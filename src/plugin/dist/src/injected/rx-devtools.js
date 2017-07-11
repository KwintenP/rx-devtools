window.sendMessage = function (text) {
    console.log('posting', text);
    window.postMessage(text, '*');
};
window.sendMessage('test');
//# sourceMappingURL=rx-devtools.js.map