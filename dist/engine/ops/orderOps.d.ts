import type { EditorState } from '../../interfaces/domain/EditorState';
import type { Node } from '../../interfaces/domain/Node';
type NodeId = Node['id'];
export interface OrderOps {
    insertNode(state: EditorState, nodeId: NodeId, index?: number): EditorState;
    removeNode(state: EditorState, nodeId: NodeId): EditorState;
    reorderNode(state: EditorState, nodeId: NodeId, toIndex: number): EditorState;
}
export declare const orderOps: OrderOps;
export {};
//# sourceMappingURL=orderOps.d.ts.map