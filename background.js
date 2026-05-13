chrome.commands.onCommand.addListener((command) => {
  if (command !== "toggle-magnify") {
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab?.id) {
      return;
    }

    chrome.tabs.sendMessage(activeTab.id, { type: "TOGGLE_MAGNIFY" });
  });
});
