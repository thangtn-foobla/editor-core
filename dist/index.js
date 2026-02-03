function replay(e, o, s) {
	return o.reduce((e, o) => {
		let c = s[o.type];
		return c ? c(e, o) : e;
	}, e);
}
function undo(o, s, c) {
	let { past: l, future: u } = o.history;
	if (l.length === 0) return null;
	let d = l.at(-1), f = l.slice(0, -1);
	return {
		...replay(s, f, c),
		history: {
			past: f,
			future: d ? [d, ...u] : u
		}
	};
}
function redo(o, s, c) {
	let { past: l, future: u } = o.history;
	if (u.length === 0) return null;
	let d = u[0], f = u.slice(1);
	return {
		...replay(s, [...l, d], c),
		history: {
			past: [...l, d],
			future: f
		}
	};
}
const historyEngine = {
	undo,
	redo
}, historyOps = { record(e, o) {
	let { past: s } = e;
	return {
		...e,
		past: [...s, o]
	};
} }, createEditorEngine = (e) => {
	let { initialState: o, intentMap: s, debug: u, logger: d } = e, f = o, p = /* @__PURE__ */ new Set();
	function m() {
		return f;
	}
	function h() {
		for (let e of p) e(f);
	}
	function g(e) {
		let o = s[e.type];
		if (!o) throw Error(`No intent found for command type ${e.type}`);
		let c = f, p = o(c, e);
		if (p === c) return;
		let m = e.meta?.recordHistory !== !1;
		f = {
			...p,
			history: m ? historyOps.record(c.history, e) : c.history
		}, u && d && d(f, e), h();
	}
	function _() {
		let e = historyEngine.undo(f, o, s);
		e && (f = e, u && d && d(f, void 0), h());
	}
	function v() {
		let e = historyEngine.redo(f, o, s);
		e && (f = e, u && d && d(f, void 0), h());
	}
	function y(e) {
		return p.add(e), () => p.delete(e);
	}
	function b(e) {
		f = e, u && d && d(f, void 0), h();
	}
	return {
		getState: m,
		dispatch: g,
		undo: _,
		redo: v,
		subscribe: y,
		replaceState: b
	};
}, nodeOps = {
	addNode(e, o) {
		if (e.nodes.has(o.id)) return e;
		let s = new Map(e.nodes);
		return s.set(o.id, o), {
			...e,
			nodes: s
		};
	},
	removeNode(e, o) {
		if (!e.nodes.has(o)) throw Error(`Node with id ${o} does not exist`);
		let s = new Map(e.nodes);
		return s.delete(o), {
			...e,
			nodes: s
		};
	},
	removeNodes(e, o) {
		let s = new Map(e.nodes);
		return o.forEach((e) => {
			s.delete(e);
		}), {
			...e,
			nodes: s
		};
	},
	updateNode(e, o, s) {
		let c = e.nodes.get(o);
		if (!c) throw Error(`Node with id ${o} does not exist`);
		let l = {
			...c,
			...s
		}, u = new Map(e.nodes);
		return u.set(o, l), {
			...e,
			nodes: u
		};
	}
}, orderOps = {
	insertNode(e, o, s) {
		let c = String(o);
		if (e.order.includes(c)) return e;
		let l = e.order, u = s ?? l.length, d = Math.max(0, Math.min(u, l.length)), f = l.slice();
		return f.splice(d, 0, c), {
			...e,
			order: f
		};
	},
	removeNode(e, o) {
		let s = e.order.filter((e) => e !== o);
		return {
			...e,
			order: s
		};
	},
	removeNodes(e, o) {
		if (o.length === 0) return {
			...e,
			order: [...e.order]
		};
		let s = new Set(o), c = e.order.filter((e) => !s.has(e));
		return {
			...e,
			order: c
		};
	},
	reorderNode(e, o, s) {
		let c = e.order, l = c.indexOf(o);
		if (l === -1) return e;
		let u = c.slice();
		u.splice(l, 1);
		let d = Math.max(0, Math.min(s, c.length));
		return u.splice(d, 0, o), {
			...e,
			order: u
		};
	}
}, selectionOps = {
	selectNodes(e, o) {
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: o
			}
		};
	},
	deselectNodes(e, o) {
		let s = new Set(o), c = (e.selection.nodeIds ?? []).filter((e) => !s.has(e));
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: c
			}
		};
	}
}, addNodeIntent = (e, o) => {
	let { node: s, index: c, select: l } = o.payload, u = e;
	u = nodeOps.addNode(u, s);
	let f = String(s.id), m = u.order;
	if (!m.includes(f)) {
		let e = c ?? m.length, o = Math.max(0, Math.min(e, m.length)), s = m.slice();
		s.splice(o, 0, f), u = {
			...u,
			order: s
		};
	}
	return l && (u = selectionOps.selectNodes(u, [s.id])), u;
}, removeNodeIntent = (e, o) => {
	let { nodeId: s } = o.payload;
	if (!e.nodes.has(s)) return e;
	let c = e;
	return c = nodeOps.removeNode(c, s), c = orderOps.removeNode(c, s), c = selectionOps.deselectNodes(c, [s]), c;
}, removeNodesIntent = (e, o) => {
	let { nodeIds: s } = o.payload;
	if (s.length === 0) return e;
	let c = e;
	return c = nodeOps.removeNodes(c, s), c = orderOps.removeNodes(c, s), c = selectionOps.deselectNodes(c, s), c;
}, updateNodeIntent = (e, o) => {
	let { nodeId: s, updates: c } = o.payload;
	if (!e.nodes.has(s)) return e;
	let l = e.nodes.get(s);
	return !l || !Object.keys(c).some((e) => l[e] !== c[e]) ? e : nodeOps.updateNode(e, s, c);
}, reorderNodeIntent = (e, o) => {
	let { nodeId: s, toIndex: c } = o.payload, l = orderOps.reorderNode(e, s, c);
	return l === e ? e : (l = selectionOps.deselectNodes(l, [s]), l);
}, selectNodeIntent = (e, o) => {
	let { nodeId: s } = o.payload;
	return selectionOps.selectNodes(e, [s]);
}, deselectNodesIntent = (e, o) => {
	let { nodeIds: s } = o.payload;
	return selectionOps.deselectNodes(e, s);
}, viewportOps = {
	setZoom(e, o, s, c) {
		if (o <= 0) return e;
		let l = e.viewport;
		if (c != null && s != null) {
			let l = s.x - c.x / o, u = s.y - c.y / o;
			return {
				...e,
				viewport: {
					scale: o,
					x: l,
					y: u
				}
			};
		}
		if (s) {
			let c = o / l.scale, u = s.x - (s.x - l.x) * c, d = s.y - (s.y - l.y) * c;
			return {
				...e,
				viewport: {
					scale: o,
					x: u,
					y: d
				}
			};
		}
		return {
			...e,
			viewport: {
				...l,
				scale: o
			}
		};
	},
	pan(e, o, s) {
		let { viewport: c } = e;
		return {
			...e,
			viewport: {
				...c,
				x: c.x + o,
				y: c.y + s
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
	SET_ZOOM: (e, o) => {
		let { scale: s, center: c, pointer: l } = o.payload;
		return viewportOps.setZoom(e, s, c, l);
	},
	PAN_VIEWPORT: (e, o) => {
		let { dx: s, dy: c } = o.payload;
		return viewportOps.pan(e, s, c);
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
function deserialize(e, o) {
	if (e.version !== 1) throw Error("Unsupported document version");
	let s = /* @__PURE__ */ new Map();
	for (let o of e.nodes) s.set(o.id, {
		id: o.id,
		type: o.type,
		geometry: o.geometry,
		state: o.state,
		style: o.style
	});
	return {
		...o,
		nodes: s,
		order: e.order,
		viewport: e.viewport ? { ...e.viewport } : o.viewport,
		selection: { nodeIds: [] },
		history: o.history
	};
}
function migrate(e) {
	switch (e.version) {
		case 1: return e;
		default: throw Error("Unsupported document version");
	}
}
export { addNodeIntent, createEditorEngine, deserialize, intentMap, migrate, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, serialize, updateNodeIntent, viewportOps };
