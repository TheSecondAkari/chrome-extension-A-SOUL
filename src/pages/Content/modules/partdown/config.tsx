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

// const defaultErrMsg =
//   '下载片段完整性受损, 请稍等数分钟再刷新页面重试\n期间可尝试前往其他页面下载视频不冲突';

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
    label: '向晚',
    primaryColor: '#8d81da',
    SecondaryColor: '#b4ade6',
    fanIcon: extensionGetURL('./public/assets/jellyfish.png'),
    QIcon: [
      {
        key: 'ava_0',
        src: extensionGetURL('./public/assets/ava_0.png'),
        style: {
          position: 'absolute',
          width: 300,
          bottom: -17,
          right: -25,
        },
      },
      {
        key: 'ava_1',
        src: extensionGetURL('./public/assets/ava_1.png'),
        style: {
          position: 'absolute',
          width: 420,
          bottom: -4,
          right: -40,
          clipPath:
            'polygon(0 0, 100% 0, 100% 100%, 44% 100%, 39% 98.5%, 29% 98.5%, 22% 100%, 0 100%)',
        },
      },
      {
        key: 'ava_2',
        src: extensionGetURL('./public/assets/ava_2.png'),
        style: {
          position: 'absolute',
          zIndex: 5,
          width: 250,
          bottom: -20,
          right: 25,
        },
      },
      {
        key: 'ava_3',
        src: extensionGetURL('./public/assets/ava_3.png'),
        style: {
          position: 'absolute',
          width: 170,
          bottom: -25,
          right: 25,
        },
      },
    ],
  },
  bella: {
    key: 'bella',
    label: '贝拉',
    primaryColor: '#DB7D74',
    SecondaryColor: '#f3a29a',
    fanIcon: extensionGetURL('./public/assets/beijixing.png'),
    QIcon: [
      {
        key: 'bella_1',
        src: extensionGetURL('./public/assets/bella_1.png'),
        style: {
          position: 'absolute',
          width: 275,
          bottom: -20,
          right: 0,
        },
      },
      {
        key: 'bella_2',
        src: extensionGetURL('./public/assets/bella_2.png'),
        style: {
          position: 'absolute',
          width: 250,
          bottom: -20,
          right: 0,
        },
      },
    ],
  },
  carol: {
    key: 'carol',
    label: '珈乐',
    primaryColor: '#8d81da',
    SecondaryColor: '#B8A6D9',
    fanIcon: extensionGetURL('./public/assets/knight.png'),
    QIcon: [
      {
        key: 'carol_1',
        src: extensionGetURL('./public/assets/carol_1.png'),
        style: {
          position: 'absolute',
          width: 225,
          bottom: -15,
          right: 15,
        },
      },
      {
        key: 'carol_2',
        src: extensionGetURL('./public/assets/carol_2.png'),
        style: {
          position: 'absolute',
          width: 220,
          bottom: 0,
          right: 20,
        },
      },
      {
        key: 'carol_3',
        src: extensionGetURL('./public/assets/carol_3.png'),
        style: {
          position: 'absolute',
          width: 215,
          bottom: 0,
          right: 0,
        },
      },
    ],
  },
  diana: {
    key: 'diana',
    label: '嘉然',
    primaryColor: '#E799B0',
    SecondaryColor: '#e4bbc7',
    fanIcon: extensionGetURL('./public/assets/jiaxintang.png'),
    QIcon: [
      {
        key: 'diana_1',
        src: extensionGetURL('./public/assets/diana_1.png'),
        style: {
          position: 'absolute',
          width: 225,
          bottom: -15,
          right: 30,
        },
      },
      {
        key: 'diana_2',
        src: extensionGetURL('./public/assets/diana_2.png'),
        style: {
          position: 'absolute',
          width: 240,
          bottom: -15,
          right: 0,
        },
      },
      {
        key: 'diana_3',
        src: extensionGetURL('./public/assets/diana_3.gif'),
        style: {
          position: 'absolute',
          width: 250,
          bottom: -20,
          right: -12,
        },
      },
      {
        key: 'diana_4',
        src: extensionGetURL('./public/assets/diana_4.png'),
        style: {
          position: 'absolute',
          width: 185,
          bottom: -15,
          right: 25,
        },
      },
    ],
  },
  eileen: {
    key: 'eileen',
    label: '乃琳',
    primaryColor: '#576690',
    SecondaryColor: '#7687b7',
    fanIcon: extensionGetURL('./public/assets/naiqilin.png'),
    QIcon: [
      {
        key: 'eileen_1',
        src: extensionGetURL('./public/assets/eileen_1.png'),
        style: {
          position: 'absolute',
          width: 320,
          bottom: -20,
          right: -20,
        },
      },
      {
        key: 'eileen_2',
        src: extensionGetURL('./public/assets/eileen_2.png'),
        style: {
          position: 'absolute',
          width: 350,
          bottom: -6,
          right: -30,
        },
      },
    ],
  },
  all: {
    key: 'all',
    label: '一起',
    primaryColor: '#cc983b',
    SecondaryColor: '#e4ac4d',
    fanIcon: extensionGetURL('./public/assets/yigehun.png'),
    QIcon: [
      {
        key: 'all_1',
        src: extensionGetURL('./public/assets/all_1.png'),
        style: {
          position: 'absolute',
          zIndex: 5,
          width: 350,
          bottom: -20,
          right: 0,
        },
      },
    ],
  },
};

const RegList = [
  {
    reg: /向\s*晚|ava|晚晚|顶晚人/i,
    value: 'ava',
  },
  {
    reg: /贝\s*拉|bella|拉姐|贝极星/i,
    value: 'bella',
  },
  {
    reg: /珈\s*乐|carol|乐乐|黄嘉祺|皇家骑士/i,
    value: 'carol',
  },
  {
    reg: /嘉\s*然|diana|然宝|然然|嘉心糖/i,
    value: 'diana',
  },
  {
    reg: /乃\s*琳|eileen|乃宝|([乃奶]淇琳)/i,
    value: 'eileen',
  },
  {
    reg: /A-?SOUL|一个魂/i,
    value: 'all',
  },
];

export function matchThemeKey(text?: string) {
  if (text) {
    const list: string[] = [];
    RegList.forEach((item) => item.reg.test(text) && list.push(item.value));
    return getRandom(list.length ? list : RegList.map((item) => item.value));
  } else return getRandom(RegList.map((item) => item.value));
}

export function matchThemeImgKey(text?: string, imgKeys?: string[]) {
  if (text && imgKeys?.length) {
    const filterRegs = RegList.filter((item) =>
      imgKeys.some((str) => str.includes(item.value))
    );
    const list: string[] = [];
    filterRegs.forEach((item) => item.reg.test(text) && list.push(item.value));
    const themeKey = getRandom(
      list.length ? list : filterRegs.map((item) => item.value)
    );
    const themeImgKey = getRandom(
      imgKeys.filter((str) => str.includes(themeKey))
    );
    return [themeKey, themeImgKey];
  } else return getRandom(RegList.map((item) => item.value));
}

export const pickTheme = (themeKey: string, themeImgKey?: string) => {
  const obj = ThemeConfig[themeKey];
  const QIcon = themeImgKey
    ? obj.QIcon.find((item: any) => item.key === themeImgKey) ||
      getRandom(obj.QIcon)
    : getRandom(obj.QIcon);
  return { ...obj, QIcon };
};
// export const themeColorMap = {
//   ava: '#9ac8e2',
//   bella: '#DB7D74',
//   carol: '#B8A6D9',
//   diana: '#E799B0',
//   eileen: '#576690',
//   acao: '#b3b4a6', // 暂定随机调的一个
//   unknow: '#ada6a7',
// };
