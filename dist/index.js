function replay(e, c, l) {
	return c.reduce((e, c) => {
		let u = l[c.type];
		return u ? u(e, c) : e;
	}, e);
}
function undo(c, l, u) {
	let { past: d, future: f } = c.history;
	if (d.length === 0) return null;
	let p = d.at(-1), m = d.slice(0, -1);
	return {
		...replay(l, m, u),
		history: {
			past: m,
			future: p ? [p, ...f] : f
		}
	};
}
function redo(c, l, u) {
	let { past: d, future: f } = c.history;
	if (f.length === 0) return null;
	let p = f[0], m = f.slice(1);
	return {
		...replay(l, [...d, p], u),
		history: {
			past: [...d, p],
			future: m
		}
	};
}
const historyEngine = {
	undo,
	redo
}, historyOps = { record(e, c) {
	let { past: l } = e;
	return {
		...e,
		past: [...l, c]
	};
} }, createEditorEngine = (e) => {
	let { initialState: c, intentMap: l } = e, f = c, p = /* @__PURE__ */ new Set();
	function m() {
		return f;
	}
	function h() {
		for (let e of p) e(f);
	}
	function g(e) {
		let c = l[e.type];
		if (!c) throw Error(`No intent found for command type ${e.type}`);
		let u = f, p = c(u, e);
		if (p === u) return;
		let m = e.meta?.recordHistory !== !1;
		f = {
			...p,
			history: m ? historyOps.record(u.history, e) : u.history
		}, h();
	}
	function _() {
		let e = historyEngine.undo(f, c, l);
		e && (f = e, h());
	}
	function v() {
		let e = historyEngine.redo(f, c, l);
		e && (f = e, h());
	}
	function y(e) {
		return p.add(e), () => p.delete(e);
	}
	function b(e) {
		f = e, h();
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
	addNode(e, c) {
		if (e.nodes.has(c.id)) return e;
		let l = new Map(e.nodes);
		return l.set(c.id, c), {
			...e,
			nodes: l
		};
	},
	removeNode(e, c) {
		if (!e.nodes.has(c)) throw Error(`Node with id ${c} does not exist`);
		let l = new Map(e.nodes);
		return l.delete(c), {
			...e,
			nodes: l
		};
	},
	removeNodes(e, c) {
		let l = new Map(e.nodes);
		return c.forEach((e) => {
			l.delete(e);
		}), {
			...e,
			nodes: l
		};
	},
	updateNode(e, c, l) {
		let u = e.nodes.get(c);
		if (!u) throw Error(`Node with id ${c} does not exist`);
		let d = {
			...u,
			...l
		}, f = new Map(e.nodes);
		return f.set(c, d), {
			...e,
			nodes: f
		};
	}
}, orderOps = {
	insertNode(e, c, l) {
		if (e.order.includes(c)) return e;
		let u = e.order, d = l ?? u.length, f = Math.max(0, Math.min(d, u.length)), p = u.slice();
		return p.splice(f, 0, c), {
			...e,
			order: p
		};
	},
	removeNode(e, c) {
		let l = e.order.filter((e) => e !== c);
		return {
			...e,
			order: l
		};
	},
	removeNodes(e, c) {
		if (c.length === 0) return {
			...e,
			order: [...e.order]
		};
		let l = new Set(c), u = e.order.filter((e) => !l.has(e));
		return {
			...e,
			order: u
		};
	},
	reorderNode(e, c, l) {
		let u = e.order, d = u.indexOf(c);
		if (d === -1) return e;
		let f = u.slice();
		f.splice(d, 1);
		let p = Math.max(0, Math.min(l, u.length));
		return f.splice(p, 0, c), {
			...e,
			order: f
		};
	}
}, selectionOps = {
	selectNodes(e, c) {
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: c
			}
		};
	},
	deselectNodes(e, c) {
		let l = new Set(c), u = (e.selection.nodeIds ?? []).filter((e) => !l.has(e));
		return {
			...e,
			selection: {
				...e.selection,
				nodeIds: u
			}
		};
	}
}, addNodeIntent = (e, c) => {
	let { node: l, index: u, select: d } = c.payload, f = e;
	return f = nodeOps.addNode(f, l), f = orderOps.insertNode(f, l.id, u ?? 0), d && (f = selectionOps.selectNodes(f, [l.id])), f;
}, removeNodeIntent = (e, c) => {
	let { nodeId: l } = c.payload;
	if (!e.nodes.has(l)) return e;
	let u = e;
	return u = nodeOps.removeNode(u, l), u = orderOps.removeNode(u, l), u = selectionOps.deselectNodes(u, [l]), u;
}, removeNodesIntent = (e, c) => {
	let { nodeIds: l } = c.payload;
	if (l.length === 0) return e;
	let u = e;
	return u = nodeOps.removeNodes(u, l), u = orderOps.removeNodes(u, l), u = selectionOps.deselectNodes(u, l), u;
}, updateNodeIntent = (e, c) => {
	let { nodeId: l, updates: u } = c.payload;
	if (!e.nodes.has(l)) return e;
	let d = e.nodes.get(l);
	return !d || !Object.keys(u).some((e) => d[e] !== u[e]) ? e : nodeOps.updateNode(e, l, u);
}, reorderNodeIntent = (e, c) => {
	let { nodeId: l, toIndex: u } = c.payload, d = orderOps.reorderNode(e, l, u);
	return d === e ? e : (d = selectionOps.deselectNodes(d, [l]), d);
}, selectNodeIntent = (e, c) => {
	let { nodeId: l } = c.payload;
	return selectionOps.selectNodes(e, [l]);
}, deselectNodesIntent = (e, c) => {
	let { nodeIds: l } = c.payload;
	return selectionOps.deselectNodes(e, l);
}, viewportOps = {
	setZoom(e, c, l, u) {
		if (c <= 0) return e;
		let d = e.viewport;
		if (u != null && l != null) {
			let d = l.x - u.x / c, f = l.y - u.y / c;
			return {
				...e,
				viewport: {
					scale: c,
					x: d,
					y: f
				}
			};
		}
		if (l) {
			let u = c / d.scale, f = l.x - (l.x - d.x) * u, p = l.y - (l.y - d.y) * u;
			return {
				...e,
				viewport: {
					scale: c,
					x: f,
					y: p
				}
			};
		}
		return {
			...e,
			viewport: {
				...d,
				scale: c
			}
		};
	},
	pan(e, c, l) {
		let { viewport: u } = e;
		return {
			...e,
			viewport: {
				...u,
				x: u.x + c,
				y: u.y + l
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
	SET_ZOOM: (e, c) => {
		let { scale: l, center: u, pointer: d } = c.payload;
		return viewportOps.setZoom(e, l, u, d);
	},
	PAN_VIEWPORT: (e, c) => {
		let { dx: l, dy: u } = c.payload;
		return viewportOps.pan(e, l, u);
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
function deserialize(e, c) {
	if (e.version !== 1) throw Error("Unsupported document version");
	let l = /* @__PURE__ */ new Map();
	for (let c of e.nodes) l.set(c.id, {
		id: c.id,
		type: c.type,
		geometry: c.geometry,
		state: c.state,
		style: c.style
	});
	return {
		...c,
		nodes: l,
		order: e.order,
		viewport: e.viewport ? { ...e.viewport } : c.viewport,
		selection: { nodeIds: [] },
		history: c.history
	};
}
function migrate(e) {
	switch (e.version) {
		case 1: return e;
		default: throw Error("Unsupported document version");
	}
}
export { addNodeIntent, createEditorEngine, deserialize, intentMap, migrate, nodeOps, orderOps, removeNodeIntent, reorderNodeIntent, selectNodeIntent, selectionOps, serialize, updateNodeIntent, viewportOps };
