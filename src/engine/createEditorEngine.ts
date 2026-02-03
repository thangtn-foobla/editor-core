import type {
  CreateEditorEngine,
  IntentHandler,
  Subscriber
} from '../interfaces/domain/Engine'
import type { EditorState, Command } from '../interfaces/domain'
import { historyEngine } from './historyEngine'
import { historyOps } from './ops/historyOps'

/**
 * Creates a new editor engine instance wired up with history support.
 * The returned engine exposes a minimal API for reading state,
 * dispatching commands and subscribing to changes.
 */
export const createEditorEngine: CreateEditorEngine = options => {
  const { initialState, intentMap } = options
  let state = initialState
  const subscribers = new Set<Subscriber>()

  function getState() {
    return state
  }

  function notify() {
    for (const sub of subscribers) {
      sub(state)
    }
  }

  function dispatch(command: Command) {
    const intent = intentMap[command.type] as IntentHandler<typeof command.type>
    if (!intent) {
      throw new Error(`No intent found for command type ${command.type}`)
    }
    const prev = state
    const next = intent(prev, command)

    if (next === prev) {
      return
    }

    const shouldRecordHistory = command.meta?.recordHistory !== false
    state = {
      ...next,
      history: shouldRecordHistory ? historyOps.record(prev.history, command) : prev.history
    }
    notify()
  }
  function undo() {
    const result = historyEngine.undo(state, initialState, intentMap)
    if (!result) return
    state = result
    notify()
  }

  function redo() {
    const result = historyEngine.redo(state, initialState, intentMap)
    if (!result) return
    state = result
    notify()
  }

  function subscribe(listener: Subscriber) {
    subscribers.add(listener)
    return () => subscribers.delete(listener)
  }

  function replaceState(nextState: EditorState) {
    state = nextState
    notify()
  }


  return {
    getState,
    dispatch,
    undo,
    redo,
    subscribe,
    replaceState,
  }
}
