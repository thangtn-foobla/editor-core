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
	let { initialState: o, intentMap: s } = e, u = o, d = /* @__PURE__ */ new Set();
	function f() {
		return u;
	}
	function p() {
		for (let e of d) e(u);
	}
	function m(e) {
		let o = s[e.type];
		if (!o) throw Error(`No intent found for command type ${e.type}`);
		let c = u, d = o(c, e);
		if (d === c) return;
		let f = e.meta?.recordHistory !== !1;
		u = {
			...d,
			history: f ? historyOps.record(c.history, e) : c.history
		}, p();
	}
	function h() {
		let e = historyEngine.undo(u, o, s);
		e && (u = e, p());
	}
	function g() {
		let e = historyEngine.redo(u, o, s);
		e && (u = e, p());
	}
	function _(e) {
		return d.add(e), () => d.delete(e);
	}
	return {
		getState: f,
		dispatch: m,
		undo: h,
		redo: g,
		subscribe: _
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
		if (e.nodes.has(o)) return e;
		let c = e.order.slice();
		return c.splice(s, 0, o), {
			...e,
			order: c
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
	return u = nodeOps.addNode(u, s), u = orderOps.insertNode(u, s.id, c ?? 0), l && (u = selectionOps.selectNodes(u, [s.id])), u;
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
export { addNodeIntent, createEditorEngine, intentMap, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, updateNodeIntent, viewportOps };
