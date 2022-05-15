import {
  Button,
  Checkbox,
  Input,
  Message,
  Popconfirm,
  Progress,
  Slider,
  TimePicker,
  Tooltip,
  Trigger,
} from '@arco-design/web-react';
import {
  IconDownload,
  IconEdit,
  IconQuestionCircle,
} from '@arco-design/web-react/icon';
import { useEffect, useState } from 'react';
import DetailedFetchBlob from './utils/detailed-fetch-blob';
import FLVMetaData from './utils/flvparser/flv-metadata';
import TwentyFourDataView from './utils/twenty-four-dataview';
import FLV from './utils/flvparser/flv';
import FLVTag from './utils/flvparser/flv-tag';
import FLVTags from './utils/flvparser/flv-tags';
import { downFileToLocal } from './utils/downloadBlob';
import '@arco-design/web-react/dist/css/arco.css';

const fill0 = (str: string | number) => {
  const temp = `${str}`;
  return temp.length === 1 ? '0' + temp : temp;
};

// duration 时长，毫秒
const InjectComponent = (props: {
  streamUrl: string;
  duration: number;
  videoTitle?: string;
}) => {
  const { streamUrl, duration, videoTitle } = props;
  const [visible, setVisible] = useState(false);
  const [process, setProcess] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [enableEncode, setEnableEncode] = useState(true);
  const [ffmpegWorker, setFfmpegWorker] = useState<any>();
  const [encoding, setEncoding] = useState(false);
  const [encodeProcess, setEncodeProcess] = useState(0);
  const [timeRange, setTimeRange] = useState<number[]>([
    duration * 0.1,
    duration * 0.2,
  ]);
  const [flvHead, setFlvHead] = useState<any>();
  const [metadataTag, setMetadataTag] = useState<any>();
  const fileInfo = metadataTag?.config?.second_amf?.arraymap || {};
  const headByteLength =
    (flvHead?.tags?.[2]?.config.currentOffset || 0) +
    (flvHead?.tags?.[2]?.config.byteLength || 0); // head + 前3个tag

  const [fileName, setFileName] = useState<string | undefined>(videoTitle);
  const validateFileName = /\S/.test(fileName || '') ? fileName : 'target';

  const flvParse = async (blob: Blob) => {
    let flv: FLV = new FLV(new TwentyFourDataView(await blob.arrayBuffer()));
    return flv;
  };

  const flvTagsParse = async (blob: Blob) => {
    let flvTags: FLVTags = new FLVTags(
      new TwentyFourDataView(await blob.arrayBuffer())
    );
    return flvTags;
  };

  const getFlvData = async (
    url: string,
    range?: [number, number],
    onProcess?: (loaded: any, total: any) => void
  ) => {
    let burl = url;
    const partialFLVFromCache: any = undefined;
    if (range?.[0] && range?.[1] && range?.[0] > range?.[1]) return;
    if (range?.[0]) burl += `&bstart=${range[0]}`;
    let opt: any = {
      fetch: window.fetch,
      method: 'GET',
      mode: 'cors',
      cache: 'default',
      referrerPolicy: 'no-referrer-when-downgrade',
      cacheLoaded: partialFLVFromCache ? partialFLVFromCache.size : 0,
      headers: range
        ? {
            Range: `bytes=${range[0] >= 0 ? range[0] : ''}-${
              range[1] >= 0 ? range[1] : ''
            }`,
          }
        : undefined,
    };
    opt.onprogress = (loaded: any, total: any) => {
      onProcess?.(loaded, total);
    };
    opt.onerror = opt.onabort = ({ target, type }: any) => {
      console.log('error', target, type);
    };
    let fch = new DetailedFetchBlob(burl, opt);
    let theBlob = await fch.getBlob();
    return theBlob;
  };

  const modifyFlvTags = (
    tags: FLVTag[],
    startTimestamp: number,
    endTimestamp: number
  ) => {
    const startTagIndex = tags.findIndex(
      (item: any) =>
        item.config.tagType === 9 &&
        item.config.currentTimestamp >= startTimestamp
    );
    const startTag: any = tags[startTagIndex];
    let endTagIndex =
      tags.findIndex(
        (item: any) =>
          item.config.tagType === 9 &&
          item.config.currentTimestamp >= endTimestamp
      ) - 1;
    endTagIndex < 0 && (endTagIndex = tags.length - 1);
    const endTag: any = tags[endTagIndex];

    // duration
    const newduration = (endTimestamp - startTimestamp) / 1000;
    metadataTag.dataView.setFloat64(
      metadataTag.keyByteOffset.duration,
      newduration
    );

    // 处理Tags时间戳
    const keyTags = [];
    const modifyKeysLength = metadataTag.keyByteOffset.filepositions.length - 3;
    let tagTimeSpace = Math.floor((newduration / modifyKeysLength) * 10) / 100;
    for (let i = startTagIndex; i <= endTagIndex; i++) {
      const tag: any = tags[i];
      const newTimestamp = tag.getCombinedTimestamp() - startTimestamp;
      if (newTimestamp % tagTimeSpace === 0 || i === endTagIndex) {
        keyTags.push({
          time: newTimestamp / 1000,
          offset:
            tag.config.currentOffset -
            startTag.config.currentOffset +
            headByteLength,
        });
      }
      tag.setCombinedTimestamp(newTimestamp >= 0 ? newTimestamp : 0);
    }

    // 处理 metadata 内容
    const metaDataTag = metadataTag;
    // let i = 0;
    // for (; i <= modifyKeysLength; i++) {
    //   const { time, offset } = keyTags[i];
    //   metaDataTag.dataView.setFloat64(
    //     metaDataTag.keyByteOffset.filepositions[i + 1],
    //     offset
    //   );
    //   metaDataTag.dataView.setFloat64(
    //     metaDataTag.keyByteOffset.times[i + 1],
    //     time
    //   );
    // }
    // metaDataTag.dataView.setFloat64(
    //   metaDataTag.keyByteOffset.filepositions[modifyKeysLength + 1],
    //   keyTags[keyTags.length - 1].offset
    // );
    // metaDataTag.dataView.setFloat64(
    //   metaDataTag.keyByteOffset.times[modifyKeysLength + 1],
    //   keyTags[keyTags.length - 1].time
    // );

    metaDataTag.dataView.setFloat64(
      metaDataTag.keyByteOffset.lasttimestamp,
      endTag.getCombinedTimestamp() / 1000
    );
    metaDataTag.dataView.setFloat64(
      metaDataTag.keyByteOffset.lastkeyframetimestamp,
      endTag.getCombinedTimestamp() / 1000
    );
    metaDataTag.dataView.setFloat64(
      metaDataTag.keyByteOffset.lastkeyframelocation,
      endTag.config.currentOffset -
        startTag.config.currentOffset +
        headByteLength
    );

    return [
      startTag.config.currentOffset,
      endTag.config.currentOffset +
        endTag.config.byteLength -
        startTag.config.currentOffset,
    ];
  };

  const preHandle = async (url: string) => {
    const halfH = Math.round(duration / 1000 / 60);
    const endLength = halfH <= 5 ? 2500 : 2499 + (halfH - 5) * 250;
    const fileInfoBlob = await getFlvData(url, [0, endLength]);
    const tempFlvHead: any = await flvParse(fileInfoBlob);
    setFlvHead(tempFlvHead);
    setMetadataTag(new FLVMetaData(tempFlvHead.tags[0].tagData));
  };

  const predictSize = (startTime: number, endTime: number) => {
    const { filepositions, times } = fileInfo?.keyframes || {};
    if (times?.data?.length && filepositions?.data?.length) {
      const startIndex =
        times.data.findIndex((num: number) => num > startTime) - 1;
      let endIndex = times.data.findIndex((num: number) => num >= endTime);
      endIndex < 0 && (endIndex = times.length - 1);

      const size =
        filepositions.data[endIndex] - filepositions.data[startIndex];
      return (size / 1024 / 1024 + 2.5).toFixed(2);
    }
    return '无法预估';
  };

  const downloadPart = async (startTime: number, endTime: number) => {
    try {
      const { filepositions, times } = fileInfo?.keyframes || {};
      if (times?.data?.length && filepositions?.data?.length) {
        setDownloading(true);
        const startIndex =
          times.data.findIndex((num: number) => num > startTime) - 1;
        let endIndex = times.data.findIndex((num: number) => num >= endTime);
        endIndex < 0 && (endIndex = times.length - 1);
        const fileContentBlob = await getFlvData(
          streamUrl,
          [filepositions.data[startIndex], filepositions.data[endIndex] - 1],
          (loaded, total) => {
            setProcess(Math.round((loaded / total) * 100));
          }
        );
        const flvContent: any = await flvTagsParse(fileContentBlob);
        const [startTagOffset, contentLength] = modifyFlvTags(
          flvContent.tags,
          startTime * 1000,
          endTime * 1000
        );

        const targetFile = new Blob([
          new DataView(flvHead.buffer, 0, headByteLength),
          new DataView(flvContent.buffer, startTagOffset, contentLength),
        ]);

        if (enableEncode)
          // 编码mp4
          await encodeVideo(targetFile);
        else {
          downFileToLocal(validateFileName + '.flv', targetFile);
        }
        setDownloading(false);
        setVisible(false);
      }
    } catch (e) {
      console.log(e);
      setDownloading(false);
    }
  };

  // 预解析，是否支持索引特定起点、终点
  useEffect(() => {
    preHandle(streamUrl);
  }, [streamUrl]);

  const formatTime = (rangeOne: number, needHour?: boolean) => {
    const seconds = rangeOne / 1000;
    const minutes = Math.floor(seconds / 60);
    const hour = Math.floor(minutes / 60);
    return (
      (hour || needHour ? `${fill0(hour)}:` : '') +
      fill0(minutes % 60) +
      ':' +
      fill0((seconds % 60).toFixed(0))
    );
  };

  // 编码视频
  const encodeVideo = async (blob: Blob) => {
    setEncoding(true);
    try {
      const ffmpeg = ffmpegWorker;
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }
      ffmpeg.FS(
        'writeFile',
        'input.flv',
        new Uint8Array(await blob.arrayBuffer())
      );
      await ffmpeg.run(
        '-i',
        'input.flv',
        '-y',
        '-vcodec',
        'copy',
        '-acodec',
        'copy',
        'output.mp4'
      );
      const data = ffmpeg.FS('readFile', 'output.mp4');
      const file = new Blob([data.buffer], { type: 'video/mp4' });
      downFileToLocal(validateFileName + '.mp4', file);
      setEncoding(false);
    } catch (e) {
      Message.warning('尝试视频编码mp4失败');
      setEncoding(false);
    }
  };

  // 初始化 ffmpeg
  useEffect(() => {
    // @ts-ignore
    const { createFFmpeg }: any = FFmpeg;
    const ffmpeg = createFFmpeg({
      corePath: chrome.runtime.getURL('./public/vendor/ffmpeg-core.js'),
      progress: (e: any) => {
        setEncodeProcess(Math.round((e?.ratio || 0) * 100));
      },
    });
    setFfmpegWorker(ffmpeg);
    return () => {
      try {
        ffmpeg?.exit?.();
      } catch (e) {}
    };
  }, []);

  return (
    <div>
      {fileInfo?.keyframes?.filepositions?.data?.length ? (
        <Popconfirm
          position="tr"
          style={{ width: 'fit-content', maxWidth: 'unset' }}
          getPopupContainer={(node) => node.parentElement as HTMLElement}
          popupVisible={visible}
          okButtonProps={{ loading: downloading }}
          cancelButtonProps={{ disabled: downloading }}
          title={
            <div style={{ width: 480 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  justifyItems: 'center',
                }}
              >
                <div>
                  视频截取下载
                  <Tooltip content="建议截取视频时，将前后时间点往前往后偏移3-5s，(秒数末尾是0或5最好)，确保获取需要的截内容">
                    <IconQuestionCircle />
                  </Tooltip>
                </div>
                <div>
                  <a href={streamUrl} download={`${validateFileName}.flv`}>
                    下载完整视频
                  </a>
                  <Tooltip content="下载完整视频暂时支持flv格式">
                    <IconQuestionCircle />
                  </Tooltip>
                </div>
              </div>
              <Slider
                range
                disabled={downloading}
                min={0}
                max={duration}
                step={1000}
                style={{ width: '96%' }}
                value={timeRange}
                onChange={setTimeRange as any}
                formatTooltip={(value) => {
                  return formatTime(value);
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  截取起始时间：
                  {formatTime(timeRange[0])}{' '}
                  <MyTimePicker
                    duration={duration}
                    value={formatTime(timeRange[0], true)}
                    onChange={(v: number) =>
                      v < timeRange[1] && setTimeRange([v, timeRange[1]])
                    }
                  />
                </div>
                <div>
                  截取结束时间：
                  {formatTime(timeRange[1])}{' '}
                  <MyTimePicker
                    duration={duration}
                    value={formatTime(timeRange[1], true)}
                    onChange={(v: number) =>
                      v > timeRange[0] && setTimeRange([timeRange[0], v])
                    }
                  />
                </div>

                <Checkbox
                  checked={enableEncode}
                  onChange={(v) => setEnableEncode(v)}
                >
                  导出为mp4
                  <Tooltip content="不开启则导出视频为flv格式，mp4格式文件受更多剪辑软件支持。且该转换为无损转换、速度快，如无特殊情况建议开启。tips：开启该功能需要更多的运行内存，建议系统内存至少有4G以上。(不过目前也没测试更多)">
                    <IconQuestionCircle />
                  </Tooltip>
                </Checkbox>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}
              >
                <div style={{ width: 88 }}>文件名字：</div>
                <Input
                  value={fileName}
                  onChange={(v) => setFileName(v)}
                  addAfter={enableEncode ? '.mp4' : '.flv'}
                />
              </div>
              <div style={{ marginTop: 4 }}>
                预估下载文件大小：
                {predictSize(timeRange[0] / 1000, timeRange[1] / 1000)} MB
                <Tooltip content="会有数MB的大小预估偏差">
                  <IconQuestionCircle />
                </Tooltip>
              </div>
              {downloading ? (
                <div>
                  下载进度：
                  <Progress percent={process} />
                </div>
              ) : null}
              {encoding ? (
                <div>
                  编译进度：
                  <Progress percent={encodeProcess} />
                </div>
              ) : null}
            </div>
          }
          onOk={() => {
            const [b, e] = timeRange;
            downloadPart(b / 1000, e / 1000);
          }}
          onCancel={() => {
            setVisible(false);
          }}
        >
          <Button
            onClick={() => {
              setVisible(!visible);
            }}
            disabled={downloading}
            shape="circle"
            type="primary"
            icon={<IconDownload />}
          />
        </Popconfirm>
      ) : null}
    </div>
  );
};

export default InjectComponent;

const MyTimePicker = (props: any) => {
  const [visible, setVisible] = useState(false);

  const { value, onChange, duration } = props;

  return (
    <Trigger
      popupVisible={visible}
      getPopupContainer={(node) => node.parentElement as any}
      onClickOutside={() => setVisible(false)}
      popup={() => (
        <div className="demo-trigger-popup">
          <TimePicker
            style={{ width: 194 }}
            getPopupContainer={(node) => node.parentElement as any}
            showNowBtn={false}
            value={value}
            onChange={(valueString) => {
              const [h, m, s] = valueString.split(':');
              const ms = (Number(h) * 3600 + Number(m) * 60 + Number(s)) * 1000;
              if (ms <= duration) {
                onChange?.(ms);
                setVisible(false);
              }
            }}
          />
        </div>
      )}
      trigger="click"
      classNames="zoomInTop"
    >
      <IconEdit onClick={() => setVisible(!visible)} />
    </Trigger>
  );
};
