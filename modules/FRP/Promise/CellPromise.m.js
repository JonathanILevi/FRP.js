import {Cell,makeCell} from "../Base/Cell.m.js";
import {makeStream} from "../Base/Stream.m.js";//for thenWaiting

export {promiseToCell};

Cell.prototype.thenOrdered = function(newInitial) {
	let lastPromise = Promise.resolve();
	let n = makeCell(newInitial);
	this.forEach(pValue=>{
		lastPromise = new Promise((resolve,reject)=>{
			lastPromise.then(()=>{
				pValue	.then(v=>n._root.send(v))
					.then(()=>resolve())
					.catch(e=>{resove();throw e;});
			});
		});
	});
	return n;
}
Cell.prototype.thenLatest = function(newInitial) {
	let n = makeCell(newInitial);
	let cancelLasts = [];
	this.forEach(pValue=>{
		let localCancelLasts = [...cancelLasts];
		cancelLasts.push(then_(pValue, v=>{doCancel(); n._root.send(v);}));
		function doCancel() {
			localCancelLasts.forEach(cl=>cl());
			cancelLasts.splice(0,cancelLasts.indexOf(localCancelLasts.last)+1);
		}
	});
	return n;
	
	function then_(promise,f) {
		let notCanceled = true;
		promise.then((...args)=>{if(notCanceled) f(...args);});
		return ()=>notCanceled=false;
	}
}
Cell.prototype.thenWaiting = function() {
	let pStream = makeStream();
	
	let latest = null;
	this.forEach(([waitingValue, pValue])=>{
		latest = pValue;
		if (pValue)
			pValue.then(v=>{if (latest==pValue) pStream._root.send(v);});
	});
	
	return this.map(([waitingValue,pValue])=>waitingValue).merge(pStream);
}
Cell.prototype.thenMaybeWaiting = function() {
	let pStream = makeStream();
	
	let latest = null;
	this.forEach(([waitingValue, pValue])=>{
		latest = pValue;
		if (pValue)
			pValue.then(v=>{if (latest==pValue) pStream._root.send(v);});
	});
	
	return this.map(([waitingValue,pValue])=>waitingValue).filerChanges(v=>v!==undefined).merge(pStream);
}

function promiseToCell(initial,promise) {
	let n = makeCell(initial);
	promise.then(v=>n._root.send(n));
	return n;
}

