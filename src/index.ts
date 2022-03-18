import { scopeVisitor } from './scope-visitor';
import { objectExpressionVisitor } from './object-expression-visitor'
import { memberExpressionVisitor } from './member-expression-visitor'
import { Program } from '@babel/types';
import { NodePath } from '@babel/traverse';


// Cleans up unused macro imports
const programVisitor = {
   exit(programPath: NodePath<Program>) {
      programPath.traverse({
         ImportDeclaration: importDeclarationPath => {
            if (importDeclarationPath.node.source.value === "babel-plugin-reactivars-solid")
               importDeclarationPath.remove()
         }
      })
   }
}

export default () => ({
   name: "babel-plugin-reactivars-solid",
   visitor: {
      Scopable: scopeVisitor,
      ObjectExpression: objectExpressionVisitor,
      MemberExpression: memberExpressionVisitor,
      Program: programVisitor
   }
})
