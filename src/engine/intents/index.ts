import type { IntentMap } from '../../interfaces/domain/Engine'

import { addNodeIntent, removeNodeIntent, removeNodesIntent, updateNodeIntent } from './nodeIntents'
import { reorderNodeIntent } from './orderIntents'
import { selectNodeIntent } from './selectionIntents'

export const intentMap = {
  ADD_NODE: addNodeIntent,
  REMOVE_NODE: removeNodeIntent,
  UPDATE_NODE: updateNodeIntent,
  REORDER: reorderNodeIntent,
  SELECT_NODE: selectNodeIntent,
  REMOVE_NODES: removeNodesIntent,
} satisfies IntentMap

export { addNodeIntent, removeNodeIntent, updateNodeIntent, reorderNodeIntent, selectNodeIntent }