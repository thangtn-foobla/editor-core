import type { EditorState } from "../../interfaces/domain/EditorState";
/**
 * Public operations that manipulate the viewport (zoom and pan).
 */
export interface ViewportOps {
    /**
     * Sets the zoom scale, optionally keeping a given point fixed on screen.
     */
    setZoom(state: EditorState, scale: number, center?: {
        x: number;
        y: number;
    }): EditorState;
    /**
     * Translates the viewport by the given deltas.
     */
    pan(state: EditorState, dx: number, dy: number): EditorState;
}
/**
 * Default implementation of viewport operations.
 */
export declare const viewportOps: ViewportOps;
//# sourceMappingURL=viewportOps.d.ts.map