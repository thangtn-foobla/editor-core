import { SerializableDocument } from "../interfaces/SerializableDocument";

/**
 * Upgrades a serialized document to the latest schema version. Throws if the version is unsupported.
 */
export function migrate(doc: SerializableDocument): SerializableDocument {
  switch (doc.version) {
    case 1:
      return doc
    default:
      throw new Error('Unsupported document version')
  }
}