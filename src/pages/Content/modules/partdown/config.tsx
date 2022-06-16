import { Tooltip } from '@arco-design/web-react';

export const spaceBetweenStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const primaryColor = '#b4ade6';

export const ChromeExtensionVersion = Number(
  process.env.ChromeExtensionVersion || '3'
); // 若没设置，默认使用 3 版本

export const extensionGetURL =
  ChromeExtensionVersion === 3
    ? chrome.runtime.getURL
    : chrome.runtime.getURL || chrome.extension.getURL;
export const icon_jellyfish = extensionGetURL('./public/jellyfish.png');
export const q_img_ava = extensionGetURL('./public/ava.png');

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
    ErrMsgs.find((item) => item.match.test(originMsg || ''))?.msg ||
    defaultErrMsg
  );
};

export const ReloadTrigger = (
  <Tooltip content={'点击有概率解决问题(若多次尝试仍失败，可稍等数分钟再重试)'}>
    <span
      onClick={() => {
        chrome.runtime.sendMessage({ type: 'reload' }, (res) => {
          res === 'reload-done' &&
            setTimeout(() => window.location.reload(), 612);
        });
      }}
      className="text-button"
      style={{ marginLeft: 6 }}
    >
      重新加载插件
    </span>
  </Tooltip>
);
