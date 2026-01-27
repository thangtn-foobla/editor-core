import type { Node } from '../../interfaces/domain/Node';
import type { EditorState } from '../../interfaces/domain/EditorState';
type NodeId = Node['id'];
export interface SelectionOps {
    selectNodes(state: EditorState, nodeIds: NodeId[]): EditorState;
    deselectNodes(state: EditorState, nodeIds: NodeId[]): EditorState;
}
export declare const selectionOps: SelectionOps;
export {};
//# sourceMappingURL=selectionOps.d.ts.map