export const NodeCommandTypes = {
  Add: 'add-node'
  // Remove: 'remove-node',
  // Update: 'update-node'
} as const

export const OrderCommandTypes = { Reorder: 'reorder' } as const

export type CommandType =
  | (typeof NodeCommandTypes)[keyof typeof NodeCommandTypes]
  | (typeof OrderCommandTypes)[keyof typeof OrderCommandTypes]

export type Command = {
  type: CommandType
  payload: any
}
