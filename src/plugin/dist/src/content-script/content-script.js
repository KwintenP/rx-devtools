var scriptInjection = new Set();
var inject = function (fn) {
    var script = document.createElement('script');
    fn(script);
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
};
var injectScript = function (path) {
    if (scriptInjection.has(path)) {
        return;
    }
    inject(function (script) {
        script.src = chrome.extension.getURL(path);
    });
    scriptInjection.add(path);
};
injectScript('rx-devtools.bundle.js');
window.addEventListener('message', function (event) {
    // Only accept messages from the same frame
    if (event.source !== window) {
        return;
    }
    var message = event.data;
    // Only accept messages that we know are ours
    if (typeof message !== 'object' || message === null ||
        !(message.source === 'rx-devtools-plugin')) {
        return;
    }
    // chrome.runtime.sendMessage(message);
});
//# sourceMappingURL=content-script.js.map