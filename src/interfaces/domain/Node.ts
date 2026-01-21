type TextNode = 'text'
type ImageNode = 'image'

type NodeType = TextNode | ImageNode
type NodeId = string

type NodeState = {
  hidden: boolean
  locked: boolean
}

export interface Node {
  id: NodeId
  type: NodeType
  geometry: Geometry
  state: NodeState
  style: {
    [key: string]: any
  }
}

interface Geometry {
  x: number
  y: number
  width: number
  height: number
  rotation: number
}
