import { identifier, numericLiteral, memberExpression } from '@babel/types'


export const getGetterMemberExpression = 
   (bindingName: string) =>
      memberExpression(
         identifier(bindingName),
         numericLiteral(0),
         true
      )
