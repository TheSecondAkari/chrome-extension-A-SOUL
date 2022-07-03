const { watchStart, watchStop } = require('./bilibiliRequestV3');

// 监听来自content-script ｜ popup 的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'reload') {
        // 插件重新加载
        chrome.runtime.reload();
        sendResponse('reload-done');
    } else if (request.type === 'enableCOIsolation') {
        try {
            if (request.data) watchStart(sendResponse(true));
            else watchStop(sendResponse(true));
        } catch (e) {
            sendResponse(false);
        }
    } else sendResponse();
});

function Start() {
    chrome.storage.sync.get(['enableCOIsolation'], function (result) {
        result.enableCOIsolation && watchStart();
    });
}

Start();
