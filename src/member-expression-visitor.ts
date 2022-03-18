import { NodePath } from '@babel/traverse'
import { 
   callExpression, memberExpression, numericLiteral, MemberExpression,
   CallExpression, ObjectProperty, Identifier, binaryExpression, Expression
} from '@babel/types'
import { isDerefFunctionCall } from './is-deref-function-call'
import { isRefFunctionCall } from './is-ref-function-call'
import { removeWrappingCtf } from './remove-wrapping-ctf'
import { isCtfCall } from './is-ctf-call'


/**
 * Transforms reactive properties
 */
export function memberExpressionVisitor(
   memberExpressionPath: NodePath<MemberExpression>
) {
   const reactivePropMemberExpression = memberExpressionPath.node
   const reactiveProperty = reactivePropMemberExpression.property

   if (
      (reactivePropMemberExpression as any).transformed
      || reactiveProperty.type !== 'Identifier'
      || !reactiveProperty.name.startsWith('$')
   ) return

   const getterMemberExpression = memberExpression(
      reactivePropMemberExpression as Expression,
      numericLiteral(0),
      true
   )

   const getterCallExpression = callExpression(
      getterMemberExpression,
      []
   )

   const setterMemberExpression = memberExpression(
      reactivePropMemberExpression,
      numericLiteral(1),
      true
   )


   // If reference is being assigned to a prefixed property on an object expression
   // (e.g. reference is obj.$b `({ $a: obj.$b })`)
   if (
      memberExpressionPath.parentPath.type === 'ObjectProperty'
      && memberExpressionPath.parentPath.parentPath.type === 'ObjectExpression'
      && (memberExpressionPath.parent as ObjectProperty).key.type === 'Identifier'
      && ((memberExpressionPath.parent as ObjectProperty).key as Identifier).name.startsWith('$')
   )
      return


   const { res: bindingIsBeingDereffed, ctfBinding } =
      isDerefFunctionCall(memberExpressionPath.parentPath)

   if (bindingIsBeingDereffed) {
      removeWrappingCtf(
         memberExpressionPath.parentPath as NodePath<CallExpression>,
         ctfBinding
      )
      return
   }


   const { res: bindingIsWrappedInReadCtf, ctfBinding: readCtfBinding } =
      isCtfCall(memberExpressionPath.parentPath, 'read')

   if (bindingIsWrappedInReadCtf) {
      const newPath = removeWrappingCtf(
         memberExpressionPath.parentPath as NodePath<CallExpression>,
         readCtfBinding
      )
      
      newPath.replaceWith(getterMemberExpression)
      
      return
   }


   const { res: bindingIsWrappedInWriteCtf, ctfBinding: writeCtfBinding } =
      isCtfCall(memberExpressionPath.parentPath, 'write')

   if (bindingIsWrappedInWriteCtf) {
      const newPath = removeWrappingCtf(
         memberExpressionPath.parentPath as NodePath<CallExpression>,
         writeCtfBinding
      )

      const getterMemberExpression = memberExpression(
         reactivePropMemberExpression as Expression,
         numericLiteral(1),
         true
      )

      newPath.replaceWith(getterMemberExpression)
      
      return
   }


   // If the member expression is being assigned to
   if (
      memberExpressionPath.parentPath.isAssignmentExpression()
      && memberExpressionPath.parentPath.node.left === reactivePropMemberExpression
   ) {
      ;(reactivePropMemberExpression as any).transformed = true

      const operator = memberExpressionPath.parentPath.node.operator
      const operatorNonAssignmentVersion = operator.replace('=', '')

      const assignmentRightNodePath = memberExpressionPath.parentPath.get('right')
      const assignmentRightNode = memberExpressionPath.parentPath.node.right
      const valueToSet =
         operator === '=' 
            ? assignmentRightNode 
            : binaryExpression(
               operatorNonAssignmentVersion as any,
               getterCallExpression,
               assignmentRightNode
            )

      if ((assignmentRightNode as any).wasWrappedInCtf) {
         if (operator !== '=') throw new Error(`Cannot use CTF to assign to a reactive property with operator ${operator}`)
         return
      }

      const { res, ctfBinding: annotatingCtfBinding } = isRefFunctionCall(assignmentRightNodePath)
      if (res) {
         if (operator !== '=') throw new Error(`Cannot use CTF to assign to a reactive property with operator ${operator}`)
         removeWrappingCtf(
            assignmentRightNodePath as NodePath<CallExpression>,
            annotatingCtfBinding
         )
         return
      }
      
      const assignmentExpressionPath = memberExpressionPath.parentPath

      assignmentExpressionPath.replaceWith(
         callExpression(
            setterMemberExpression,
            [valueToSet]
         )
      )

      return
   }


   // If the member expression is inside an update expression (e.g. obj.$a++ )
   if (memberExpressionPath.parentPath.isUpdateExpression()) {
      const updateExpressionPath = memberExpressionPath.parentPath
      const postfixOrPrefix = (updateExpressionPath.node as any).prefix ? "prefix" : "postfix"
      const operator = (updateExpressionPath.node as any).operator as string
      const binaryOperator = operator[0]
      const oppositeBinaryOperator = binaryOperator === "-" ? "+" : "-"

      const valueToSet = binaryExpression(
         binaryOperator as any,
         getterCallExpression,
         numericLiteral(1)
      )
      
      const setterCallExpression = callExpression(
         setterMemberExpression,
         [valueToSet]
      )

      updateExpressionPath.replaceWith(
         postfixOrPrefix === "prefix"
            ? setterCallExpression
            : binaryExpression(
               oppositeBinaryOperator,
               setterCallExpression,
               numericLiteral(1)
            )
      )
   }


   ;(reactivePropMemberExpression as any).transformed = true


   // Check if the reactive property is being copied with the ref function.
   // If so, the CTF will be removed when processing the copying reactive
   // variable / property.
   if (
      (reactivePropMemberExpression as any).wasWrappedInCtf
      || isRefFunctionCall(memberExpressionPath.parentPath).res
   ) return


   memberExpressionPath.replaceWith(getterCallExpression)
}
