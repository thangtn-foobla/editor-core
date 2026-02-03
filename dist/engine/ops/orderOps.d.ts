import type { EditorState } from '../../interfaces/domain/EditorState';
import type { Node } from '../../interfaces/domain/Node';
type NodeId = Node['id'];
/**
 * Pure operations that manage node order (z-order / stacking).
 */
export interface OrderOps {
    insertNode(state: EditorState, nodeId: NodeId, index?: number): EditorState;
    removeNode(state: EditorState, nodeId: NodeId): EditorState;
    removeNodes(state: EditorState, nodeIds: NodeId[]): EditorState;
    reorderNode(state: EditorState, nodeId: NodeId, toIndex: number): EditorState;
}
/** Default implementation of order operations. */
export declare const orderOps: OrderOps;
export {};
//# sourceMappingURL=orderOps.d.ts.map