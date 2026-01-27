import type { IntentMap } from '../interfaces/domain/Engine';
import type { EditorState } from '../interfaces/domain/EditorState';
declare function undo(state: EditorState, initial: EditorState, intentMap: IntentMap): EditorState | null;
declare function redo(state: EditorState, initial: EditorState, intentMap: IntentMap): EditorState | null;
export declare const historyEngine: {
    undo: typeof undo;
    redo: typeof redo;
};
export {};
//# sourceMappingURL=historyEngine.d.ts.map