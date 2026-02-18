import { EditorState, Node } from "../interfaces/domain";
import { SerializableDocument } from "../interfaces/SerializableDocument";

/**
 * Migrate a v1 serialized node (content stored in style) to the v2 structure
 * where semantic data lives in the `content` field.
 */
function migrateNodeContent(raw: { type: string; style: Record<string, any>; content?: Record<string, any> }): Record<string, any> {
  if (raw.content) return raw.content

  if (raw.type === 'text') {
    const text = typeof raw.style?.text === 'string' ? raw.style.text : ''
    return { text }
  }
  if (raw.type === 'image') {
    const src = typeof raw.style?.src === 'string' ? raw.style.src : ''
    return { src }
  }
  return {}
}

/**
 * Clean v1 style by removing semantic fields that have been moved to `content`.
 */
function cleanMigratedStyle(type: string, style: Record<string, any>, hadContent: boolean): Record<string, any> {
  if (hadContent) return style
  const cleaned = { ...style }
  if (type === 'text') delete cleaned.text
  if (type === 'image') delete cleaned.src
  return cleaned
}

/**
 * Builds editor state from a serialized document, using initialState for defaults (e.g. history, viewport).
 * Supports both v1 (content in style) and v2 (content field) document formats.
 */
export function deserialize(document: SerializableDocument, initialState: EditorState): EditorState {

  if (document.version !== 1 && document.version !== 2) {
    throw new Error('Unsupported document version')
  }

  const nodes = new Map<string, Node>()
  for (const raw of document.nodes) {
    const hadContent = !!raw.content
    const content = migrateNodeContent(raw)
    const style = cleanMigratedStyle(raw.type, raw.style, hadContent)

    nodes.set(raw.id, {
      id: raw.id,
      type: raw.type as Node['type'],
      geometry: raw.geometry,
      state: raw.state,
      style,
      content,
    } as Node)
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
