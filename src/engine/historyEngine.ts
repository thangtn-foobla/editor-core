import type { IntentHandler, IntentMap } from '../interfaces/domain/Engine'
import type { EditorState } from '../interfaces/domain/EditorState'
import type { Command } from '../interfaces/domain/Command'

function replay(
  initial: EditorState,
  commands: Command[],
  intentMap: IntentMap
): EditorState {
  return commands.reduce((state, command) => {
    const intent = intentMap[command.type] as IntentHandler<typeof command.type>
    return intent ? intent(state, command) : state
  }, initial)
}

function undo(
  state: EditorState,
  initial: EditorState,
  intentMap: IntentMap
): EditorState | null {
  const { past, future } = state.history
  if (past.length === 0) return null

  const undone = past.at(-1)
  const remaining = past.slice(0, -1)

  const replayed = replay(initial, remaining, intentMap)
  return {
    ...replayed,
    history: {
      past: remaining,
      future: undone ? [undone, ...future] : future
    }
  }
}

function redo(
  state: EditorState,
  initial: EditorState,
  intentMap: IntentMap
): EditorState | null {
  const { past, future } = state.history
  if (future.length === 0) return null

  const redone = future[0]
  const remaining = future.slice(1)
  const replayed = replay(initial, [...past, redone], intentMap)
  return {
    ...replayed,
    history: {
      past: [...past, redone],
      future: remaining
    }
  }
}

export const historyEngine = {
  undo,
  redo
}
