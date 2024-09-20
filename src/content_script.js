// content_script.js

let timerID = null;
let observer = null;

const selectorsMap = {
  hideShorts: "ytd-reel-shelf-renderer",
  hidePeopleAlsoWatched: "ytd-shelf-renderer",
  hideLatestPosts: "ytd-shelf-renderer",
  hidePlaylists: "ytd-playlist-renderer",
  hideLiveVids: "ytd-video-renderer",
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setTimer") {
    const seconds = message.seconds;

    const video = document.querySelector("video");

    if (video) {
      if (timerID) {
        clearTimeout(timerID);
      }

      sendResponse({ status: "Started timer" });
      timerID = setTimeout(() => {
        video.pause();
        console.log("Video paused");
      }, seconds * 1000);
    } else {
      sendResponse({ status: "No video found" });
    }
  }

  if (message.action === "stopTimer") {
    if (timerID) {
      clearTimeout(timerID);
      timerID = null;
      sendResponse({ status: "Timer stopped" });
    } else {
      sendResponse({ status: "No active timer" });
    }
  }

  const selector = selectorsMap[message.action];
  if (message.action === "hidePeopleAlsoWatched") {
    togglePeopleAlsoWatched(message.checked);
    sendResponse({ status: `Toggled ${message.action}` });
  } else if (message.action === "hideLatestPosts") {
    toggleLatestPosts(message.checked);
    sendResponse({ status: `Toggled ${message.action}` });
  } else if (selector) {
    toggleElements(selector, message.checked);
    sendResponse({ status: `Toggled ${message.action}` });
  }
});

// Hide general elements
function toggleElements(selector, hide) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    // For live videos, check if the child element has the 'is-live-video' attribute
    if (selector === "ytd-video-renderer") {
      const thumbnail = element.querySelector("ytd-thumbnail[is-live-video]");
      if (thumbnail) {
        element.style.display = hide ? "none" : "";
      }
    }
    // For other elements, hide or show directly
    else {
      element.style.display = hide ? "none" : "";
    }
  });
}

// Hide "People also watched"
function togglePeopleAlsoWatched(hide) {
  const shelfRenderers = document.querySelectorAll("ytd-shelf-renderer");
  shelfRenderers.forEach((shelf) => {
    const titleElement = shelf.querySelector("span#title");
    if (titleElement && titleElement.textContent.trim() === "People also watched") {
      shelf.style.display = hide ? "none" : "";
    }
  });
}

// Hide "Latest posts"
function toggleLatestPosts(hide) {
  const shelfRenderers = document.querySelectorAll("ytd-shelf-renderer");
  shelfRenderers.forEach((shelf) => {
    const titleElement = shelf.querySelector("span#title");
    if (titleElement && titleElement.textContent.trim().startsWith("Latest posts from")) {
      shelf.style.display = hide ? "none" : "";
    }
  });
}

// Observe changes on the page
function observeMutations() {
  const observer = new MutationObserver(() => {
    Object.keys(selectorsMap).forEach((key) => {
      chrome.storage.local.get(key, (data) => {
        if (key === "hidePeopleAlsoWatched") {
          togglePeopleAlsoWatched(data[key]);
        } else {
          toggleElements(selectorsMap[key], data[key]);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.onload = function () {
  observeMutations();
};
