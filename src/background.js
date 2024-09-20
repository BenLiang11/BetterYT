// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setTimer") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "setTimer",
          seconds: request.duration,
        },
        (response) => {
          if (chrome.runtime.lastError || !response) {
            sendResponse({ status: "Error in content script" });
          } else {
            sendResponse({ status: "Timer set on content script" });
          }
        },
      );
    });
    return true;
  }

  if (request.action === "stopTimer") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: "stopTimer",
        },
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
  }

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

  // Timer variables
  chrome.storage.local.set({ timerStartTime: null, timerDuration: 0 }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting initial storage values:", chrome.runtime.lastError);
    } else {
      console.log("Default timer values initialized.");
    }
  });
});
