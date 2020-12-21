type ExtensionStorage = typeof chrome.storage;

export const storage: ExtensionStorage = (() => {
  return (
    // Chrome
    window?.chrome?.storage 
      ||
    // Firefox
    //@ts-ignore
    window?.storage
      ||
    // Firefox content script
    //@ts-ignore
    browser?.storage
  );
})();