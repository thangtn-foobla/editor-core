import type { EditorDevToolsBridge, EditorDevToolsOptions } from './types';
/**
 * Creates a devtools bridge. Pass the returned `logger` to createEditorEngine
 * when debug: true, then call connect(engine) so replaceStateAt and exportStateJSON work.
 *
 * @example
 * const devTools = createEditorDevTools({ maxLogSize: 50 })
 * const engine = createEditorEngine({ initialState, intentMap, debug: true, logger: devTools.logger })
 * devTools.connect(engine)
 * devTools.replaceStateAt(0) // time-travel
 * const json = devTools.exportStateJSON()
 */
export declare function createEditorDevTools(options?: EditorDevToolsOptions): EditorDevToolsBridge;
//# sourceMappingURL=bridge.d.ts.map