import { EditorState, Node } from "./domain"

export interface SerializableDocument {
  version: number
  nodes: SerializableNode[]
  order: string[]
  viewport: EditorState['viewport']
}

export interface SerializableNode {
  id: string
  type: string
  geometry: Node['geometry']
  state: Node['state']
  style: Node['style']
}