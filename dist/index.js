function replay(e, a, o) {
	return a.reduce((e, a) => {
		let s = o[a.type];
		return s ? s(e, a) : e;
	}, e);
}
function undo(a, o, s) {
	let { past: c, future: l } = a.history;
	if (c.length === 0) return null;
	let u = c.at(-1), d = c.slice(0, -1);
	return {
		...replay(o, d, s),
		history: {
			past: d,
			future: u ? [u, ...l] : l
		}
	};
}
function redo(a, o, s) {
	let { past: c, future: l } = a.history;
	if (l.length === 0) return null;
	let u = l[0], d = l.slice(1);
	return {
		...replay(o, [...c, u], s),
		history: {
			past: [...c, u],
			future: d
		}
	};
}
const historyEngine = {
	undo,
	redo
}, historyOps = { record(e, a) {
	let { past: o } = e;
	return {
		...e,
		past: [...o, a]
	};
} }, createEditorEngine = (e) => {
	let { initialState: a, intentMap: o } = e, l = a, u = /* @__PURE__ */ new Set();
	function d() {
		return l;
	}
	function f() {
		for (let e of u) e(l);
	}
	function p(e) {
		let a = o[e.type];
		if (!a) throw Error(`No intent found for command type ${e.type}`);
		let s = l, u = a(s, e);
		if (u === s) return;
		let d = e.meta?.recordHistory !== !1;
		l = {
			...u,
			history: d ? historyOps.record(s.history, e) : s.history
		}, f();
	}
	function m() {
		let e = historyEngine.undo(l, a, o);
		e && (l = e, f());
	}
	function h() {
		let e = historyEngine.redo(l, a, o);
		e && (l = e, f());
	}
	function g(e) {
		return u.add(e), () => u.delete(e);
	}
	function _(e) {
		l = e, f();
	}
	return {
		getState: d,
		dispatch: p,
		undo: m,
		redo: h,
		subscribe: g,
		replaceState: _
	};
}, nodeOps = {
	addNode(e, a) {
		if (e.nodes.has(a.id)) return e;
		let o = new Map(e.nodes);
		return o.set(a.id, a), {
			...e,
			nodes: o
		};
	},
	removeNode(e, a) {
		if (!e.nodes.has(a)) throw Error(`Node with id ${a} does not exist`);
		let o = new Map(e.nodes);
		return o.delete(a), {
			...e,
			nodes: o
		};
	},
	removeNodes(e, a) {
		let o = new Map(e.nodes);
		return a.forEach((e) => {
			o.delete(e);
		}), {
			...e,
			nodes: o
		};
	},
	updateNode(e, a, o) {
		let s = e.nodes.get(a);
		if (!s) throw Error(`Node with id ${a} does not exist`);
		let c = {
			...s,
			...o
		}, l = new Map(e.nodes);
		return l.set(a, c), {
			...e,
			nodes: l
		};
	}
}, orderOps = {
	insertNode(e, a, o) {
		if (e.nodes.has(a)) return e;
		let s = e.order.slice();
		return s.splice(o, 0, a), {
			...e,
			order: s
		};
	},
	removeNode(e, a) {
		let o = e.order.filter((e) => e !== a);
		return {
			...e,
			order: o
		};
	},
	removeNodes(e, a) {
		if (a.length === 0) return {
			...e,
			order: [...e.order]
		};
		let o = new Set(a), s = e.order.filter((e) => !o.has(e));
		return {
			...e,
			order: s
		};
	},
	reorderNode(e, a, o) {
		let s = e.order, c = s.indexOf(a);
		if (c === -1) return e;
		let l = s.slice();
		l.splice(c, 1);
		let u = Math.max(0, Math.min(o, s.length));
		return l.splice(u, 0, a), {
			...e,
			order: l
		};
	}
}, selectionOps = {
	selectNodes(e, a) {
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: a
			}
		};
	},
	deselectNodes(e, a) {
		let o = new Set(a), s = (e.selection.nodeIds ?? []).filter((e) => !o.has(e));
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: s
			}
		};
	}
}, addNodeIntent = (e, a) => {
	let { node: o, index: s, select: c } = a.payload, l = e;
	return l = nodeOps.addNode(l, o), l = orderOps.insertNode(l, o.id, s ?? 0), c && (l = selectionOps.selectNodes(l, [o.id])), l;
}, removeNodeIntent = (e, a) => {
	let { nodeId: o } = a.payload;
	if (!e.nodes.has(o)) return e;
	let s = e;
	return s = nodeOps.removeNode(s, o), s = orderOps.removeNode(s, o), s = selectionOps.deselectNodes(s, [o]), s;
}, removeNodesIntent = (e, a) => {
	let { nodeIds: o } = a.payload;
	if (o.length === 0) return e;
	let s = e;
	return s = nodeOps.removeNodes(s, o), s = orderOps.removeNodes(s, o), s = selectionOps.deselectNodes(s, o), s;
}, updateNodeIntent = (e, a) => {
	let { nodeId: o, updates: s } = a.payload;
	if (!e.nodes.has(o)) return e;
	let c = e.nodes.get(o);
	return !c || !Object.keys(s).some((e) => c[e] !== s[e]) ? e : nodeOps.updateNode(e, o, s);
}, reorderNodeIntent = (e, a) => {
	let { nodeId: o, toIndex: s } = a.payload, c = orderOps.reorderNode(e, o, s);
	return c === e ? e : (c = selectionOps.deselectNodes(c, [o]), c);
}, selectNodeIntent = (e, a) => {
	let { nodeId: o } = a.payload;
	return selectionOps.selectNodes(e, [o]);
}, deselectNodesIntent = (e, a) => {
	let { nodeIds: o } = a.payload;
	return selectionOps.deselectNodes(e, o);
}, viewportOps = {
	setZoom(e, a, o, s) {
		if (a <= 0) return e;
		let c = e.viewport;
		if (s != null && o != null) {
			let c = o.x - s.x / a, l = o.y - s.y / a;
			return {
				...e,
				viewport: {
					scale: a,
					x: c,
					y: l
				}
			};
		}
		if (o) {
			let s = a / c.scale, l = o.x - (o.x - c.x) * s, u = o.y - (o.y - c.y) * s;
			return {
				...e,
				viewport: {
					scale: a,
					x: l,
					y: u
				}
			};
		}
		return {
			...e,
			viewport: {
				...c,
				scale: a
			}
		};
	},
	pan(e, a, o) {
		let { viewport: s } = e;
		return {
			...e,
			viewport: {
				...s,
				x: s.x + a,
				y: s.y + o
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
	SET_ZOOM: (e, a) => {
		let { scale: o, center: s, pointer: c } = a.payload;
		return viewportOps.setZoom(e, o, s, c);
	},
	PAN_VIEWPORT: (e, a) => {
		let { dx: o, dy: s } = a.payload;
		return viewportOps.pan(e, o, s);
	}
};
export { addNodeIntent, createEditorEngine, intentMap, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, updateNodeIntent, viewportOps };
