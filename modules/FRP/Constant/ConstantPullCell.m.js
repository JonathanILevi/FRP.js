import {PullCell} from "../Base/PullCell.m.js";

export {EnumPullCell,ConstantPullCell,enumPullCell,constantPullCell};

class EnumPullCell extends PullCell {
	constructor (callback, possibilities) {
		super(callback);
		this._callback = callback;
		this.possibilities = possibilities;
	}
	map(f) {
		return new EnumPullCell(()=>f(callback()),this.possibilities.map(f));
	}
	grab() {
		let v = this._callback();
		if (this.possibilities.indexOf(v)!=-1)
			return v;
		else
			console.assert(false);
	}
}
class ConstantPullCell extends EnumPullCell {
	constructor(value) {
		super(()=>console.assert(false,"Why is this being called?!"),[value]);
	}
	get value() {
		return this.possibilities[0];
	}
	map(f) {
		return new ConstantPullCell(f(this.value));
	}
	grab() {
		return this.value;
	}
}

function enumPullCell(callback,possibilities) {
	return new PullCell(callback,possibilities);
}
EnumPullCell.cell = enumPullCell;
PullCell.enum = enumPullCell;

function constantPullCell(value) {
	return new PullCell(()=>value);
}
ConstantPullCell.cell = constantPullCell;
PullCell.constant = constantPullCell;




