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

