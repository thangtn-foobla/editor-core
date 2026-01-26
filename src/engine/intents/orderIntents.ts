import { orderOps } from '../ops/orderOps'
import { selectionOps } from '../ops/selectionOps'
import type { IntentHandler } from '../../interfaces/domain/Engine.ts'

export const reorderNodeIntent: IntentHandler<'REORDER'> = (state, cmd) => {
  const { nodeId, toIndex } = cmd.payload
  let next = orderOps.reorderNode(state, nodeId, toIndex)
  if (next === state) {
    return state
  }
  next = selectionOps.deselectNodes(next, [nodeId])
  return next
}