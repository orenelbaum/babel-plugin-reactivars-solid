import { Binding, NodePath } from "@babel/traverse"
import { ImportDeclaration, CallExpression } from '@babel/types';


/**
 * If the function is annotated with the `component` CTF, remove it.
 */
export const removeWrappingCtf = (ctfPath: NodePath<CallExpression>, ctfBinding: Binding) => {
	// If the CTF import is not used again, remove it.
	if (ctfBinding.references === 1) {
		// If the CTF import is the only specifier in the import declaration, remove the
		// import declaration.
		if ((ctfBinding.path.parentPath.node as ImportDeclaration).specifiers.length === 1)
			ctfBinding.path.parentPath.remove()
		// Otherwise, remove the import specifier.
		else
			ctfBinding.path.remove()
	}
	else ctfBinding.references--

   const args = ctfPath.get("arguments")
   if (
      !Array.isArray(args)
      || args.length !== 1
   ) return

   const wrappedExpression = args[0]

	;(wrappedExpression.node as any).wasWrappedInCtf = true

	return ctfPath.replaceWith(wrappedExpression)[0]
}
