import {Cell} from "../Base/Cell.m.js";
import {PullCell} from "../Base/PullCell.m.js";

/**	Takes a value to be treated as a cell.
	If value is a cell it will simply be returned, else it will be made into a constant.
*/
export
function asCell(value) {
	if (value instanceof Cell || a instanceof PullCell)
		return value;
	return Cell.constant(value);
}
 
