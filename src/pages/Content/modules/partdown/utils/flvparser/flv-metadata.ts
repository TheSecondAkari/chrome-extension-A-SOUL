/***
 * Copyright (C) 2018 Qli5. All Rights Reserved.
 *
 * @author qli5 <goodlq11[at](163|gmail).com>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable */
// @ts-nocheck

// import TwentyFourDataView from '../utils/twenty-four-dataview';

const dataTypeMap = {
  0: 'number', // size length 8 float
  1: 'boolean', // size length 1
  2: 'string', // size length 2
  3: 'object',
  8: 'array', // size length 4
  10: 'strict_array', // size length 4
};

class FLVMetaData {
  constructor(dataView) {
    this.parseIndex = 0;
    this.dataView = dataView;
    this.keyByteOffset = {};
    const first_amf = this.get_first_AMF_package(dataView);
    const second_amf = this.get_second_AMF_package(dataView);
    this.config = { first_amf, second_amf };
    this.parseIndex = 0;
  }

  get_first_AMF_package(dataView) {
    const type = dataTypeMap[dataView.getUint8(this.parseIndex)];
    this.parseIndex += 1;
    if (type === 'string') {
      const value = this.data_string(dataView);
      return value;
    } else {
      throw new Error('is not first package');
    }
  }

  get_second_AMF_package(dataView) {
    const result = {};
    var { type, arraymap_length } = this.get_data_info(dataView);
    if (type === 'array') {
      result.arraymap = this.deal_array(dataView);
      result.arraymap.length = arraymap_length;
    }
    return result;
  }

  data_string(dataView) {
    const data_length = dataView.getUint16(this.parseIndex);
    this.parseIndex += 2;
    let str = '';
    for (let i = 0; i < data_length; i++) {
      str += String.fromCharCode(dataView.getUint8(this.parseIndex));
      this.parseIndex += 1;
    }
    return str;
  }

  get_data_info(dataView, keyOffset) {
    const type = dataTypeMap[dataView.getUint8(this.parseIndex)];
    this.parseIndex += 1;

    if (keyOffset) {
      if (['filepositions', 'times'].includes(keyOffset)) {
        !this.keyByteOffset[keyOffset] && (this.keyByteOffset[keyOffset] = []);
        this.keyByteOffset[keyOffset].push(this.parseIndex);
      } else {
        this.keyByteOffset[keyOffset] = this.parseIndex;
      }
    }

    if (type === 'string') {
      const value = this.data_string(dataView);
      return { type, value };
    }
    if (type === 'number') {
      const value = dataView.getFloat64(this.parseIndex);
      this.parseIndex += 8;
      return { type, value };
    }
    if (type === 'boolean') {
      const value = dataView.getUint8(this.parseIndex) ? true : false;
      this.parseIndex += 1;
      return { type, value };
    }
    if (type === 'array') {
      const data_length = dataView.getUint32(this.parseIndex);
      this.parseIndex += 4;
      return { type, arraymap_length: data_length };
    }
    if (type === 'strict_array') {
      const data_length = dataView.getUint32(this.parseIndex);
      this.parseIndex += 4;
      return { type, strict_array_length: data_length };
    }
    if (type === 'object') {
      return { type };
    }
  }

  deal_array(dataView, obj = {}) {
    const itemKey = this.data_string(dataView);
    const { value: itemValue, type } = this.get_data_info(dataView, itemKey);
    if (type !== 'object') {
      obj[itemKey] = itemValue;
      return this.deal_array(dataView, obj);
    } else {
      obj[itemKey] = this.deal_object(dataView);
      // obj["end-mark"] = dataView.buffer.slice(this.parseIndex);
      return obj;
    }
  }

  // 处理 当type为object当情况
  deal_object(dataView, obj = {}) {
    if (dataView.byteLength - this.parseIndex < 8) {
      return obj;
    }
    const itemKey = this.data_string(dataView);
    var { type, strict_array_length } = this.get_data_info(dataView);
    obj[itemKey] = {
      length: strict_array_length,
      data: [],
      key: itemKey,
    };
    if (type === 'strict_array') {
      this.deal_object_data(dataView, obj[itemKey]);
      return this.deal_object(dataView, obj);
    }
  }

  // 处理 keyframes 的元信息
  deal_object_data(dataView, obj) {
    if (obj.data.length >= obj.length) {
      return obj;
    }
    var { type, value } = this.get_data_info(dataView, obj.key);
    if (type === 'number') {
      // 判断数据是不是到达指定的长度
      obj.data.push(value);
      return this.deal_object_data(dataView, obj);
    } else {
      return obj;
    }
  }

  get tagType() {
    return this.tagHeader.getUint8(0);
  }

  get dataSize() {
    return this.tagHeader.getUint24(1);
  }

  get timestamp() {
    return this.tagHeader.getUint24(4);
  }

  get timestampExtension() {
    return this.tagHeader.getUint8(7);
  }

  get streamID() {
    return this.tagHeader.getUint24(8);
  }

  // stripKeyframesScriptData() {
  //     let hasKeyframes = 'hasKeyframes\x01';
  //     let keyframes = '\x00\x09keyframs\x03';
  //     if (this.tagType != 0x12) throw 'can not strip non-scriptdata\'s keyframes';

  //     let index;
  //     index = this.tagData.indexOf(hasKeyframes);
  //     if (index != -1) {
  //         //0x0101 => 0x0100
  //         this.tagData.setUint8(index + hasKeyframes.length, 0x00);
  //     }

  //     // Well, I think it is unnecessary
  //     /*index = this.tagData.indexOf(keyframes)
  //     if (index != -1) {
  //         this.dataSize = index;
  //         this.tagHeader.setUint24(1, index);
  //         this.tagData = new TwentyFourDataView(this.tagData.buffer, this.tagData.byteOffset, index);
  //     }*/
  // }

  // getDuration() {
  //     if (this.tagType != 0x12) throw 'can not find non-scriptdata\'s duration';

  //     let duration = 'duration\x00';
  //     let index = this.tagData.indexOf(duration);
  //     if (index == -1) throw 'can not get flv meta duration';

  //     index += 9;
  //     return this.tagData.getFloat64(index);
  // }

  // getDurationAndView() {
  //     if (this.tagType != 0x12) throw 'can not find non-scriptdata\'s duration';

  //     let duration = 'duration\x00';
  //     let index = this.tagData.indexOf(duration);
  //     if (index == -1) throw 'can not get flv meta duration';

  //     index += 9;
  //     return {
  //         duration: this.tagData.getFloat64(index),
  //         durationDataView: new TwentyFourDataView(this.tagData.buffer, this.tagData.byteOffset + index, 8)
  //     };
  // }

  // getCombinedTimestamp() {
  //     return (this.timestampExtension << 24 | this.timestamp);
  // }

  // setCombinedTimestamp(timestamp) {
  //     if (timestamp < 0) throw 'timestamp < 0';
  //     this.tagHeader.setUint8(7, timestamp >> 24);
  //     this.tagHeader.setUint24(4, timestamp & 0x00FFFFFF);
  // }
}

export default FLVMetaData;
