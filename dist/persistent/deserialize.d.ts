import { EditorState } from "../interfaces/domain";
import { SerializableDocument } from "../interfaces/SerializableDocument";
/**
 * Builds editor state from a serialized document, using initialState for defaults (e.g. history, viewport).
 */
export declare function deserialize(document: SerializableDocument, initialState: EditorState): EditorState;
//# sourceMappingURL=deserialize.d.ts.map