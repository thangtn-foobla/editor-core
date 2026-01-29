import { addNodeIntent, removeNodeIntent, updateNodeIntent } from './nodeIntents';
import { reorderNodeIntent } from './orderIntents';
import { selectNodeIntent } from './selectionIntents';
export declare const intentMap: {
    ADD_NODE: import("../../interfaces/domain").IntentHandler<"ADD_NODE">;
    REMOVE_NODE: import("../../interfaces/domain").IntentHandler<"REMOVE_NODE">;
    REMOVE_NODES: import("../../interfaces/domain").IntentHandler<"REMOVE_NODES">;
    UPDATE_NODE: import("../../interfaces/domain").IntentHandler<"UPDATE_NODE">;
    REORDER: import("../../interfaces/domain").IntentHandler<"REORDER">;
    SELECT_NODE: import("../../interfaces/domain").IntentHandler<"SELECT_NODE">;
    DESELECT_NODES: import("../../interfaces/domain").IntentHandler<"DESELECT_NODES">;
    SET_ZOOM: import("../../interfaces/domain").IntentHandler<"SET_ZOOM">;
    PAN_VIEWPORT: import("../../interfaces/domain").IntentHandler<"PAN_VIEWPORT">;
};
export { addNodeIntent, removeNodeIntent, updateNodeIntent, reorderNodeIntent, selectNodeIntent };
//# sourceMappingURL=index.d.ts.map