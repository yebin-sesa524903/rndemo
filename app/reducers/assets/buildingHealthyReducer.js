'use strict';

import {
  BUILDING_HEALTHY_REQUEST,
  BUILDING_HEALTHY_SUCCESS,
  BUILDING_HEALTHY_FAILURE,
  RESET_HEALTHY_DATA,
  BUILDING_TRANSFORMER_REQUEST, BUILDING_TRANSFORMER_SUCCESS, BUILDING_TRANSFORMER_FAILURE,
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  dataHealthy: null,
  dataTransformer: null,
  isFetching: false,
  hierarchyId: null,
  filter: {
    AssetTaskType: 1,
    CurrentPage: 1,
  }
});

function startHealthyRequest(state, action) {
  if (!state.get('dataHealthy') || !state.get('dataTransformer')) {
    state = state.set('isFetching', true);
  }
  return state;
}

function updateData(state, action) {
  var { hierarchyId } = action;
  console.warn();
  var result = action.response.Result;
  var newState = state;

  // response=JSON.parse('{"Error":"0","Message":[""],"RequestId":null,"Result":{"RiskFactor":67,"Items":[{"HealthLevel":0,"EmergencyLevel":0,"Count":90,"DeviceHealthInfo":[{"DeviceId":346684,"DeviceName":"(0,0)BoxB所在配电室-设备1","AlarmInfos":[]},{"DeviceId":346685,"DeviceName":"(0,0)BoxB所在配电室-设备2","AlarmInfos":[]},{"DeviceId":346760,"DeviceName":"设备1","AlarmInfos":[]},{"DeviceId":346761,"DeviceName":"设备2","AlarmInfos":[]},{"DeviceId":346762,"DeviceName":"设备3","AlarmInfos":[]},{"DeviceId":346763,"DeviceName":"设备4","AlarmInfos":[]},{"DeviceId":346764,"DeviceName":"设备5","AlarmInfos":[]},{"DeviceId":346765,"DeviceName":"设备6","AlarmInfos":[]},{"DeviceId":346766,"DeviceName":"设备7","AlarmInfos":[]},{"DeviceId":346767,"DeviceName":"设备8","AlarmInfos":[]},{"DeviceId":346768,"DeviceName":"设备9","AlarmInfos":[]},{"DeviceId":346769,"DeviceName":"设备10","AlarmInfos":[]},{"DeviceId":346770,"DeviceName":"设备11","AlarmInfos":[]},{"DeviceId":346771,"DeviceName":"设备12","AlarmInfos":[]},{"DeviceId":346772,"DeviceName":"设备13","AlarmInfos":[]},{"DeviceId":346773,"DeviceName":"设备14","AlarmInfos":[]},{"DeviceId":346775,"DeviceName":"设备16","AlarmInfos":[]},{"DeviceId":346776,"DeviceName":"设备17","AlarmInfos":[]},{"DeviceId":346777,"DeviceName":"设备18","AlarmInfos":[]},{"DeviceId":346778,"DeviceName":"设备19","AlarmInfos":[]},{"DeviceId":346779,"DeviceName":"设备20","AlarmInfos":[]},{"DeviceId":346780,"DeviceName":"设备21","AlarmInfos":[]},{"DeviceId":346781,"DeviceName":"设备22","AlarmInfos":[]},{"DeviceId":346782,"DeviceName":"设备23","AlarmInfos":[]},{"DeviceId":346783,"DeviceName":"设备24","AlarmInfos":[]},{"DeviceId":346784,"DeviceName":"设备25","AlarmInfos":[]},{"DeviceId":346785,"DeviceName":"设备26","AlarmInfos":[]},{"DeviceId":346786,"DeviceName":"设备27","AlarmInfos":[]},{"DeviceId":346787,"DeviceName":"设备28","AlarmInfos":[]},{"DeviceId":346788,"DeviceName":"设备29","AlarmInfos":[]},{"DeviceId":346789,"DeviceName":"设备30","AlarmInfos":[]},{"DeviceId":346790,"DeviceName":"设备31","AlarmInfos":[]},{"DeviceId":346791,"DeviceName":"设备32","AlarmInfos":[]},{"DeviceId":346792,"DeviceName":"设备33","AlarmInfos":[]},{"DeviceId":346793,"DeviceName":"设备34","AlarmInfos":[]},{"DeviceId":346794,"DeviceName":"设备35","AlarmInfos":[]},{"DeviceId":346795,"DeviceName":"设备36","AlarmInfos":[]},{"DeviceId":346796,"DeviceName":"设备37","AlarmInfos":[]},{"DeviceId":346797,"DeviceName":"设备38","AlarmInfos":[]},{"DeviceId":346798,"DeviceName":"设备39","AlarmInfos":[]},{"DeviceId":346799,"DeviceName":"设备40","AlarmInfos":[]},{"DeviceId":346800,"DeviceName":"设备41","AlarmInfos":[]},{"DeviceId":346801,"DeviceName":"设备42","AlarmInfos":[]},{"DeviceId":346802,"DeviceName":"设备43","AlarmInfos":[]},{"DeviceId":346803,"DeviceName":"设备44","AlarmInfos":[]},{"DeviceId":346804,"DeviceName":"设备45","AlarmInfos":[]},{"DeviceId":346805,"DeviceName":"设备46","AlarmInfos":[]},{"DeviceId":346806,"DeviceName":"设备47","AlarmInfos":[]},{"DeviceId":346807,"DeviceName":"设备48","AlarmInfos":[]},{"DeviceId":346808,"DeviceName":"设备49","AlarmInfos":[]},{"DeviceId":346809,"DeviceName":"设备50","AlarmInfos":[]},{"DeviceId":346810,"DeviceName":"设备51","AlarmInfos":[]},{"DeviceId":346811,"DeviceName":"设备52","AlarmInfos":[]},{"DeviceId":346819,"DeviceName":"设备53","AlarmInfos":[]},{"DeviceId":346812,"DeviceName":"设备54","AlarmInfos":[]},{"DeviceId":346813,"DeviceName":"设备55","AlarmInfos":[]},{"DeviceId":346814,"DeviceName":"设备56","AlarmInfos":[]},{"DeviceId":346815,"DeviceName":"设备57","AlarmInfos":[]},{"DeviceId":346816,"DeviceName":"设备58","AlarmInfos":[]},{"DeviceId":346817,"DeviceName":"设备59","AlarmInfos":[]},{"DeviceId":346818,"DeviceName":"设备60","AlarmInfos":[]},{"DeviceId":346820,"DeviceName":"设备61","AlarmInfos":[]},{"DeviceId":346821,"DeviceName":"设备62","AlarmInfos":[]},{"DeviceId":346822,"DeviceName":"设备63","AlarmInfos":[]},{"DeviceId":346823,"DeviceName":"设备64","AlarmInfos":[]},{"DeviceId":346824,"DeviceName":"设备65","AlarmInfos":[]},{"DeviceId":346825,"DeviceName":"设备66","AlarmInfos":[]},{"DeviceId":346826,"DeviceName":"设备67","AlarmInfos":[]},{"DeviceId":346827,"DeviceName":"设备68","AlarmInfos":[]},{"DeviceId":346828,"DeviceName":"设备69","AlarmInfos":[]},{"DeviceId":346829,"DeviceName":"设备70","AlarmInfos":[]},{"DeviceId":346830,"DeviceName":"设备71","AlarmInfos":[]},{"DeviceId":346831,"DeviceName":"设备72","AlarmInfos":[]},{"DeviceId":346832,"DeviceName":"设备73","AlarmInfos":[]},{"DeviceId":346994,"DeviceName":"设备1","AlarmInfos":[]},{"DeviceId":346995,"DeviceName":"设备2","AlarmInfos":[]},{"DeviceId":346996,"DeviceName":"设备3","AlarmInfos":[]},{"DeviceId":346997,"DeviceName":"设备4","AlarmInfos":[]},{"DeviceId":346998,"DeviceName":"设备5","AlarmInfos":[]},{"DeviceId":346999,"DeviceName":"设备6","AlarmInfos":[]},{"DeviceId":347000,"DeviceName":"设备7","AlarmInfos":[]},{"DeviceId":347001,"DeviceName":"设备8","AlarmInfos":[]},{"DeviceId":347002,"DeviceName":"设备9","AlarmInfos":[]},{"DeviceId":347003,"DeviceName":"设备10","AlarmInfos":[]},{"DeviceId":347004,"DeviceName":"设备11","AlarmInfos":[]},{"DeviceId":347005,"DeviceName":"设备12","AlarmInfos":[]},{"DeviceId":347006,"DeviceName":"设备13","AlarmInfos":[]},{"DeviceId":347007,"DeviceName":"设备14","AlarmInfos":[]},{"DeviceId":346662,"DeviceName":"boxB-机柜1-设备1-d","AlarmInfos":[]},{"DeviceId":346666,"DeviceName":"boxB-机柜1-设备1-h","AlarmInfos":[]}]},{"HealthLevel":1,"EmergencyLevel":1,"Count":2,"DeviceHealthInfo":[{"DeviceId":346694,"DeviceName":"BoxB-机柜4-设备1","AlarmInfos":[{"Code":"702","Name":"超高负载运行","Value":"100","DiagnoseId":590,"UomName":"%"}]},{"DeviceId":346706,"DeviceName":"BoxB-机柜8-设备1","AlarmInfos":[{"Code":"702","Name":"超高负载运行","Value":"100","DiagnoseId":596,"UomName":"%"}]}]},{"HealthLevel":2,"EmergencyLevel":0,"Count":3,"DeviceHealthInfo":[{"DeviceId":346700,"DeviceName":"BoxB-机柜6-设备1","AlarmInfos":[{"Code":"704","Name":"严重负载不平衡","Value":"100","DiagnoseId":591,"UomName":"%"}]},{"DeviceId":346661,"DeviceName":"boxB-机柜1-设备1-c","AlarmInfos":[{"Code":"722","Name":"系统频率异常","Value":"0","DiagnoseId":728,"UomName":"Hz"}]},{"DeviceId":346660,"DeviceName":"boxB-机柜1-设备1-b","AlarmInfos":[{"Code":"722","Name":"系统频率异常","Value":"0","DiagnoseId":727,"UomName":"Hz"}]}]},{"HealthLevel":2,"EmergencyLevel":2,"Count":1,"DeviceHealthInfo":[{"DeviceId":346704,"DeviceName":"BoxB-机柜7-设备2","AlarmInfos":[{"Code":"704","Name":"严重负载不平衡","Value":"100","DiagnoseId":594,"UomName":"%"},{"Code":"712","Name":"系统电压谐波严重","Value":"100","DiagnoseId":595,"UomName":"%"}]}]},{"HealthLevel":2,"EmergencyLevel":1,"Count":2,"DeviceHealthInfo":[{"DeviceId":346703,"DeviceName":"BoxB-机柜7-设备1","AlarmInfos":[{"Code":"717","Name":"电压严重不平衡","Value":"100","DiagnoseId":611,"UomName":"%"}]},{"DeviceId":346659,"DeviceName":"boxB-机柜1-设备1-a","AlarmInfos":[{"Code":"702","Name":"超高负载运行","Value":"100","DiagnoseId":716,"UomName":"%"},{"Code":"722","Name":"系统频率异常","Value":"0","DiagnoseId":726,"UomName":"Hz"}]}]},{"HealthLevel":1,"EmergencyLevel":0,"Count":2,"DeviceHealthInfo":[{"DeviceId":346686,"DeviceName":"(Inc Green)BoxB所在配电室-设备3","AlarmInfos":[{"Code":"703","Name":"负载不平衡","Value":"60","DiagnoseId":612,"UomName":"%"}]},{"DeviceId":346712,"DeviceName":"BoxB-机柜10-设备1","AlarmInfos":[{"Code":"703","Name":"负载不平衡","Value":"60","DiagnoseId":613,"UomName":"%"}]}]},{"HealthLevel":0,"EmergencyLevel":1,"Count":2,"DeviceHealthInfo":[{"DeviceId":346713,"DeviceName":"BoxB-机柜10-设备2","AlarmInfos":[{"Code":"711","Name":"系统电压谐波高","Value":"60","DiagnoseId":614,"UomName":"%"}]},{"DeviceId":346687,"DeviceName":"(Other Green)BoxB所在配电室-设备4","AlarmInfos":[{"Code":"711","Name":"系统电压谐波高","Value":"60","DiagnoseId":615,"UomName":"%"}]}]}]}};');

  newState = newState.set('dataHealthy', Immutable.fromJS(result))
    .set('hierarchyId', hierarchyId);
  if (newState.get('dataHealthy') && newState.get('dataTransformer')) {
    newState = newState.set('isFetching', false);
  }

  return newState;
}

function updateTransformerData(state, action) {
  var { hierarchyId } = action;
  var result = action.response.Result;
  var newState = state;

  newState = newState.set('dataTransformer', Immutable.fromJS(result))
    .set('hierarchyId', hierarchyId);
  if (newState.get('dataHealthy') && newState.get('dataTransformer')) {
    newState = newState.set('isFetching', false);
  }
  return newState;
}

function handleError(state, action) {
  var err = action.error.Error;
  // console.warn('handleError',action);

  switch (err) {
    case '040001307022':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      state = state.set('dataHealthy', Immutable.fromJS(null));
      state = state.set('dataTransformer', Immutable.fromJS(null));
      break;
  }
  return state.set('isFetching', false);
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case BUILDING_HEALTHY_REQUEST:
      return startHealthyRequest(state, action);
    case BUILDING_TRANSFORMER_REQUEST:
      return startHealthyRequest(state, action);
    case BUILDING_HEALTHY_SUCCESS:
      return updateData(state, action);
    case BUILDING_TRANSFORMER_SUCCESS:
      return updateTransformerData(state, action);
    case BUILDING_HEALTHY_FAILURE:
      return handleError(state, action);
    case RESET_HEALTHY_DATA:
      return defaultState;
    default:

  }
  return state;
}
