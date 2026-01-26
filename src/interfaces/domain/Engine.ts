import type { EditorState } from './EditorState.ts'
import type { Command } from './Command.ts'

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
  notify(): void
}

export type CreateEditorEngine = (options: EngineOptions) => EditorEngine
