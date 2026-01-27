import type {
  CreateEditorEngine,
  IntentHandler,
  Subscriber
} from '../interfaces/domain/Engine'
import type { Command } from '../interfaces/domain/Command'
import { historyEngine } from './historyEngine'
import { historyOps } from './ops/historyOps'

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

    if (next === state) {
      return
    }

    const shouldRecordHistory = command.meta?.recordHistory !== false
    if (shouldRecordHistory) {
      next.history = historyOps.record(state.history, command)
    }
    state = next

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


  return {
    getState,
    dispatch,
    undo,
    redo,
    subscribe,
    notify
  }
}
