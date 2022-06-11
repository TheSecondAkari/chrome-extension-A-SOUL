/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import InjectComponent from './injectComponent';
import './index.css';

// 获取url中全部参数的对象
function getUrlAllParams() {
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

const InjectApp = () => {
  const [pageList, setPageList] = useState<any[]>([]);
  const [pNum, setPNum] = useState(0);
  const [stream, setStream] = useState<any>({});
  const [pageUrl, setPageUrl] = useState(location.href);
  const videoTitle = (document.getElementsByClassName('tit')?.[0] as any)
    ?.innerText;

  useEffect(() => {
    setStream({});
    handle();

    const timer = setInterval(() => {
      if (pageUrl !== location.href) setPageUrl(location.href);
    }, 1000);

    return () => clearInterval(timer);
  }, [pageUrl]);

  const handle = async () => {
    if (window.location.href.startsWith('https://www.bilibili.com/video')) {
      const aid_or_bvid = window.location.pathname.split('/')[2];
      const p = Number(getUrlAllParams()?.p || 0);
      setPNum(p);
      const list = await getPageList(aid_or_bvid);
      const { cid } = list[p > 0 ? p - 1 : p];
      const streamInfo = await getVideoStream(aid_or_bvid, cid);
      streamInfo?.durl?.forEach((item: any) =>
        item.url.replace('http://', 'https://')
      );
      setStream(streamInfo);
    }
  };

  const getPageList = async (videoId: string) => {
    const params = videoId.startsWith('av') // 判断是aid 还是 bvid
      ? `aid=${videoId.slice(2)}`
      : `bvid=${videoId}`;
    const api_url = `https://api.bilibili.com/x/player/pagelist?${params}`;
    const re = await fetch(api_url, { credentials: 'include' });
    const apiJson = await re.json();
    setPageList(apiJson.data);
    return apiJson.data;
  };

  const getVideoStream = async (videoId: string, cid: string) => {
    const apiPath = '/x/player/playurl';
    const qn = '120';
    const params = videoId.startsWith('av') // 判断是aid 还是 bvid
      ? `avid=${videoId.slice(2)}`
      : `bvid=${videoId}`;
    const api_url = `https://api.bilibili.com${apiPath}?${params}&cid=${cid}&otype=json&fourk=1&qn=${qn}`;

    const re = await fetch(api_url, { credentials: 'include' });
    const apiJson = await re.json();
    return apiJson.data || apiJson.result;
  };

  return (
    <div>
      {/flv/.test(stream?.format || '') && stream?.durl?.[0]?.url ? (
        <InjectComponent
          videoTitle={videoTitle}
          streamUrl={stream.durl[0].url}
          duration={stream.timelength}
        />
      ) : null}
    </div>
  );
};

const inject = () => {
  chrome.storage.sync.get(['enableDownload'], function (result) {
    if (result.enableDownload === undefined || result.enableDownload) {
      const injectDOM = document.createElement('div');
      injectDOM.id = 'handle-video-download';
      document.body.appendChild(injectDOM);
      render(<InjectApp />, injectDOM);
    }
  });
};

inject();
