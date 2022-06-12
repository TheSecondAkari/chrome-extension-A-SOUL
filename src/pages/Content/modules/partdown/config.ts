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

export const defaultErrMsg =
    '下载片段完整性受损, 请稍等10-15分钟左右再刷新页面重试(原因：可能视频接口不稳定）\n期间可尝试前往其他页面下载视频不冲突';
