import { Binding, NodePath } from '@babel/traverse'
import {
   numericLiteral, callExpression, memberExpression, CallExpression, ObjectProperty,
   Identifier, JSXAttribute, JSXIdentifier, Expression
} from '@babel/types'
import { isDerefFunctionCall } from './is-deref-function-call'
import { isRefFunctionCall } from './is-ref-function-call'
import { removeWrappingCtf } from './remove-wrapping-ctf'
import { isCtfCall } from './is-ctf-call'
import { getGetterMemberExpression } from './utils'


export function transformBindingReferences(binding: Binding, bindingName: string) {
   for (const refPath of binding.referencePaths) {
      
      // Check if the reactive variable is being copied with the ref function.
      // If so, the CTF will be removed when processing the copying reactive
      // variable / property.
      if (
         (refPath.node as any).wasWrappedInCtf
         || isRefFunctionCall(refPath.parentPath).res
      ) continue

      const { res: bindingIsBeingDereffed, ctfBinding: derefCtfBinding } =
         isDerefFunctionCall(refPath.parentPath)
      if (bindingIsBeingDereffed) {
         removeWrappingCtf(
            refPath.parentPath as NodePath<CallExpression>,
            derefCtfBinding
         )
         continue
      }
      
      const { res: bindingIsWrappedInReadCtf, ctfBinding: readCtfBinding } =
         isCtfCall(refPath.parentPath, "read")
      if (bindingIsWrappedInReadCtf) {
         const newPath = removeWrappingCtf(
            refPath.parentPath as NodePath<CallExpression>,
            readCtfBinding
         )

         const getterMemberExpression = memberExpression(
            refPath.node as Expression,
            numericLiteral(0),
            true
         )
         
         newPath.replaceWith(getterMemberExpression)
         
         continue
      }

      const { res: bindingIsWrappedInWriteCtf, ctfBinding: writeCtfBinding } =
         isCtfCall(refPath.parentPath, "write")
      if (bindingIsWrappedInWriteCtf) {
         const newPath = removeWrappingCtf(
            refPath.parentPath as NodePath<CallExpression>,
            writeCtfBinding
         )

         const getterMemberExpression = memberExpression(
            refPath.node as Expression,
            numericLiteral(1),
            true
         )

         newPath.replaceWith(getterMemberExpression)
         
         continue
      }

      // If reference is being assigned to a prefixed property on an object expression
      // (e.g. `({ $a: $b })`)
      if (
         refPath.parentPath.type === "ObjectProperty"
         && refPath.parentPath.parentPath.type === "ObjectExpression"
         && (refPath.parent as ObjectProperty).key.type === "Identifier"
         && ((refPath.parent as ObjectProperty).key as Identifier)
            .name.startsWith("$")
      )
         continue
         
      // If the reference is being assigned to a prefixed JSX attribute
      // (e.g. `<div {...{ $a: $b }} />`)
      if (
         refPath.parentPath.type === "JSXExpressionContainer"
         && refPath.parentPath.parentPath.type === "JSXAttribute"
         && (refPath.parentPath.parent as JSXAttribute).name.type === "JSXIdentifier"
         && ((refPath.parentPath.parent as JSXAttribute).name as JSXIdentifier)
            .name.startsWith("$")
      )
         continue

      const getterMemberExpression = getGetterMemberExpression(bindingName)

      refPath.replaceWith(
         callExpression(
            getterMemberExpression,
            []
         )
      )
   }
}
