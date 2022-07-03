import { useEffect, useState } from 'react';
import { Tooltip, Message, Switch } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { getAsoulImgsNum } from '../../utils';
import './index.css';

const ConfigForm = (props: { type: 'popup' | 'options' }) => {
  const { type } = props;
  const [enableDownload, setEnableDownload] = useState(false);
  const [enableCOIsolation, setEnableCOIsolation] = useState(false);
  const [pic, setPic] = useState('');

  const randomPic = async () => {
    const [{ img }] = await getAsoulImgsNum();
    img && setPic(img);
  };

  useEffect(() => {
    randomPic();
    chrome.storage.sync.get(
      ['enableDownload', 'enableCOIsolation'],
      function (result) {
        setEnableDownload(
          result.enableDownload !== undefined ? result.enableDownload : true
        );
        setEnableCOIsolation(
          result.enableCOIsolation !== undefined
            ? result.enableCOIsolation
            : false
        );
      }
    );
  }, []);

  return (
    <div className="wrapper">
      <div
        className={'bg'}
        style={{
          background: `url('${pic}')`,
          opacity: 0.15,
        }}
      />
      <div style={{ display: 'flex' }}>
        <div>启动视频下载功能</div>

        <Switch
          checked={enableDownload}
          style={{ marginLeft: 8 }}
          onChange={(value) => {
            chrome.storage.sync.set({ enableDownload: value }, function () {
              setEnableDownload(value);
            });
          }}
        />
      </div>
      <div style={{ marginTop: 24, display: 'flex', alignItems: 'center' }}>
        <div>强制启动截取支持</div>
        <Tooltip content="实验性功能，若非必要，不建议开启。该功能有概率会对b站视频页面的浏览造成一定的影响，若出现过度卡顿、资源加载失效时，请关闭该功能。不需要用到视频截取下载时，也请关闭">
          <IconQuestionCircle
            style={{ color: 'red', strokeWidth: 5, marginLeft: 4 }}
          />
        </Tooltip>
        <Switch
          style={{ marginLeft: 8 }}
          checked={enableCOIsolation}
          onChange={(value) => {
            chrome.runtime.sendMessage(
              { type: 'enableCOIsolation', data: value },
              (success: boolean) => {
                if (success) {
                  setEnableCOIsolation(value);
                  chrome.storage.sync.set({ enableCOIsolation: value });
                } else {
                  Message.error('操作失败');
                }
              }
            );
          }}
        />
      </div>
      <div style={{ fontSize: '12px', fontWeight: 500, marginTop: 8 }}>
        强制启动截取支持改动操作，旧页面需要刷新才能生效
      </div>
    </div>
  );
};

export default ConfigForm;
