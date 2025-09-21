// popup/popup.js

//------------------------Hide Search Elements------------------------

document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", (event) => {
    const action = event.target.id;
    const checked = event.target.checked;

    chrome.storage.local.set({ [action]: checked });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action, checked }, (response) => {
        console.log(response.status);
      });
    });
  });
});

// Load stored states on popup load
document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = [
    "hideShorts",
    "hidePeopleAlsoWatched",
    "hideLatestPosts",
    "hidePlaylists",
    "hideLiveVids",
  ];
  checkboxes.forEach((id) => {
    chrome.storage.local.get(id, (data) => {
      document.getElementById(id).checked = data[id] || false;
    });
  });
});
