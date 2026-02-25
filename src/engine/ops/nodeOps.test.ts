import { describe, it, expect } from 'vitest'
import { nodeOps } from './nodeOps'
import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'

function createNode(id: string, type: 'text' | 'image' = 'text'): Node {
  return {
    id,
    type,
    content: type === 'text' ? { text: '' } : { src: '' },
    geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
    state: { hidden: false, locked: false },
    style: {}
  } as Node
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

describe('nodeOps', () => {
  describe('addNode', () => {
    it('should add a new node to the state', () => {
      const state = createInitialState()
      const node = createNode('node-1')

      const result = nodeOps.addNode(state, node)

      expect(result.nodes.has('node-1')).toBe(true)
      expect(result.nodes.get('node-1')).toEqual(node)
      expect(result.nodes.size).toBe(1)
    })

    it('should not modify the original state', () => {
      const state = createInitialState()
      const node = createNode('node-1')

      nodeOps.addNode(state, node)

      expect(state.nodes.size).toBe(0)
    })

    it('should return the same state if node already exists', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      const result = nodeOps.addNode(stateWithNode, node)

      expect(result).toBe(stateWithNode)
      expect(result.nodes.size).toBe(1)
    })

    it('should add multiple nodes', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2', 'image')

      let result = nodeOps.addNode(state, node1)
      result = nodeOps.addNode(result, node2)

      expect(result.nodes.size).toBe(2)
      expect(result.nodes.get('node-1')).toEqual(node1)
      expect(result.nodes.get('node-2')).toEqual(node2)
    })
  })

  describe('removeNode', () => {
    it('should remove an existing node', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      const result = nodeOps.removeNode(stateWithNode, 'node-1')

      expect(result.nodes.has('node-1')).toBe(false)
      expect(result.nodes.size).toBe(0)
    })

    it('should throw an error if node does not exist', () => {
      const state = createInitialState()

      expect(() => {
        nodeOps.removeNode(state, 'non-existent')
      }).toThrow('Node with id non-existent does not exist')
    })

    it('should not modify the original state', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      nodeOps.removeNode(stateWithNode, 'node-1')

      expect(stateWithNode.nodes.size).toBe(1)
    })

    it('should remove one node while keeping others', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2')
      let result = nodeOps.addNode(state, node1)
      result = nodeOps.addNode(result, node2)

      result = nodeOps.removeNode(result, 'node-1')

      expect(result.nodes.has('node-1')).toBe(false)
      expect(result.nodes.has('node-2')).toBe(true)
      expect(result.nodes.size).toBe(1)
    })
  })

  describe('removeNodes', () => {
    it('should remove multiple existing nodes', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2')
      const node3 = createNode('node-3')
      let result = nodeOps.addNode(state, node1)
      result = nodeOps.addNode(result, node2)
      result = nodeOps.addNode(result, node3)

      const after = nodeOps.removeNodes(result, ['node-1', 'node-3'])

      expect(after.nodes.has('node-1')).toBe(false)
      expect(after.nodes.has('node-3')).toBe(false)
      expect(after.nodes.has('node-2')).toBe(true)
      expect(after.nodes.size).toBe(1)
    })

    it('should ignore nodeIds that do not exist', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2')
      let result = nodeOps.addNode(state, node1)
      result = nodeOps.addNode(result, node2)

      const after = nodeOps.removeNodes(result, ['node-1', 'non-existent'])

      expect(after.nodes.has('node-1')).toBe(false)
      expect(after.nodes.has('node-2')).toBe(true)
      expect(after.nodes.size).toBe(1)
    })

    it('should return same nodes when given empty array', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2')
      const result = nodeOps.addNode(nodeOps.addNode(state, node1), node2)

      const after = nodeOps.removeNodes(result, [])

      expect(after.nodes).not.toBe(result.nodes) // new Map
      expect(after.nodes.size).toBe(2)
      expect(after.nodes.has('node-1')).toBe(true)
      expect(after.nodes.has('node-2')).toBe(true)
    })

    it('should not modify the original state', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2')
      const withNodes = nodeOps.addNode(nodeOps.addNode(state, node1), node2)

      nodeOps.removeNodes(withNodes, ['node-1'])

      expect(withNodes.nodes.size).toBe(2)
      expect(withNodes.nodes.has('node-1')).toBe(true)
      expect(withNodes.nodes.has('node-2')).toBe(true)
    })
  })

  describe('updateNode', () => {
    it('should update node properties', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      const result = nodeOps.updateNode(stateWithNode, 'node-1', {
        geometry: { x: 10, y: 20, width: 200, height: 100, rotation: 45 }
      })

      const updatedNode = result.nodes.get('node-1')
      expect(updatedNode?.geometry.x).toBe(10)
      expect(updatedNode?.geometry.y).toBe(20)
      expect(updatedNode?.geometry.width).toBe(200)
      expect(updatedNode?.geometry.height).toBe(100)
      expect(updatedNode?.geometry.rotation).toBe(45)
    })

    it('should update node state', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      const result = nodeOps.updateNode(stateWithNode, 'node-1', {
        state: { hidden: true, locked: true }
      })

      const updatedNode = result.nodes.get('node-1')
      expect(updatedNode?.state.hidden).toBe(true)
      expect(updatedNode?.state.locked).toBe(true)
    })

    it('should update node style', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      const result = nodeOps.updateNode(stateWithNode, 'node-1', {
        style: { color: 'red', fontSize: 16 }
      })

      const updatedNode = result.nodes.get('node-1')
      expect(updatedNode?.style.color).toBe('red')
      expect(updatedNode?.style.fontSize).toBe(16)
    })

    it('should partially update node properties', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      const result = nodeOps.updateNode(stateWithNode, 'node-1', {
        geometry: { x: 50, y: 50, width: 150, height: 75, rotation: 0 }
      })

      const updatedNode = result.nodes.get('node-1')
      expect(updatedNode?.geometry.x).toBe(50)
      expect(updatedNode?.geometry.y).toBe(50)
      expect(updatedNode?.state.hidden).toBe(false) // unchanged
      expect(updatedNode?.style).toEqual({}) // unchanged
    })

    it('should throw an error if node does not exist', () => {
      const state = createInitialState()

      expect(() => {
        nodeOps.updateNode(state, 'non-existent', { state: { hidden: true, locked: false } })
      }).toThrow('Node with id non-existent does not exist')
    })

    it('should not modify the original state', () => {
      const state = createInitialState()
      const node = createNode('node-1')
      const stateWithNode = nodeOps.addNode(state, node)

      nodeOps.updateNode(stateWithNode, 'node-1', { state: { hidden: true, locked: false } })

      expect(stateWithNode.nodes.get('node-1')?.state.hidden).toBe(false)
    })
  })

  describe('updateNodes', () => {
    it('should update multiple nodes at once', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const node2 = createNode('node-2')
      let result = nodeOps.addNode(state, node1)
      result = nodeOps.addNode(result, node2)

      const after = nodeOps.updateNodes(result, [
        { nodeId: 'node-1', updates: { geometry: { x: 10, y: 20, width: 100, height: 50, rotation: 0 } } },
        { nodeId: 'node-2', updates: { state: { hidden: true, locked: false } } }
      ])

      expect(after.nodes.get('node-1')?.geometry.x).toBe(10)
      expect(after.nodes.get('node-2')?.state.hidden).toBe(true)
    })

    it('should skip non-existent nodeIds', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const result = nodeOps.addNode(state, node1)

      const after = nodeOps.updateNodes(result, [
        { nodeId: 'node-1', updates: { state: { hidden: true, locked: false } } },
        { nodeId: 'non-existent', updates: { state: { hidden: true, locked: false } } }
      ])

      expect(after.nodes.get('node-1')?.state.hidden).toBe(true)
      expect(after.nodes.has('non-existent')).toBe(false)
    })

    it('should return new state even with empty entries', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const result = nodeOps.addNode(state, node1)

      const after = nodeOps.updateNodes(result, [])

      expect(after.nodes.size).toBe(1)
    })

    it('should not modify the original state', () => {
      const state = createInitialState()
      const node1 = createNode('node-1')
      const result = nodeOps.addNode(state, node1)

      nodeOps.updateNodes(result, [
        { nodeId: 'node-1', updates: { state: { hidden: true, locked: false } } }
      ])

      expect(result.nodes.get('node-1')?.state.hidden).toBe(false)
    })
  })
})
