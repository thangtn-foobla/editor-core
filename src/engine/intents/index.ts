import type { IntentMap } from '../../interfaces/domain/Engine'

import { addNodeIntent, removeNodeIntent, removeNodesIntent, updateNodeIntent } from './nodeIntents'
import { reorderNodeIntent } from './orderIntents'
import { deselectNodesIntent, selectNodeIntent } from './selectionIntents'
import { panIntent, zoomIntent } from './zoomIntents'

export const intentMap = {
  ADD_NODE: addNodeIntent,
  REMOVE_NODE: removeNodeIntent,
  REMOVE_NODES: removeNodesIntent,
  UPDATE_NODE: updateNodeIntent,
  REORDER: reorderNodeIntent,
  SELECT_NODE: selectNodeIntent,
  DESELECT_NODES: deselectNodesIntent,
  SET_ZOOM: zoomIntent,
  PAN_VIEWPORT: panIntent,
} satisfies IntentMap

export { addNodeIntent, removeNodeIntent, updateNodeIntent, reorderNodeIntent, selectNodeIntent }