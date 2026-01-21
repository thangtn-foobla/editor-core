import type { Command } from './Command.ts'

export interface HistoryState {
  past: Command[]
  future: Command[]
}
