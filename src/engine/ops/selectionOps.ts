import type { Node } from '../../interfaces/domain/Node.ts'
import type { EditorState } from '../../interfaces/domain/EditorState.ts'


type NodeId = Node['id']
export interface SelectionOps {
  selectNodes(state: EditorState, nodeIds: NodeId[]): EditorState

  deselectNodes(state: EditorState, nodeIds: NodeId[]): EditorState

  // clearSelection(state: EditorState): EditorState
}

export const selectionOps: SelectionOps = {
  selectNodes(state: EditorState, nodeIds: NodeId[]): EditorState {
    return {
      ...state,
      selection: {
        ...state.selection,
        nodeIds: nodeIds
      }
    }
  },
  deselectNodes(state: EditorState, nodeIds: NodeId[]): EditorState {
    return {
      ...state,
      selection: {
        ...state.selection,
        nodeIds: nodeIds
      }
    }
  }
}
