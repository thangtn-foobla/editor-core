import { describe, it, expect } from 'vitest'
import { reorderNodeIntent } from './orderIntents'
import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'
import type { ReorderCommand } from '../../interfaces/domain/Command'
import { addNodeIntent } from './nodeIntents'

function createNode(id: string): Node {
  return {
    id,
    type: 'text',
    geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
    state: { hidden: false, locked: false },
    style: {}
  }
}

function createStateWithNodes(nodeIds: string[]): EditorState {
  const nodes = new Map<string, Node>()
  nodeIds.forEach(id => {
    nodes.set(id, createNode(id))
  })
  return {
    nodes,
    order: [...nodeIds],
    selection: { nodeIds: [] },
    history: { past: [], future: [] }
  }
}

describe('orderIntents', () => {
  describe('reorderNodeIntent', () => {
    it('should reorder a node to a new index', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3', 'node-4'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-2', toIndex: 3 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result.order).toEqual(['node-1', 'node-3', 'node-4', 'node-2'])
    })

    it('should move a node to the beginning', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-3', toIndex: 0 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result.order).toEqual(['node-3', 'node-1', 'node-2'])
    })

    it('should move a node to the end', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-1', toIndex: 2 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result.order).toEqual(['node-2', 'node-3', 'node-1'])
    })

    it('should deselect the node after reordering', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      state.selection.nodeIds = ['node-2']
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-2', toIndex: 0 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result.selection.nodeIds).not.toContain('node-2')
    })

    it('should return the same state if node does not exist in order', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'non-existent', toIndex: 0 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result).toBe(state)
    })

    it('should not modify the original state', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-1', toIndex: 2 },
        meta: { source: 'ui' }
      }

      reorderNodeIntent(state, command)

      expect(state.order).toEqual(['node-1', 'node-2', 'node-3'])
    })

    it('should handle moving a node to its current position', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-2', toIndex: 1 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result.order).toEqual(['node-1', 'node-2', 'node-3'])
    })

    it('should clamp index to valid range', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      const command: ReorderCommand = {
        type: 'REORDER',
        payload: { nodeId: 'node-1', toIndex: 100 },
        meta: { source: 'ui' }
      }

      const result = reorderNodeIntent(state, command)

      expect(result.order.length).toBe(3)
      expect(result.order[result.order.length - 1]).toBe('node-1')
    })
  })
})
