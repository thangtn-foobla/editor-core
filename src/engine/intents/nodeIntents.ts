import { nodeOps } from '../ops/nodeOps'
import { orderOps } from '../ops/orderOps'
import { selectionOps } from '../ops/selectionOps'
import type { IntentHandler } from '../../interfaces/domain/Engine'

/** Intent handler for adding a node to the document. */
export const addNodeIntent: IntentHandler<'ADD_NODE'> = (state, cmd) => {
  const { node, index, select } = cmd.payload

  let next = state
  next = nodeOps.addNode(next, node)
  // Always set order explicitly so the new node id is in order (avoids relying on
  // insertNode when state.order might be shared/mutated elsewhere)
  const id = String(node.id)
  const currentOrder = next.order
  if (!currentOrder.includes(id)) {
    const idx = index ?? currentOrder.length
    const clampedIdx = Math.max(0, Math.min(idx, currentOrder.length))
    const newOrder = currentOrder.slice()
    newOrder.splice(clampedIdx, 0, id)
    next = { ...next, order: newOrder }
  }
  if (select) {
    next = selectionOps.selectNodes(next, [node.id])
  }
  return next
}

/** Intent handler for removing a single node. */
export const removeNodeIntent: IntentHandler<'REMOVE_NODE'> = (state, cmd) => {
  const { nodeId } = cmd.payload
  if (!state.nodes.has(nodeId)) {
    return state
  }
  let next = state
  next = nodeOps.removeNode(next, nodeId)
  next = orderOps.removeNode(next, nodeId)
  next = selectionOps.deselectNodes(next, [nodeId])
  return next
}

/** Intent handler for removing multiple nodes. */
export const removeNodesIntent: IntentHandler<'REMOVE_NODES'> = (state, cmd) => {
  const { nodeIds } = cmd.payload
  if (nodeIds.length === 0) {
    return state
  }
  let next = state
  next = nodeOps.removeNodes(next, nodeIds)
  next = orderOps.removeNodes(next, nodeIds)
  next = selectionOps.deselectNodes(next, nodeIds)
  return next
}

/** Intent handler for applying partial updates to a node. */
export const updateNodeIntent: IntentHandler<'UPDATE_NODE'> = (state, cmd) => {
  const { nodeId, updates } = cmd.payload
  if (!state.nodes.has(nodeId)) {
    return state
  }
  const node = state.nodes.get(nodeId)
  if (!node) {
    return state
  }

  const hasChange = Object.keys(updates).some(key => (node as any)[key] !== (updates as any)[key])
  if (!hasChange) {
    return state
  }

  return nodeOps.updateNode(state, nodeId, updates)
}


