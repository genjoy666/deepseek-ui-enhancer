chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      enabled: true,
      autoPrompt: true,
    });
  }
  // 每次安装或更新都清掉旧提示词，让 content.js 用最新的 DEFAULT_PROMPT
  chrome.storage.local.remove('promptText');
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get({ enabled: true, autoPrompt: true }, function(result) {
      sendResponse(result);
    });
    return true;
  }
});
