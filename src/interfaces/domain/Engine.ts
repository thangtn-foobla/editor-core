import type { EditorState } from './EditorState'
import type { Command } from './Command'

export type IntentHandler<T extends Command['type']> = (
  state: EditorState,
  command: Extract<Command, { type: T }>
) => EditorState

export type IntentMap = {
  [K in Command['type']]: IntentHandler<K>
}

export type Subscriber = (state: EditorState) => void

export interface EngineOptions {
  initialState: EditorState
  intentMap: IntentMap
}

export interface EditorEngine {
  getState(): EditorState
  dispatch(command: Command): void
  undo(): void
  redo(): void
  subscribe(listener: Subscriber): () => void
  // notify(): void
}

export type CreateEditorEngine = (options: EngineOptions) => EditorEngine
