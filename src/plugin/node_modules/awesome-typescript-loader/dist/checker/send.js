"use strict";
var isWindows = /^win/.test(process.platform);
function createQueuedSender(childProcess) {
    var msgQueue = [];
    var useQueue = false;
    var send = function (msg) {
        if (useQueue) {
            msgQueue.push(msg);
            return;
        }
        var result = childProcess.send(msg, function (error) {
            if (error) {
                console.error(error);
            }
            useQueue = false;
            if (msgQueue.length > 0) {
                var msgQueueCopy = msgQueue.slice(0);
                msgQueue = [];
                msgQueueCopy.forEach(function (entry) { return send(entry); });
            }
        });
        if (!result || isWindows) {
            useQueue = true;
        }
    };
    return { send: send };
}
exports.createQueuedSender = createQueuedSender;
//# sourceMappingURL=send.js.map