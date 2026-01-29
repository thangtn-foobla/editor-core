import type { IntentHandler } from "../../interfaces/domain/Engine";
import { viewportOps } from "../ops/viewportOps";

/**
 * Intent handler that updates the viewport zoom level.
 */
export const zoomIntent: IntentHandler<'SET_ZOOM'> = (state, cmd) => {
  const { scale, center } = cmd.payload
  return viewportOps.setZoom(state, scale, center)
}

/**
 * Intent handler that pans the viewport by a delta.
 */
export const panIntent: IntentHandler<'PAN_VIEWPORT'> = (state, cmd) => {
  const { dx, dy } = cmd.payload
  return viewportOps.pan(state, dx, dy)
}