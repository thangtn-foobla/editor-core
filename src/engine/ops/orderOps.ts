import type { EditorState } from '../../interfaces/domain/EditorState.ts'

export interface OrderOps {
  insertNode(state: EditorState, nodeId: NodeId, index?: number): EditorState

  removeNode(state: EditorState, nodeId: NodeId): EditorState

  moveNode(state: EditorState, nodeId: NodeId, toIndex: number): EditorState

  bringToFront(state: EditorState, nodeId: NodeId): EditorState

  sendToBack(state: EditorState, nodeId: NodeId): EditorState
}
