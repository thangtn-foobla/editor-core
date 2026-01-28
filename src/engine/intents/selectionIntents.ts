import type { IntentHandler } from '../../interfaces/domain/Engine'
import { selectionOps } from '../ops/selectionOps'

export const selectNodeIntent: IntentHandler<'SELECT_NODE'> = (state, cmd) => {
  const { nodeId } = cmd.payload
  return selectionOps.selectNodes(state, [nodeId])
}


export const deselectNodesIntent: IntentHandler<'DESELECT_NODES'> = (state, cmd) => {
  const { nodeIds } = cmd.payload
  return selectionOps.deselectNodes(state, nodeIds)
}

