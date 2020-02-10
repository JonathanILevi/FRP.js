import {NeverStream,ConstantStream,EnumStream} from "./ConstantStream.m.js";
import {makeConstantCell,makeConstantChangingCell,makeEnumCell,} from "./ConstantCell.m.js";


NeverStream.prototype.hold = function(initial) {
	return makeConstantCell(initial,this._root,this.nodeIdentifier);
}

ConstantStream.prototype.hold = function(initial) {
	if (initial == this.value)
		return makeConstantChangingCell(initial,this._root,this.nodeIdentifier);
	else
		return EnumStream.prototype.hold.bind(this)(initial);
}

EnumStream.prototype.hold = function(initial) {
	let possibilities = this.possibilities;
	if (possibilities.indexOf(initial)==-1)
		possibilities = [initial,...possibilities]; // Not pushing due to mutation.
	return makeEnumCell(initial,possibilities,this._root,this.nodeIdentifier);
}

