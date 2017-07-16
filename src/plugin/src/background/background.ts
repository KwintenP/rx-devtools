// background.js
var connections = {};

console.log('connection requested');
chrome.runtime.onConnect.addListener(function (port) {
  var extensionListener = function (message, sender, sendResponse) {
    console.log('called');
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name == "rx-devtools-page-init") {
      connections[message.tabId] = port;
      return;
    }
    console.log('init called', connections, message);
    // other message handling
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener as any);

  port.onDisconnect.addListener(function(port) {
    port.onMessage.removeListener(extensionListener as any);

    var tabs = Object.keys(connections);
    for (var i=0, len=tabs.length; i < len; i++) {
      if (connections[tabs[i]] == port) {
        delete connections[tabs[i]]
        break;
      }
    }
    console.log('disconnect', connections);
  });
});
console.log('request done');

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('receiving something!', connections, request, sender, sendResponse);
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id;
    if (tabId in connections) {
      console.log('sending it to tab with id', tabId, 'with message', request);
      connections[tabId].postMessage(request);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});
