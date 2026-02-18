import { describe, it, expect, beforeEach } from 'vitest'
import { createEditorEngine } from '../engine/createEditorEngine'
import { intentMap } from '../engine/intents'
import { createEditorDevTools } from './bridge'
import type { EditorState } from '../interfaces/domain/EditorState'
import type { Node } from '../interfaces/domain/Node'

function createNode(id: string): Node {
  return {
    id,
    type: 'text',
    content: { text: '' },
    geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
    state: { hidden: false, locked: false },
    style: {}
  }
}

function createInitialState(): EditorState {
  return {
    nodes: new Map(),
    order: [],
    selection: { nodeIds: [] },
    history: { past: [], future: [] },
    viewport: { scale: 1, x: 0, y: 0 }
  }
}

describe('createEditorDevTools', () => {
  let engine: ReturnType<typeof createEditorEngine>
  let devTools: ReturnType<typeof createEditorDevTools>

  beforeEach(() => {
    const initialState = createInitialState()
    devTools = createEditorDevTools({ maxLogSize: 50 })
    engine = createEditorEngine({
      initialState,
      intentMap,
      debug: true,
      logger: devTools.logger
    })
    devTools.connect(engine)
  })

  it('records log entry on dispatch', () => {
    expect(devTools.getLog()).toHaveLength(0)

    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })

    const log = devTools.getLog()
    expect(log).toHaveLength(1)
    expect(log[0].source).toBe('dispatch')
    expect(log[0].command?.type).toBe('ADD_NODE')
    expect(log[0].stateSnapshot.order).toEqual(['node-1'])
  })

  it('records log entry on undo with source replace', () => {
    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })
    const lenAfterDispatch = devTools.getLog().length
    engine.undo()
    const log = devTools.getLog()
    expect(log).toHaveLength(lenAfterDispatch + 1)
    expect(log[log.length - 1].source).toBe('replace')
    expect(log[log.length - 1].stateSnapshot.order).toEqual([])
  })

  it('getStateAt returns snapshot at index', () => {
    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })
    const at0 = devTools.getStateAt(0)
    expect(at0).not.toBeNull()
    expect(at0!.order).toEqual(['node-1'])
    expect(devTools.getStateAt(-1)).toBeNull()
    expect(devTools.getStateAt(10)).toBeNull()
  })

  it('replaceStateAt restores state (time-travel)', () => {
    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })
    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-2') },
      meta: { source: 'ui' }
    })
    expect(engine.getState().order).toEqual(['node-1', 'node-2'])

    devTools.replaceStateAt(0)
    expect(engine.getState().order).toEqual(['node-1'])
  })

  it('exportStateJSON returns current state as JSON', () => {
    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })
    const json = devTools.exportStateJSON()
    const parsed = JSON.parse(json)
    expect(parsed.version).toBe(1)
    expect(parsed.order).toEqual(['node-1'])
    expect(parsed.nodes).toHaveLength(1)
  })

  it('getCurrentIndex returns last log index', () => {
    expect(devTools.getCurrentIndex()).toBe(0)
    engine.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })
    expect(devTools.getCurrentIndex()).toBe(0)
    const log = devTools.getLog()
    expect(log.length).toBe(1)
    expect(devTools.getCurrentIndex()).toBe(0)
  })

  it('replaceStateAt is no-op when not connected', () => {
    const devToolsOnly = createEditorDevTools()
    const initialState = createInitialState()
    const eng = createEditorEngine({
      initialState,
      intentMap,
      debug: true,
      logger: devToolsOnly.logger
    })
    eng.dispatch({
      type: 'ADD_NODE',
      payload: { node: createNode('node-1') },
      meta: { source: 'ui' }
    })
    expect(devToolsOnly.getLog()).toHaveLength(1)
    devToolsOnly.replaceStateAt(0)
    expect(eng.getState().order).toEqual(['node-1'])
  })

  it('exportStateJSON returns {} when not connected', () => {
    const devToolsOnly = createEditorDevTools()
    expect(devToolsOnly.exportStateJSON()).toBe('{}')
  })

  it('caps log at maxLogSize', () => {
    const smallDevTools = createEditorDevTools({ maxLogSize: 3 })
    const eng = createEditorEngine({
      initialState: createInitialState(),
      intentMap,
      debug: true,
      logger: smallDevTools.logger
    })
    smallDevTools.connect(eng)
    for (let i = 0; i < 5; i++) {
      eng.dispatch({
        type: 'ADD_NODE',
        payload: { node: createNode(`node-${i}`) },
        meta: { source: 'ui' }
      })
    }
    expect(smallDevTools.getLog()).toHaveLength(3)
  })
})
