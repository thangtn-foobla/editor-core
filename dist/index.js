function replay(e, r, i) {
	return r.reduce((e, r) => {
		let a = i[r.type];
		return a ? a(e, r) : e;
	}, e);
}
function undo(r, i, a) {
	let { past: o, future: s } = r.history;
	if (o.length === 0) return null;
	let c = o.at(-1), l = o.slice(0, -1);
	return {
		...replay(i, l, a),
		history: {
			past: l,
			future: c ? [c, ...s] : s
		}
	};
}
function redo(r, i, a) {
	let { past: o, future: s } = r.history;
	if (s.length === 0) return null;
	let c = s[0], l = s.slice(1);
	return {
		...replay(i, [...o, c], a),
		history: {
			past: [...o, c],
			future: l
		}
	};
}
const historyEngine = {
	undo,
	redo
}, historyOps = { record(e, r) {
	let { past: i } = e;
	return {
		...e,
		past: [...i, r]
	};
} }, createEditorEngine = (e) => {
	let { initialState: r, intentMap: i } = e, s = r, c = /* @__PURE__ */ new Set();
	function l() {
		return s;
	}
	function u() {
		for (let e of c) e(s);
	}
	function d(e) {
		let r = i[e.type];
		if (!r) throw Error(`No intent found for command type ${e.type}`);
		let a = s, c = r(a, e);
		if (c === a) return;
		let l = e.meta?.recordHistory !== !1;
		s = {
			...c,
			history: l ? historyOps.record(a.history, e) : a.history
		}, u();
	}
	function f() {
		let e = historyEngine.undo(s, r, i);
		e && (s = e, u());
	}
	function p() {
		let e = historyEngine.redo(s, r, i);
		e && (s = e, u());
	}
	function m(e) {
		return c.add(e), () => c.delete(e);
	}
	return {
		getState: l,
		dispatch: d,
		undo: f,
		redo: p,
		subscribe: m
	};
}, nodeOps = {
	addNode(e, r) {
		if (e.nodes.has(r.id)) return e;
		let i = new Map(e.nodes);
		return i.set(r.id, r), {
			...e,
			nodes: i
		};
	},
	removeNode(e, r) {
		if (!e.nodes.has(r)) throw Error(`Node with id ${r} does not exist`);
		let i = new Map(e.nodes);
		return i.delete(r), {
			...e,
			nodes: i
		};
	},
	removeNodes(e, r) {
		let i = new Map(e.nodes);
		return r.forEach((e) => {
			i.delete(e);
		}), {
			...e,
			nodes: i
		};
	},
	updateNode(e, r, i) {
		let a = e.nodes.get(r);
		if (!a) throw Error(`Node with id ${r} does not exist`);
		let o = {
			...a,
			...i
		}, s = new Map(e.nodes);
		return s.set(r, o), {
			...e,
			nodes: s
		};
	}
}, orderOps = {
	insertNode(e, r, i) {
		if (e.nodes.has(r)) return e;
		let a = e.order.slice();
		return a.splice(i, 0, r), {
			...e,
			order: a
		};
	},
	removeNode(e, r) {
		let i = e.order.filter((e) => e !== r);
		return {
			...e,
			order: i
		};
	},
	removeNodes(e, r) {
		if (r.length === 0) return {
			...e,
			order: [...e.order]
		};
		let i = new Set(r), a = e.order.filter((e) => !i.has(e));
		return {
			...e,
			order: a
		};
	},
	reorderNode(e, r, i) {
		let a = e.order, o = a.indexOf(r);
		if (o === -1) return e;
		let s = a.slice();
		s.splice(o, 1);
		let c = Math.max(0, Math.min(i, a.length));
		return s.splice(c, 0, r), {
			...e,
			order: s
		};
	}
}, selectionOps = {
	selectNodes(e, r) {
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: r
			}
		};
	},
	deselectNodes(e, r) {
		let i = new Set(r), a = (e.selection.nodeIds ?? []).filter((e) => !i.has(e));
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: a
			}
		};
	}
}, addNodeIntent = (e, r) => {
	let { node: i, index: a, select: o } = r.payload, s = e;
	return s = nodeOps.addNode(s, i), s = orderOps.insertNode(s, i.id, a ?? 0), o && (s = selectionOps.selectNodes(s, [i.id])), s;
}, removeNodeIntent = (e, r) => {
	let { nodeId: i } = r.payload;
	if (!e.nodes.has(i)) return e;
	let a = e;
	return a = nodeOps.removeNode(a, i), a = orderOps.removeNode(a, i), a = selectionOps.deselectNodes(a, [i]), a;
}, updateNodeIntent = (e, r) => {
	let { nodeId: i, updates: a } = r.payload;
	if (!e.nodes.has(i)) return e;
	let o = e.nodes.get(i);
	return !o || !Object.keys(a).some((e) => o[e] !== a[e]) ? e : nodeOps.updateNode(e, i, a);
}, reorderNodeIntent = (e, r) => {
	let { nodeId: i, toIndex: a } = r.payload, o = orderOps.reorderNode(e, i, a);
	return o === e ? e : (o = selectionOps.deselectNodes(o, [i]), o);
}, selectNodeIntent = (e, r) => {
	let { nodeId: i } = r.payload;
	return selectionOps.selectNodes(e, [i]);
}, intentMap = {
	ADD_NODE: addNodeIntent,
	REMOVE_NODE: removeNodeIntent,
	UPDATE_NODE: updateNodeIntent,
	REORDER: reorderNodeIntent,
	SELECT_NODE: selectNodeIntent
};
export { addNodeIntent, createEditorEngine, intentMap, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, updateNodeIntent };
