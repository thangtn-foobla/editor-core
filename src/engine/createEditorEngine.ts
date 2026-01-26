import type {
  CreateEditorEngine,
  IntentHandler,
  Subscriber
} from '../interfaces/domain/Engine.ts'
import type { Command } from '../interfaces/domain/Command.ts'
import { historyEngine } from './historyEngine.ts'
import { historyOps } from './ops/historyOps.ts'

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
    const next = intent(state, command)
    const changed = next !== state

    if (changed) {
      next.history = historyOps.record(state.history, command)
      notify()
    }
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

  return {
    getState,
    dispatch,
    undo,
    redo,
    subscribe,
    notify
  }
}
