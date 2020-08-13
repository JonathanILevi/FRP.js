import {newRoot,newDeadRoot,joinRoots,partialRoot,compareRoots,same,overlapping,discrete} from "../Core/PushRoot.m.js";

import {Stream,makeStream} from "./Stream.m.js";
import {Cell,makeCell} from "./Cell.m.js";
import * as PC from "./PullCell.m.js";
import * as HC from "./HybridCell.m.js";

export {map, lift, iLift, liftAny};

function map(f, m) {
	m.map(f);
}


function lift(f) {
	return (...args)=>{
		let streamArgs = args.filter(a=>a instanceof Stream);
		
		if (streamArgs.length > 0) {
			console.assert(streamArgs.length==1 || compareRoots(...streamArgs)==same);
			let n = makeStream(streamArgs[0]._root,Symbol());
			forStreamRoot(n._root, n.nodeIdentifier, n._root);
			return n;
		}
		else {
			let pushArgs = args.filter(a=>(a instanceof Cell || a instanceof HC.Cell));
			let roots = [pushArgs[0]._root];
			pushArgs.tail().forEach((a,i)=>{
				if (!pushArgs.slice(0,i+1).any(t=>compareRoots(a._root,t._root)==same))
					roots.push(a._root);
			});
			
			let nnid=Symbol();
			let n = new Cell(f(...args.map(a=>
				(a instanceof Cell)
				?a.initial
				:	((a instanceof PC.Cell || a instanceof HC.Cell)
					?a.grab()
					:a/*assume constant*/)
			)),joinRoots(nnid,roots),nnid);
			roots.forEach(r=>forStreamRoot(r, nnid, n._root));
			return n;
		}
		
		function forStreamRoot(streamRoot, nnid, newRoot) {
			let retrieveArgs = args.map(a=>{
				if (a instanceof PC.Cell || a instanceof HC.Cell)
					return _=>a.grab();
				else if (a instanceof Cell || a instanceof Stream) {
					if (compareRoots(a._root,streamRoot)==same)
						return scope=>scope[a.nodeIdentifier];
					else {
						let ap = a.cache();
						return _=>ap.grab();
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

function iLift(...args) {
	return (f)=>lift(f)(...args);
}

function liftAny(f) {
	return (...args)=>{
		let pushArgs = args.filter(a=>(a instanceof Stream || a instanceof Cell || a instanceof HC.Cell));
		let roots = [pushArgs[0]._root];
		pushArgs.tail().forEach((a,i)=>{
			if (!pushArgs.slice(0,i+1).any(t=>compareRoots(a._root,t._root)==same))
				roots.push(a._root);
		});
		
		let nnid=Symbol();
		let n = new Cell(f(...args.map(a=>
			(a instanceof Cell)
			?a.initial
			:	((a instanceof PC.Cell || a instanceof HC.Cell)
				?a.grab()
				:a/*assume constant*/)
		)),joinRoots(nnid,roots),nnid);
		roots.forEach(r=>forStreamRoot(r, nnid, n._root));
		return n;
		
		function forStreamRoot(streamRoot, nnid) {
			let retrieveArgs = args.map(a=>{
				if (a instanceof PC.Cell || a instanceof HC.Cell)
					return _=>a.grab();
				else if (a instanceof Cell || a instanceof Stream) {
					if (compareRoots(a._root,streamRoot)==same)
						return scope=>scope[a.nodeIdentifier];
					else if (a instanceof Cell) {
						let ap = a.cache();
						return _=>ap.grab();
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



