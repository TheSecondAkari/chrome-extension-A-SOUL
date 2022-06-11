import { useEffect, useState } from 'react';
import { Tooltip, Message, Switch } from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { getAsoulImgsNum } from '../../utils';
import './index.css';

const ConfigForm = (props: { type: 'popup' | 'options' }) => {
  const { type } = props;
  const [enableDownload, setEnableDownload] = useState(false);
  const [pic, setPic] = useState('');

  const randomPic = async () => {
    const [{ img }] = await getAsoulImgsNum();
    img && setPic(img);
  };

  useEffect(() => {
    randomPic();
    chrome.storage.sync.get(['enableDownload'], function (result) {
      setEnableDownload(
        result.enableDownload !== undefined ? result.enableDownload : true
      );
    });
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
      <div>
        启动视频下载功能
        <Tooltip content="该功能是实验性功能">
          <IconQuestionCircle />
        </Tooltip>
        :{' '}
        <Switch
          checked={enableDownload}
          onChange={(value) => {
            chrome.storage.sync.set({ enableDownload: value }, function () {
              Message.success(value ? '视频下载功能开启' : '视频下载功能关闭');
              setEnableDownload(value);
            });
          }}
        />
      </div>
    </div>
  );
};

export default ConfigForm;
