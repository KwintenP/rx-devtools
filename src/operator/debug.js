"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Subscriber_1 = require("rxjs/Subscriber");
var uuid_1 = require("uuid");
function debug() {
    // Assign an id to the current observable being lifted. This way we can identify
    // which observable should be debugged.
    this.__rx_observable_dev_tools_id = uuid_1.default();
    return this.lift(new DebugOperator());
}
exports.debug = debug;
var DebugOperator = (function () {
    function DebugOperator() {
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
