import { SerializableDocument } from "../interfaces/SerializableDocument";

export function migrate(doc: SerializableDocument): SerializableDocument {
  switch (doc.version) {
    case 1:
      return doc
    default:
      throw new Error('Unsupported document version')
  }
}