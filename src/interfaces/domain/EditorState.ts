import type { Node } from './Node'
import type { HistoryState } from './History'
import type { Selection } from './Selection'

type Order = Node['id'][]

export interface EditorState {
  nodes: Map<string, Node>
  order: Order
  selection: Selection
  history: HistoryState
}
