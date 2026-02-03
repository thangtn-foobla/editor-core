import type { EditorState } from '../interfaces/domain';
import type { EditorStateSnapshot } from './types';
/**
 * Deserializes a devtools snapshot back into EditorState (nodes as Map).
 * Used for time-travel: replaceStateAt restores via this.
 */
export declare function deserializeState(snapshot: EditorStateSnapshot): EditorState;
//# sourceMappingURL=deserializeState.d.ts.map