import ifvisible from 'ifvisible';

chrome.storage.sync.get(['config'], function (result) {
  const { triggerTime = 300 } = result.config || {};
  ifvisible.setIdleDuration(triggerTime); // 闲置多久认为是闲置，单位 秒
});

// 闲置触发的操作
// ifvisible.idle(function(){
//   console.log('认为闲置')
// });
