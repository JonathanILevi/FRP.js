import {Stream} from "./Stream.m.js";
import {Cell} from "./Cell.m.js";
////import {Cell as PullCell} from "./PullCell.m.js";
import {} from "./CellToStream.m.js";
import {joinRootsMap,compareRoots,same,overlapping,discrete} from "../Core/PushRoot.m.js";

export {merge,};

Stream.prototype.snapshot = function(c,f=(s,c)=>c) {
	if (compareRoots(this._root)==same)
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
	if (cell == null)
		return new Stream(joinRootsMap(nnid,streams.map(s=>[s._root,s.nodeIdentifier])),nnid);
	else
		return new Cell(cell.initial, joinRootsMap(nnid,streams.map(s=>[s._root,s.nodeIdentifier])),nnid);
}


