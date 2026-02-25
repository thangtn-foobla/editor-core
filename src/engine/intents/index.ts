import type { IntentMap } from '../../interfaces/domain/Engine'

import { addNodeIntent, removeNodeIntent, removeNodesIntent, updateNodeIntent, updateNodesIntent, updateTextIntent } from './nodeIntents'
import { reorderNodeIntent } from './orderIntents'
import { deselectNodesIntent, selectNodeIntent } from './selectionIntents'
import { panIntent, zoomIntent } from './zoomIntents'

/** Map from command type to intent handler. Used by createEditorEngine. */
export const intentMap = {
  ADD_NODE: addNodeIntent,
  REMOVE_NODE: removeNodeIntent,
  REMOVE_NODES: removeNodesIntent,
  UPDATE_NODE: updateNodeIntent,
  UPDATE_NODES: updateNodesIntent,
  UPDATE_TEXT: updateTextIntent,
  REORDER: reorderNodeIntent,
  SELECT_NODE: selectNodeIntent,
  DESELECT_NODES: deselectNodesIntent,
  SET_ZOOM: zoomIntent,
  PAN_VIEWPORT: panIntent,
} satisfies IntentMap

export { addNodeIntent, removeNodeIntent, updateNodeIntent, updateNodesIntent, updateTextIntent, reorderNodeIntent, selectNodeIntent }