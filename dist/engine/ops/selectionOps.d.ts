import type { Node } from '../../interfaces/domain/Node';
import type { EditorState } from '../../interfaces/domain/EditorState';
type NodeId = Node['id'];
/**
 * Pure operations that update the current selection.
 */
export interface SelectionOps {
    selectNodes(state: EditorState, nodeIds: NodeId[]): EditorState;
    deselectNodes(state: EditorState, nodeIds: NodeId[]): EditorState;
}
/** Default implementation of selection operations. */
export declare const selectionOps: SelectionOps;
export {};
//# sourceMappingURL=selectionOps.d.ts.map