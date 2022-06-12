// 监听来自content-script ｜ popup 的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === 'reload') {
        chrome.runtime.reload();
        sendResponse('reload-done');
    }
    else
        sendResponse();
});