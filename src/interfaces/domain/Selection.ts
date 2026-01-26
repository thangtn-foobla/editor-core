import type { Node } from './Node.ts'
type NodeId = Node['id']
export interface Selection {
  nodeIds: NodeId[]
  primary?: NodeId
}
