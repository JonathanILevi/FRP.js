import {Cell} from "./Cell.m.js";
import {makeStream} from "./Stream.m.js";
import {} from "./StreamWithCell.m.js";

Cell.prototype.changes = function() {
	return makeStream(this._root,this.nodeIdentifier);
}
Cell.prototype.snapshot = function(s,f=undefined) {
	s.snapshot(s,f?(sv,cv)=>f(cv,sv):undefined);
}
Cell.prototype.scan = function(f=(previous,func)=>func(previous)) {
	let last = this.initial;
	return this.map(v=>last=f(last,v));
}




