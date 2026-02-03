# Editor DevTools (bridge only)

This package provides a **devtools bridge** only. UI (state inspector, action log, time-travel slider, export button) is implemented by the consumer.

## Usage

1. Create the bridge first, then the engine with the bridge's logger, then connect the engine:

```ts
import { createEditorEngine, createEditorDevTools } from 'your-editor-package'

const devTools = createEditorDevTools({ maxLogSize: 100 })

const engine = createEditorEngine({
  initialState,
  intentMap,
  debug: true,
  logger: devTools.logger
})

devTools.connect(engine)
```

2. Use the bridge API to build your UI:

- **State inspector**: `devTools.getStateAt(devTools.getCurrentIndex())` or `engine.getState()` for live state.
- **Action log**: `devTools.getLog()` — list entries; on click call `devTools.replaceStateAt(index)`.
- **Time-travel**: slider/stepper with `getLog().length`; on change call `devTools.replaceStateAt(index)`.
- **Export**: `devTools.exportStateJSON()` then download the string as a file.

## API

- `devTools.logger` — Pass to `createEditorEngine({ debug: true, logger: devTools.logger })`.
- `devTools.connect(engine)` — Call after creating the engine; required for replaceStateAt and exportStateJSON.
- `devTools.getLog()` — All log entries (newest at end).
- `devTools.getStateAt(index)` — Snapshot at index, or null.
- `devTools.replaceStateAt(index)` — Restore state at index (time-travel). No-op if not connected.
- `devTools.exportStateJSON()` — JSON string of current state. Returns `"{}"` if not connected.
- `devTools.getCurrentIndex()` — Index of the latest entry.

## Log entry source

- `dispatch` — State changed by a command (entry has `command`).
- `replace` — State changed by undo, redo, or `replaceState` (no `command`).
