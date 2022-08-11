import {Cell} from "./Cell.m.js";
import {PullCell} from "./PullCell.m.js";

Cell.prototype.cache = function() {
	let value = this.initial;
	this.forEach(v=>value=v);
	return new PullCell(()=>value);
}

Cell.prototype.caching = function() {
	if (!this.grab) {
		let value = this.initial;
		this.forEach(v=>value=v);
		this.grab = ()=>value;
	}
	return this;
}


