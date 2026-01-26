import type { Command } from '../interfaces/domain/Command.ts'
import type { Node } from '../interfaces/domain/Node.ts'
import { NodeCommandTypes } from '../interfaces/domain/Command.ts'

export const addNodeCommand: Command<{ node: Node }> = {
  type: NodeCommandTypes.Add,
  payload: node
}