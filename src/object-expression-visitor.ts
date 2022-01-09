import { NodePath } from "@babel/traverse"
import * as types from '@babel/types';
import { CallExpression } from '@babel/types';
import { isRefFunctionCall } from "./is-ref-function-call";
import { removeWrappingCtf } from "./remove-wrapping-ctf";
import { getOrCreateUniqueImport } from './get-or-create-unique-import';


// Transforms reactive property declarations with signals.
export function objectExpressionVisitor(objectLiteralPath: NodePath<types.ObjectExpression>) {
   const objectLiteral = objectLiteralPath.node
   const properties = objectLiteral.properties

   for (const property of properties) {
      if (
         property.type !== "ObjectProperty"
         || property.key.type !== "Identifier"
         || !property.key.name.startsWith("$")
      )
         continue
      
      const propertyPath = objectLiteralPath.get(`properties.${properties.indexOf(property)}`) as NodePath<types.ObjectProperty>
      const valuePathOrPaths = propertyPath?.get("value")
      const valuePath = Array.isArray(valuePathOrPaths) ? valuePathOrPaths[0] : valuePathOrPaths
      const value = valuePath.node as types.Expression

      // If value is a ref function call
      const { res, ctfBinding } = isRefFunctionCall(valuePath)
      if (res) {
         removeWrappingCtf(valuePath as NodePath<CallExpression>, ctfBinding)
         continue
      }

      // If value is another reactive variable or a reactive property
      if (
         (
            value.type === "Identifier"
            && value.name.startsWith("$")
         )
         || (
            value.type === "MemberExpression"
            && value.property.type === "Identifier"
            && value.property.name.startsWith("$")
         )
      )
         continue

      const createSignalUniqueName = getOrCreateUniqueImport(objectLiteralPath, "createSignal")
      
      property.value =
         types.callExpression(
            createSignalUniqueName,
            [property.value as types.Expression]
         )
   }
}