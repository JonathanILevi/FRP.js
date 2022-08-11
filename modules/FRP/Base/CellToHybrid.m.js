import {Cell,RootCell} from "./Cell.m.js";

Cell.prototype.caching = function() {
	if (!this.grab) {
		let value = this.initial;
		this.forEach(v=>value=v);
		this.grab = ()=>value;
	}
	return this;
}
////RootCell.prototype.caching = function() {
////	let value = this.initial;
////	this.forEach(v=>value=v);
////	return new HC.RootCell(()=>value, this.initial, this._root, this.nodeIdentifier);
////}



