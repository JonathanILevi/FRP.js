import {Stream, stream, makeStream} from "./Stream.m.js";
import {Cell, cell, makeCell} from "./Cell.m.js";
////import {PullCell} from "./PullCell.m.js";
import {joinRootsMap,compareRoots,same,overlapping,discrete} from "../Core/PushRoot.m.js";

export {merge,};

Stream.prototype.snapshot = function(c,f=(s,c)=>c) {
	if (compareRoots(this._root, c._root) == same)
		return c.changes();
	if (c instanceof Cell)
		c = c.cache();
	return this.map(()=>c.grab());
}

// Merge supporting specialized constant/enum streams in `Constant/ConstantStream.m.js`.
function merge(...streams) {
	console.assert(compareRoots(...streams.map(s=>s._root)) == discrete);
	let nnid=Symbol();
	
	// If a stream is a cell;
	let cell = null;
	for (let s of streams) {
		if (s instanceof Cell) {
			if (cell == null)
				cell = s;
			else
				console.assert("`merge` cannot work with more than one cell");
		}
	}
	streams.forEach((s,i)=>s.forEach(v=>console.log("i",v,i,"of",streams.length)));
	streams.forEach((s,i)=>s._root.addNode(scope=>console.log("iscope",scope,scope[s.nodeIdentifier])));
	let root = joinRootsMap(nnid,streams.map(s=>[s._root,s.nodeIdentifier]));
	makeStream(root, nnid).forEach(v=>console.log("out",v));
	if (cell == null)
		return makeStream(root, nnid);
	else
		return makeCell(cell.initial, root, nnid);
}

Stream.prototype.merge = function(...streams) {
	return merge(this, ...streams);
}
Cell.prototype.merge = function(...streams) {
	return merge(this, ...streams);
}

Stream.prototype.scan = function(initial,f=(previous,func)=>func(previous)) {
	if (initial instanceof Cell) {
		let last = initial.initial;
		initial.forEach(i=>last=i);
		return merge(initial, this.map(v=>last=f(last,v)));
	}
	else {
		let last = initial;
		return this.map(v=>last=f(last,v));
	}
}

Cell.prototype.changeable = function(changeOut=null) {
	let s = stream().forEach(v=>console.log("a",v));
	this.forEach(v=>console.log("aa",v))
	let nc = this.merge(s).forEach(v=>console.log("b",v));
	nc.change = s.send;
	if (changeOut)
		changeOut(s.send);
	return nc;
}


