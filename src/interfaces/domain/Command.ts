import type { Node } from './Node'


interface BaseCommand {
  type: string;
  meta?: CommandMeta;
}

export interface CommandMeta {
  recordHistory?: boolean;
  groupId?: string;
  source: 'ui' | 'remote' | 'system'

}

export interface AddNodeCommand extends BaseCommand {
  type: 'ADD_NODE';
  payload: {
    node: Node;
    index?: number;
    select?: boolean
  };
}

export interface RemoveNodeCommand extends BaseCommand {
  type: 'REMOVE_NODE';
  payload: {
    nodeId: Node['id'];
  };
}

export interface UpdateNodeCommand extends BaseCommand {
  type: 'UPDATE_NODE';
  payload: {
    nodeId: Node['id'];
    updates: Partial<Node>;
  };
}

export interface ReorderCommand extends BaseCommand {
  type: 'REORDER';
  payload: {
    nodeId: Node['id'];
    toIndex: number;
  };
}

export interface SelectNodeCommand extends BaseCommand {
  type: 'SELECT_NODE';
  payload: {
    nodeId: Node['id'];
  };
}

export interface RemoveSelectedNodesCommand extends BaseCommand {
  type: 'REMOVE_SELECTED_NODES';
}


export type NodeCommand = AddNodeCommand | RemoveNodeCommand | UpdateNodeCommand
export type OrderCommand = ReorderCommand
export type SelectionCommand = SelectNodeCommand | RemoveSelectedNodesCommand

export type Command = NodeCommand | OrderCommand | SelectionCommand