import { NodePath } from '@babel/traverse'
import { ImportDeclaration, Identifier, CallExpression } from "@babel/types"


/**
 * Checks if the node is a call to a CTF imported from `reactivars/react`
 */
export function isCtfCall(path: NodePath<any>, ctfName: string) {
	if (path.node?.type !== "CallExpression") return { res: false }

   if ((path.node as CallExpression).callee.type !== "Identifier") return { res: false }
	const wrappingFunctionName = (path.node.callee as Identifier).name
	const wrappingFunctionBinding = getBinding(path, wrappingFunctionName)
	if (!wrappingFunctionBinding) return { res: false }
	const importSpecifier = wrappingFunctionBinding.path.node
	if (importSpecifier.type !== "ImportSpecifier") return { res: false }
	if (
      importSpecifier.imported.type !== "Identifier"
      || importSpecifier.imported.name !== ctfName
   )
      return { res: false }
	if (
      (wrappingFunctionBinding.path.parent as ImportDeclaration).source.value !== 'babel-plugin-reactivars-solid'
   ) return { res: false }

	const ctfBinding = wrappingFunctionBinding

	return { res: true, ctfBinding }
}

function getBinding(path: NodePath<any>, name: string) {
	const bindings = path.context.scope.bindings
	let binding = bindings[name]
	if (binding) return binding
	const parent = path.findParent(path => path.scope.hasOwnBinding(name))
	return parent?.scope.bindings[name] || false
}