import { describe, it, expect, vi } from 'vitest'
import { zoomIntent, panIntent } from './zoomIntents'
import * as viewportOpsModule from '../ops/viewportOps'
import type { EditorState } from '../../interfaces/domain/EditorState'
import type { Node } from '../../interfaces/domain/Node'
import type { ZoomCommand } from '../../interfaces/domain/Command'

function createNode(id: string): Node {
  return {
    id,
    type: 'text',
    geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
    state: { hidden: false, locked: false },
    style: {}
  }
}

function createState(): EditorState {
  return {
    nodes: new Map<string, Node>([['node-1', createNode('node-1')]]),
    order: ['node-1'],
    selection: { nodeIds: [] },
    history: { past: [], future: [] },
    viewport: { scale: 1, x: 0, y: 0 }
  }
}

describe('zoomIntents', () => {
  describe('zoomIntent', () => {
    it('should delegate to viewportOps.setZoom with correct args', () => {
      const state = createState()
      const spy = vi.spyOn(viewportOpsModule.viewportOps, 'setZoom')
      const command: ZoomCommand = {
        type: 'SET_ZOOM',
        payload: { scale: 2, center: { x: 100, y: 50 } },
        meta: { source: 'ui' }
      }

      zoomIntent(state, command as any)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(state, 2, { x: 100, y: 50 }, undefined)
      spy.mockRestore()
    })

    it('should pass pointer to viewportOps.setZoom when in payload', () => {
      const state = createState()
      const spy = vi.spyOn(viewportOpsModule.viewportOps, 'setZoom')
      const command: ZoomCommand = {
        type: 'SET_ZOOM',
        payload: {
          scale: 2,
          center: { x: 100, y: 50 },
          pointer: { x: 200, y: 100 }
        },
        meta: { source: 'ui' }
      }

      zoomIntent(state, command as any)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(state, 2, { x: 100, y: 50 }, { x: 200, y: 100 })
    })

    it('should return the result of viewportOps.setZoom', () => {
      const state = createState()
      const expected: EditorState = {
        ...state,
        viewport: { scale: 2, x: 10, y: 20 }
      }
      const spy = vi
        .spyOn(viewportOpsModule.viewportOps, 'setZoom')
        .mockReturnValue(expected)
      const command: ZoomCommand = {
        type: 'SET_ZOOM',
        payload: { scale: 2, center: { x: 100, y: 50 } },
        meta: { source: 'ui' }
      }

      const result = zoomIntent(state, command as any)

      expect(result).toBe(expected)
      spy.mockRestore()
    })
  })

  describe('panIntent', () => {
    it('should delegate to viewportOps.pan with correct args', () => {
      const state = createState()
      const spy = vi.spyOn(viewportOpsModule.viewportOps, 'pan')
      const command: ZoomCommand = {
        type: 'PAN_VIEWPORT',
        payload: { dx: 10, dy: -5 },
        meta: { source: 'ui' }
      }

      panIntent(state, command as any)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(state, 10, -5)
    })

    it('should return the result of viewportOps.pan', () => {
      const state = createState()
      const expected: EditorState = {
        ...state,
        viewport: { scale: 1, x: 5, y: 5 }
      }
      const spy = vi
        .spyOn(viewportOpsModule.viewportOps, 'pan')
        .mockReturnValue(expected)
      const command: ZoomCommand = {
        type: 'PAN_VIEWPORT',
        payload: { dx: 5, dy: 5 },
        meta: { source: 'ui' }
      }

      const result = panIntent(state, command as any)

      expect(result).toBe(expected)
      spy.mockRestore()
    })
  })
})

