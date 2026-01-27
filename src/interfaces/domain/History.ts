import type { Command } from './Command'

export interface HistoryState {
  past: Command[]
  future: Command[]
}
