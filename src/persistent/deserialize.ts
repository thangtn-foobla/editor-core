import { EditorState, Node } from "../interfaces/domain";
import { SerializableDocument } from "../interfaces/SerializableDocument";

/**
 * Builds editor state from a serialized document, using initialState for defaults (e.g. history, viewport).
 */
export function deserialize(document: SerializableDocument, initialState: EditorState): EditorState {

  if (document.version !== 1) {
    throw new Error('Unsupported document version')
  }

  const nodes = new Map<string, Node>()
  for (const node of document.nodes) {
    nodes.set(node.id, {
      id: node.id,
      type: node.type as Node['type'],
      geometry: node.geometry,
      state: node.state,
      style: node.style
    })
  }

  return {
    ...initialState,
    nodes,
    order: document.order,
    viewport: document.viewport ? {
      ...document.viewport,
    } : initialState.viewport,
    selection: { nodeIds: [] },
    history: initialState.history,
  } as EditorState
}