import { NodePath } from "@babel/traverse"
import { 
   callExpression, memberExpression, numericLiteral, MemberExpression, CallExpression,
   ObjectProperty, Identifier
} from '@babel/types'
import { isDerefFunctionCall } from "./is-deref-function-call"
import { isRefFunctionCall } from "./is-ref-function-call"
import { removeWrappingCtf } from "./remove-wrapping-ctf"
import { isCtfCall } from './is-ctf-call';
import { Expression } from '@babel/types';


/**
 * Transforms reactive properties
 */
export function memberExpressionVisitor(
   memberExpressionPath: NodePath<MemberExpression>
) {
   const property = memberExpressionPath.node.property

   if (
      (memberExpressionPath.node as any).transformed
      || property.type !== "Identifier"
      || !property.name.startsWith("$")
   ) return

   // If reference is being assigned to a prefixed property on an object expression
   // (e.g. `({ $a: $b })`)
   if (
      memberExpressionPath.parentPath.type === "ObjectProperty"
      && memberExpressionPath.parentPath.parentPath.type === "ObjectExpression"
      && (memberExpressionPath.parent as ObjectProperty).key.type === "Identifier"
      && ((memberExpressionPath.parent as ObjectProperty).key as Identifier).name.startsWith("$")
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
      isCtfCall(memberExpressionPath.parentPath, "read")
   if (bindingIsWrappedInReadCtf) {
      const newPath = removeWrappingCtf(
         memberExpressionPath.parentPath as NodePath<CallExpression>,
         readCtfBinding
      )

      const getterMemberExpression = memberExpression(
         memberExpressionPath.node as Expression,
         numericLiteral(0),
         true
      )
      
      newPath.replaceWith(getterMemberExpression)
      
      return
   }

   const { res: bindingIsWrappedInWriteCtf, ctfBinding: writeCtfBinding } =
      isCtfCall(memberExpressionPath.parentPath, "write")
   if (bindingIsWrappedInWriteCtf) {
      const newPath = removeWrappingCtf(
         memberExpressionPath.parentPath as NodePath<CallExpression>,
         writeCtfBinding
      )

      const getterMemberExpression = memberExpression(
         memberExpressionPath.node as Expression,
         numericLiteral(1),
         true
      )

      newPath.replaceWith(getterMemberExpression)
      
      return
   }

   // If the member expression is being assigned to
   if (
      memberExpressionPath.parentPath.isAssignmentExpression()
      && memberExpressionPath.parentPath.node.left === memberExpressionPath.node
   ) {
      ;(memberExpressionPath.node as any).transformed = true

      const rightPath = memberExpressionPath.parentPath.get("right")
      const right = memberExpressionPath.parentPath.node.right

      if ((right as any).wasWrappedInRefCtf) return

      const { res, ctfBinding: annotatingCtfBinding } = isRefFunctionCall(rightPath)
      if (res) {
         removeWrappingCtf(rightPath as NodePath<CallExpression>, annotatingCtfBinding)
         return
      }
      
      const assignmentExpressionPath = memberExpressionPath.parentPath

      assignmentExpressionPath.replaceWith(
         callExpression(
            memberExpression(
               memberExpressionPath.node,
               numericLiteral(1),
               true
            ),
            [right]
         )
      )

      return
   }

   ;(memberExpressionPath.node as any).transformed = true

   // Check if the reactive variable is being copied with the ref function.
   // If so, the CTF will be removed when processing the copying reactive
   // variable / property.
   if (
      (memberExpressionPath.node as any).wasWrappedInRefCtf
      || isRefFunctionCall(memberExpressionPath.parentPath).res
   ) return

   memberExpressionPath.replaceWith(
      callExpression(
         memberExpression(
            memberExpressionPath.node,
            numericLiteral(0),
            true
         ),
         []
      )
   )

}
