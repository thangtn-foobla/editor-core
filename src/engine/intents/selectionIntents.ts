import { selectionOps } from '../ops/selectionOps'
import type { IntentHandler } from '../../interfaces/domain/Engine.ts'
export const selectNodeIntent: IntentHandler<'SELECT_NODE'> = (state, cmd) => {
  const { nodeId } = cmd.payload
  return selectionOps.selectNodes(state, [nodeId])
}