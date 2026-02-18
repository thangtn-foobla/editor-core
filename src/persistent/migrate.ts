import { SerializableDocument } from "../interfaces/SerializableDocument";

/**
 * Upgrades a serialized document to the latest schema version.
 * v1 → v2: moves semantic data from style to content field.
 * Throws if the version is unsupported.
 */
export function migrate(doc: SerializableDocument): SerializableDocument {
  switch (doc.version) {
    case 1: {
      const migratedNodes = doc.nodes.map(node => {
        let content: Record<string, any> | undefined
        const style = { ...node.style }

        if (node.type === 'text') {
          content = { text: typeof style.text === 'string' ? style.text : '' }
          delete style.text
        } else if (node.type === 'image') {
          content = { src: typeof style.src === 'string' ? style.src : '' }
          delete style.src
        }

        return { ...node, style, content }
      })
      return { ...doc, version: 2, nodes: migratedNodes }
    }
    case 2:
      return doc
    default:
      throw new Error('Unsupported document version')
  }
}
