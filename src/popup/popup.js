// popup/popup.js

let timerInterval;

//------------------------Set Timer------------------------

document.getElementById("setTimer").addEventListener("click", async () => {
  // Check if timer is already set
  const result = await chrome.storage.local.get(["timerDuration"]);
  const duration = parseInt(result.timerDuration, 10);
  if (duration > 0) {
    return;
  }

  // Retreive info to set timer
  const hours = parseInt(document.getElementById("hours").value, 10);
  const minutes = parseInt(document.getElementById("minutes").value, 10);
  const seconds = parseInt(document.getElementById("seconds").value, 10);

  let durationSeconds = hours * 3600 + minutes * 60 + seconds;

  if (durationSeconds <= 0) {
    return;
  }

  console.log("Attempting to start timer for: ", durationSeconds);

  try {
    const response = await chrome.runtime.sendMessage({
      action: "setTimer",
      duration: durationSeconds,
    });
    console.log("Start timer status:", response.status);

    startCountdownTimer(durationSeconds);
  } catch (error) {
    console.error("Error starting timer: ", error);
  }
});

// Load timer when popup.js opens
document.addEventListener("DOMContentLoaded", async () => {
  const result = await chrome.storage.local.get(["timerStartTime", "timerDuration"]);
  const startTime = result.timerStartTime;
  const duration = parseInt(result.timerDuration, 10);

  if (startTime && duration) {
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const remainingSeconds = duration - elapsedSeconds;

    if (remainingSeconds > 0) {
      startCountdownTimer(remainingSeconds);
    } else {
      // Clear storage if the timer has already finished
      chrome.storage.local.set({ timerStartTime: null, timerDuration: 0 });
      document.getElementById("live-timer").textContent = "Timer finished.";
    }
  }
});

//------------------------Stop Timer------------------------

document.getElementById("stopTimer").addEventListener("click", async () => {
  // Send "stopTimer" action to content script
  try {
    const response = await chrome.runtime.sendMessage({
      action: "stopTimer",
    });
    console.log("Timer stopped:", response.status);

    // Stop timers
    clearInterval(timerInterval);
    chrome.storage.local.set({ timerStartTime: null, timerDuration: 0 });
    document.getElementById("live-timer").textContent = "Timer cleared.";
  } catch (error) {
    console.error("Error stopping timer:", error);
  }
});

// Count down timer
function startCountdownTimer(duration) {
  // Save current time and duration of timer
  const startTime = Date.now();
  chrome.storage.local.set({
    timerStartTime: startTime,
    timerDuration: duration,
  });

  function updateTimer() {
    if (duration <= 0) {
      clearInterval(timerInterval);
      chrome.storage.local.remove(["timerStartTime", "timerDuration"]);
      document.getElementById("live-timer").textContent = "Video Stopped";
      return;
    }

    const hrs = Math.floor(duration / 3600);
    const mins = Math.floor((duration % 3600) / 60);
    const secs = duration % 60;

    document.getElementById("live-timer").textContent = `${String(hrs).padStart(
      2,
      "0",
    )}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    chrome.storage.local.set({ timerDuration: duration });

    duration--;
  }

  // Initialize the timer immediately
  updateTimer();

  // Update the timer every second
  timerInterval = setInterval(updateTimer, 1000);
}

// "More" toggle button
function setupToggle(buttonId, contentId, arrowId) {
  document.getElementById(buttonId).addEventListener("click", function () {
    const moreContent = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);
    if (moreContent.style.display === "none") {
      moreContent.style.display = "block";
      arrow.innerHTML = "&#x25BC;"; // Downward arrow
    } else {
      moreContent.style.display = "none";
      arrow.innerHTML = "&#x25B6;"; // Right arrow
    }
  });
}
setupToggle("moreToggle1", "moreContent1", "arrow1");

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
