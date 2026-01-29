import type { EditorState } from './EditorState'
import type { Command } from './Command'

/**
 * Handler that applies a command of type `T` to the current editor state.
 */
export type IntentHandler<T extends Command['type']> = (
  state: EditorState,
  command: Extract<Command, { type: T }>
) => EditorState

/**
 * Map from command type to the handler responsible for processing it.
 */
export type IntentMap = {
  [K in Command['type']]: IntentHandler<K>
}

/**
 * Callback invoked whenever the editor state changes.
 */
export type Subscriber = (state: EditorState) => void

/**
 * Configuration options for creating an `EditorEngine` instance.
 */
export interface EngineOptions {
  /**
   * Initial editor state before any commands are dispatched.
   */
  initialState: EditorState
  /**
   * Lookup table mapping command types to intent handlers.
   */
  intentMap: IntentMap
}

/**
 * Public interface of the editor engine.
 */
export interface EditorEngine {
  /**
   * Returns the current editor state.
   */
  getState(): EditorState
  /**
   * Applies the given command to the current state.
   */
  dispatch(command: Command): void
  /**
   * Reverts the last command, if possible.
   */
  undo(): void
  /**
   * Re-applies a previously undone command, if possible.
   */
  redo(): void
  /**
   * Subscribes to state changes. Returns an unsubscribe function.
   */
  subscribe(listener: Subscriber): () => void
  // notify(): void
}

/**
 * Factory function that creates a new `EditorEngine` instance.
 */
export type CreateEditorEngine = (options: EngineOptions) => EditorEngine
