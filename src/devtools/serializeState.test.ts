import { describe, it, expect } from 'vitest'
import { serializeState } from './serializeState'
import { deserializeState } from './deserializeState'
import type { EditorState } from '../interfaces/domain/EditorState'
import type { Node } from '../interfaces/domain/Node'

function createNode(id: string): Node {
  return {
    id,
    type: 'text',
    geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
    state: { hidden: false, locked: false },
    style: {}
  }
}

function createState(overrides: Partial<EditorState> = {}): EditorState {
  return {
    nodes: new Map(),
    order: [],
    selection: { nodeIds: [] },
    history: { past: [], future: [] },
    viewport: { scale: 1, x: 0, y: 0 },
    ...overrides
  }
}

describe('serializeState / deserializeState', () => {
  it('roundtrips empty state', () => {
    const state = createState()
    const snapshot = serializeState(state)
    expect(snapshot.version).toBe(1)
    expect(snapshot.nodes).toEqual([])
    expect(snapshot.order).toEqual([])
    expect(snapshot.selection.nodeIds).toEqual([])
    expect(snapshot.history.past).toEqual([])
    expect(snapshot.history.future).toEqual([])

    const restored = deserializeState(snapshot)
    expect(restored.nodes.size).toBe(0)
    expect(restored.order).toEqual([])
    expect(restored.selection.nodeIds).toEqual([])
    expect(restored.history.past).toEqual([])
    expect(restored.history.future).toEqual([])
    expect(restored.viewport).toEqual(state.viewport)
  })

  it('roundtrips state with nodes and selection', () => {
    const nodes = new Map<string, Node>([
      ['a', createNode('a')],
      ['b', createNode('b')]
    ])
    const state = createState({
      nodes,
      order: ['a', 'b'],
      selection: { nodeIds: ['a'], primary: 'a' },
      history: { past: [], future: [] }
    })
    const snapshot = serializeState(state)
    expect(snapshot.nodes).toHaveLength(2)
    expect(snapshot.order).toEqual(['a', 'b'])
    expect(snapshot.selection.nodeIds).toEqual(['a'])
    expect(snapshot.selection.primary).toBe('a')

    const restored = deserializeState(snapshot)
    expect(restored.nodes.size).toBe(2)
    expect(restored.nodes.get('a')).toEqual(createNode('a'))
    expect(restored.order).toEqual(['a', 'b'])
    expect(restored.selection.nodeIds).toEqual(['a'])
    expect(restored.selection.primary).toBe('a')
  })

  it('throws on unsupported snapshot version', () => {
    const snapshot = serializeState(createState())
      ; (snapshot as { version: number }).version = 99
    expect(() => deserializeState(snapshot)).toThrow('Unsupported devtools snapshot version')
  })
})
