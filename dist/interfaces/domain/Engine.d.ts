import type { EditorState } from './EditorState';
import type { Command } from './Command';
/**
 * Handler that applies a command of type `T` to the current editor state.
 */
export type IntentHandler<T extends Command['type']> = (state: EditorState, command: Extract<Command, {
    type: T;
}>) => EditorState;
/**
 * Map from command type to the handler responsible for processing it.
 */
export type IntentMap = {
    [K in Command['type']]: IntentHandler<K>;
};
/**
 * Callback invoked whenever the editor state changes.
 */
export type Subscriber = (state: EditorState) => void;
/**
 * Optional debug logger. When `debug` is true and this is provided, it is called
 * on every state change. For dispatch: (state, command). For undo/redo/replaceState: (state).
 */
export type DebugLogger = (state: EditorState, command?: Command | null) => void;
/**
 * Configuration options for creating an `EditorEngine` instance.
 */
export interface EngineOptions {
    /**
     * Initial editor state before any commands are dispatched.
     */
    initialState: EditorState;
    /**
     * Lookup table mapping command types to intent handlers.
     */
    intentMap: IntentMap;
    /**
     * Debug mode. When true and `logger` is provided, state changes are logged.
     */
    debug?: boolean;
    /**
     * Optional logger (e.g. console.log in browser, vi.fn() in tests). Only used when debug is true.
     */
    logger?: DebugLogger;
}
/**
 * Public interface of the editor engine.
 */
export interface EditorEngine {
    /**
     * Returns the current editor state.
     */
    getState(): EditorState;
    /**
     * Applies the given command to the current state.
     */
    dispatch(command: Command): void;
    /**
     * Reverts the last command, if possible.
     */
    undo(): void;
    /**
     * Re-applies a previously undone command, if possible.
     */
    redo(): void;
    /**
     * Subscribes to state changes. Returns an unsubscribe function.
     */
    subscribe(listener: Subscriber): () => void;
    /**
    * Replace the current state with a new one.
    */
    replaceState(nextState: EditorState): void;
}
/**
 * Factory function that creates a new `EditorEngine` instance.
 */
export type CreateEditorEngine = (options: EngineOptions) => EditorEngine;
//# sourceMappingURL=Engine.d.ts.map