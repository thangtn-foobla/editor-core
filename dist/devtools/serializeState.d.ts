import type { EditorState } from '../interfaces/domain';
import type { EditorStateSnapshot } from './types';
/**
 * Serializes full editor state to a plain snapshot (no Map).
 * Used by devtools for log entries and export.
 */
export declare function serializeState(state: EditorState): EditorStateSnapshot;
//# sourceMappingURL=serializeState.d.ts.map