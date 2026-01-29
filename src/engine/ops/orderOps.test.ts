import { describe, it, expect } from 'vitest'
import { orderOps } from './orderOps'
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

function createStateWithNodes(nodeIds: string[]): EditorState {
  const nodes = new Map<string, Node>()
  nodeIds.forEach(id => {
    nodes.set(id, createNode(id))
  })
  return {
    nodes,
    order: [...nodeIds],
    selection: { nodeIds: [] },
    history: { past: [], future: [] },
    viewport: { scale: 1, x: 0, y: 0 }
  }
}

describe('orderOps', () => {
  describe('insertNode', () => {
    it('should insert a node at the beginning when index is 0', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])
      // Node should NOT exist in nodes for insertNode to work
      const stateWithoutNode = {
        ...state,
        nodes: new Map(state.nodes)
      }
      stateWithoutNode.nodes.delete('node-3')

      const result = orderOps.insertNode(stateWithoutNode, 'node-3', 0)

      expect(result.order).toEqual(['node-3', 'node-1', 'node-2'])
    })

    it('should insert a node at the end when index equals length', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])
      const stateWithoutNode = {
        ...state,
        nodes: new Map(state.nodes)
      }
      stateWithoutNode.nodes.delete('node-3')

      const result = orderOps.insertNode(stateWithoutNode, 'node-3', 2)

      expect(result.order[result.order.length - 1]).toBe('node-3')
    })

    it('should insert a node at a specific index', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])
      const stateWithoutNode = {
        ...state,
        nodes: new Map(state.nodes)
      }
      stateWithoutNode.nodes.delete('node-4')

      const result = orderOps.insertNode(stateWithoutNode, 'node-4', 1)

      expect(result.order).toEqual(['node-1', 'node-4', 'node-2', 'node-3'])
    })

    it('should return the same state if node already exists in order', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])

      const result = orderOps.insertNode(state, 'node-1', 0)

      expect(result).toBe(state)
      expect(result.order).toEqual(['node-1', 'node-2'])
    })

    it('should not modify the original state', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])
      const newNode = createNode('node-3')
      const stateWithNewNode = {
        ...state,
        nodes: new Map(state.nodes).set('node-3', newNode)
      }

      orderOps.insertNode(stateWithNewNode, 'node-3', 0)

      expect(stateWithNewNode.order).toEqual(['node-1', 'node-2'])
    })
  })

  describe('removeNode', () => {
    it('should remove a node from the order', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.removeNode(state, 'node-2')

      expect(result.order).toEqual(['node-1', 'node-3'])
      expect(result.order.length).toBe(2)
    })

    it('should remove the first node', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.removeNode(state, 'node-1')

      expect(result.order).toEqual(['node-2', 'node-3'])
    })

    it('should remove the last node', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.removeNode(state, 'node-3')

      expect(result.order).toEqual(['node-1', 'node-2'])
    })

    it('should handle removing a node that does not exist in order', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])

      const result = orderOps.removeNode(state, 'non-existent')

      expect(result.order).toEqual(['node-1', 'node-2'])
    })

    it('should not modify the original state', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      orderOps.removeNode(state, 'node-2')

      expect(state.order).toEqual(['node-1', 'node-2', 'node-3'])
    })
  })

  describe('removeNodes', () => {
    it('should remove multiple nodes from the order', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3', 'node-4'])

      const result = orderOps.removeNodes(state, ['node-2', 'node-4'])

      expect(result.order).toEqual(['node-1', 'node-3'])
    })

    it('should ignore ids not present in the order', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.removeNodes(state, ['node-2', 'non-existent'])

      expect(result.order).toEqual(['node-1', 'node-3'])
    })

    it('should return a new order array when called with empty list', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])

      const result = orderOps.removeNodes(state, [])

      expect(result.order).toEqual(['node-1', 'node-2'])
      expect(result.order).not.toBe(state.order)
    })

    it('should not modify the original state', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      orderOps.removeNodes(state, ['node-2'])

      expect(state.order).toEqual(['node-1', 'node-2', 'node-3'])
    })
  })

  describe('reorderNode', () => {
    it('should move a node to a new index', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3', 'node-4'])

      const result = orderOps.reorderNode(state, 'node-2', 3)

      expect(result.order).toEqual(['node-1', 'node-3', 'node-4', 'node-2'])
    })

    it('should move a node to the beginning', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.reorderNode(state, 'node-3', 0)

      expect(result.order).toEqual(['node-3', 'node-1', 'node-2'])
    })

    it('should move a node to the end', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.reorderNode(state, 'node-1', 2)

      expect(result.order).toEqual(['node-2', 'node-3', 'node-1'])
    })

    it('should clamp index to valid range when too high', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.reorderNode(state, 'node-1', 100)

      expect(result.order.length).toBe(3)
      expect(result.order[result.order.length - 1]).toBe('node-1')
    })

    it('should clamp index to 0 when negative', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.reorderNode(state, 'node-3', -10)

      expect(result.order[0]).toBe('node-3')
    })

    it('should return the same state if node does not exist in order', () => {
      const state = createStateWithNodes(['node-1', 'node-2'])

      const result = orderOps.reorderNode(state, 'non-existent', 0)

      expect(result).toBe(state)
      expect(result.order).toEqual(['node-1', 'node-2'])
    })

    it('should not modify the original state', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      orderOps.reorderNode(state, 'node-1', 2)

      expect(state.order).toEqual(['node-1', 'node-2', 'node-3'])
    })

    it('should handle moving a node to its current position', () => {
      const state = createStateWithNodes(['node-1', 'node-2', 'node-3'])

      const result = orderOps.reorderNode(state, 'node-2', 1)

      expect(result.order).toEqual(['node-1', 'node-2', 'node-3'])
    })
  })
})
