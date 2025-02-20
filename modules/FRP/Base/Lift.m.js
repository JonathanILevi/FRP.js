import {newRoot,newDeadRoot,joinRoots,partialRoot,compareRoots,same,overlapping,discrete} from "../Core/PushRoot.m.js";

import {Stream,makeStream} from "./Stream.m.js";
import {Cell,makeCell} from "./Cell.m.js";
import {PullCell} from "./PullCell.m.js";

export {map, lift, iLift, liftAny};

function map(f, m) {
	m.map(f);
}

// `lift` appears to have problems.
// `lift` didn't have the `forStreamRoot` function, but it called it.
// `liftAny` always returns a cell, even when it is passed only streams.
// `lift` should return a stream if there is one stream, and a cell if there are any cells, and assert if there are multiple incompatible streams
// `liftAny` should return a stream if only has streams and no cells (which begs when it would be used, like a goofy merge with a function call that knows which stream the value comes from, or for overlapping roots (which merge will assert on))
//
// UPDATE
// I used this function...and it wasn't working right.  I fixed it and it has now been tested.  (Leaving old comments for posterity sake for now.)
function lift(f) {
	return (...args)=>{
		let streamArgs = args.filter(a=>a instanceof Stream);
		if (streamArgs.length > 0)
			console.assert(streamArgs.length==1 || compareRoots(...streamArgs)==same);
		return liftAny(f)(...args);
	};
}

function iLift(...args) {
	return (f)=>lift(f)(...args);
}

/// Lift but allowing multiple streams.
/// Extra streams will be undefined with incompatible root.
function liftAny(f) {
	return (...args)=>{
		let pushArgs = args.filter(a=>(a instanceof Stream || a instanceof Cell));
		let roots = [pushArgs[0]._root];
		pushArgs.tail.forEach((a,i)=>{
			if (!pushArgs.slice(0,i+1).any(t=>compareRoots(a._root,t._root)==same))
				roots.push(a._root);
		});
		
		let nnid=Symbol();
		let n = makeCell(f(...args.map(a=>{
			if (a instanceof Cell)
				return a.initial;
			if (a instanceof PullCell)
				return a.grab();
			if (a instanceof Stream)
				return undefined;
			return a;// Non-FRP value, use as constant.
		})),joinRoots(nnid,roots),nnid);
		roots.forEach(r=>forStreamRoot(r, nnid, n._root));
		return n;
		
		function forStreamRoot(streamRoot, nnid, newRoot) {
			let retrieveArgs = args.map(a=>{
				if (a instanceof PullCell)
					return _=>a.grab();
				else if (a instanceof Cell || a instanceof Stream) {
					if (compareRoots(a._root,streamRoot)==same)
						return scope=>scope[a.nodeIdentifier];
					else if (a instanceof Cell) {
						a.caching();
						return a.grab;
					}
					else {
						return _=>undefined;
					}
				}
				else {// Non-FRP value, use as constant.
					return _=>a;
				}
			});
			streamRoot.addNode(scope=>newRoot.sendScope({[nnid]:f(...retrieveArgs.map(ra=>ra(scope)))}));
		}
	};
}

