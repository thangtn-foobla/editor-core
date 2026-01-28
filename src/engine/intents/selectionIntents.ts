import type { IntentHandler } from '../../interfaces/domain/Engine'
import { selectionOps } from '../ops/selectionOps'

export const selectNodeIntent: IntentHandler<'SELECT_NODE'> = (state, cmd) => {
  const { nodeId } = cmd.payload
  return selectionOps.selectNodes(state, [nodeId])
}

