import {Stream} from "../Base/Stream.m.js";

/**	Creates an changing el from a cell in an el.
	The reference to the returned element must be only held within the DOM (a parent element).
	The returned element must never be taken out of the dom (it must always be in a parent element).
*/
export
function eventStream(element, eventType) {
	let eventStream = Stream.stream();
	element.addEventListener(eventType, ev=>eventStream.send(ev));
	return eventStream;
}
 
