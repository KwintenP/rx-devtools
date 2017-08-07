// background.js
var connections = {};

chrome.runtime.onConnect.addListener(function (port) {
  var extensionListener = function (message, sender, sendResponse) {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name === "rx-devtools-page-init") {
      connections[message.tabId] = port;
      return;
    } else if (message.name === "RESET_TIMER") {

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
          console.log(response.farewell);
        });
      });
    }
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
  });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // Messages from content scripts should have sender.tab set
  if (sender.tab) {
    var tabId = sender.tab.id;
    sendMessage(sender.tab.id, request.message);
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});

chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
  sendMessage(tabId, {name: 'RESET_DATA'});
});

const sendMessage = (tabId, request) => {
  if (tabId in connections) {
    connections[tabId].postMessage(request);
  } else {
    console.log("Tab not found in connection list.");
  }
}

