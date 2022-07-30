// ! 不建议使用chrome 插件 v2版本， 这里的 requset 监听范围没有收敛

// 监听的回调
const callback = function (
  details: chrome.webRequest.WebResponseHeadersDetails
) {
  const headers = details.responseHeaders;
  // console.log(
  //   details.url === 'https://message.bilibili.com/pages/nav/header_sync'
  // );
  if (headers) {
    if (
      details.method === 'GET' &&
      /^https?:\/\/www\.bilibili\.com\/video\/.*/.test(details.url)
    ) {
      const newHeaders = headers.filter(
        (item) =>
          item.name !== 'Cross-Origin-Opener-Policy' &&
          item.name !== 'Cross-Origin-Embedder-Policy'
      );
      newHeaders.push({
        name: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      });
      newHeaders.push({
        name: 'Cross-Origin-Embedder-Policy',
        value: 'require-corp',
      });
      return { responseHeaders: newHeaders };
    } else if (
      details.method === 'GET' &&
      (/iframe\.html$/.test(details.url) ||
        /^https?:\/\/www\.bilibili\.com\/correspond\/.*/.test(details.url))
    ) {
      const newHeaders = headers.filter(
        (item) => item.name !== 'Cross-Origin-Embedder-Policy'
      );
      newHeaders.push({
        name: 'Cross-Origin-Embedder-Policy',
        value: 'require-corp',
      });
      return { responseHeaders: newHeaders };
    } else {
      const newHeaders = headers.filter(
        (item) => item.name !== 'Cross-Origin-Resource-Policy'
      );
      newHeaders.push({
        name: 'Cross-Origin-Resource-Policy',
        value: 'cross-origin',
      });
      return { responseHeaders: newHeaders };
    }
  }
};

// 监听哪些内容
const filter = {
  urls: ['*://*.bilibili.com/*', '*://*.hdslb.com/*'],
};

// 额外的信息规范，可选的
const extraInfoSpec = ['blocking', 'responseHeaders'];

let listener: any;

export const watchStart = () => {
  if (!chrome.webRequest.onHeadersReceived.hasListener(listener)) {
    listener = chrome.webRequest.onHeadersReceived.addListener(
      callback,
      filter,
      extraInfoSpec
    );
  }
};

export const watchStop = () => {
  chrome.webRequest.onHeadersReceived.removeListener(listener);
};
