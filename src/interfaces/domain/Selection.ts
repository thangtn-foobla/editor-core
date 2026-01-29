import type { Node } from './Node'

type NodeId = Node['id']

/**
 * Describes which nodes are currently selected.
 */
export interface Selection {
  /**
   * All selected node ids.
   */
  nodeIds: NodeId[]
  /**
   * Optional primary node (e.g. for handles or inspector focus).
   */
  primary?: NodeId
}
