// 随机排序
const shuffle = function (list: any[]) {
  const input = list;
  for (let i = input.length - 1; i >= 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const itemAtIndex = input[randomIndex];
    input[randomIndex] = input[i];
    input[i] = itemAtIndex;
  }
  return input;
};

// 是否可见
const isVisible = (ele: HTMLElement) => {
  const { display, visibility, opacity } = window.getComputedStyle(ele);
  return display !== 'none' && visibility !== 'hidden' && opacity !== '0';
};

export const findAllTextNode = () => {
  const list: any = [];
  const deep = (ele: any) => {
    if (ele && !['NOSCRIPT', 'SCRIPT', 'STYLE'].includes(ele.tagName)) {
      // 可视元素
      if (isVisible(ele)) {
        if (/\S/.test(ele.innerText) && ele.innerText?.length <= 150) {
          list.push(ele);
        } else {
          [...ele.children].forEach((i) => deep(i));
        }
      }
    }
  };
  deep(document.body);
  return list;
};

// 图片应该添加筛选，大小要有要求
export const findAllImg = () => {
  const eles = document.getElementsByTagName('img');
  const list = Array.from(eles).filter((i) => {
    const { width, height, display, visibility, opacity } = window.getComputedStyle(i);
    if (
      display !== 'none' &&
      visibility !== 'hidden' &&
      opacity !== '0' &&
      Number(width.replace('px', '')) > 64 &&
      Number(height.replace('px', '')) > 64
    )
      return true;
    return false;
  });
  return list;
};

export const findAllVideo = () => {
  const eles = document.getElementsByTagName('video');
  const list = Array.from(eles).filter((i) => isVisible(i));
  return list;
};

const pickOne = (eles: any[]) => {
  const one = eles[Math.floor(Math.random() * eles.length)] as HTMLElement;
  const temp = Math.random();
  const target =
    (temp < 0.5
      ? one
      : temp < 0.8
        ? one.parentElement
        : one.parentElement?.parentElement) || one;
  if (target.tagName !== 'HTML' && target.tagName !== 'BODY') {
    const { width, height } = window.getComputedStyle(target);
    if (
      Number(width.replace('px', '')) > 0 &&
      Number(height.replace('px', '')) > 0
    )
      return target;
  }
  return undefined;
};

export const findRandomElement = (
  img?: boolean,
  video?: boolean
): HTMLElement | undefined => {
  const list = [];
  list.push(...findAllTextNode());
  img && list.push(...findAllImg());
  video && list.push(...findAllVideo());
  shuffle(list);
  let target = pickOne(list);
  let i = 0;
  while (!target && i < 10) {
    target = pickOne(list);
    i++;
  }
  return target;
};


