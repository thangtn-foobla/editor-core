function replay(e, i, a) {
	return i.reduce((e, i) => {
		let o = a[i.type];
		return o ? o(e, i) : e;
	}, e);
}
function undo(i, a, o) {
	let { past: s, future: c } = i.history;
	if (s.length === 0) return null;
	let l = s.at(-1), u = s.slice(0, -1);
	return {
		...replay(a, u, o),
		history: {
			past: u,
			future: l ? [l, ...c] : c
		}
	};
}
function redo(i, a, o) {
	let { past: s, future: c } = i.history;
	if (c.length === 0) return null;
	let l = c[0], u = c.slice(1);
	return {
		...replay(a, [...s, l], o),
		history: {
			past: [...s, l],
			future: u
		}
	};
}
const historyEngine = {
	undo,
	redo
}, historyOps = { record(e, i) {
	let { past: a } = e;
	return {
		...e,
		past: [...a, i]
	};
} }, createEditorEngine = (e) => {
	let { initialState: i, intentMap: a } = e, c = i, l = /* @__PURE__ */ new Set();
	function u() {
		return c;
	}
	function d() {
		for (let e of l) e(c);
	}
	function f(e) {
		let i = a[e.type];
		if (!i) throw Error(`No intent found for command type ${e.type}`);
		let o = c, l = i(o, e);
		if (l === o) return;
		let u = e.meta?.recordHistory !== !1;
		c = {
			...l,
			history: u ? historyOps.record(o.history, e) : o.history
		}, d();
	}
	function p() {
		let e = historyEngine.undo(c, i, a);
		e && (c = e, d());
	}
	function m() {
		let e = historyEngine.redo(c, i, a);
		e && (c = e, d());
	}
	function h(e) {
		return l.add(e), () => l.delete(e);
	}
	return {
		getState: u,
		dispatch: f,
		undo: p,
		redo: m,
		subscribe: h
	};
}, nodeOps = {
	addNode(e, i) {
		if (e.nodes.has(i.id)) return e;
		let a = new Map(e.nodes);
		return a.set(i.id, i), {
			...e,
			nodes: a
		};
	},
	removeNode(e, i) {
		if (!e.nodes.has(i)) throw Error(`Node with id ${i} does not exist`);
		let a = new Map(e.nodes);
		return a.delete(i), {
			...e,
			nodes: a
		};
	},
	removeNodes(e, i) {
		let a = new Map(e.nodes);
		return i.forEach((e) => {
			a.delete(e);
		}), {
			...e,
			nodes: a
		};
	},
	updateNode(e, i, a) {
		let o = e.nodes.get(i);
		if (!o) throw Error(`Node with id ${i} does not exist`);
		let s = {
			...o,
			...a
		}, c = new Map(e.nodes);
		return c.set(i, s), {
			...e,
			nodes: c
		};
	}
}, orderOps = {
	insertNode(e, i, a) {
		if (e.nodes.has(i)) return e;
		let o = e.order.slice();
		return o.splice(a, 0, i), {
			...e,
			order: o
		};
	},
	removeNode(e, i) {
		let a = e.order.filter((e) => e !== i);
		return {
			...e,
			order: a
		};
	},
	removeNodes(e, i) {
		if (i.length === 0) return {
			...e,
			order: [...e.order]
		};
		let a = new Set(i), o = e.order.filter((e) => !a.has(e));
		return {
			...e,
			order: o
		};
	},
	reorderNode(e, i, a) {
		let o = e.order, s = o.indexOf(i);
		if (s === -1) return e;
		let c = o.slice();
		c.splice(s, 1);
		let l = Math.max(0, Math.min(a, o.length));
		return c.splice(l, 0, i), {
			...e,
			order: c
		};
	}
}, selectionOps = {
	selectNodes(e, i) {
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: i
			}
		};
	},
	deselectNodes(e, i) {
		let a = new Set(i), o = (e.selection.nodeIds ?? []).filter((e) => !a.has(e));
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: o
			}
		};
	}
}, addNodeIntent = (e, i) => {
	let { node: a, index: o, select: s } = i.payload, c = e;
	return c = nodeOps.addNode(c, a), c = orderOps.insertNode(c, a.id, o ?? 0), s && (c = selectionOps.selectNodes(c, [a.id])), c;
}, removeNodeIntent = (e, i) => {
	let { nodeId: a } = i.payload;
	if (!e.nodes.has(a)) return e;
	let o = e;
	return o = nodeOps.removeNode(o, a), o = orderOps.removeNode(o, a), o = selectionOps.deselectNodes(o, [a]), o;
}, removeNodesIntent = (e, i) => {
	let { nodeIds: a } = i.payload;
	if (a.length === 0) return e;
	let o = e;
	return o = nodeOps.removeNodes(o, a), o = orderOps.removeNodes(o, a), o = selectionOps.deselectNodes(o, a), o;
}, updateNodeIntent = (e, i) => {
	let { nodeId: a, updates: o } = i.payload;
	if (!e.nodes.has(a)) return e;
	let s = e.nodes.get(a);
	return !s || !Object.keys(o).some((e) => s[e] !== o[e]) ? e : nodeOps.updateNode(e, a, o);
}, reorderNodeIntent = (e, i) => {
	let { nodeId: a, toIndex: o } = i.payload, s = orderOps.reorderNode(e, a, o);
	return s === e ? e : (s = selectionOps.deselectNodes(s, [a]), s);
}, selectNodeIntent = (e, i) => {
	let { nodeId: a } = i.payload;
	return selectionOps.selectNodes(e, [a]);
}, intentMap = {
	ADD_NODE: addNodeIntent,
	REMOVE_NODE: removeNodeIntent,
	REMOVE_NODES: removeNodesIntent,
	UPDATE_NODE: updateNodeIntent,
	REORDER: reorderNodeIntent,
	SELECT_NODE: selectNodeIntent,
	DESELECT_NODES: (e, i) => {
		let { nodeIds: a } = i.payload;
		return selectionOps.deselectNodes(e, a);
	}
};
export { addNodeIntent, createEditorEngine, intentMap, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, updateNodeIntent };
