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
injectScript('dist/rx-devtools.bundle.js');
window.addEventListener('message', function (event) {
    if (event.source === window) {
        console.log('event', event);
    }
});
//# sourceMappingURL=content-script.js.map