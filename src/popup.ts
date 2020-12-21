import * as browser from './browser';

// Clicking the extension icon should open the options page
browser.runtime.openOptionsPage(() => {
  window.close();
});