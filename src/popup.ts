// Clicking the extension icon should open the options page
chrome.runtime.openOptionsPage(() => {
  window.close();
});