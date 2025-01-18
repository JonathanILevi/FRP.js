
/**	Creates a temporary el that will be replaced in whatever it's parent is when an el in a promise is resolved.
	The reference to the returned element must be only held within the DOM (a parent element).
	The returned element must never be taken out of the dom (it must always be in a parent element).
*/
export
function promiseEl(initialEl, elPromise) {
	elPromise.then(el=>{
		initialEl.parentElement?.replaceChild(el,initialEl);
		return el;
	});
	return initialEl;
}