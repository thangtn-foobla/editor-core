import type { Command } from '../../interfaces/domain/Command.ts'
import type { HistoryState } from '../../interfaces/domain/History.ts'

export interface HistoryOps {
  record(history: HistoryState, command: Command): HistoryState
}

export const historyOps: HistoryOps = {
  record(currentHistory: HistoryState, command: Command) {
    const { past } = currentHistory
    return {
      ...currentHistory,
      past: [...past, command]
    }
  }
}
