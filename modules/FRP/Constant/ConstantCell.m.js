import {Cell,} from "../Base/Cell.m.js";
import {newRoot,newDeadRoot,joinRoots,joinRootsMap,partialRoot,compareRoots,same,overlapping,discrete} from "../Core/PushRoot.m.js";

export {ConstantCell,constantCell,makeConstantCell,};
export {ConstantChangingCell,constantChangingCell,makeConstantChangingCell,};
export {EnumCell,enumCell,makeEnumCell,};


class EnumCell extends Cell {
	constructor(initial,possibilities,...args) {
		super(initial,...args);
		this.possibilities = possibilities;
	}
	pureMap(f) {
		let n = makeEnumCell(f(this.initial),this.possibilities.map(f),this._root);
		this._root.addNode((scope)=>{
			scope[n.nodeIdentifier]=f(scope[this.nodeIdentifier]);
		});
		return n;
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

function constantChangingCell(value, changeOut=null) {
	let cell = makeConstantChangingCell(value);
	cell.change = v=>{
		console.assert(v==value);
		cell._root.send(v);
	};
	if (changeOut)
		changeOut(cell.change);
	return cell;
}
ConstantChangingCell.cell = constantChangingCell;
Cell.changingConstant = constantChangingCell;

function enumCell(initial, possibilities, changeOut=null) {
	console.assert(possibilities.length!=0, "Cannot have an EnumCell without any possible values.");
	console.assert(possibilities.includes(initial),"Inital value must be in possible values.");
	
	if (possibilities.length==1)
		return constantCell(possibilities[0]);
	
	let cell = makeEnumCell(initial,possibilities);
	cell.change = v=>{
		console.assert(possibilities.includes(v), "Value must be in possible values.");
		cell._root.send(v);
	};
	if (changeOut)
		changeOut(cell.change);
	
	return cell;
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
		console.assert(false, "Inital value must be in possible values.", initial, possibilities);
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


