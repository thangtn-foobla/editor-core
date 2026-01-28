import { describe, it, expect } from 'vitest'
import { selectNodeIntent, removeSelectedNodesIntent } from './selectionIntents'
import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'
import type {
  SelectionCommand,
  RemoveSelectedNodesCommand
} from '../../interfaces/domain/Command'

function createNode(id: string): Node {
  return {
    id,
    type: 'text',
    geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
    state: { hidden: false, locked: false },
    style: {}
  }
}

function createStateWithSelection(nodeIds: string[], selectedIds: string[]): EditorState {
  const nodes = new Map<string, Node>()
  nodeIds.forEach(id => {
    nodes.set(id, createNode(id))
  })
  return {
    nodes,
    order: [...nodeIds],
    selection: { nodeIds: selectedIds },
    history: { past: [], future: [] }
  }
}

describe('selectionIntents', () => {
  describe('selectNodeIntent', () => {
    it('should select a single node', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], [])
      const command: SelectionCommand = {
        type: 'SELECT_NODE',
        payload: { nodeId: 'node-1' },
        meta: { source: 'ui' }
      }

      const result = selectNodeIntent(state, command)

      expect(result.selection.nodeIds).toEqual(['node-1'])
    })

    it('should replace existing selection', () => {
      const state = createStateWithSelection(['node-1', 'node-2', 'node-3'], ['node-1'])
      const command: SelectionCommand = {
        type: 'SELECT_NODE',
        payload: { nodeId: 'node-2' },
        meta: { source: 'ui' }
      }

      const result = selectNodeIntent(state, command)

      expect(result.selection.nodeIds).toEqual(['node-2'])
    })

    it('should select a different node', () => {
      const state = createStateWithSelection(['node-1', 'node-2', 'node-3'], ['node-1'])
      const command: SelectionCommand = {
        type: 'SELECT_NODE',
        payload: { nodeId: 'node-3' },
        meta: { source: 'ui' }
      }

      const result = selectNodeIntent(state, command)

      expect(result.selection.nodeIds).toEqual(['node-3'])
      expect(result.selection.nodeIds).not.toContain('node-1')
    })

    it('should not modify the original state', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], [])
      const command: SelectionCommand = {
        type: 'SELECT_NODE',
        payload: { nodeId: 'node-1' },
        meta: { source: 'ui' }
      }

      selectNodeIntent(state, command)

      expect(state.selection.nodeIds).toEqual([])
    })
  })

  describe('removeSelectedNodesIntent', () => {
    function createStateWithNodesAndSelection(
      nodeIds: string[],
      selectedIds: string[]
    ): EditorState {
      const nodes = new Map<string, Node>()
      nodeIds.forEach(id => {
        nodes.set(id, createNode(id))
      })
      return {
        nodes,
        order: [...nodeIds],
        selection: { nodeIds: selectedIds },
        history: { past: [], future: [] }
      }
    }

    it('should do nothing when there is no selection', () => {
      const state = createStateWithNodesAndSelection(['node-1', 'node-2'], [])
      const command: RemoveSelectedNodesCommand = {
        type: 'REMOVE_SELECTED_NODES',
        payload: {},
        meta: { source: 'ui' }
      }

      const result = removeSelectedNodesIntent(state, command)

      expect(result).toBe(state)
    })

    it('should remove all selected nodes from state', () => {
      const state = createStateWithNodesAndSelection(
        ['node-1', 'node-2', 'node-3'],
        ['node-1', 'node-3']
      )
      const command: RemoveSelectedNodesCommand = {
        type: 'REMOVE_SELECTED_NODES',
        payload: {},
        meta: { source: 'ui' }
      }

      const result = removeSelectedNodesIntent(state, command)

      // nodes map
      expect(result.nodes.has('node-1')).toBe(false)
      expect(result.nodes.has('node-3')).toBe(false)
      expect(result.nodes.has('node-2')).toBe(true)

      // order
      expect(result.order).toEqual(['node-2'])

      // selection cleared
      expect(result.selection.nodeIds).toEqual([])
    })

    it('should only remove currently selected nodes', () => {
      const state = createStateWithNodesAndSelection(
        ['node-1', 'node-2', 'node-3'],
        ['node-2']
      )
      const command: RemoveSelectedNodesCommand = {
        type: 'REMOVE_SELECTED_NODES',
        payload: {},
        meta: { source: 'ui' }
      }

      const result = removeSelectedNodesIntent(state, command)

      expect(result.nodes.has('node-2')).toBe(false)
      expect(result.nodes.has('node-1')).toBe(true)
      expect(result.nodes.has('node-3')).toBe(true)
      expect(result.order).toEqual(['node-1', 'node-3'])
      expect(result.selection.nodeIds).toEqual([])
    })

    it('should not modify the original state', () => {
      const state = createStateWithNodesAndSelection(
        ['node-1', 'node-2'],
        ['node-1']
      )
      const command: RemoveSelectedNodesCommand = {
        type: 'REMOVE_SELECTED_NODES',
        payload: {},
        meta: { source: 'ui' }
      }

      removeSelectedNodesIntent(state, command)

      // original state remains unchanged
      expect(state.nodes.has('node-1')).toBe(true)
      expect(state.order).toEqual(['node-1', 'node-2'])
      expect(state.selection.nodeIds).toEqual(['node-1'])
    })
  })
})
