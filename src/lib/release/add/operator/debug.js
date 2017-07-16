"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var debug_1 = require("../../operator/debug");
function debug(name) {
    return debug_1.debug(this, name);
}
exports.debug = debug;
Observable_1.Observable.prototype.debug = debug;
//# sourceMappingURL=debug.js.map