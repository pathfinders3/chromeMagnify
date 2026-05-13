chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "toggle-magnify") {
    return;
  }

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab?.id) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(activeTab.id, { type: "TOGGLE_MAGNIFY" });
  } catch (error) {
    if (!String(error?.message || "").includes("Receiving end does not exist")) {
      console.error(error);
    }
  }
});
