type ExtensionRuntime = typeof chrome.runtime;

export const runtime: ExtensionRuntime = (() => {
  return (
    // Chrome
    chrome?.runtime 
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