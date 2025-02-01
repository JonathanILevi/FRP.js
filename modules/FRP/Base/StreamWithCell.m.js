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
			console.assert(cell == null, "`merge` cannot work with more than one cell");
				cell = s;
		}
	}
	let root = joinRootsMap(nnid,streams.map(s=>[s._root,s.nodeIdentifier]));
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

////Stream.prototype.scan = function(initial,f=(previous,func)=>func(previous)) {
////	if (initial instanceof Cell) {
////		let last = initial.initial;
////		initial.forEach(i=>last=i);
////		// Which actually makes sense?  This is a rather weird function.
////		return merge(initial, this.map(v=>last=f(last,v)));
////		return merge(initial.changes(), this.map(v=>last=f(last,v)));
////		return merge(this.map(v=>last=f(last,v)));
////	}
////	else {
////		let last = initial;
////		return this.map(v=>last=f(last,v));
////	}
////}

Cell.prototype.scan = function(initial,f=(previous,func)=>func(previous)) {
	let last = initial;
	return this.map(v=>last=f(last,v));
}
Cell.prototype.scan1 = function(f=(previous,func)=>func(previous)) {
	let last = this.initial;
	return this.changes().map(v=>last=f(last,v)).hold(last);
}

Cell.prototype.forEachScan = function(initial,f=(previous,func)=>func(previous)) {
	let last = initial;
	return this.forEach(v=>f(last,last=v));
}
Cell.prototype.forEachScan1 = function(f=(previous,func)=>func(previous)) {
	let last = this.initial;
	return this.changes().forEach(v=>f(last,last=v)).hold(last);
}


Cell.prototype.changeable = function(changeOut=null) {
	let s = stream();
	let nc = this.merge(s);
	nc.change = s.send;
	if (changeOut)
		changeOut(s.send);
	return nc;
}

Cell.prototype.hiddenChangeable = function(hiddenChangeOut=null) {
	let hiddenChangesS = stream();
	let combinedC = this.merge(hiddenChangesS);
	combinedC.unhidden = this;
	combinedC.hiddenChange = hiddenChangesS.send;
	combinedC.change = this.change.bind(this);
	if (hiddenChangeOut)
		hiddenChangeOut(hiddenChangesS.send);
	return combinedC;
}

/*
cell
cell.map all
cell.change all
cell.hiddenChange
cell.unhidden
*/


Cell.prototype.filterChanges = function(f) {
	let n = makeCell(this.initial, partialRoot(this._root),this.nodeIdentifier);
	this._root.addNode(scope=>{
		if (f(scope[this.nodeIdentifier])) 
			n._root.sendScope(scope);
	});
	return n;
}
