import type { Node } from './Node'

/**
 * Common properties shared by all editor commands.
 */
interface BaseCommand {
  /**
   * Discriminant string describing what this command does.
   */
  type: string;
  /**
   * Optional metadata that controls how the engine treats this command.
   */
  meta?: CommandMeta;
}

/**
 * Optional metadata that can influence how a command is processed.
 */
export interface CommandMeta {
  /**
   * Whether this command should be recorded in history for undo/redo.
   *
   * Defaults to `true`. Set to `false` to skip history.
   */
  recordHistory?: boolean;
  /**
   * Optional identifier to group related commands together.
   */
  groupId?: string;
  /**
   * Where this command originated from.
   */
  source: 'ui' | 'remote' | 'system'

}

/**
 * Command for adding a node to the editor.
 */
export interface AddNodeCommand extends BaseCommand {
  type: 'ADD_NODE';
  payload: {
    node: Node;
    index?: number;
    select?: boolean
  };
}

/**
 * Command for removing a single node.
 */
export interface RemoveNodeCommand extends BaseCommand {
  type: 'REMOVE_NODE';
  payload: {
    nodeId: Node['id'];
  };
}

/**
 * Command for removing multiple nodes at once.
 */
export interface RemoveNodesCommand extends BaseCommand {
  type: 'REMOVE_NODES';
  payload: {
    nodeIds: Node['id'][];
  };
}

/**
 * Command for applying a partial update to an existing node.
 */
export interface UpdateNodeCommand extends BaseCommand {
  type: 'UPDATE_NODE';
  payload: {
    nodeId: Node['id'];
    updates: Partial<Node>;
  };
}

/**
 * Command for reordering a node within the stacking order.
 */
export interface ReorderCommand extends BaseCommand {
  type: 'REORDER';
  payload: {
    nodeId: Node['id'];
    toIndex: number;
  };
}

/**
 * Command for selecting a single node.
 */
export interface SelectNodeCommand extends BaseCommand {
  type: 'SELECT_NODE';
  payload: {
    nodeId: Node['id'];
  };
}

/**
 * Command for deselecting one or more nodes.
 */
export interface DeselectNodesCommand extends BaseCommand {
  type: 'DESELECT_NODES';
  payload: {
    nodeIds: Node['id'][];
  };
}


export interface SetZoomCommand extends BaseCommand {
  type: 'SET_ZOOM';
  payload: {
    scale: number;
    center?: { x: number; y: number };
    /** Screen position (container coords) – when set, keeps world `center` fixed at this point (zoom at cursor). */
    pointer?: { x: number; y: number };
  };
}

export interface PanViewportCommand extends BaseCommand {
  type: 'PAN_VIEWPORT';
  payload: {
    dx: number;
    dy: number;
  };
}


/**
 * All commands that operate directly on nodes.
 */
export type NodeCommand = AddNodeCommand | RemoveNodeCommand | RemoveNodesCommand | UpdateNodeCommand

/**
 * All commands that affect node ordering.
 */
export type OrderCommand = ReorderCommand

/**
 * All commands that affect the current selection.
 */
export type SelectionCommand = SelectNodeCommand | DeselectNodesCommand


export type ZoomCommand = SetZoomCommand | PanViewportCommand

/**
 * Union of all supported command types.
 */
export type Command = NodeCommand | OrderCommand | SelectionCommand | ZoomCommand