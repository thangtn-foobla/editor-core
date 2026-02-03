import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'

type NodeId = Node['id']

export interface OrderOps {
  insertNode(state: EditorState, nodeId: NodeId, index?: number): EditorState

  removeNode(state: EditorState, nodeId: NodeId): EditorState

  removeNodes(state: EditorState, nodeIds: NodeId[]): EditorState

  // moveNode(state: EditorState, nodeId: NodeId, toIndex: number): EditorState

  // bringToFront(state: EditorState, nodeId: NodeId): EditorState

  // sendToBack(state: EditorState, nodeId: NodeId): EditorState

  reorderNode(state: EditorState, nodeId: NodeId, toIndex: number): EditorState
}

export const orderOps: OrderOps = {

  insertNode(state: EditorState, nodeId: NodeId, index?: number): EditorState {
    // Avoid duplicate: if nodeId is already in order, do nothing (idempotent).
    if (state.order.includes(nodeId)) {
      return state
    }
    const nodeIds = state.order
    const idx = index ?? nodeIds.length
    const clampedIndex = Math.max(0, Math.min(idx, nodeIds.length))
    const newOrder = nodeIds.slice()
    newOrder.splice(clampedIndex, 0, nodeId)
    return {
      ...state,
      order: newOrder
    }
  },

  removeNode(state: EditorState, nodeId: NodeId): EditorState {
    const nodeIds = state.order
    const newOrder = nodeIds.filter(id => id !== nodeId)
    return {
      ...state,
      order: newOrder
    }
  },

  removeNodes(state: EditorState, nodeIds: NodeId[]): EditorState {
    if (nodeIds.length === 0) {
      return {
        ...state,
        order: [...state.order]
      }
    }
    const toRemove = new Set(nodeIds)
    const newOrder = state.order.filter(id => !toRemove.has(id))
    return {
      ...state,
      order: newOrder
    }
  },



  reorderNode(state: EditorState, nodeId: NodeId, toIndex: number): EditorState {
    const nodeIds = state.order
    const fromIndex = nodeIds.indexOf(nodeId)
    if (fromIndex === -1) {
      return state
    }
    const newOrder = nodeIds.slice()
    newOrder.splice(fromIndex, 1)

    const clampedIndex = Math.max(0, Math.min(toIndex, nodeIds.length))

    newOrder.splice(clampedIndex, 0, nodeId)

    return {
      ...state,
      order: newOrder
    }
  }
}
