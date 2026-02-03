import type { EditorState } from '../interfaces/domain'
import type { EditorStateSnapshot } from './types'

const SNAPSHOT_VERSION = 1

/**
 * Serializes full editor state to a plain snapshot (no Map).
 * Used by devtools for log entries and export.
 */
export function serializeState(state: EditorState): EditorStateSnapshot {
  return {
    version: SNAPSHOT_VERSION,
    nodes: Array.from(state.nodes.values()).map(node => ({
      id: node.id,
      type: node.type,
      geometry: node.geometry,
      state: node.state,
      style: node.style ? { ...node.style } : {}
    })),
    order: [...state.order],
    viewport: { ...state.viewport },
    selection: {
      nodeIds: [...state.selection.nodeIds],
      ...(state.selection.primary != null && { primary: state.selection.primary })
    },
    history: {
      past: [...state.history.past],
      future: [...state.history.future]
    }
  }
}
