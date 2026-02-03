import { EditorState, Node } from "./domain"

/**
 * Plain document format for persistence (save/load). Safe to JSON.stringify.
 */
export interface SerializableDocument {
  version: number
  nodes: SerializableNode[]
  order: string[]
  viewport: EditorState['viewport']
}

/**
 * Plain node shape used in SerializableDocument (no Map).
 */
export interface SerializableNode {
  id: string
  type: string
  geometry: Node['geometry']
  state: Node['state']
  style: Node['style']
}