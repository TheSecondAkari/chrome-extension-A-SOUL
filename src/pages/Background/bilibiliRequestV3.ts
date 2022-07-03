const bilibiliReqRules: chrome.declarativeNetRequest.Rule[] = [
  {
    id: 1,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'Cross-Origin-Opener-Policy',
          operation: 'set',
          value: 'same-origin',
        },
        {
          header: 'Cross-Origin-Embedder-Policy',
          operation: 'set',
          value: 'require-corp',
        },
      ],
    },
    condition: {
      urlFilter: 'www.bilibili.com/video',
      resourceTypes: ['main_frame'],
    },
  },
  {
    id: 2,
    priority: 2,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'Cross-Origin-Embedder-Policy',
          operation: 'set',
          value: 'require-corp',
        },
      ],
    },
    condition: {
      regexFilter: 'hdslb.com|www.bilibili.com/correspond',
      resourceTypes: ['sub_frame'],
    },
  },
  {
    id: 3,
    priority: 3,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'Cross-Origin-Resource-Policy',
          operation: 'set',
          value: 'cross-origin',
        },
      ],
    },
    condition: {
      urlFilter: 'hdslb.com',
      resourceTypes: ['image', 'script'],
    },
  },
  {
    id: 4,
    priority: 3,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'Cross-Origin-Resource-Policy',
          operation: 'set',
          value: 'cross-origin',
        },
      ],
    },
    condition: {
      urlFilter: 'data.bilibili.com',
      resourceTypes: ['ping'],
    },
  },
  {
    id: 5,
    priority: 3,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          header: 'Cross-Origin-Embedder-Policy',
          operation: 'set',
          value: 'require-corp',
        },
        {
          header: 'Cross-Origin-Resource-Policy',
          operation: 'set',
          value: 'cross-origin',
        },
      ],
    },
    condition: {
      urlFilter: 'message.bilibili.com/pages',
      resourceTypes: ['sub_frame'],
    },
  }
] as any;

export const watchStart = (callback: () => void) => {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      addRules: bilibiliReqRules,
      removeRuleIds: bilibiliReqRules.map((item) => item.id),
    },
    callback,
  );
};

export const watchStop = (callback: () => void) => {
  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: bilibiliReqRules.map((item) => item.id),
    },
    callback,
  );
};
