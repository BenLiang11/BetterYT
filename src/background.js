// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: request.action, checked: request.checked },
      (response) => {
        if (chrome.runtime.lastError || !response) {
          sendResponse({ status: "Error in content script" });
        } else {
          sendResponse({ status: response.status });
        }
      },
    );
  });
  return true;
});

// Initialize default values on installation or update
chrome.runtime.onInstalled.addListener(() => {
  // Hide element variables
  const defaults = {
    hideShorts: false,
    hidePeopleAlsoWatched: false,
    hideLatestPosts: false,
    hidePlaylists: false,
    hideLiveVids: false,
  };
  chrome.storage.local.set(defaults);
});
