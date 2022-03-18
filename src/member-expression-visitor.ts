import { NodePath } from '@babel/traverse'
import { 
   callExpression, memberExpression as memberExpression_, numericLiteral, MemberExpression,
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
   const memberExpression = memberExpressionPath.node
   const property = memberExpression.property

   if (
      (memberExpression as any).transformed
      || property.type !== 'Identifier'
      || !property.name.startsWith('$')
   ) return


   const getterCallExpression = callExpression(
      memberExpression_(
         memberExpression,
         numericLiteral(0),
         true
      ),
      []
   )


   // If reference is being assigned to a prefixed property on an object expression
   // (e.g. `({ $a: $b })`)
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

      const getterMemberExpression = memberExpression_(
         memberExpression as Expression,
         numericLiteral(0),
         true
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

      const getterMemberExpression = memberExpression_(
         memberExpression as Expression,
         numericLiteral(1),
         true
      )

      newPath.replaceWith(getterMemberExpression)
      
      return
   }


   // If the member expression is being assigned to
   if (
      memberExpressionPath.parentPath.isAssignmentExpression()
      && memberExpressionPath.parentPath.node.left === memberExpression
   ) {
      ;(memberExpression as any).transformed = true

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
            memberExpression_(
               memberExpression,
               numericLiteral(1),
               true
            ),
            [valueToSet]
         )
      )

      return
   }


   ;(memberExpression as any).transformed = true


   // Check if the reactive property is being copied with the ref function.
   // If so, the CTF will be removed when processing the copying reactive
   // variable / property.
   if (
      (memberExpression as any).wasWrappedInCtf
      || isRefFunctionCall(memberExpressionPath.parentPath).res
   ) return

   memberExpressionPath.replaceWith(getterCallExpression)
}
