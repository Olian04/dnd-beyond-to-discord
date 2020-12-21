type ExtensionRuntime = typeof chrome.runtime;

export const runtime: ExtensionRuntime = (() => {
  return (
    // Chrome
    window?.chrome?.runtime 
      ||
    // Firefox
    //@ts-ignore
    window?.runtime
    ||
  // Firefox content script
  //@ts-ignore
  browser?.runtime
  );
})();