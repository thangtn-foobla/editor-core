import type { Command } from '../interfaces/domain/Command'
import type { EditorEngine } from '../interfaces/domain/Engine'
import type { EditorState } from '../interfaces/domain'
import type {
  EditorDevToolsBridge,
  EditorDevToolsOptions,
  DevToolsLogEntry,
  DevToolsLogSource,
  EditorStateSnapshot
} from './types'
import { serializeState } from './serializeState'
import { deserializeState } from './deserializeState'

const DEFAULT_MAX_LOG_SIZE = 100

let idCounter = 0
function nextId(): string {
  idCounter += 1
  return `devtools-${idCounter}-${Date.now()}`
}

/**
 * Creates a devtools bridge. Pass the returned `logger` to createEditorEngine
 * when debug: true, then call connect(engine) so replaceStateAt and exportStateJSON work.
 *
 * @example
 * const devTools = createEditorDevTools({ maxLogSize: 50 })
 * const engine = createEditorEngine({ initialState, intentMap, debug: true, logger: devTools.logger })
 * devTools.connect(engine)
 * devTools.replaceStateAt(0) // time-travel
 * const json = devTools.exportStateJSON()
 */
export function createEditorDevTools(
  options: EditorDevToolsOptions = {}
): EditorDevToolsBridge {
  const maxLogSize = options.maxLogSize ?? DEFAULT_MAX_LOG_SIZE
  const log: DevToolsLogEntry[] = []
  let engineRef: EditorEngine | null = null

  function appendEntry(
    source: DevToolsLogSource,
    state: EditorState,
    command?: Command | null
  ): void {
    const snapshot = serializeState(state)
    const entry: DevToolsLogEntry = {
      id: nextId(),
      timestamp: Date.now(),
      source,
      ...(command !== undefined && command !== null && { command }),
      stateSnapshot: snapshot
    }
    log.push(entry)
    if (log.length > maxLogSize) {
      log.splice(0, log.length - maxLogSize)
    }
  }

  const logger: EditorDevToolsBridge['logger'] = (state, command) => {
    const source: DevToolsLogSource =
      command !== undefined && command !== null ? 'dispatch' : 'replace'
    appendEntry(source, state, command)
  }

  function connect(engine: EditorEngine): void {
    engineRef = engine
  }

  function getLog(): DevToolsLogEntry[] {
    return [...log]
  }

  function getStateAt(index: number): EditorStateSnapshot | null {
    if (index < 0 || index >= log.length) return null
    return log[index].stateSnapshot
  }

  function replaceStateAt(index: number): void {
    if (engineRef == null) return
    const snapshot = getStateAt(index)
    if (snapshot == null) return
    const state = deserializeState(snapshot)
    engineRef.replaceState(state)
  }

  function exportStateJSON(): string {
    if (engineRef == null) return '{}'
    const state = engineRef.getState()
    const snapshot = serializeState(state)
    return JSON.stringify(snapshot, null, 2)
  }

  function getCurrentIndex(): number {
    return Math.max(0, log.length - 1)
  }

  return {
    logger,
    connect,
    getLog,
    getStateAt,
    replaceStateAt,
    exportStateJSON,
    getCurrentIndex
  }
}
