import { pickTriggerConfig } from './getConfig';

// 获取当前激活 tab
async function getActivedTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function sendRenderToActiveTab() {
  const tab = await getActivedTab();
  if (tab?.id) {
    pickTriggerConfig((config) => {
      chrome.tabs.sendMessage(tab.id as number, {
        type: 'render',
        data: config,
      });
    });
  }
}

// 监听来自content-script ｜ popup 的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === 'force_need_render') {
    sendRenderToActiveTab();
  }
  if (request.type === 'need_render') {
    chrome.storage.sync.get(['enableTips'], function (result) {
      if (result.enableTips === undefined || result.enableTips)
        sendRenderToActiveTab();
    });
  }
  sendResponse();
});
