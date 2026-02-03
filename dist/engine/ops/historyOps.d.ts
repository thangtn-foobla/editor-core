import type { Command } from '../../interfaces/domain/Command';
import type { HistoryState } from '../../interfaces/domain/History';
/**
 * Operations for recording commands into undo/redo history.
 */
export interface HistoryOps {
    record(history: HistoryState, command: Command): HistoryState;
}
/** Default implementation of history recording. */
export declare const historyOps: HistoryOps;
//# sourceMappingURL=historyOps.d.ts.map