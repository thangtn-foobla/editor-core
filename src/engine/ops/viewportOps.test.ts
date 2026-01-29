import { describe, it, expect } from 'vitest'
import { viewportOps } from './viewportOps'
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

function createState(
  viewport: EditorState['viewport'] = { scale: 1, x: 0, y: 0 }
): EditorState {
  return {
    nodes: new Map<string, Node>([['node-1', createNode('node-1')]]),
    order: ['node-1'],
    selection: { nodeIds: [] },
    history: { past: [], future: [] },
    viewport
  }
}

describe('viewportOps', () => {
  describe('setZoom', () => {
    it('should update scale without center and preserve x,y', () => {
      const state = createState({ scale: 1, x: 10, y: 20 })

      const result = viewportOps.setZoom(state, 2)

      expect(result.viewport.scale).toBe(2)
      expect(result.viewport.x).toBe(10)
      expect(result.viewport.y).toBe(20)
    })

    it('should not change state when scale is zero or negative', () => {
      const state = createState({ scale: 1, x: 10, y: 20 })

      const resultZero = viewportOps.setZoom(state, 0)
      const resultNegative = viewportOps.setZoom(state, -1)

      expect(resultZero).toBe(state)
      expect(resultNegative).toBe(state)
    })

    it('should zoom at cursor when pointer is provided (center fixed at screen position)', () => {
      const state = createState({ scale: 1, x: 0, y: 0 })
      const center = { x: 100, y: 50 }
      const pointer = { x: 200, y: 100 }
      const scale = 2

      const result = viewportOps.setZoom(state, scale, center, pointer)

      // newViewport.x = center.x - pointer.x / scale
      expect(result.viewport.scale).toBe(scale)
      expect(result.viewport.x).toBe(100 - 200 / 2)
      expect(result.viewport.y).toBe(50 - 100 / 2)
      // Verify: (center - viewport) * scale = pointer
      expect((center.x - result.viewport.x) * scale).toBe(pointer.x)
      expect((center.y - result.viewport.y) * scale).toBe(pointer.y)
    })

    it('should zoom relative to center point when no pointer', () => {
      const state = createState({ scale: 1, x: 0, y: 0 })
      const center = { x: 100, y: 50 }
      const scale = 2

      const result = viewportOps.setZoom(state, scale, center)

      const prev = state.viewport
      const ratio = scale / prev.scale
      const expectedX = center.x - (center.x - prev.x) * ratio
      const expectedY = center.y - (center.y - prev.y) * ratio

      expect(result.viewport.scale).toBe(scale)
      expect(result.viewport.x).toBeCloseTo(expectedX)
      expect(result.viewport.y).toBeCloseTo(expectedY)
    })

    it('should use previous viewport when computing centered zoom', () => {
      const state = createState({ scale: 2, x: 50, y: 30 })
      const center = { x: 200, y: 100 }
      const scale = 4

      const result = viewportOps.setZoom(state, scale, center)

      const prev = state.viewport
      const ratio = scale / prev.scale
      const expectedX = center.x - (center.x - prev.x) * ratio
      const expectedY = center.y - (center.y - prev.y) * ratio

      expect(result.viewport.x).toBeCloseTo(expectedX)
      expect(result.viewport.y).toBeCloseTo(expectedY)
      expect(result.viewport.scale).toBe(scale)
    })

    it('should return new state object and not mutate original', () => {
      const state = createState({ scale: 1, x: 0, y: 0 })

      const result = viewportOps.setZoom(state, 2)

      expect(result).not.toBe(state)
      expect(state.viewport.scale).toBe(1)
      expect(state.viewport.x).toBe(0)
      expect(state.viewport.y).toBe(0)
    })
  })

  describe('pan', () => {
    it('should translate viewport by dx, dy', () => {
      const state = createState({ scale: 1, x: 10, y: 20 })

      const result = viewportOps.pan(state, 5, -10)

      expect(result.viewport.x).toBe(15)
      expect(result.viewport.y).toBe(10)
    })

    it('should handle zero translation', () => {
      const state = createState({ scale: 1, x: 10, y: 20 })

      const result = viewportOps.pan(state, 0, 0)

      expect(result.viewport.x).toBe(10)
      expect(result.viewport.y).toBe(20)
    })

    it('should not mutate original state', () => {
      const state = createState({ scale: 1, x: 10, y: 20 })

      const result = viewportOps.pan(state, 5, 5)

      expect(result).not.toBe(state)
      expect(state.viewport.x).toBe(10)
      expect(state.viewport.y).toBe(20)
    })
  })
})

