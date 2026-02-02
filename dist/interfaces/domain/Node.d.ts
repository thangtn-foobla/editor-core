type TextNode = 'text';
type ImageNode = 'image';
/**
 * All supported node types in the editor.
 */
type NodeType = TextNode | ImageNode;
/**
 * Unique identifier for a node.
 */
type NodeId = string;
/**
 * Internal flags that control node visibility and locking.
 */
type NodeState = {
    hidden: boolean;
    locked: boolean;
};
/**
 * Public representation of a node in the editor.
 */
export interface Node {
    /**
     * Unique identifier for this node.
     */
    id: NodeId;
    /**
      * Type of node (e.g. text, image).
      */
    type: NodeType;
    /**
     * Position, size and rotation of the node.
     */
    geometry: Geometry;
    /**
     * State flags such as visibility and lock status.
     */
    state: NodeState;
    /**
     * Free-form style information, typically mapped to rendering.
     */
    style: {
        [key: string]: any;
    };
}
/**
 * Axis-aligned bounding box with rotation for a node.
 */
export interface Geometry {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
}
export {};
//# sourceMappingURL=Node.d.ts.map