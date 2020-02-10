import {Cell} from "../Base/PullCell.m.js";

export {EnumCell,ConstantCell,enumCell,constantCell};

class EnumCell extends Cell {
	constructor (callback, possibilities) {
		super(callback);
		this._callback = callback;
		this.possibilities = possibilities;
	}
	map(f) {
		return new EnumCell(()=>f(callback()),this.possibilities.map(f));
	}
	grab() {
		let v = this._callback();
		if (this.possibilities.indexOf(v)!=-1)
			return v;
		else
			console.assert(false);
	}
}
class ConstantCell extends EnumCell {
	constructor(value) {
		super(()=>console.assert(false,"Why is this being called?!"),[value]);
	}
	get value() {
		return this.possibilities[0];
	}
	map(f) {
		return new ConstantCell(f(this.value));
	}
	grab() {
		return this.value;
	}
}

function enumCell(callback,possibilities) {
	return new Cell(callback,possibilities);
}
EnumCell.cell = enumCell;
Cell.enum = enumCell;

function constantCell(value) {
	return new Cell(()=>value);
}
ConstantCell.cell = constantCell;
Cell.constant = constantCell;




