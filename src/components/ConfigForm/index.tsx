import React, { useEffect, useState } from 'react';
import {
  Form,
  Button,
  InputNumber,
  Tooltip,
  Message,
  Space,
  Switch,
  Input,
  Checkbox,
} from '@arco-design/web-react';
import { IconQuestionCircle } from '@arco-design/web-react/icon';
import { characterList, initiConfig, textTypes } from '../../utils/config';
import {
  getAsoulImgsNum,
  matchFilesFromStr,
  sendMessageToContentScript,
} from '../../utils';
import './index.css';

const FormItem = Form.Item;

const ConfigForm = (props: { type: 'popup' | 'options' }) => {
  const { type } = props;
  const [enableTips, setEnableTips] = useState(false);
  const [enableDownload, setEnableDownload] = useState(false);
  const [pic, setPic] = useState('');
  const [form] = Form.useForm();

  const randomPic = async () => {
    const [{ img }] = await getAsoulImgsNum();
    img && setPic(img);
  };

  useEffect(() => {
    randomPic();
    chrome.storage.sync.get(
      ['config', 'enableTips', 'enableDownload'],
      function (result) {
        setEnableTips(
          result.enableTips !== undefined ? result.enableTips : true
        );
        setEnableDownload(
          result.enableDownload !== undefined ? result.enableDownload : true
        );
        form.setFieldsValue({
          ...initiConfig,
          ...result.config,
        });
      }
    );
  }, []);

  const save = () => {
    form.validate((err, values) => {
      if (!err) {
        chrome.storage.sync.set({ config: values }, function () {
          Message.success('配置成功');
          // const { talkContent } = values;
          // Object.keys(talkContent).forEach((key) => {
          //   talkContent[key] = talkContent[key].filter((i: string) =>
          //     Boolean(i)
          //   );
          // });
          sendMessageToContentScript({
            type: 'config',
            data: values,
          });
        });
      }
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        className={'bg'}
        style={{
          background: `url('${pic}')`,
          opacity: 0.15,
        }}
      />

      <div style={{ height: '100%' }}>
        <div className="title">
          <div>插件信息配置</div>
          <div style={{ fontSize: '14px', display: 'flex' }}>
            <div>
              启动闲置提示:{' '}
              <Switch
                checked={enableTips}
                onChange={(value) => {
                  chrome.storage.sync.set({ enableTips: value }, function () {
                    Message.success(value ? '闲置提示开启' : '闲置提示关闭');
                    setEnableTips(value);
                  });
                }}
              />
            </div>
            {type === 'popup' ? undefined : (
              <div style={{ marginLeft: 16 }}>
                启动视频下载功能
                <Tooltip content="该功能是实验性功能">
                  <IconQuestionCircle />
                </Tooltip>
                :{' '}
                <Switch
                  checked={enableDownload}
                  onChange={(value) => {
                    chrome.storage.sync.set(
                      { enableDownload: value },
                      function () {
                        Message.success(
                          value ? '视频下载功能开启' : '视频下载功能关闭'
                        );
                        setEnableDownload(value);
                      }
                    );
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="tips">修改配置后，请记得提交配置</div>
        <Form
          form={form}
          labelCol={{ span: type === 'popup' ? 8 : 5 }}
          wrapperCol={{ span: type === 'popup' ? 14 : 18 }}
        >
          <FormItem
            label="闲置触发时间/秒"
            field="triggerTime"
            rules={[{ required: true, type: 'number' }]}
          >
            <InputNumber placeholder="触发间隔时间" min={0} precision={0} />
          </FormItem>

          <FormItem
            noStyle
            shouldUpdate={(prev, next) => prev.more !== next.more}
          >
            {(values: any) => {
              return (
                <FormItem
                  label="显示人物"
                  field="character"
                  rules={[
                    {
                      validator: (value, callback) => {
                        callback(value?.length ? undefined : '至少选择一个');
                      },
                    },
                  ]}
                >
                  <Checkbox.Group
                    options={characterList.map((item) => ({
                      ...item,
                      disabled: item.value === 'custom' && !values.more,
                    }))}
                  />
                </FormItem>
              );
            }}
          </FormItem>

          <FormItem
            label={
              <span>
                图片宽度
                <Tooltip content="高度自动根据图片比例和设定的宽度自适应">
                  <IconQuestionCircle />
                </Tooltip>
              </span>
            }
            field="width"
            rules={[{ required: true }]}
          >
            <InputNumber placeholder="图片宽度:最小设置50" min={50} />
          </FormItem>
          <Form.Item
            field="talk"
            label="对话文本框"
            triggerPropName="checked"
            extra={
              type === 'popup' ? (
                <span
                  style={{
                    cursor: 'pointer',
                    color: '#3491FA',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                  onClick={() => {
                    chrome.tabs.create({
                      url: chrome.runtime.getURL('./options.html'),
                    });
                  }}
                >
                  自定义人物文本内容
                </span>
              ) : undefined
            }
          >
            <Switch />
          </Form.Item>
          <Form.Item
            field="pickEle"
            label="抓取某元素"
            triggerPropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item field="more" label="自定义图片" triggerPropName="checked">
            <Switch
              onChange={(value) => {
                !value &&
                  form.setFieldValue(
                    'character',
                    form
                      .getFieldValue('character')
                      ?.filter((i: string) => i !== 'custom')
                  );
              }}
            />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.more !== next.more}
          >
            {(values: any) => {
              return values.more ? (
                <Form.Item
                  field="basePath"
                  validateTrigger="onBlur"
                  label={
                    <span>
                      插件文件路径
                      <Tooltip
                        color={undefined}
                        content="鉴于浏览器安全策略，本插件只会尝试读取自身目录下的资源文件，请填写对应的路径"
                      >
                        <IconQuestionCircle />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: '开启自定义图片功能，需要填写准确路径',
                    },
                    {
                      validator: async (value, callback) => {
                        if (value) {
                          const res = await fetch(`file:///${value}`);
                          if (res.status === 0) {
                            const text = await res.text();
                            const dirList = matchFilesFromStr(text);
                            !dirList.some(
                              (item) => item[0] === 'manifest.json'
                            ) && callback('路径不正确');
                          } else {
                            callback('尝试访问对应路径失败');
                          }
                        }
                      },
                    },
                  ]}
                >
                  <Input.TextArea placeholder={'该插件的解压文件本地路径'} />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          <div style={{ display: type === 'options' ? 'block' : 'none' }}>
            <div style={{ margin: '0 0 20px 60px', fontWeight: 500 }}>
              人物文本内容，支持多个，用回车符号划分
            </div>
            {textTypes.map((item) => {
              const { value, label } = item;
              return (
                <Form.Item
                  key={value}
                  field={`talkContent.${value}`}
                  validateTrigger="onBlur"
                  label={label}
                >
                  <ArrayInput />
                </Form.Item>
              );
            })}
          </div>
          <FormItem
            wrapperCol={{
              offset: 8,
            }}
          >
            <Space>
              <Button type="primary" onClick={() => save()}>
                提交配置
              </Button>
              {type === 'popup' ? (
                <Button
                  type="primary"
                  onClick={() => {
                    chrome.runtime.sendMessage({ type: 'force_need_render' });
                  }}
                >
                  触发互动{' '}
                  <Tooltip content="需打开普通页面才能触发(若上述配置改变，请先提交配置)">
                    <IconQuestionCircle />
                  </Tooltip>
                </Button>
              ) : null}
            </Space>
          </FormItem>
        </Form>
      </div>
    </div>
  );
};

export default ConfigForm;

const ArrayInput = (props: any) => {
  const { value, onChange } = props;
  return (
    <Input.TextArea
      value={value?.join('\n')}
      onChange={(value) => {
        onChange(value?.split('\n') || []);
      }}
      placeholder={'请输入，多句话之间用回车区分'}
      autoSize={{ minRows: 3, maxRows: 10 }}
    />
  );
};
