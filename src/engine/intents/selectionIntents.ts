import type { IntentHandler } from '../../interfaces/domain/Engine'
import { selectionOps } from '../ops/selectionOps'
import { nodeOps } from '../ops/nodeOps'
import { orderOps } from '../ops/orderOps'

export const selectNodeIntent: IntentHandler<'SELECT_NODE'> = (state, cmd) => {
  const { nodeId } = cmd.payload
  return selectionOps.selectNodes(state, [nodeId])
}

export const removeSelectedNodesIntent: IntentHandler<'REMOVE_SELECTED_NODES'> = (state, cmd) => {
  const nodeIds = state.selection.nodeIds ?? []
  if (nodeIds.length === 0) {
    return state
  }
  let next = state
  next = selectionOps.deselectNodes(next, nodeIds)
  next = nodeOps.removeNodes(next, nodeIds)
  next = orderOps.removeNodes(next, nodeIds)
  return next
}