import type { IntentMap } from '../../interfaces/domain/Engine.ts'

import { addNodeIntent, removeNodeIntent, updateNodeIntent } from './nodeIntents'
import { reorderNodeIntent } from './orderIntents.ts'
import { selectNodeIntent } from './selectionIntents.ts'

export const intentMap = {
  ADD_NODE: addNodeIntent,
  REMOVE_NODE: removeNodeIntent,
  UPDATE_NODE: updateNodeIntent,
  REORDER: reorderNodeIntent,
  SELECT_NODE: selectNodeIntent,
} satisfies IntentMap