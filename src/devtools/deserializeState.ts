import type { EditorState, Node } from '../interfaces/domain'
import type { EditorStateSnapshot } from './types'

/**
 * Deserializes a devtools snapshot back into EditorState (nodes as Map).
 * Used for time-travel: replaceStateAt restores via this.
 */
export function deserializeState(snapshot: EditorStateSnapshot): EditorState {
  if (snapshot.version !== 1) {
    throw new Error(`Unsupported devtools snapshot version: ${snapshot.version}`)
  }

  const nodes = new Map<string, Node>()
  for (const n of snapshot.nodes) {
    nodes.set(n.id, {
      id: n.id,
      type: n.type as Node['type'],
      geometry: n.geometry,
      state: n.state,
      style: n.style ?? {}
    })
  }

  return {
    nodes,
    order: [...snapshot.order],
    viewport: { ...snapshot.viewport },
    selection: {
      nodeIds: [...snapshot.selection.nodeIds],
      ...(snapshot.selection.primary != null && { primary: snapshot.selection.primary })
    },
    history: {
      past: [...snapshot.history.past],
      future: [...snapshot.history.future]
    }
  }
}
