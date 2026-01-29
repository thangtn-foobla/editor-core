import type { Node } from './Node';
import type { HistoryState } from './History';
import type { Selection } from './Selection';
/**
 * Linear ordering of node ids representing their stacking order.
 */
type Order = Node['id'][];
/**
 * Root state container for the editor.
 */
export interface EditorState {
    /**
     * Map of all nodes in the document, keyed by id.
     */
    nodes: Map<string, Node>;
    /**
     * Z-order / visual ordering of nodes.
     */
    order: Order;
    /**
     * Current selection information.
     */
    selection: Selection;
    /**
     * Undo/redo history state.
     */
    history: HistoryState;
}
export {};
//# sourceMappingURL=EditorState.d.ts.map