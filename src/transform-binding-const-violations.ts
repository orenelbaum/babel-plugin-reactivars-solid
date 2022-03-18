import { Binding } from '@babel/traverse'
import * as types from '@babel/types'
import { getGetterMemberExpression } from './utils'


export function transformBindingConstViolations(binding: Binding, bindingName: string) {
   for (const constViolationPath of binding.constantViolations) {
      const setterMemberExpression = types.memberExpression(
         types.identifier(bindingName),
         types.numericLiteral(1),
         true
      )

      if (!constViolationPath.isAssignmentExpression()) continue

      const assignmentRightNode = constViolationPath.node.right

      const operator = constViolationPath.node.operator
      const operatorNonAssignmentVersion = operator.replace('=', "")
      const valueToSet =
         operator === "=" 
            ? assignmentRightNode 
            : types.binaryExpression(
               operatorNonAssignmentVersion as any,
               types.callExpression(getGetterMemberExpression(bindingName), []),
               assignmentRightNode
            )

      constViolationPath.replaceWith(
         types.callExpression(
            setterMemberExpression,
            [valueToSet]
         )
      )
   }
}
