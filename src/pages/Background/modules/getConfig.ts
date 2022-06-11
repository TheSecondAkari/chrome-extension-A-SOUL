// 都是服务于tips的旧逻辑，不需要了
import { initiConfig } from '../../../utils/config';

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

const listRandom = (list: any[]) => {
  return list[Math.floor(Math.random() * list.length)];
};

const matchFilesFromStr = (text: string) => {
  const content = text.replace(/<!DOCTYPE html>[\S\s]*<\/html>/g, '');
  const rows = content.match(/<script>addRow.*<\/script>/g) || [];
  const dirList = rows.map((row) =>
    row
      .replace(/<script>addRow|"|<\/script>|\(|\)/g, '')
      .split(',')
      .slice(1, 3)
  );
  return dirList;
};

const findImgs = (dirList: string[][]) => {
  return dirList
    .filter(([name, type]) => {
      return type === '0' && /\.(a?png|jpg|webp|gif)/i.test(name);
    })
    .map((i) => i[0]);
};

const identify = (str: string) => {
  const nameMap: any = {
    阿草: 'acao',
    啊草: 'acao',
    向晚: 'ava',
    贝拉: 'bella',
    珈乐: 'carol',
    嘉然: 'diana',
    乃琳: 'eileen',
  };
  const nameMatch =
    str.match(
      /acao|ava|bella|carol|diana|eileen|阿草|啊草|向晚|贝拉|珈乐|嘉然|乃琳/
    )?.[0] || 'unknow';
  return nameMap[nameMatch] || nameMatch;
};

// 找到对应的人物动画 加 文案
export const pickTriggerConfig = async (callback: (config: any) => void) => {
  chrome.storage.sync.get(['config'], function (result) {
    const { talk, talkContent, more, pickEle, basePath, width, character } = {
      ...initiConfig,
      ...result.config,
    } as any;

    if (more) {
      const dirKey: string = listRandom(character);

      fetch(`file:///${basePath}/public/${dirKey}`)
        .then((res) => res.text())
        .then((str) => {
          const dirList = matchFilesFromStr(str);
          const imgFile = listRandom(shuffle(findImgs(dirList)));
          const characterKey =
            dirKey === 'custom'
              ? identify(decodeURIComponent(imgFile))
              : dirKey;
          const textList = [
            ...(talkContent.common || []),
            ...(talkContent[characterKey] || []),
          ].filter(i => /\S/.test(i));
          callback({
            img: chrome.runtime.getURL(`./public/${dirKey}/${imgFile}`),
            text: talk ? listRandom(shuffle(textList)) : undefined,
            pickEle,
            width,
            character: characterKey,
          });
        });
    } else {
      const characterKey: string = listRandom(
        character.filter((i: string) => i !== 'custom')
      );
      const textList = [...(talkContent.common || []), ...talkContent[characterKey]].filter(i => /\S/.test(i));
      callback({
        img: chrome.runtime.getURL(
          `./public/${characterKey}/${characterKey}.png`
        ),
        text: talk ? listRandom(shuffle(textList)) : undefined,
        pickEle,
        width,
        character: characterKey,
      });
    }
  });
};
