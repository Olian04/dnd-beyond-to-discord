chrome.runtime.onInstalled.addListener(() => {
  // Enable extension icon as a clickable button for selected pages
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {hostEquals: 'www.dndbeyond.com'},
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ]);
  });
});