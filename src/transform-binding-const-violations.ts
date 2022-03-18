import { Binding } from '@babel/traverse'
import * as types from '@babel/types'
import { getGetterMemberExpression } from './utils'


export function transformBindingConstViolations(binding: Binding, bindingName: string) {
   for (const constViolationPath of binding.constantViolations) {
      const getterCallExpression = types.callExpression(getGetterMemberExpression(bindingName), [])
      
      const setterMemberExpression = types.memberExpression(
         types.identifier(bindingName),
         types.numericLiteral(1),
         true
      )

      const operator = (constViolationPath.node as any).operator as string

      if (constViolationPath.isAssignmentExpression()) {
         const assignmentRightNode = constViolationPath.node.right   
         const operatorNonAssignmentVersion = operator.replace('=', "")
         const valueToSet =
            operator === "=" 
               ? assignmentRightNode 
               : types.binaryExpression(
                  operatorNonAssignmentVersion as any,
                  getterCallExpression,
                  assignmentRightNode
               )
   
         constViolationPath.replaceWith(
            types.callExpression(
               setterMemberExpression,
               [valueToSet]
            )
         )
      }

      // Handle unary operators (++, --)
      else if (operator == "++" || operator == "--") {
         const postfixOrPrefix = (constViolationPath.node as any).prefix ? "prefix" : "postfix"
         const binaryOperator = operator[0]
         const oppositeBinaryOperator = binaryOperator === "-" ? "+" : "-"

         const valueToSet = types.binaryExpression(
            binaryOperator as any,
            getterCallExpression,
            types.numericLiteral(1)
         )
         
         const setterCallExpression = types.callExpression(
            setterMemberExpression,
            [valueToSet]
         )

         constViolationPath.replaceWith(
            postfixOrPrefix === "prefix"
               ? setterCallExpression
               : types.binaryExpression(
                  oppositeBinaryOperator,
                  setterCallExpression,
                  types.numericLiteral(1)
               )
         )
      }
   }
}
