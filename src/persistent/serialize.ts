import { EditorState } from "../interfaces/domain"
import { SerializableDocument } from "../interfaces/SerializableDocument"


export function serialize(state: EditorState): SerializableDocument {
  return {
    version: 1,
    nodes: Array.from(state.nodes.values()).map(node => ({
      id: node.id,
      type: node.type,
      geometry: node.geometry,
      state: node.state,
      style: node.style ? { ...node.style } : {}
    })),
    order: state.order,
    viewport: state.viewport
  } as SerializableDocument
}