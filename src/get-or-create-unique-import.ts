import { NodePath } from "@babel/traverse"
import {
	Identifier, importDeclaration, importSpecifier, identifier, stringLiteral, Program
} from '@babel/types';


/**
 * Looks for an existing unique import. If none is found, we create a new import and add it
 * to the file.
 */
export const getOrCreateUniqueImport = (path:  NodePath<any>, specifier: string) => {
	let uniqueName = lookForUniqueImport(path, specifier)
            
	// If not found, create one
	if (!uniqueName) {
		const program = path.findParent(path => path.isProgram()) as NodePath<Program>

		uniqueName = (program.scope.generateUidIdentifier as any)(specifier) as Identifier
		// We mark the identifier as unique so we can find it later
		(uniqueName as any).unique = true
		addImportDeclarationToProgram(program, uniqueName, specifier, "solid-js")
	}
  
	return uniqueName
}


/**
 * Looks for an existing `mergeProps` import declaration that is marked as unique.
 */
 function lookForUniqueImport(path: NodePath<any>, targetSpecifier: string) {
	const program = path.findParent(path => path.isProgram())
	
	let mergePropsUniqueName: Identifier

	program.traverse({
		ImportDeclaration(path) {
			if (path.node.source.value !== "solid-js")
				return
			for (const specifier of path.node.specifiers)
				if (
               specifier.type === "ImportSpecifier"
               && specifier.imported
               && specifier.imported.type === "Identifier"
					&& (specifier.imported as Identifier).name === targetSpecifier
					&& (specifier.local as any).unique
				) {
					mergePropsUniqueName = specifier.local
					return
				}
		}
	})

	return mergePropsUniqueName
}


function addImportDeclarationToProgram(
   program: NodePath<Program>,
   specifier: Identifier,
   imported: string,
   source: string
) {
	program.node.body.unshift(
		importDeclaration(
			[importSpecifier(specifier, identifier(imported))],
			stringLiteral(source)
		)
	)
}