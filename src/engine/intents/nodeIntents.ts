import { nodeOps } from '../ops/nodeOps'
import { orderOps } from '../ops/orderOps'
import { selectionOps } from '../ops/selectionOps'
import type { IntentHandler } from '../../interfaces/domain/Engine.ts'

export const addNodeIntent: IntentHandler<'ADD_NODE'> = (state, cmd) => {
  const { node, index, select } = cmd.payload

  let next = state
  next = nodeOps.addNode(next, node)
  next = orderOps.insertNode(next, node.id, index ?? 0)
  if (select) {
    next = selectionOps.selectNodes(next, [node.id])
  }
  return next
}

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


