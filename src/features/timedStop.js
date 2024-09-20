function setTimedStop(duration) {
  // Error checking
  if (typeof duration !== "number" || isNaN(duration) || duration <= 0) {
    console.error("Invalid duration input");
    return;
  }

  const video = document.querySelector("video");

  // Pause video after duration expires
  if (video) {
    setTimeout(() => {
      video.pause();
    }, duration * 1000);
  } else {
    console.error("No video element found.");
  }
}

export default setTimedStop;
