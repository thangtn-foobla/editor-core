import type { Node } from '../../interfaces/domain/Node'
import type { EditorState } from '../../interfaces/domain/EditorState'


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
  deselectNodes(state: EditorState, nodeIdsToRemove: NodeId[]): EditorState {
    const toRemove = new Set(nodeIdsToRemove)
    const nodeIds = (state.selection.nodeIds ?? []).filter(
      id => !toRemove.has(id)
    )
    return {
      ...state,
      selection: {
        ...state.selection,
        nodeIds
      }
    }
  }
}
