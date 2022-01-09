import { NodePath } from '@babel/traverse'
import { isCtfCall } from './is-ctf-call';


/**
 * Checks if the node is a call to the function `$$` imported from `reactivars/react`
 */
export const isDerefFunctionCall = (path: NodePath<any>) => isCtfCall(path, '$$')
