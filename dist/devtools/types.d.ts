import type { Command } from '../interfaces/domain/Command';
import type { EditorEngine } from '../interfaces/domain/Engine';
import type { EditorState } from '../interfaces/domain/EditorState';
import type { Selection } from '../interfaces/domain/Selection';
import type { SerializableNode } from '../interfaces/SerializableDocument';
/**
 * Serialized form of EditorState for devtools log and time-travel.
 * Plain object only (no Map); safe to JSON.stringify.
 */
export interface EditorStateSnapshot {
    version: number;
    nodes: SerializableNode[];
    order: string[];
    viewport: EditorState['viewport'];
    selection: Selection;
    history: {
        past: Command[];
        future: Command[];
    };
}
/**
 * Source of a state change recorded by devtools.
 */
export type DevToolsLogSource = 'dispatch' | 'undo' | 'redo' | 'replace';
/**
 * Single entry in the devtools log. Created on every state change when
 * the engine is wired with the devtools logger.
 */
export interface DevToolsLogEntry {
    id: string;
    timestamp: number;
    source: DevToolsLogSource;
    /** Present when source is 'dispatch'. */
    command?: Command | null;
    stateSnapshot: EditorStateSnapshot;
}
/**
 * Options for createEditorDevTools.
 */
export interface EditorDevToolsOptions {
    /** Max number of log entries to keep. Default 100. */
    maxLogSize?: number;
}
/**
 * Bridge returned by createEditorDevTools. Consumer uses this to build
 * UI (state inspector, action log, time-travel, export).
 */
export interface EditorDevToolsBridge {
    /** Logger to pass to createEditorEngine when debug: true. */
    logger: (state: EditorState, command?: Command | null) => void;
    /** Connect the engine after creation. Required for replaceStateAt and exportStateJSON. */
    connect(engine: EditorEngine): void;
    /** All log entries (newest at end). */
    getLog(): DevToolsLogEntry[];
    /** Snapshot at given index, or null if out of range. */
    getStateAt(index: number): EditorStateSnapshot | null;
    /** Restore state at index via engine.replaceState (time-travel). No-op if not connected. */
    replaceStateAt(index: number): void;
    /** JSON string of current engine state (for export/download). Returns "{}" if not connected. */
    exportStateJSON(): string;
    /** Index of the latest log entry (current state). */
    getCurrentIndex(): number;
}
//# sourceMappingURL=types.d.ts.map