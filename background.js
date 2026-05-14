chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "CAPTURE_TAB") {
    return;
  }

  chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
    sendResponse({ dataUrl: dataUrl ?? null });
  });

  return true; // 비동기 응답을 위해 채널 유지
});
