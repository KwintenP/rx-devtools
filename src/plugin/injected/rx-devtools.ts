(window as any).sendMessage = (text: string) => {
  window.postMessage(text, '*');
}

(window as any).sendMessage('test');
