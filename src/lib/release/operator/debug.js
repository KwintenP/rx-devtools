"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require("rxjs/Subscriber");
var uuid_1 = require("uuid");
function debug(name) {
    // Assign an id to the current observable being lifted. This way we can identify
    // which observable should be debugged.
    this.__rx_observable_dev_tools_id = uuid_1.default();
    return this.lift(new DebugOperator(name));
}
exports.debug = debug;
var DebugOperator = (function () {
    function DebugOperator(name) {
        this.name = name;
    }
    DebugOperator.prototype.call = function (subscriber, source) {
        return source.subscribe(new DebugSubscriber(subscriber));
    };
    return DebugOperator;
}());
exports.DebugOperator = DebugOperator;
var DebugSubscriber = (function (_super) {
    __extends(DebugSubscriber, _super);
    function DebugSubscriber(destination) {
        return _super.call(this, destination) || this;
    }
    DebugSubscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    return DebugSubscriber;
}(Subscriber_1.Subscriber));
//# sourceMappingURL=debug.js.map