'use strict';

import { LOAD_CLIPBOARD, RESET_CLIPBOARD } from '../actions/appAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.Map({ itemId: null, itemType: null, content: null })//alarm,ticket

function parseClipContent(text) {
  var itemId = null;
  var itemType = null;
  var content = null;
  if (text.length >= 6) {
    // 施耐德电气EnergyHub提示您有新工单(406)，请按时执行。
    // 施耐德电气EnergyHub提示您设备报警(32A35)，请及时检查响应!
    var retAlarmStart = text.match(/\(([a-zA-Z0-9]*)\)/);
    // console.warn('ddddd',text,retAlarmStart);
    if (!retAlarmStart || retAlarmStart.length < 2) {
      return {
        itemId: null,
        itemType: null,
        content: null,
      }
    }
    var keyInfo = retAlarmStart[1];
    var strApp = keyInfo.substr(0, 2);
    var strMethod = keyInfo.substr(2, 1);
    var strId = keyInfo.substring(3);

    if (keyInfo.length <= 4 || strApp !== '01') {//01EnergyHub,02灯塔,04云能效,08万丈云
      return {
        itemId: null,
        itemType: null,
        content: null,
      }
    }

    console.warn(`strApp=${strApp} strMethod=${strMethod} strId=${strId}`);
    // console.warn('retTicket,retAlarm',retTicket,retAlarm);
    if (strMethod === '2') {
      itemId = strId;
      itemType = 'alarm';
      content = '您有报警，请查看!';
    } else if (strMethod === '4') {
      itemId = strId;
      itemType = 'ticket';
      content = '您有工单，请查看!';
    } else if (strMethod === '6') {
      itemId = strId;
      itemType = 'ticket';
      content = '工单已完成，请查看!';
    } else if (strMethod === '8') {
      itemId = strId;
      itemType = 'ticket';
      content = '工单已提交，请查看!';
    } else if (strMethod === '9') {
      itemId = strId;
      itemType = 'ticket';
      content = '您有工单被驳回，请查看!';
    }
  }
  return {
    itemId,
    itemType,
    content,
  }
}

function loadClipboard(state, action) {
  if (action.content) {
    var { itemId, itemType, content } = parseClipContent(action.content);
    return state.set('itemId', itemId).set('itemType', itemType).set('content', content);
  }
  return state;
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case LOAD_CLIPBOARD:
      return loadClipboard(state, action);
    case RESET_CLIPBOARD:
      return defaultState;
  }
  return state;
}
