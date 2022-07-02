import axios from 'axios';

// 获取数组中随机一个
export const getRandom = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];

// 获取数组中随机几个
export const getRandomArray = (arr: any[], num: number) => {
  const sData = arr.slice(0);
  let i = arr.length;
  const min = i - num;
  let item;
  let index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    item = sData[index];
    sData[index] = sData[i];
    sData[i] = item;
  }
  return sData.slice(min);
};

const typeList = [1, 2, 3, 4, 1, 2, 4, 1, 4]; // sort 参数的随机  1是浏览量，2是分享数，3是新发布，4是热门
const pageList = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

// 随机取整页内容
export const getAsoulImgs = async (): Promise<
  { author: string; img: string }[]
> => {
  const { data } = await axios.get(
    `https://api.asoul.cloud:8000/getPic?page=${getRandom(
      pageList
    )}&tag_id=0&sort=${getRandom(typeList)}&part=0&rank=0&ctime=0&type=1`
  );
  return (data || []).map((item: any) => ({
    author: item.name || 'none',
    img: getRandom(item.pic_url).img_src,
  }));
};

// 随机取某些个数量图，不能超过一页20个
export const getAsoulImgsNum = async (
  num = 1
): Promise<{ author: string; img: string }[]> => {
  const imgs = await getAsoulImgs();
  return getRandomArray(imgs, num > 20 ? 20 : num);
};