import { nodeOps } from '../ops/nodeOps'
import type { Node } from '../../interfaces/domain/Node.ts'
import type { Intent } from '../../interfaces/domain/Engine.ts'

export const addNodeIntent: Intent<Node> = (state, node) => {
  return nodeOps.addNode(state, node)
}
