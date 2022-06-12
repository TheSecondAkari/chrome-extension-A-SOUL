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
    ChromeExtensionVersion === 3 ? chrome.runtime.getURL : (chrome.runtime.getURL || chrome.extension.getURL);
export const icon_jellyfish = extensionGetURL('./public/水母.png');
export const q_img_ava = extensionGetURL('./public/ava.png');

const ErrMsgs = [
    {
        match: /SharedArrayBuffer is not defined/,
        msg: '视频编码器处理数据失败，请 稍等片刻(数分钟后)再刷新重试 或 尝试下载其他视频 或 切换chrome浏览器尝试'
    },
]
const defaultErrMsg =
    '下载片段完整性受损, 请稍等5-15分钟左右再刷新页面重试(原因：可能视频接口不稳定）\n期间可尝试前往其他页面下载视频不冲突';

export const judgeErrMsg = (originMsg: string) => {
    return ErrMsgs.find(item => item.match.test(originMsg || ''))?.msg || defaultErrMsg
}
