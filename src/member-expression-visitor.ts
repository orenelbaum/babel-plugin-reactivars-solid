import { NodePath } from "@babel/traverse"
import { 
   callExpression, memberExpression, numericLiteral, MemberExpression, CallExpression,
   ObjectProperty, Identifier
} from '@babel/types'
import { isDerefFunctionCall } from "./is-deref-function-call"
import { isRefFunctionCall } from "./is-ref-function-call"
import { removeWrappingCtf } from "./remove-wrapping-ctf"


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

   // If reference is the value of a prefixed object expression property
   if (
      memberExpressionPath.parentPath.type === "ObjectProperty"
      && memberExpressionPath.parentPath.parentPath.type === "ObjectExpression"
      && (memberExpressionPath.parent as ObjectProperty).key.type === "Identifier"
      && ((memberExpressionPath.parent as ObjectProperty).key as Identifier).name.startsWith("$")
   )
      return

   const { res, ctfBinding } = isDerefFunctionCall(memberExpressionPath.parentPath)
   if (res) {
      removeWrappingCtf(
         memberExpressionPath.parentPath as NodePath<CallExpression>,
         ctfBinding
      )
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
