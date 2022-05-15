import {
  Button,
  Checkbox,
  Input,
  Message,
  Popconfirm,
  Progress,
  Select,
  Tooltip,
} from '@arco-design/web-react';
import { IconDownload, IconQuestionCircle } from '@arco-design/web-react/icon';
import { useEffect, useState } from 'react';
import DetailedFetchBlob from './utils/detailed-fetch-blob';
import FLVMetaData from './utils/flvparser/flv-metadata';
import TwentyFourDataView from './utils/twenty-four-dataview';
import FLV from './utils/flvparser/flv';
// import FLVTag from './utils/flvparser/flv-tag';
// import FLVTags from './utils/flvparser/flv-tags';
import { downFileToLocal, formatTime } from './utils/common';
import '@arco-design/web-react/dist/css/arco.css';

// ! 不再手动处理flv的Tag信息，采用ffmpeg去处理
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
  const [timeRange, setTimeRange] = useState<number[]>([]);
  const [timestampOptions, setTimestampOptions] = useState<
    { label: string; value: number }[]
  >([]);
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

  const getFormatMarkOptions = (times: any) => {
    let result: any = [];
    if (times.length) {
      const list = [...times];
      if (list[0] === list[1]) list.shift();
      result = list.map((seconds) => ({
        label: formatTime(seconds * 1000),
        value: seconds * 1000,
      }));
    }
    setTimestampOptions(result);
  };

  const preHandle = async (url: string) => {
    const halfH = Math.round(duration / 1000 / 60);
    const endLength = halfH <= 5 ? 2500 : 2499 + (halfH - 5) * 250;
    const fileInfoBlob = await getFlvData(url, [0, endLength]);
    const tempFlvHead: any = await flvParse(fileInfoBlob);
    setFlvHead(tempFlvHead);
    const metadataTagObj: any = new FLVMetaData(tempFlvHead.tags[0].tagData);
    getFormatMarkOptions(
      metadataTagObj?.config?.second_amf?.arraymap?.keyframes?.times?.data || []
    ); // 获取特定时间帧的选择
    setMetadataTag(metadataTagObj);
  };

  const predictSize = (startTime: number, endTime: number) => {
    const { filepositions, times } = fileInfo?.keyframes || {};
    if (startTime === undefined || endTime === undefined) {
      return '请先选择截取时间点';
    }
    if (startTime >= endTime) return '不允许结束时间小于等于开始时间';
    const startTimestamp = startTime / 1000;
    const endTimestamp = endTime / 1000;
    if (
      startTime < endTime &&
      times?.data?.length &&
      filepositions?.data?.length
    ) {
      const startIndex =
        times.data.findIndex((num: number) => num > startTimestamp) - 1;
      let endIndex = times.data.findIndex((num: number) => num >= endTimestamp);
      endIndex < 0 && (endIndex = times.length - 1);
      const size =
        filepositions.data[endIndex] - filepositions.data[startIndex];
      return (size / 1024 / 1024 + 2.5).toFixed(2) + ' MB';
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
        const targetFile = new Blob([
          new DataView(flvHead.buffer, 0, headByteLength),
          fileContentBlob,
        ]);
        if (enableEncode)
          // 编码mp4
          await encodeVideoMP4(targetFile);
        else {
          // 编码flv， 自动纠正时间、metadata信息 （不再使用手动处理）
          await encodeVideoFlv(targetFile);
        }
        setDownloading(false);
        setProcess(0);
        setEncodeProcess(0);
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

  // 编码视频
  const encodeVideoMP4 = async (blob: Blob) => {
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

  const encodeVideoFlv = async (blob: Blob) => {
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
        '-c',
        'copy',
        '-flvflags',
        'add_keyframe_index',
        'output.flv'
      );
      const data = ffmpeg.FS('readFile', 'output.flv');
      const file = new Blob([data.buffer]);
      downFileToLocal(validateFileName + '.flv', file);
      setEncoding(false);
    } catch (e) {
      downFileToLocal(validateFileName + '.flv', blob);
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
    <div style={{ position: 'relative' }}>
      {fileInfo?.keyframes?.filepositions?.data?.length ? (
        <Popconfirm
          position="tr"
          style={{ width: 'fit-content', maxWidth: 'unset' }}
          getPopupContainer={(node) => node.parentElement as HTMLElement}
          popupVisible={visible}
          triggerProps={{ unmountOnExit: false }}
          okButtonProps={{
            loading: downloading,
            disabled:
              timeRange[0] === undefined ||
              timeRange[1] === undefined ||
              timeRange[1] <= timeRange[0],
          }}
          cancelButtonProps={{ disabled: downloading }}
          title={
            <div style={{ width: 500 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  justifyItems: 'center',
                }}
              >
                <div>
                  视频截取下载
                  <Tooltip content="因视频编码格式，为保证在无需重新编码即可获取到对应片段。所以采取只能从特定的视频关键依赖帧的时间点进行裁剪（加快导出速度）">
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

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '8px 0',
                }}
              >
                <div>
                  截取: 起始时间:
                  <TimestampSelect
                    placeholder="起始时间"
                    disabled={downloading}
                    options={timestampOptions}
                    value={timeRange[0]}
                    onChange={(v: number) => {
                      setTimeRange([v, timeRange[1]]);
                    }}
                  />
                </div>
                <div>
                  结束时间:
                  <TimestampSelect
                    placeholder="结束时间"
                    disabled={downloading}
                    options={timestampOptions}
                    value={timeRange[1]}
                    onChange={(v: number) => {
                      setTimeRange([timeRange[0], v]);
                    }}
                  />
                </div>

                <Checkbox
                  checked={enableEncode}
                  disabled={downloading}
                  onChange={(v) => setEnableEncode(v)}
                >
                  导出为mp4
                  <Tooltip content="不开启则导出视频为flv格式，mp4格式文件受更多剪辑软件支持。且该转换为无损转换、速度快，如无特殊情况建议开启。">
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
                  disabled={downloading}
                  onChange={(v) => setFileName(v)}
                  addAfter={enableEncode ? '.mp4' : '.flv'}
                />
              </div>
              <div style={{ marginTop: 4 }}>
                预估下载文件大小：
                {predictSize(timeRange[0], timeRange[1])}
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
            if (b >= 0 && e >= 0) downloadPart(b / 1000, e / 1000);
            setVisible(false);
          }}
          onCancel={() => {
            setVisible(false);
          }}
        >
          {downloading ? (
            <Progress
              style={{ position: 'absolute', left: -16, top: -16 }}
              type="circle"
              percent={encoding ? encodeProcess : process}
              status={encoding ? 'success' : 'normal'}
            />
          ) : null}

          <Button
            onClick={() => {
              setVisible(!visible);
            }}
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

const TimestampSelect = (props: any) => {
  const { value, onChange, options, placeholder, disabled } = props;

  return (
    <Select
      placeholder={placeholder}
      showSearch
      value={value}
      disabled={disabled}
      style={{ width: 100 }}
      getPopupContainer={(node) => node.parentElement as any}
      onChange={onChange}
      filterOption={(inputValue, option) =>
        option.props.children.toLowerCase().indexOf(inputValue.toLowerCase()) >=
        0
      }
    >
      {options.map((item: any) => (
        <Select.Option key={item.value} value={item.value}>
          {item.label}
        </Select.Option>
      ))}
    </Select>
  );
};

// download part的处理  手动处理tag，一定程度上速度比ffmpeg快，但修改的信息不全面
// const flvContent: any = await flvTagsParse(fileContentBlob);
// const [startTagOffset, contentLength] = modifyFlvTags(
//   flvContent.tags,
//   startTime * 1000,
//   endTime * 1000
// );

// const flvTagsParse = async (blob: Blob) => {
//   let flvTags: FLVTags = new FLVTags(
//     new TwentyFourDataView(await blob.arrayBuffer())
//   );
//   return flvTags;
// };

// const modifyFlvTags = (
//   tags: FLVTag[],
//   startTimestamp: number,
//   endTimestamp: number
// ) => {
//   const startTagIndex = tags.findIndex(
//     (item: any) =>
//       item.config.tagType === 9 &&
//       item.config.currentTimestamp >= startTimestamp
//   );
//   const startTag: any = tags[startTagIndex];
//   let endTagIndex =
//     tags.findIndex(
//       (item: any) =>
//         item.config.tagType === 9 &&
//         item.config.currentTimestamp >= endTimestamp
//     ) - 1;
//   endTagIndex < 0 && (endTagIndex = tags.length - 1);
//   const endTag: any = tags[endTagIndex];

//   // duration
//   const newduration = (endTimestamp - startTimestamp) / 1000;
//   metadataTag.dataView.setFloat64(
//     metadataTag.keyByteOffset.duration,
//     newduration
//   );

//   // 处理Tags时间戳
//   const keyTags = [];
//   const modifyKeysLength = metadataTag.keyByteOffset.filepositions.length - 3;
//   let tagTimeSpace = Math.floor((newduration / modifyKeysLength) * 10) / 100;
//   for (let i = startTagIndex; i <= endTagIndex; i++) {
//     const tag: any = tags[i];
//     const newTimestamp = tag.getCombinedTimestamp() - startTimestamp;
//     if (newTimestamp % tagTimeSpace === 0 || i === endTagIndex) {
//       keyTags.push({
//         time: newTimestamp / 1000,
//         offset:
//           tag.config.currentOffset -
//           startTag.config.currentOffset +
//           headByteLength,
//       });
//     }
//     tag.setCombinedTimestamp(newTimestamp >= 0 ? newTimestamp : 0);
//   }

//   // 处理 metadata 内容
//   const metaDataTag = metadataTag;
//   // let i = 0;
//   // for (; i <= modifyKeysLength; i++) {
//   //   const { time, offset } = keyTags[i];
//   //   metaDataTag.dataView.setFloat64(
//   //     metaDataTag.keyByteOffset.filepositions[i + 1],
//   //     offset
//   //   );
//   //   metaDataTag.dataView.setFloat64(
//   //     metaDataTag.keyByteOffset.times[i + 1],
//   //     time
//   //   );
//   // }
//   // metaDataTag.dataView.setFloat64(
//   //   metaDataTag.keyByteOffset.filepositions[modifyKeysLength + 1],
//   //   keyTags[keyTags.length - 1].offset
//   // );
//   // metaDataTag.dataView.setFloat64(
//   //   metaDataTag.keyByteOffset.times[modifyKeysLength + 1],
//   //   keyTags[keyTags.length - 1].time
//   // );

//   metaDataTag.dataView.setFloat64(
//     metaDataTag.keyByteOffset.lasttimestamp,
//     endTag.getCombinedTimestamp() / 1000
//   );
//   metaDataTag.dataView.setFloat64(
//     metaDataTag.keyByteOffset.lastkeyframetimestamp,
//     endTag.getCombinedTimestamp() / 1000
//   );
//   metaDataTag.dataView.setFloat64(
//     metaDataTag.keyByteOffset.lastkeyframelocation,
//     endTag.config.currentOffset -
//       startTag.config.currentOffset +
//       headByteLength
//   );

//   return [
//     startTag.config.currentOffset,
//     endTag.config.currentOffset +
//       endTag.config.byteLength -
//       startTag.config.currentOffset,
//   ];
// };
