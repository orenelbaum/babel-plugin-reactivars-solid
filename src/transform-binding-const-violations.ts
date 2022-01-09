import { Binding } from "@babel/traverse"
import * as types from "@babel/types"


export function transformBindingConstViolations(binding: Binding, bindingName: string) {
   for (const constViolationPath of binding.constantViolations) {
      const setterMemberExpression = types.memberExpression(
         types.identifier(bindingName),
         types.numericLiteral(1),
         true
      )

      if (!constViolationPath.isAssignmentExpression()) continue

      const assignedValue = constViolationPath.node.right

      constViolationPath.replaceWith(
         types.callExpression(
            setterMemberExpression,
            [assignedValue]
         )
      )
   }
}
