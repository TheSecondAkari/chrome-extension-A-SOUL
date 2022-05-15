import React, { useEffect } from 'react';
import { getRandom } from '../../utils';
import { 彩蛋 } from '../../utils/config';
import './index.css';

const Surprise = (props: any) => {
  const judge = () => {
    if (window.location.href.startsWith('https://www.bilibili.com/video')) {
      return /勇敢牛牛|牛牛民｜牛武器/.test(document.body.innerText);
    }
    return false;
  };

  useEffect(() => {
    if (judge()) {
      const container = document.getElementById(
        'extend-asoul-caidan'
      ) as HTMLElement;
      /// 屏幕宽度
      const dWidth = document.body.scrollWidth;
      const dHeight = window.innerHeight;
      container.style.height = dHeight as any;
      const production = () => {
        const t1 = document.createElement('img');
        /// left 和 top 最大值
        /// left 减掉 100 是为了不产生横行的滑动条
        const t1Left = Math.floor(Math.random() * dWidth) - 100;
        const t1Top = Math.floor(Math.random() * 10);

        // 雪花
        // t1.innerText = '❉';
        // t1.style.color = 'white';
        t1.style.left = t1Left + 'px';
        t1.style.top = t1Top + 'px';
        t1.style.display = 'inline-block';
        const { src, to } = getRandom(彩蛋);
        const 折迁门 = getRandom(to);
        t1.src = src;
        // 设置宽高
        t1.style.width = getRandom([25, 30, 35, 40, 45, 50, 52]) + 'px';
        t1.onclick = () => {
          window.open(折迁门);
        };

        t1.classList.add('xue');
        container.appendChild(t1);

        setTimeout(function () {
          t1?.remove();
        }, 5000);
      };

      const 牛牛 = setInterval(function () {
        production();
      }, 150);

      return () => clearInterval(牛牛);
    }
  }, []);

  return <div id="extend-asoul-caidan"></div>;
};

export default Surprise;
