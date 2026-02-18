/**
 * Unique identifier for a node.
 */
export type NodeId = string

/**
 * Internal flags that control node visibility and locking.
 */
export type NodeState = {
  hidden: boolean
  locked: boolean
}

/**
 * Axis-aligned bounding box with rotation for a node.
 */
export interface Geometry {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

/**
 * Shared properties across all node types.
 */
interface BaseNode {
  id: NodeId
  geometry: Geometry
  state: NodeState
}

/**
 * A text node whose semantic content lives in `content.text`.
 * Visual appearance (font, color, alignment) lives in `style`.
 */
export interface TextNode extends BaseNode {
  type: 'text'
  content: {
    text: string
  }
  style: {
    fontFamily?: string
    fontSize?: number
    fontWeight?: string
    fill?: string
    align?: string
    [key: string]: any
  }
}

/**
 * An image node whose source lives in `content.src`.
 * Visual appearance (opacity, filters) lives in `style`.
 */
export interface ImageNode extends BaseNode {
  type: 'image'
  content: {
    src: string
  }
  style: {
    opacity?: number
    [key: string]: any
  }
}

/**
 * Discriminated union of all supported node types.
 * Use `node.type` to narrow:
 *
 * ```ts
 * if (node.type === 'text') {
 *   node.content.text // safe
 * }
 * ```
 */
export type Node = TextNode | ImageNode
