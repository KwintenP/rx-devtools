(window as any).sendMessage = (text: string) => {
  window.postMessage(text, '*');
};
