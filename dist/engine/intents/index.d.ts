import { addNodeIntent, removeNodeIntent, updateNodeIntent } from './nodeIntents';
import { reorderNodeIntent } from './orderIntents';
import { selectNodeIntent } from './selectionIntents';
export declare const intentMap: {
    ADD_NODE: import("../../interfaces/domain/Engine").IntentHandler<"ADD_NODE">;
    REMOVE_NODE: import("../../interfaces/domain/Engine").IntentHandler<"REMOVE_NODE">;
    REMOVE_NODES: import("../../interfaces/domain/Engine").IntentHandler<"REMOVE_NODES">;
    UPDATE_NODE: import("../../interfaces/domain/Engine").IntentHandler<"UPDATE_NODE">;
    REORDER: import("../../interfaces/domain/Engine").IntentHandler<"REORDER">;
    SELECT_NODE: import("../../interfaces/domain/Engine").IntentHandler<"SELECT_NODE">;
    DESELECT_NODES: import("../../interfaces/domain/Engine").IntentHandler<"DESELECT_NODES">;
};
export { addNodeIntent, removeNodeIntent, updateNodeIntent, reorderNodeIntent, selectNodeIntent };
//# sourceMappingURL=index.d.ts.map