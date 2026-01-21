import type { Node } from './Node'
import type { HistoryState } from './History.ts'
import type { Selection } from './Selection.ts'

type Order = Node['id'][]

export interface EditorState {
  nodes: Map<string, Node>
  order: Order
  selection: Selection
  history: HistoryState
}
