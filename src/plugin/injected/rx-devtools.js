window.sendMessage = function (text) {
    window.postMessage(text, '*');
};
window.sendMessage('test');
