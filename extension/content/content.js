function getVideoInfo() {
  const title = document.title
    .replace(" - YouTube", "")
    .trim();

  return {
    title,
    url: window.location.href
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_VIDEO_INFO") {
    sendResponse({
      success: true,
      video: getVideoInfo()
    });
  }
});