import type { Command } from './Command'

/**
 * Tracks undo/redo information for the editor.
 */
export interface HistoryState {
  /**
   * Commands that have been applied, in order.
   */
  past: Command[]
  /**
   * Commands that have been undone and can be re-applied.
   */
  future: Command[]
}
