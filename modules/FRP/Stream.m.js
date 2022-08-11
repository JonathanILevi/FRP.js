import {Stream,stream,never,/*merge,*/} from "./Base/Stream.m.js";
import {} from "./Base/StreamWithCell.m.js";
import {} from "./Base/StreamToCell.m.js";
import {promiseToStream} from "./Promise/StreamPromise.m.js";
import {} from "./Base/StreamScanFilter.m.js";
import {eventStream} from "./Event/EventStream.m.js";

import	{ ConstantStream,constantStream
	, EnumStream,enumStream
	, merge
	} from "./Constant/ConstantStream.m.js";
import {} from "./Constant/StreamWithConstant.m.js";
import {} from "./Constant/StreamToConstantCell.m.js";

import {map} from "./Base/Shared.m.js";
import {lift, iLift,liftAny} from "./Base/Lift.m.js";

/* Override default merge which does not have handling for `ConstantStream`s. */
Stream.merge = function (...streams) {
	merge(streams);
}

export	{ Stream,stream,never
	, ConstantStream,constantStream
	, EnumStream,enumStream
	, promiseToStream
	, merge
	, map
	, lift, iLift, liftAny
	, eventStream
	}

