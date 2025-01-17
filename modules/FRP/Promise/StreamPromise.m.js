import {Stream,makeStream} from "../Base/Stream.m.js";

// For thenScan.
import {Cell} from "../Base/Cell.m.js";
import {merge} from "../Base/StreamWithCell.m.js";

Stream.prototype.thenOrdered = function() {
	let n = makeStream();
	this.scan(Promise.resolve(), (pLast, pValue) => 
		pLast.then(() => 
			pValue.then(v=>n._root.send(v))
			.catch(_=>{})
		)
	);
	return n;
}
Stream.prototype.thenUnordered = function() {
	let n = makeStream();
	this.forEach(pValue=>{
		pValue.then(v=>n._root.send(v)).catch(_=>{});
	});
	return n;
}
Stream.prototype.thenLatest = function() {
	let n = makeStream();
	let promiseCancels = [];
	this.forEach(pValue=>{
		let promiseCancel =	makeCancellablePromise(pValue)
			.modify(cp=>cp.then(v=>n._root.send(v)).finally(()=>doCancel()))
			.cancel;
		function doCancel() {
			promiseCancels.splice(0,promiseCancels.indexOf(promiseCancel)+1).forEach(cl=>cl());
		}
	});
	return n;
}

Stream.prototype.thenScanOrdered = function() {
	let n = makeStream();
	this.scan(Promise.resolve(), (pLast, pValue) => 
		pLast.then(() => 
			pValue.then(v=>n._root.send(v))
			.catch(_=>{})
		)
	);
	return n;
}

Stream.prototype.thenScanLatest = function(initial, f) {
	if (initial instanceof Cell) {
		let n = makeStream();
		let promiseCancels = [];
		let last = initial.initial;
		initial.changes().forEach(i=>{
			last=i;
			promiseCancels.forEach(cl=>cl());
			promiseCancels = [];
		});
		this.forEach(v=>{
			let promiseCancel =	makeCancellablePromise(f(last,v))
				.modify(cp=>cp.then(v=>n._root.send(last=v)).finally(()=>doCancel()))
				.cancel;
			promiseCancels.push(promiseCancel);
			function doCancel() {
				promiseCancels.splice(0,promiseCancels.indexOf(promiseCancel)+1).forEach(cl=>cl());
			}
		});
		return merge(initial, n);
	}
	else {
		let n = makeStream();
		let promiseCancels = [];
		let last = initial;
		this.forEach(v=>{
			let promiseCancel =	makeCancellablePromise(f(last,v))
				.modify(cp=>cp.then(v=>n._root.send(last=v)).finally(()=>doCancel()))
				.cancel;
			promiseCancels.push(promiseCancel);
			function doCancel() {
				promiseCancels.splice(0,promiseCancels.indexOf(promiseCancel)+1).forEach(cl=>cl());
			}
		});
		return n;
	}
}

export function promiseToStream(p) {
	let s = makeStream();
	p.then(v=>s._root.send(v)).catch(_=>{});
	return s;
}


// Credit to https://github.com/wojtekmaj/make-cancellable-promise
// Modified to return wrappedPromise with cancel as a member.
export default function makeCancellablePromise(promise) {
	let isCancelled = false;
	
	const wrappedPromise = new Promise((resolve, reject) => {
		promise
		.then((...args) => !isCancelled && resolve(...args))
		.catch((error) => !isCancelled && reject(error));
	});
	
	wrappedPromise.cancel = () => {
		isCancelled = true;
	}
	
	return wrappedPromise
}


Object.defineProperty(Promise.prototype, 'resolvable', {
	value: function (...args) {
		let resolve;
		let promise = new Promise(r=>resolve=r);
		promise.resolve = resolve;
		return promise;
	}
});