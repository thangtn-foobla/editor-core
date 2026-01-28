import { describe, it, expect } from 'vitest'
import { selectionOps } from './selectionOps'
import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'

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

describe('selectionOps', () => {
  describe('selectNodes', () => {
    it('should select a single node', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], [])

      const result = selectionOps.selectNodes(state, ['node-1'])

      expect(result.selection.nodeIds).toEqual(['node-1'])
    })

    it('should select multiple nodes', () => {
      const state = createStateWithSelection(['node-1', 'node-2', 'node-3'], [])

      const result = selectionOps.selectNodes(state, ['node-1', 'node-2'])

      expect(result.selection.nodeIds).toEqual(['node-1', 'node-2'])
    })

    it('should replace existing selection', () => {
      const state = createStateWithSelection(['node-1', 'node-2', 'node-3'], ['node-1'])

      const result = selectionOps.selectNodes(state, ['node-2', 'node-3'])

      expect(result.selection.nodeIds).toEqual(['node-2', 'node-3'])
    })

    it('should select all nodes', () => {
      const state = createStateWithSelection(['node-1', 'node-2', 'node-3'], [])

      const result = selectionOps.selectNodes(state, ['node-1', 'node-2', 'node-3'])

      expect(result.selection.nodeIds).toEqual(['node-1', 'node-2', 'node-3'])
    })

    it('should clear selection when empty array is provided', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], ['node-1'])

      const result = selectionOps.selectNodes(state, [])

      expect(result.selection.nodeIds).toEqual([])
    })

    it('should not modify the original state', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], [])

      selectionOps.selectNodes(state, ['node-1'])

      expect(state.selection.nodeIds).toEqual([])
    })
  })

  describe('deselectNodes', () => {
    it('should deselect a single node', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], ['node-1', 'node-2'])

      const result = selectionOps.deselectNodes(state, ['node-1'])

      expect(result.selection.nodeIds).toEqual(['node-2'])
    })

    it('should deselect multiple nodes', () => {
      const state = createStateWithSelection(
        ['node-1', 'node-2', 'node-3'],
        ['node-1', 'node-2', 'node-3']
      )

      const result = selectionOps.deselectNodes(state, ['node-1', 'node-2'])

      expect(result.selection.nodeIds).toEqual(['node-3'])
    })

    it('should handle deselecting nodes that are not selected', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], ['node-1'])

      const result = selectionOps.deselectNodes(state, ['node-2'])

      expect(result.selection.nodeIds).toEqual(['node-1'])
    })

    it('should clear all selection when deselecting all selected nodes', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], ['node-1', 'node-2'])

      const result = selectionOps.deselectNodes(state, ['node-1', 'node-2'])

      expect(result.selection.nodeIds).toEqual([])
    })

    it('should not modify the original state', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], ['node-1'])

      selectionOps.deselectNodes(state, ['node-1'])

      expect(state.selection.nodeIds).toEqual(['node-1'])
    })

    it('should handle empty selection', () => {
      const state = createStateWithSelection(['node-1', 'node-2'], [])

      const result = selectionOps.deselectNodes(state, ['node-1'])

      expect(result.selection.nodeIds).toEqual([])
    })
  })
})
