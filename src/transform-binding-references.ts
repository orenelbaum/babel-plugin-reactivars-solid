import { Binding, NodePath } from "@babel/traverse"
import {
   identifier, numericLiteral, callExpression, memberExpression, CallExpression,
   ObjectProperty, Identifier, JSXAttribute, JSXIdentifier
} from "@babel/types"
import { isDerefFunctionCall } from "./is-deref-function-call"
import { isRefFunctionCall } from "./is-ref-function-call"
import { removeWrappingCtf } from "./remove-wrapping-ctf"


export function transformBindingReferences(binding: Binding, bindingName: string) {
   for (const refPath of binding.referencePaths) {
      if (
         (refPath.node as any).wasWrappedInRefCtf
         || isRefFunctionCall(refPath.parentPath).res
      ) continue

      const { res, ctfBinding } = isDerefFunctionCall(refPath.parentPath)
      if (res) {
         removeWrappingCtf(refPath.parentPath as NodePath<CallExpression>,  ctfBinding)
         continue
      }

      // If reference is the value of a prefixed object expression property
      if (
         refPath.parentPath.type === "ObjectProperty"
         && refPath.parentPath.parentPath.type === "ObjectExpression"
         && (refPath.parent as ObjectProperty).key.type === "Identifier"
         && ((refPath.parent as ObjectProperty).key as Identifier).name.startsWith("$")
      )
         continue
         
      // If the reference is the value of a prefixed JSX attribute
      if (
         refPath.parentPath.type === "JSXExpressionContainer"
         && refPath.parentPath.parentPath.type === "JSXAttribute"
         && (refPath.parentPath.parent as JSXAttribute).name.type === "JSXIdentifier"
         && ((refPath.parentPath.parent as JSXAttribute).name as JSXIdentifier).name.startsWith("$")
      )
         continue

      const getterMemberExpression = memberExpression(
         identifier(bindingName),
         numericLiteral(0),
         true
      )

      refPath.replaceWith(
         callExpression(
            getterMemberExpression,
            []
         )
      )
   }
}
