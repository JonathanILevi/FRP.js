import {Push} from "../Core/Push.m.js";
import {newRoot,newDeadRoot} from "../Core/PushRoot.m.js";

import * as C from "./Cell.m.js";

export {Cell,RootCell};

class Cell extends C.Cell {
	constructor (grab, ...args) {
		super(...args);
		this.grab = grab;
		this._root.addNode(scope=>this.initial=scope[this.nodeIdentifier]);
	}
	map(f) {
		let n = new Cell(()=>f(this.grab()), f(this.grab()), this._root);
		this._root.addNode((scope)=>{scope[n.nodeIdentifier]=f(scope[this.nodeIdentifier])});
		return n;
	}
}

class RootCell extends Cell {
	change(value) {
		this._root.send(value);
	}
	modify(f) {
		this.change(f(this.grab()));
	}
	impureModify(f) {
		f(this.grab())
		this.change(this.grab());
	}
}


