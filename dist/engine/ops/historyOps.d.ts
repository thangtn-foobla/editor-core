import type { Command } from '../../interfaces/domain/Command';
import type { HistoryState } from '../../interfaces/domain/History';
export interface HistoryOps {
    record(history: HistoryState, command: Command): HistoryState;
}
export declare const historyOps: HistoryOps;
//# sourceMappingURL=historyOps.d.ts.map