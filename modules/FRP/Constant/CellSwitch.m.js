import {Cell,makeCell} from "../Base/Cell.m.js";
import {EnumCell} from "./ConstantCell.m.js";
import {partialRoot,joinRoots} from "../Core/PushRoot.m.js";

EnumCell.prototype.switch = function() {
	if (this.possibilities.all(v=>v instanceof Cell))
		return this.switchC();
	if (this.possibilities.all(v=>v instanceof Stream))
		return this.switchS();
	console.assert(false);
}
// I don't think this was coded right at all.  This new code has not been tested.
// Also note, that this does no pausing of unused cellThreads, as that and that never happens in other functions, so that is normal.  It would make sense to make pausable cells, but then would only work their value would be recalculated whenever it would need resumed. (Basically the switch would have to include a partial root of each pausable inner cell)
EnumCell.prototype.switchC = function() {
	let nnid = Symbol();
	let current = this.initial;
	let n = makeCell(this.initial.initial,joinRoots(nnid,[this._root,...this.possibilities.map(p=>p._root)]),nnid);
	
	this.map(v=>{
		this.current = v;
		n._root.send(v.grab());
	});
	this.possibilities.forEach(p=>p.forEach(pv=>{
		n._root.send(pv);
	}));
	
	return n;
}
// Modified form new switchC, also not tested.
EnumCell.prototype.switchS = function() {
	let nnid = Symbol();
	let current = this.initial;
	let n = makeStream(joinRoots(nnid,this.possibilities.map(p=>p._root)),nnid);
	
	this.map(v=>{
		this.current = v;
	});
	this.possibilities.forEach(p=>p.forEach(pv=>{
		n._root.send(pv);
	}));
	
	return n;
}




