import { NodePath, Binding } from '@babel/traverse'
import {
   Scopable, Expression, callExpression, CallExpression, VariableDeclarator
} from "@babel/types"
import { transformBindingReferences } from './transform-binding-references'
import { transformBindingConstViolations } from './transform-binding-const-violations'
import { removeWrappingCtf } from './remove-wrapping-ctf'
import { isRefFunctionCall } from './is-ref-function-call';
import { getOrCreateUniqueImport } from './get-or-create-unique-import'


export function scopeVisitor(programPath: NodePath<Scopable>) {
   const scope = programPath.scope

   for (const bindingName in scope.bindings) {
      if ((scope.bindings[bindingName] as any).transformed) return

      if (
         !bindingName.startsWith("$")
         || bindingName === "$"
         || bindingName === "ref"
         || bindingName === "$$"
         || bindingName === "deref"
         || bindingName === "read"
         || bindingName === "write"
      ) continue

      const binding = scope.bindings[bindingName]

      transformReactiveVariableDeclaration(binding)
      
      transformBindingReferences(binding, bindingName)

      transformBindingConstViolations(binding, bindingName)

      ;(scope.bindings[bindingName] as any).transformed = true
   }
}


function transformReactiveVariableDeclaration(binding: Binding) {
   const bindingPath = binding.path
   
   if (
      bindingPath.node.type === "ObjectPattern"
      || bindingPath.node.type === "ImportSpecifier"
      || bindingPath.node.type === "ImportDefaultSpecifier"
   ) return

   const initPathOrPaths = bindingPath?.get("init")
   const initPath = Array.isArray(initPathOrPaths) ? initPathOrPaths[0] : initPathOrPaths
   const init = initPath.node as Expression

   const declaratorId = (bindingPath.node as VariableDeclarator).id
   if (declaratorId.type === "ObjectPattern") return

   // If init is a ref function call
   const { res: res1, ctfBinding } = isRefFunctionCall(initPath)
   if (res1) {
      removeWrappingCtf(
         initPath as NodePath<CallExpression>,
         ctfBinding
      )
      return
   }

   // If init is a postfixed function call
   if (
      init.type === "CallExpression"
      && init.callee.type === "Identifier"
      && init.callee.name.endsWith("$")
   )
      return
   
   const createSignalUniqueName = getOrCreateUniqueImport(bindingPath, "createSignal")

   initPath.replaceWith(
      callExpression(
         createSignalUniqueName,
         [init]
      )
   )
}
