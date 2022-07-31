import { useEffect } from 'react';
import {
  Tooltip,
  Form,
  Radio,
  Checkbox,
  Space,
  Image,
  Typography,
} from '@arco-design/web-react';
import { IconImage, IconQuestionCircle } from '@arco-design/web-react/icon';
import { ThemeConfig } from '../../pages/Content/modules/partdown/config';

export const defaultThemeConfig = {
  type: 'auto',
  method: 'match',
  imgKeys: [],
};

const ThemeOptions = Object.keys(ThemeConfig).map((key) => {
  const { QIcon, label } = ThemeConfig[key];
  return {
    key,
    label,
    children: QIcon.map((item: any) => ({
      value: item.key,
      label: item.key,
      src: item.src,
    })),
  };
});

const infoTooltip = (text: string) => (
  <Tooltip content={text}>
    <IconQuestionCircle />
  </Tooltip>
);

const ThemeForm = (props: { type: 'popup' | 'options' }) => {
  const { type } = props;

  const [form] = Form.useForm();

  useEffect(() => {
    chrome.storage.sync.get(['themeConfig'], function (result) {
      const { themeConfig = defaultThemeConfig } = result || {};
      form.setFieldsValue(themeConfig);
    });
  }, []);

  return (
    <Form
      form={form}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      onValuesChange={(_, vs) => {
        chrome.storage.sync.set({ themeConfig: vs });
      }}
    >
      <Form.Item
        field="type"
        label="类型"
        rules={[{ required: true, message: '类型不能为空' }]}
      >
        <Radio.Group
          type="button"
          options={[
            {
              label: (
                <span>
                  自动
                  {infoTooltip(
                    '启动所有主题。根据视频标题关键字匹配，未命中或命中多个则随机'
                  )}
                </span>
              ),
              value: 'auto',
            },
            { label: '自定义', value: 'custom' },
          ]}
        ></Radio.Group>
      </Form.Item>
      <Form.Item shouldUpdate noStyle>
        {(values: any) => {
          const disabled = values.type === 'auto';
          return (
            <>
              <Form.Item
                field="method"
                label="策略"
                rules={[{ required: true, message: '策略不能为空' }]}
              >
                <Radio.Group
                  disabled={disabled}
                  options={[
                    { label: '随机', value: 'random' },
                    {
                      label: (
                        <span>
                          匹配+随机
                          {infoTooltip(
                            '根据视频标题关键字匹配，未命中或命中多个则随机'
                          )}
                        </span>
                      ),
                      value: 'match',
                    },
                  ]}
                ></Radio.Group>
              </Form.Item>
              <Form.Item field="imgKeys" label="主题图">
                <Checkbox.Group disabled={disabled}>
                  {type === 'popup' ? (
                    <Space wrap align="start">
                      {ThemeOptions.map((item) => {
                        const { key, label, children = [] } = item;
                        return (
                          <div key={key} style={{ width: 120, marginTop: 5 }}>
                            <div>{label}</div>
                            {children.map((i: any) => (
                              <Checkbox
                                key={i.value}
                                value={i.value}
                                style={{ marginTop: 6 }}
                              >
                                {i.label}
                                <Tooltip
                                  content={
                                    <Image
                                      preview={false}
                                      height={160}
                                      src={i.src}
                                      alt={i.value}
                                    />
                                  }
                                >
                                  <IconImage />
                                </Tooltip>
                              </Checkbox>
                            ))}
                          </div>
                        );
                      })}
                    </Space>
                  ) : (
                    ThemeOptions.map((item) => {
                      const { key, label, children = [] } = item;
                      return (
                        <div key={key} style={{ marginTop: 5 }}>
                          <div>{label}</div>
                          {children.map((i: any) => (
                            <Checkbox
                              key={i.value}
                              value={i.value}
                              style={{ marginTop: 6 }}
                            >
                              {({ checked }) => {
                                return (
                                  <Space
                                    align="start"
                                    className={`custom-checkbox-card ${
                                      checked
                                        ? 'custom-checkbox-card-checked'
                                        : ''
                                    }`}
                                  >
                                    <div className="custom-checkbox-card-mask">
                                      <div className="custom-checkbox-card-mask-dot"></div>
                                    </div>
                                    <div>
                                      <div className="custom-checkbox-card-title">
                                        {' '}
                                        {i.label}
                                      </div>
                                      <Typography.Text type="secondary">
                                        <Image
                                          preview={false}
                                          height={200}
                                          src={i.src}
                                          alt={i.value}
                                        />
                                      </Typography.Text>
                                    </div>
                                  </Space>
                                );
                              }}
                            </Checkbox>
                          ))}
                        </div>
                      );
                    })
                  )}
                </Checkbox.Group>
              </Form.Item>
              {values.type === 'custom' &&
                !values.imgKeys?.length &&
                (type === 'popup' ? (
                  <span style={{ color: 'red', fontSize: '14px' }}>
                    若开启自定义，请至少选择一张主题图，否则会自动采用【自动】类型
                  </span>
                ) : (
                  <Form.Item label=" ">
                    <span style={{ color: 'red', fontSize: '14px' }}>
                      若开启自定义，请至少选择一张主题图，否则会自动采用【自动】类型
                    </span>
                  </Form.Item>
                ))}
            </>
          );
        }}
      </Form.Item>
    </Form>
  );
};

export default ThemeForm;
