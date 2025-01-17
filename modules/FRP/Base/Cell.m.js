import {Push} from "../Core/Push.m.js";
import {newRoot,newDeadRoot} from "../Core/PushRoot.m.js";

export {Cell,cell,};
export {makeCell,};

class Cell extends Push {
	constructor (initial, ...args) {
		super(...args);
		this.initial = initial;
	}
	map(f) {
		let n = makeCell(f(this.initial),this._root);
		this._root.addNode((scope)=>{scope[n.nodeIdentifier]=f(scope[this.nodeIdentifier])});
		return n;
	}
	forEach(f) {
		f(this.initial);
		this._root.addNode((scope)=>{f(scope[this.nodeIdentifier])});
		return this;
	}
}
function cell(initial, changeOut=null) {
	let cell = makeCell(initial);
	cell.change = cell._root.send;
	if (changeOut)
		changeOut(cell._root.send);
	return cell;
}
function makeCell(initial,root=null,nnid=null) {
	if (nnid==null)
		nnid = Symbol();
	if (root==null)
		root = newRoot(nnid);
	return new Cell(initial,root,nnid);
}

