import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'

type NodeId = Node['id']

/**
 * Pure operations on editor state for adding, removing and updating nodes.
 */
export interface NodeOps {
  addNode(state: EditorState, node: Node): EditorState

  removeNode(state: EditorState, nodeId: NodeId): EditorState

  removeNodes(state: EditorState, nodeIds: NodeId[]): EditorState

  updateNode(
    state: EditorState,
    nodeId: NodeId,
    updates: Partial<Node>
  ): EditorState
}

/** Default implementation of node operations. */
export const nodeOps: NodeOps = {
  addNode(state: EditorState, node: Node): EditorState {
    if (state.nodes.has(node.id)) {
      return state
    }

    const nodes = new Map(state.nodes)
    nodes.set(node.id, node)

    return {
      ...state,
      nodes
    }
  },

  removeNode(state: EditorState, nodeId: NodeId): EditorState {
    if (!state.nodes.has(nodeId)) {
      throw new Error(`Node with id ${nodeId} does not exist`)
    }

    const nodes = new Map(state.nodes)
    nodes.delete(nodeId)
    return {
      ...state,
      nodes
    }
  },

  removeNodes(state: EditorState, nodeIds: NodeId[]): EditorState {
    const nodes = new Map(state.nodes)
    nodeIds.forEach(nodeId => {
      nodes.delete(nodeId)
    })
    return {
      ...state,
      nodes
    }
  },

  updateNode(
    state: EditorState,
    nodeId: NodeId,
    updates: Partial<Node>
  ): EditorState {
    const existingNode = state.nodes.get(nodeId)
    if (!existingNode) {
      throw new Error(`Node with id ${nodeId} does not exist`)
    }

    const updatedNode = { ...existingNode, ...updates }
    const nodes = new Map(state.nodes)
    nodes.set(nodeId, updatedNode)

    return {
      ...state,
      nodes
    }
  }
}
