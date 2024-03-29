import {} from "../Base/Cell.m.js";
import {} from "../Base/CellToStream.m.js";

/**	Creates a changing el from a cell in an el.
	The reference to the returned element must be only held within the DOM (a parent element).
	The returned element must never be taken out of the dom (it must always be in a parent element).
*/
export
function cellEl(elCell) {
	elCell.scan((last,el)=>{
		console.log("el: cell",last,el);
		last.parentElement?.replaceChild(el,last);
		return el;
	});
	return elCell.initial;
}

/**	Creates changing sequence of els from a cell.
	The reference to the returned elements must be only held within the DOM (a parent element).
	The returned elements must never be taken out of the dom (it must always be in a parent element).
	The elements must always be in the Dom as siblings, in order.
*/
export
function cellEls(elsCell) {
	elsCell.scan((last,els)=>{
		last.slice(1).forEach(el=>el?.parentElement.removeChild(el));
		els.forEach(el=>last[0].parentElement?.insertBefore(el,last[0]));
		last[0].parentElement?.removeChild(last[0]);
		return els;
	});
	return elsCell.initial;
}

