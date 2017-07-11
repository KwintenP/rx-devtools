(window as any).sendMessage = (text: string) => {
  console.log('posting', text);
  window.postMessage(text, '*');
}

(window as any).sendMessage('test');
