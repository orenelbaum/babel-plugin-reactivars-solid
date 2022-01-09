import { scopeVisitor } from './scope-visitor';
import { objectExpressionVisitor } from './object-expression-visitor'
import { memberExpressionVisitor } from './member-expression-visitor'


export default () => ({
   name: "babel-plugin-reactivars-solid",
   visitor: {
      Scopable: scopeVisitor,
      ObjectExpression: objectExpressionVisitor,
      MemberExpression: memberExpressionVisitor
   }
})
