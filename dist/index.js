function replay(e, p, m) {
	return p.reduce((e, p) => {
		let h = m[p.type];
		return h ? h(e, p) : e;
	}, e);
}
function undo(p, m, h) {
	let { past: g, future: _ } = p.history;
	if (g.length === 0) return null;
	let v = g.at(-1), y = g.slice(0, -1);
	return {
		...replay(m, y, h),
		history: {
			past: y,
			future: v ? [v, ..._] : _
		}
	};
}
function redo(p, m, h) {
	let { past: g, future: _ } = p.history;
	if (_.length === 0) return null;
	let v = _[0], y = _.slice(1);
	return {
		...replay(m, [...g, v], h),
		history: {
			past: [...g, v],
			future: y
		}
	};
}
const historyEngine = {
	undo,
	redo
}, historyOps = { record(e, p) {
	let { past: m } = e;
	return {
		...e,
		past: [...m, p]
	};
} }, createEditorEngine = (e) => {
	let { initialState: p, intentMap: m, debug: _, logger: v } = e, y = p, b = /* @__PURE__ */ new Set();
	function x() {
		return y;
	}
	function S() {
		for (let e of b) e(y);
	}
	function C(e) {
		let p = m[e.type];
		if (!p) throw Error(`No intent found for command type ${e.type}`);
		let h = y, b = p(h, e);
		if (b === h) return;
		let x = e.meta?.recordHistory !== !1;
		y = {
			...b,
			history: x ? historyOps.record(h.history, e) : h.history
		}, _ && v && v(y, e), S();
	}
	function w() {
		let e = historyEngine.undo(y, p, m);
		e && (y = e, _ && v && v(y, void 0), S());
	}
	function T() {
		let e = historyEngine.redo(y, p, m);
		e && (y = e, _ && v && v(y, void 0), S());
	}
	function E(e) {
		return b.add(e), () => b.delete(e);
	}
	function D(e) {
		y = e, _ && v && v(y, void 0), S();
	}
	return {
		getState: x,
		dispatch: C,
		undo: w,
		redo: T,
		subscribe: E,
		replaceState: D
	};
}, nodeOps = {
	addNode(e, p) {
		if (e.nodes.has(p.id)) return e;
		let m = new Map(e.nodes);
		return m.set(p.id, p), {
			...e,
			nodes: m
		};
	},
	removeNode(e, p) {
		if (!e.nodes.has(p)) throw Error(`Node with id ${p} does not exist`);
		let m = new Map(e.nodes);
		return m.delete(p), {
			...e,
			nodes: m
		};
	},
	removeNodes(e, p) {
		let m = new Map(e.nodes);
		return p.forEach((e) => {
			m.delete(e);
		}), {
			...e,
			nodes: m
		};
	},
	updateNode(e, p, m) {
		let h = e.nodes.get(p);
		if (!h) throw Error(`Node with id ${p} does not exist`);
		let g = {
			...h,
			...m
		}, _ = new Map(e.nodes);
		return _.set(p, g), {
			...e,
			nodes: _
		};
	}
}, orderOps = {
	insertNode(e, p, m) {
		let h = String(p);
		if (e.order.includes(h)) return e;
		let g = e.order, _ = m ?? g.length, v = Math.max(0, Math.min(_, g.length)), y = g.slice();
		return y.splice(v, 0, h), {
			...e,
			order: y
		};
	},
	removeNode(e, p) {
		let m = e.order.filter((e) => e !== p);
		return {
			...e,
			order: m
		};
	},
	removeNodes(e, p) {
		if (p.length === 0) return {
			...e,
			order: [...e.order]
		};
		let m = new Set(p), h = e.order.filter((e) => !m.has(e));
		return {
			...e,
			order: h
		};
	},
	reorderNode(e, p, m) {
		let h = e.order, g = h.indexOf(p);
		if (g === -1) return e;
		let _ = h.slice();
		_.splice(g, 1);
		let v = Math.max(0, Math.min(m, h.length));
		return _.splice(v, 0, p), {
			...e,
			order: _
		};
	}
}, selectionOps = {
	selectNodes(e, p) {
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: p
			}
		};
	},
	deselectNodes(e, p) {
		let m = new Set(p), h = (e.selection.nodeIds ?? []).filter((e) => !m.has(e));
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: h
			}
		};
	}
}, addNodeIntent = (e, p) => {
	let { node: m, index: h, select: g } = p.payload, _ = e;
	_ = nodeOps.addNode(_, m);
	let y = String(m.id), x = _.order;
	if (!x.includes(y)) {
		let e = h ?? x.length, p = Math.max(0, Math.min(e, x.length)), m = x.slice();
		m.splice(p, 0, y), _ = {
			..._,
			order: m
		};
	}
	return g && (_ = selectionOps.selectNodes(_, [m.id])), _;
}, removeNodeIntent = (e, p) => {
	let { nodeId: m } = p.payload;
	if (!e.nodes.has(m)) return e;
	let h = e;
	return h = nodeOps.removeNode(h, m), h = orderOps.removeNode(h, m), h = selectionOps.deselectNodes(h, [m]), h;
}, removeNodesIntent = (e, p) => {
	let { nodeIds: m } = p.payload;
	if (m.length === 0) return e;
	let h = e;
	return h = nodeOps.removeNodes(h, m), h = orderOps.removeNodes(h, m), h = selectionOps.deselectNodes(h, m), h;
}, updateNodeIntent = (e, p) => {
	let { nodeId: m, updates: h } = p.payload;
	if (!e.nodes.has(m)) return e;
	let g = e.nodes.get(m);
	return !g || !Object.keys(h).some((e) => g[e] !== h[e]) ? e : nodeOps.updateNode(e, m, h);
}, reorderNodeIntent = (e, p) => {
	let { nodeId: m, toIndex: h } = p.payload, g = orderOps.reorderNode(e, m, h);
	return g === e ? e : (g = selectionOps.deselectNodes(g, [m]), g);
}, selectNodeIntent = (e, p) => {
	let { nodeId: m } = p.payload;
	return selectionOps.selectNodes(e, [m]);
}, deselectNodesIntent = (e, p) => {
	let { nodeIds: m } = p.payload;
	return selectionOps.deselectNodes(e, m);
}, viewportOps = {
	setZoom(e, p, m, h) {
		if (p <= 0) return e;
		let g = e.viewport;
		if (h != null && m != null) {
			let g = m.x - h.x / p, _ = m.y - h.y / p;
			return {
				...e,
				viewport: {
					scale: p,
					x: g,
					y: _
				}
			};
		}
		if (m) {
			let h = p / g.scale, _ = m.x - (m.x - g.x) * h, v = m.y - (m.y - g.y) * h;
			return {
				...e,
				viewport: {
					scale: p,
					x: _,
					y: v
				}
			};
		}
		return {
			...e,
			viewport: {
				...g,
				scale: p
			}
		};
	},
	pan(e, p, m) {
		let { viewport: h } = e;
		return {
			...e,
			viewport: {
				...h,
				x: h.x + p,
				y: h.y + m
			}
		};
	}
}, intentMap = {
	ADD_NODE: addNodeIntent,
	REMOVE_NODE: removeNodeIntent,
	REMOVE_NODES: removeNodesIntent,
	UPDATE_NODE: updateNodeIntent,
	REORDER: reorderNodeIntent,
	SELECT_NODE: selectNodeIntent,
	DESELECT_NODES: deselectNodesIntent,
	SET_ZOOM: (e, p) => {
		let { scale: m, center: h, pointer: g } = p.payload;
		return viewportOps.setZoom(e, m, h, g);
	},
	PAN_VIEWPORT: (e, p) => {
		let { dx: m, dy: h } = p.payload;
		return viewportOps.pan(e, m, h);
	}
};
function serialize(e) {
	return {
		version: 1,
		nodes: Array.from(e.nodes.values()).map((e) => ({
			id: e.id,
			type: e.type,
			geometry: e.geometry,
			state: e.state,
			style: e.style ? { ...e.style } : {}
		})),
		order: e.order,
		viewport: e.viewport
	};
}
function deserialize(e, p) {
	if (e.version !== 1) throw Error("Unsupported document version");
	let m = /* @__PURE__ */ new Map();
	for (let p of e.nodes) m.set(p.id, {
		id: p.id,
		type: p.type,
		geometry: p.geometry,
		state: p.state,
		style: p.style
	});
	return {
		...p,
		nodes: m,
		order: e.order,
		viewport: e.viewport ? { ...e.viewport } : p.viewport,
		selection: { nodeIds: [] },
		history: p.history
	};
}
function migrate(e) {
	switch (e.version) {
		case 1: return e;
		default: throw Error("Unsupported document version");
	}
}
var SNAPSHOT_VERSION = 1;
function serializeState(e) {
	return {
		version: SNAPSHOT_VERSION,
		nodes: Array.from(e.nodes.values()).map((e) => ({
			id: e.id,
			type: e.type,
			geometry: e.geometry,
			state: e.state,
			style: e.style ? { ...e.style } : {}
		})),
		order: [...e.order],
		viewport: { ...e.viewport },
		selection: {
			nodeIds: [...e.selection.nodeIds],
			...e.selection.primary != null && { primary: e.selection.primary }
		},
		history: {
			past: [...e.history.past],
			future: [...e.history.future]
		}
	};
}
function deserializeState(e) {
	if (e.version !== 1) throw Error(`Unsupported devtools snapshot version: ${e.version}`);
	let p = /* @__PURE__ */ new Map();
	for (let m of e.nodes) p.set(m.id, {
		id: m.id,
		type: m.type,
		geometry: m.geometry,
		state: m.state,
		style: m.style ?? {}
	});
	return {
		nodes: p,
		order: [...e.order],
		viewport: { ...e.viewport },
		selection: {
			nodeIds: [...e.selection.nodeIds],
			...e.selection.primary != null && { primary: e.selection.primary }
		},
		history: {
			past: [...e.history.past],
			future: [...e.history.future]
		}
	};
}
var DEFAULT_MAX_LOG_SIZE = 100, idCounter = 0;
function nextId() {
	return idCounter += 1, `devtools-${idCounter}-${Date.now()}`;
}
function createEditorDevTools(e = {}) {
	let p = e.maxLogSize ?? DEFAULT_MAX_LOG_SIZE, m = [], h = null;
	function g(e, h, g) {
		let _ = serializeState(h), v = {
			id: nextId(),
			timestamp: Date.now(),
			source: e,
			...g != null && { command: g },
			stateSnapshot: _
		};
		m.push(v), m.length > p && m.splice(0, m.length - p);
	}
	let _ = (e, p) => {
		g(p == null ? "replace" : "dispatch", e, p);
	};
	function v(e) {
		h = e;
	}
	function y() {
		return [...m];
	}
	function b(e) {
		return e < 0 || e >= m.length ? null : m[e].stateSnapshot;
	}
	function x(e) {
		if (h == null) return;
		let p = b(e);
		if (p == null) return;
		let m = deserializeState(p);
		h.replaceState(m);
	}
	function S() {
		if (h == null) return "{}";
		let e = serializeState(h.getState());
		return JSON.stringify(e, null, 2);
	}
	function C() {
		return Math.max(0, m.length - 1);
	}
	return {
		logger: _,
		connect: v,
		getLog: y,
		getStateAt: b,
		replaceStateAt: x,
		exportStateJSON: S,
		getCurrentIndex: C
	};
}
export { addNodeIntent, createEditorDevTools, createEditorEngine, deserialize, deserializeState, intentMap, migrate, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, serialize, serializeState, updateNodeIntent, viewportOps };
