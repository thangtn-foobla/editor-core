import type { EditorState } from '../../interfaces/domain/EditorState';
import type { Node } from '../../interfaces/domain/Node';
type NodeId = Node['id'];
export interface NodeOps {
    addNode(state: EditorState, node: Node): EditorState;
    removeNode(state: EditorState, nodeId: NodeId): EditorState;
    updateNode(state: EditorState, nodeId: NodeId, updates: Partial<Node>): EditorState;
}
export declare const nodeOps: NodeOps;
export {};
//# sourceMappingURL=nodeOps.d.ts.map