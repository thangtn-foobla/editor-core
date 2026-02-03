import type { IntentHandler } from '../../interfaces/domain/Engine'
import { selectionOps } from '../ops/selectionOps'

/** Intent handler for selecting a single node. */
export const selectNodeIntent: IntentHandler<'SELECT_NODE'> = (state, cmd) => {
  const { nodeId } = cmd.payload
  return selectionOps.selectNodes(state, [nodeId])
}

/** Intent handler for deselecting one or more nodes. */
export const deselectNodesIntent: IntentHandler<'DESELECT_NODES'> = (state, cmd) => {
  const { nodeIds } = cmd.payload
  return selectionOps.deselectNodes(state, nodeIds)
}

