// content_script.js

let observer = null;

const selectorsMap = {
  hideShorts: "ytd-reel-shelf-renderer",
  hidePeopleAlsoWatched: "ytd-shelf-renderer",
  hideLatestPosts: "ytd-shelf-renderer",
  hidePlaylists: "ytd-playlist-renderer",
  hideLiveVids: "ytd-video-renderer",
  hideExploreMore: "ytd-shelf-renderer",
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const selector = selectorsMap[message.action];
  if (message.action === "hidePeopleAlsoWatched") {
    togglePeopleAlsoWatched(message.checked);
    sendResponse({ status: `Toggled ${message.action}` });
  } else if (message.action === "hideExploreMore") {
    toggleExploreMore(message.checked);
    sendResponse({ status: `Toggled ${message.action}` });
  } else if (message.action === "hideLatestPosts") {
    toggleLatestPosts(message.checked);
    sendResponse({ status: `Toggled ${message.action}` });
  } else if (message.action === "hideShorts") {
    toggleElements(selector, message.checked); // Hides ytd-reel-shelf-renderer
    toggleGridShorts(message.checked); // Hides grid style shorts
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

// Hide the grid-style "Shorts" section HERE
function toggleGridShorts(hide) {
  const gridSections = document.querySelectorAll(
    ".ytGridShelfViewModelHost.ytd-item-section-renderer"
  );
  gridSections.forEach((section) => {
    const titleElement = section.querySelector(".yt-core-attributed-string");
    if (titleElement && titleElement.textContent.trim().includes("Shorts")) {
      section.style.display = hide ? "none" : "";
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

// Hide "Explore more"
function toggleExploreMore(hide) {
  const shelfRenderers = document.querySelectorAll(
    "ytd-shelf-renderer.style-scope.ytd-item-section-renderer"
  );
  shelfRenderers.forEach((shelf) => {
    const titleElement = shelf.querySelector("span#title, .yt-core-attributed-string");
    if (titleElement && titleElement.textContent.trim().includes("Explore more")) {
      shelf.style.display = hide ? "none" : "";
    }
  });
}

// Observe changes on the page
function observeMutations() {
  const observer = new MutationObserver(() => {
    // Re-apply all hiding preferences when the page content changes
    Object.keys(selectorsMap).forEach((key) => {
      chrome.storage.local.get(key, (data) => {
        const shouldHide = data[key];
        if (key === "hidePeopleAlsoWatched") {
          togglePeopleAlsoWatched(shouldHide);
        } else if (key === "hideLatestPosts") {
          toggleLatestPosts(shouldHide);
        } else if (key === "hideExploreMore") {
          toggleExploreMore(shouldHide);
        } else if (key === "hideShorts") {
          // Must check for both types of Shorts on mutation
          toggleElements(selectorsMap[key], shouldHide);
          toggleGridShorts(shouldHide);
        } else {
          toggleElements(selectorsMap[key], shouldHide);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

window.onload = function () {
  observeMutations();
};
