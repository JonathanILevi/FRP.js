import {Cell,makeCell} from "../Base/Cell.m.js";
import {EnumCell} from "./ConstantCell.m.js";

EnumCell.prototype.switch = function() {
	if (this.possibilities.all(v=>v instanceof Cell))
		return this.switchC();
	if (this.possibilities.all(v=>v instanceof Stream))
		return this.switchS();
	console.assert(false);
}
// I don't think this was coded right at all.  This new code has not been tested.
// Also note, that this does no pausing of unused cellThreads, as that and that never happens in other functions, so that is normal.  It would make sense to make pausable cells, but then would only work their value would be recalculated whenever it would need resumed. (Basically the switch would have to include a partial root of each pausable inner cell)
// And...I rewrote it again, much more idealistic, using other functions.
// Also note, that FRP.js has poor handling for caching currently.  the `current` variable here, could just make this caching, and then use the cached value.  I think this is true throughout.
EnumCell.prototype.switchC = function() {
	let current = this.initial;
	return merge(
		this.map(v=>{
			current = v;
			return v.grab();
		}),
		...this.possibilities.map(p=>p.changes().filter(()=>p==current)),
	);
}
// Modified form new switchC, also not tested.
EnumCell.prototype.switchS = function() {
	let current = this.initial;
	this.forEach(v=>current = v);
	return merge(...this.possibilities.map(p=>p.changes().filter(()=>p==current)));
}




