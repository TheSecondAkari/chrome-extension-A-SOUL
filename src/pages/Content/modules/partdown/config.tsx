import { Tooltip } from '@arco-design/web-react';
import { getRandom } from './utils/common';

export const spaceBetweenStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const ChromeExtensionVersion = Number(
  process.env.ChromeExtensionVersion || '3'
); // 若没设置，默认使用 3 版本

export const extensionGetURL =
  ChromeExtensionVersion === 3
    ? chrome.runtime.getURL
    : chrome.runtime.getURL || chrome.extension.getURL;
export const icon_jellyfish = extensionGetURL('./public/assets/jellyfish.png');
export const q_img_ava = extensionGetURL('./public/assets/ava.png');

const ErrMsgs: { match: RegExp; msg: string }[] = [
  //   {
  //     match: /SharedArrayBuffer is not defined/,
  //     msg: '视频编码器处理数据失败，请 稍等片刻(数分钟后)再刷新重试 或 尝试下载其他视频 或 切换chrome浏览器尝试',
  //   },
];

const defaultErrMsg =
  '下载片段完整性受损, 请稍等数分钟再刷新页面重试\n期间可尝试前往其他页面下载视频不冲突';

export const judgeErrMsg = (originMsg: string) => {
  return (
    ErrMsgs.find((item) => item.match.test(originMsg || ''))?.msg || originMsg
  );
};

export const ReloadTrigger = (
  <Tooltip
    content={
      '点击有概率解决问题(若多次尝试仍失败，可尝试在选项配置开启“强制支持截取”，并刷新页面重试)'
    }
  >
    <span
      onClick={() => {
        try {
          chrome.runtime.sendMessage({ type: 'reload' }, (res) => {
            res === 'reload-done' &&
              setTimeout(() => window.location.reload(), 612);
          });
        } catch (e: any) {
          if (/Extension context invalidated/.test(e?.toString?.() || `${e}`)) {
            window.location.reload();
          }
        }
      }}
      className="text-button"
      style={{ marginLeft: 6 }}
    >
      重新加载插件
    </span>
  </Tooltip>
);

export const ThemeConfig = {
  ava: {
    key: 'ava',
    primaryColor: '#8d81da',
    SecondaryColor: '#b4ade6',
    fanIcon: extensionGetURL('./public/assets/jellyfish.png'),
    QIcon: [
      {
        src: extensionGetURL('./public/assets/ava.png'),
        style: {
          position: 'absolute',
          width: 300,
          bottom: -17,
          right: -25,
        },
      },
    ],
  },
  bella: {
    key: 'bella',
    primaryColor: '#DB7D74',
    SecondaryColor: '#f3a29a',
    fanIcon: extensionGetURL('./public/assets/beijixing.png'),
    QIcon: [
      {
        src: extensionGetURL('./public/assets/bella_q1.png'),
        style: {
          position: 'absolute',
          width: 275,
          bottom: -20,
          right: 0,
        },
      },
      {
        src: extensionGetURL('./public/assets/bella_q2.png'),
        style: {
          position: 'absolute',
          width: 250,
          bottom: -20,
          right: 0,
        },
      },
    ],
  },
};

const RegList = [
  {
    reg: /向晚|晚晚/,
    value: 'ava',
  },
  {
    reg: /贝拉|拉姐/,
    value: 'bella',
  },
];

export function matchThemeKey(text?: string) {
  if (text) {
    const list: string[] = [];
    RegList.forEach((item) => item.reg.test(text) && list.push(item.value));
    return getRandom(list.length ? list : RegList.map((item) => item.value));
  } else return getRandom(RegList.map((item) => item.value));
}

// export const themeColorMap = {
//   ava: '#9ac8e2',
//   bella: '#DB7D74',
//   carol: '#B8A6D9',
//   diana: '#E799B0',
//   eileen: '#576690',
//   acao: '#b3b4a6', // 暂定随机调的一个
//   unknow: '#ada6a7',
// };
