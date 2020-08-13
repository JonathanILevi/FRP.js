import {Cell,RootCell} from "./Cell.m.js";
import * as HC from "./HybridCell.m.js";

Cell.prototype.caching = function() {
	let value = this.initial;
	this.forEach(v=>value=v);
	return new HC.Cell(()=>value, this.initial, this._root, this.nodeIdentifier);
}
RootCell.prototype.caching = function() {
	let value = this.initial;
	this.forEach(v=>value=v);
	return new HC.RootCell(()=>value, this.initial, this._root, this.nodeIdentifier);
}



