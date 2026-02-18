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
    const base = {
      id: n.id,
      type: n.type as Node['type'],
      geometry: n.geometry,
      state: n.state,
      style: n.style ?? {},
    }

    if (n.content) {
      nodes.set(n.id, { ...base, content: n.content } as Node)
    } else if (n.type === 'text') {
      nodes.set(n.id, { ...base, content: { text: (n.style as any)?.text ?? '' } } as Node)
    } else if (n.type === 'image') {
      nodes.set(n.id, { ...base, content: { src: (n.style as any)?.src ?? '' } } as Node)
    } else {
      nodes.set(n.id, { ...base, content: {} } as Node)
    }
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
