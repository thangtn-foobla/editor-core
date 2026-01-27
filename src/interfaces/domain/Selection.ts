import type { Node } from './Node'
type NodeId = Node['id']
export interface Selection {
  nodeIds: NodeId[]
  primary?: NodeId
}
