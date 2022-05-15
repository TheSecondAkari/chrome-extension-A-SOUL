import React, { useEffect } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import ifvisible from 'ifvisible';
import { findRandomElement } from './dom';
import { themeColorMap } from '../../../../utils/config';
import Surprise from '../../../../components/Surprise';

const InjectApp = (props: {
  target?: HTMLElement;
  img: string;
  character: string;
  text?: string;
  width?: number;
}) => {
  const { target, img, text, width = 400, character } = props;

  useEffect(() => {
    if (target) {
      // 判断是否需要调整宽高
      let modify = false;
      const { width: styleWidth, height: styleHeight } = target.style;
      const { width, height } = window.getComputedStyle(target);
      if (width !== styleWidth || height !== styleHeight) {
        modify = true;
        target.style.width = width;
        target.style.height = height;
      }
      // 进行替换
      const tempDiv = document.createElement('div');
      target.replaceWith(tempDiv);
      const container = document.getElementsByClassName('target-ele')[0];
      container.appendChild(target);

      // 恢复
      return () => {
        if (modify) {
          target.style.width = styleWidth;
          target.style.height = styleHeight;
        }
        tempDiv.replaceWith(target);
      };
    }
  }, []);

  const remove = () => {
    const ele = document.getElementsByClassName('inject-extend-asoul-tips')[0];
    unmountComponentAtNode(ele);
    ele?.remove?.();
  };

  return (
    <div className="extend-asoul-animation">
      <Surprise />
      {target ? (
        <div
          className="target-ele"
          style={{
            right: width + 20,
            maxWidth: `calc(100vw - ${width + 80}px)`,
          }}
        ></div>
      ) : undefined}
      {text ? (
        <>
          <div
            className="extend-asoul-animation-text"
            style={{ background: (themeColorMap as any)[character] }}
            onClick={() => remove()}
          >
            {text}
          </div>
        </>
      ) : null}
      <img
        src={img}
        className="extend-asoul-animation-img"
        alt="asoul-character"
        onClick={() => {
          text || remove();
        }}
      />
    </div>
  );
};

const showAsoul = (config: {
  img: string;
  pickEle: boolean;
  text?: string;
  width?: number;
  character: string;
}) => {
  const ele = document.getElementsByClassName('inject-extend-asoul-tips')?.[0];
  if (!ele) {
    const { img, text, width = 400, pickEle = true, character } = config;
    const target = pickEle ? findRandomElement(true, true) : undefined;
    const injectDOM = document.createElement('div');
    injectDOM.className = 'inject-extend-asoul-tips';
    document.body.appendChild(injectDOM);
    injectDOM.style.cssText = `width:${width}px;height:${width}px`;
    render(
      <InjectApp
        character={character}
        target={target}
        img={img}
        text={text}
        width={width}
      />,
      injectDOM
    );
  }
};

ifvisible.idle(() => {
  ifvisible.now('idle') && chrome.runtime.sendMessage({ type: 'need_render' });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { type, data } = request;
  switch (type) {
    case 'render':
      showAsoul(data || {});
      break;
    case 'config':
      ifvisible.setIdleDuration(data.triggerTime);
      break;
    default:
      break;
  }
  sendResponse();
});
