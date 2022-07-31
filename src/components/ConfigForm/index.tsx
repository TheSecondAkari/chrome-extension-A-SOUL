import { useEffect, useState } from 'react';
import { Tooltip, Message, Switch, Grid } from '@arco-design/web-react';
import { IconEye, IconQuestionCircle } from '@arco-design/web-react/icon';
import { getAsoulImgsNum } from '../../utils';
import ThemeForm from './ThemeForm';
import './index.css';

const Row = Grid.Row;
const Col = Grid.Col;

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
    type === 'popup' && randomPic();
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
  }, [type]);

  const labelColProps: any =
    type === 'popup'
      ? { span: 7, style: { alignItem: 'center' } }
      : { span: 4, style: { textAlign: 'right', alignItem: 'center' } };

  return (
    <div className="wrapper">
      {pic && (
        <div
          className={'bg'}
          style={{
            background: `url('${pic}')`,
            opacity: 0.15,
          }}
        />
      )}

      <Row>
        <Col {...labelColProps}>启动视频下载功能</Col>
        <Col span={8}>
          <Switch
            checked={enableDownload}
            style={{ marginLeft: 8 }}
            onChange={(value) => {
              chrome.storage.sync.set({ enableDownload: value }, function () {
                setEnableDownload(value);
              });
            }}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: 16 }}>
        <Col {...labelColProps}>
          强制启动截取支持
          <Tooltip
            content={
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {
                  '实验性功能，若非必要，不建议开启\n该功能有概率对b站视频页面的浏览造成影响\n若过度卡顿、内容加载失效时，关闭功能即可\n已经打开的视频页面刷新才能生效'
                }
              </div>
            }
          >
            <IconQuestionCircle
              style={{ color: 'red', strokeWidth: 5, marginLeft: 4 }}
            />
          </Tooltip>
        </Col>
        <Col span={8}>
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
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col {...labelColProps}>插件主题配置</Col>
        {type === 'popup' ? (
          <span
            style={{
              cursor: 'pointer',
              color: '#3491FA',
            }}
            onClick={() => {
              chrome.tabs.create({
                url: chrome.runtime.getURL('./options.html'),
              });
            }}
          >
            便捷预览配置
            <IconEye />
          </span>
        ) : null}
      </Row>

      <div style={{ marginTop: 16 }}>
        <ThemeForm type={type} />
      </div>
    </div>
  );
};

export default ConfigForm;
