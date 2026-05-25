// Stack of close-handlers. The topmost handler is called when the Android back
// button is pressed. Components register via useNativeBackClose.

const handlers: Array<() => void> = [];

export function pushBackHandler(fn: () => void): () => void {
  handlers.push(fn);
  return () => {
    const idx = handlers.lastIndexOf(fn);
    if (idx >= 0) handlers.splice(idx, 1);
  };
}

export function handleNativeBack(): boolean {
  if (handlers.length > 0) {
    handlers[handlers.length - 1]();
    return true;
  }
  return false;
}
