import type { EditorState } from "../../interfaces/domain/EditorState";

/**
 * Public operations that manipulate the viewport (zoom and pan).
 */
export interface ViewportOps {
  /**
   * Sets the zoom scale, optionally keeping a given point fixed on screen.
   * When `pointer` is provided (zoom at cursor), world point `center` stays at screen position `pointer`.
   */
  setZoom(
    state: EditorState,
    scale: number,
    center?: { x: number; y: number },
    pointer?: { x: number; y: number }
  ): EditorState

  /**
   * Translates the viewport by the given deltas.
   */
  pan(state: EditorState, dx: number, dy: number): EditorState
}

/**
 * Default implementation of viewport operations.
 */
export const viewportOps: ViewportOps = {
  setZoom(
    state: EditorState,
    scale: number,
    center?: { x: number; y: number },
    pointer?: { x: number; y: number }
  ): EditorState {
    if (scale <= 0) return state

    const prev = state.viewport

    if (pointer != null && center != null) {
      // Zoom at cursor: keep world point `center` fixed at screen position `pointer`.
      const x = center.x - pointer.x / scale
      const y = center.y - pointer.y / scale
      return {
        ...state,
        viewport: { scale, x, y },
      }
    }

    if (center) {
      const ratio = scale / prev.scale
      const x = center.x - (center.x - prev.x) * ratio
      const y = center.y - (center.y - prev.y) * ratio
      return {
        ...state,
        viewport: { scale, x, y },
      }
    }

    return {
      ...state,
      viewport: { ...prev, scale },
    }
  },
  pan(state: EditorState, dx: number, dy: number): EditorState {
    const { viewport } = state

    return {
      ...state,
      viewport: {
        ...viewport,
        x: viewport.x + dx,
        y: viewport.y + dy,
      },
    }
  },
}