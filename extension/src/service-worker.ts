chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'OPEN_PANEL') {
    await chrome.sidePanel.open({tabId: sender.tab!.id!});
  }
})