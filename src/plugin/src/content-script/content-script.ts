let scriptInjection = new Set<string>();

const inject = (fn: (element: HTMLScriptElement) => void) => {
  const script = document.createElement('script');
  fn(script);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
};

const injectScript = (path: string) => {
  if (scriptInjection.has(path)) {
    return;
  }

  inject(script => {
    script.src = chrome.extension.getURL(path);
  });

  scriptInjection.add(path);
};

injectScript('rx-devtools.bundle.js');

window.addEventListener('message',
  (event: MessageEvent) => {
    if (event.source === window) {
      console.log('event', event);
    }
});
