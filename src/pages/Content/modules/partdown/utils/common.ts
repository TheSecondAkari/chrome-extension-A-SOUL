export function downFileToLocal(fileName: string, blob: Blob) {
    // 创建用于下载文件的a标签
    const d = document.createElement('a')
    // 设置下载内容
    d.href = window.URL.createObjectURL(blob)
    // 设置下载文件的名字
    d.download = fileName
    // 界面上隐藏该按钮
    d.style.display = 'none'
    // 放到页面上
    document.body.appendChild(d)
    // 点击下载文件
    d.click()
    // 从页面移除掉
    document.body.removeChild(d)
    // 释放 URL.createObjectURL() 创建的 URL 对象
    window.URL.revokeObjectURL(d.href)
}

const fill0 = (str: string | number) => {
    const temp = `${str}`;
    return temp.length === 1 ? '0' + temp : temp;
};

export const formatTime = (rangeOne: number, needHour?: boolean) => {
    const seconds = rangeOne / 1000;
    const minutes = Math.floor(seconds / 60);
    const hour = Math.floor(minutes / 60);
    return (
        (hour || needHour ? `${fill0(hour)}:` : '') +
        fill0(minutes % 60) +
        ':' +
        fill0((seconds % 60).toFixed(0))
    );
};

// 获取url中全部参数的对象
export function getUrlAllParams() {
    // 解决乱码问题
    const url = decodeURI(window.location.href);
    const res: any = {};
    const url_data = url.split('?').length > 1 ? url.split('?')[1] : null;
    if (!url_data) return {};
    const params_arr = url_data.split('&');
    params_arr.forEach(function (item) {
        const [key, value] = item.split('=');
        res[key] = value;
    });
    return res;
}

// 获取数组中随机一个
export function getRandom(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}