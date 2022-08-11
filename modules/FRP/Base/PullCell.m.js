export {PullCell,pullCell,constantPull};

class PullCell {
	constructor (callback) {
		this.grab = callback;
	}
	map(f) {
		return new PullCell(()=>f(callback()));
	}
}

function pullCell(callback) {
	return new PullCell(callback);
}
function constantPull(value) {
	return new PullCell(()=>value);
}
PullCell.cell = pullCell;
PullCell.constant = constantPull;




