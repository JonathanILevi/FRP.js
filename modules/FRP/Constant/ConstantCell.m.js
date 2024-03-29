import {Cell,} from "../Base/Cell.m.js";
import {newRoot,newDeadRoot,joinRoots,joinRootsMap,partialRoot,compareRoots,same,overlapping,discrete} from "../Core/PushRoot.m.js";

export {ConstantCell,constantCell,makeConstantCell,};
export {RootConstantChangingCell,ConstantChangingCell,constantChangingCell,makeConstantChangingCell,};
export {RootEnumCell,EnumCell,enumCell,makeEnumCell,};


class EnumCell extends Cell {
	constructor(initial,possibilities,...args) {
		super(initial,...args);
		this.possibilities = possibilities;
	}
	map(f) {
		let n = makeEnumCell(f(this.initial),this.possibilities.map(f),this._root);
		this._root.addNode((scope)=>{
			scope[n.nodeIdentifier]=f(scope[this.nodeIdentifier]);
		});
		return n;
	}
}
class RootEnumCell extends EnumCell {
	constructor(initial, possibilities) {
		let nodeId = Symbol();
		super(initial, possibilities, newRoot(nodeId), nodeId);
	}
	change(value) {
		if (this.possibilities.indexOf(value)!=-1)
			this._root.send(value);
		else
			console.assert(false);
	}
}

class ConstantChangingCell extends EnumCell {
	constructor(value,...args) {
		super(value, [value],...args);
	}
	get value() {
		return this.possibilities[0];
	}
	map(f) {
		let n = makeConstantChangingCell(f(this.value),this._root);
		this._root.addNode((scope)=>{
			scope[n.nodeIdentifier]=n.value;
		});
		return n;
	}
}
class RootConstantChangingCell extends ConstantChangingCell {
	constructor(value) {
		let nodeId = Symbol();
		super(value,newRoot(nodeId),nodeId);
	}
	change() {
		this._root.send(this.value);
	}
}

class ConstantCell extends ConstantChangingCell {
	map(f) {
		return makeConstantCell(f(this.value),this._root);
	}
	forEach(f) {
		f(this.initial);
		return this;
	}
}

function constantCell(value) {
	return new makeConstantCell(value);
}
ConstantCell.cell = constantCell;
Cell.constant = constantCell;

function constantChangingCell(value) {
	return new RootConstantChangingCell(value);
}
ConstantChangingCell.cell = constantChangingCell;
Cell.changingConstant = constantChangingCell;

function enumCell(initial,possibilities) {
	if (possibilities.length==0)
		console.assert(false, "Cannot have an EnumCell without any possible values.");
	else if (possibilities.indexOf(initial)==-1)
		console.assert(false, "Inital value must be in possible values.");
	else {
		if (possibilities.length==1)
			return constantCell(possibilities[0]);
		else
			return new RootEnumCell(initial,possibilities);
	}
}
EnumCell.cell = enumCell;
Cell.enum = enumCell;

function makeConstantCell(value,root=null,nnid=null) {
	if (nnid==null)
		nnid = Symbol();
	if (root==null)
		root = newDeadRoot(nnid);
	return new ConstantCell(value,root,nnid);
}
function makeConstantChangingCell(value,root=null,nnid=null) {
	if (nnid==null)
		nnid = Symbol();
	if (root==null)
		root = newDeadRoot(nnid);
	return new ConstantChangingCell(value,root,nnid);
}
function makeEnumCell(initial,possibilities,root=null,nnid=null) {
	if (possibilities.length==0)
		console.assert(false, "Cannot have an EnumCell without any possible values.");
	else if (possibilities.indexOf(initial)==-1)
		console.assert(false, "Inital value must be in possible values.");
	else {
		if (possibilities.length==1)
			return makeConstantChangingCell(possibilities[0],root,nnid);
		else {
			if (nnid==null)
				nnid = Symbol();
			if (root==null)
				root = newRoot(nnid);
			return new EnumCell(initial,possibilities,root,nnid);
		}
	}
}


