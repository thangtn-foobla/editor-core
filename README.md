# Editor Core

A lightweight, type-safe state management engine for building rich text and visual editors. Built with TypeScript, this library provides a command-based architecture with built-in undo/redo support, subscription system, and extensible intent handlers.

## Features

- 🎯 **Command-based architecture** - All state changes go through typed commands
- 🔄 **Undo/Redo support** - Built-in history management with undo/redo capabilities
- 📦 **Node management** - Support for different node types (text, image) with geometry, state, and styling
- 🎨 **Selection system** - Manage node selection state
- 🔀 **Reordering** - Reorder nodes in the editor
- 📡 **Subscription system** - Subscribe to state changes for reactive updates
- 🛡️ **Type-safe** - Full TypeScript support with strict typing
- 🔌 **Extensible** - Custom intent handlers for custom commands

## Installation

```bash
npm install
```

## Public API

The package exports the following:

### Functions

- `createEditorEngine(options)` - Factory function to create an editor engine instance

### Types

- `EditorEngine` - The main engine interface
- `EditorState` - The editor state structure

### Operations

- `nodeOps` - Node manipulation operations
  - `addNode(state, node)` - Add a node to the editor
  - `removeNode(state, nodeId)` - Remove a node from the editor
  - `updateNode(state, nodeId, updates)` - Update node properties

- `orderOps` - Order manipulation operations
  - `insertNode(state, nodeId, index?)` - Insert a node at a specific index
  - `removeNode(state, nodeId)` - Remove a node from the order
  - `reorderNode(state, nodeId, toIndex)` - Reorder a node to a new index

- `selectionOps` - Selection manipulation operations
  - `selectNodes(state, nodeIds)` - Select nodes
  - `deselectNodes(state, nodeIds)` - Deselect nodes

- `historyOps` - History manipulation operations

### Intent Handlers

- `intentMap` - Default intent map with handlers for all command types
- `addNodeIntent` - Handler for ADD_NODE commands
- `removeNodeIntent` - Handler for REMOVE_NODE commands
- `updateNodeIntent` - Handler for UPDATE_NODE commands
- `reorderNodeIntent` - Handler for REORDER commands
- `selectNodeIntent` - Handler for SELECT_NODE commands

### Example Import

```typescript
import {
  createEditorEngine,
  intentMap,
  nodeOps,
  orderOps,
  selectionOps,
  historyOps,
  type EditorEngine,
  type EditorState
} from 'editor-core'
```

## Usage

### Basic Setup

```typescript
import { createEditorEngine, intentMap } from 'editor-core'

// Create initial state
const initialState = {
  nodes: new Map(),
  order: [],
  selection: { nodeId: null },
  history: { past: [], present: null, future: [] }
}

// Create the engine
const engine = createEditorEngine({
  initialState,
  intentMap
})

// Subscribe to state changes
const unsubscribe = engine.subscribe((state) => {
  console.log('State updated:', state)
})

// Dispatch commands
engine.dispatch({
  type: 'ADD_NODE',
  payload: {
    node: {
      id: 'node-1',
      type: 'text',
      geometry: { x: 0, y: 0, width: 100, height: 50, rotation: 0 },
      state: { hidden: false, locked: false },
      style: {}
    },
    select: true
  },
  meta: {
    source: 'ui',
    recordHistory: true
  }
})

// Undo/Redo
engine.undo()
engine.redo()

// Get current state
const currentState = engine.getState()
```

## API Reference

### `createEditorEngine(options)`

Creates a new editor engine instance.

**Parameters:**
- `options.initialState` - The initial editor state
- `options.intentMap` - Map of command types to intent handlers

**Returns:** `EditorEngine`

### `EditorEngine`

The main engine interface with the following methods:

#### `getState(): EditorState`

Returns the current editor state.

#### `dispatch(command: Command): void`

Dispatches a command to update the state. Commands are processed by intent handlers.

#### `undo(): void`

Undoes the last command (if available).

#### `redo(): void`

Redoes the last undone command (if available).

#### `subscribe(listener: Subscriber): () => void`

Subscribes to state changes. Returns an unsubscribe function.

#### `notify(): void`

Manually notifies all subscribers of the current state.

### Commands

The engine supports the following command types:

#### `ADD_NODE`
Adds a new node to the editor.

```typescript
{
  type: 'ADD_NODE',
  payload: {
    node: Node,
    index?: number,
    select?: boolean
  },
  meta?: CommandMeta
}
```

#### `REMOVE_NODE`
Removes a node from the editor.

```typescript
{
  type: 'REMOVE_NODE',
  payload: {
    nodeId: string
  },
  meta?: CommandMeta
}
```

#### `UPDATE_NODE`
Updates a node's properties.

```typescript
{
  type: 'UPDATE_NODE',
  payload: {
    nodeId: string,
    updates: Partial<Node>
  },
  meta?: CommandMeta
}
```

#### `REORDER`
Reorders nodes in the editor.

```typescript
{
  type: 'REORDER',
  payload: {
    nodeId: string,
    toIndex: number
  },
  meta?: CommandMeta
}
```

#### `SELECT_NODE`
Selects a node in the editor.

```typescript
{
  type: 'SELECT_NODE',
  payload: {
    nodeId: string
  },
  meta?: CommandMeta
}
```

### Command Meta

Commands can include optional metadata:

```typescript
{
  recordHistory?: boolean,  // Whether to record in history (default: true)
  groupId?: string,         // Group ID for batching commands
  source: 'ui' | 'remote' | 'system'  // Source of the command
}
```

## Architecture

### State Structure

The editor state consists of:

- **nodes**: `Map<string, Node>` - All nodes in the editor
- **order**: `string[]` - Array of node IDs defining the rendering order
- **selection**: `Selection` - Currently selected node
- **history**: `HistoryState` - Undo/redo history state

### Node Structure

Nodes have the following structure:

```typescript
{
  id: string,
  type: 'text' | 'image',
  geometry: {
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
  },
  state: {
    hidden: boolean,
    locked: boolean
  },
  style: {
    [key: string]: any
  }
}
```

### Intent Handlers

Intent handlers are pure functions that transform the state based on commands:

```typescript
type IntentHandler<T extends Command['type']> = (
  state: EditorState,
  command: Extract<Command, { type: T }>
) => EditorState
```

### Operations

The library exports operations for manipulating state:

- `nodeOps` - Node manipulation operations
- `orderOps` - Order manipulation operations
- `selectionOps` - Selection manipulation operations
- `historyOps` - History manipulation operations

## Development

### Scripts

```bash
# Development server
npm run dev

# Build
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:fix
```

### Project Structure

```
src/
  engine/
    createEditorEngine.ts    # Engine factory
    historyEngine.ts         # History management
    intents/                 # Intent handlers
    ops/                     # State operations
  interfaces/
    domain/                  # Type definitions
```

## License

Private project
