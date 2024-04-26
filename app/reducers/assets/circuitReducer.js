'use strict';

import {
  CIRCUIT_LOAD_REQUEST,
  CIRCUIT_LOAD_SUCCESS,
  CIRCUIT_LOAD_FAILURE,
  PANEL_SAVE_ENV_FAILURE,
  LOGBOOK_UPDATE_PANEL_SUCCESS,
  CIRCUIT_LOAD_ALL_PARAMETERS_REQUEST,
  CIRCUIT_LOAD_ALL_PARAMETERS_SUCCESS,
  CIRCUIT_LOAD_ALL_PARAMETERS_FAILURE,
  CIRCUIT_LOAD_RISK_HISTORY_DATA_REQUEST,
  CIRCUIT_LOAD_RISK_HISTORY_DATA_SUCCESS,
  CIRCUIT_LOAD_RISK_HISTORY_DATA_FAILURE,
  CIRCUIT_LOAD_MONITOR_DATA_SUCCESS,
  CIRCUIT_LOAD_MONITOR_DATA_FAILURE,
  CIRCUIT_LOAD_RUNTIME_SETTING_DATA_SUCCESS,
  CIRCUIT_LOAD_RUNTIME_SETTING_DATA_FAILURE,
  CIRCUIT_CHANGE_RISK_DATE,
  CIRCUIT_RESET, CIRCUIT_PARAM_EXPAND,
  CIRCUIT_LOAD_SENSOR_DATA_REQUEST,
  CIRCUIT_LOAD_SENSOR_DATA_SUCCESS,
  CIRCUIT_LOAD_SENSOR_DATA_FAILURE,
  CIRCUIT_LOAD_REDDOT_DATA_SUCCESS,
  CIRCUIT_LOAD_REDDOT_DATA_FAILURE
} from '../../actions/assetsAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';
import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  circuitId: null,
  data: null,
  sectionData: [],
  isFetching: false,
  logCount: '',
  errorMessage: null,
  logPageData: [],
  logPageSectionData: [],
  panelType: null
});


function updateAssetDetailData(state, action) {
  var { data: { circuitId }, response: { Result } } = action;
  // let {url,body,types} = action;
  var res = Result;

  var arrStatistic =
    res.StatisticData.BasicStatistic.
      concat(res.StatisticData.DeviceStatistic || []).
      map((item) => {
        return {
          title: item.Key,
          value: (item.Value + item.Unit),
          isNav: false,
        }
      });

  var tendingCount = res.HistoryTicketsCount;
  var ticketsCount = res.RunningTicketsCount;
  var singleLineCount = res.SingleLineDiagrams.length;
  var allElements = [
    [{ title: '资产文档', value: singleLineCount, isNav: true, type: 'singleLine' }],
  ];
  var allSecTitle = [
    '',
  ];

  //给维护日志tab组装数据
  let logPageData = [
    [{ title: '未完成工单', value: ticketsCount, isNav: true, type: 'ticketing' }],
    [{ title: '已完成工单', value: tendingCount, isNav: true, type: 'tending' }]
  ];
  let logPageSection = ['', ''];

  //missing log
  if (arrStatistic.length > 0) {
    allSecTitle.push('统计信息');
    allElements.push(arrStatistic);
  }

  var arrSinglePhotos = res.SingleLineDiagrams;
  arrSinglePhotos.forEach((item, index) => {
    if (item.FileType) {
      //item.FileName = item.ImageId + '.' + item.FileType;
      item.PictureId = item.ImageId;
    }
  });

  allSecTitle.push(' ');
  allElements.push([{ title: '父节点', value: res.ParentName, gotoParent: true }]);
  let parent = {
    Id: res.ParentId,
    Name: res.ParentName,
    parentType: res.ParentType,
    parentSubType: res.ParentSubType
  }
  let isFetching = state.get('paramFetching');

  return state.merge(Immutable.Map(Immutable.fromJS({
    data: Immutable.fromJS(allElements),
    logPageData: Immutable.fromJS(logPageData),
    logPageSectionData: Immutable.fromJS(logPageSection),
    sectionData: Immutable.fromJS(allSecTitle),
    isFetching: isFetching,
    circuitFetching: false,
    circuitId,
    gid: res.GatewayUniqueId,
    networkType: res.NetworkType,
    isLookbook: res.IsAsset,
    arrSinglePhotos: Immutable.fromJS(arrSinglePhotos),
    parent
  })));
}

function loadAllParameters(state, action) {
  state = state.set('paramFetching', false).set('isFetching', state.get('circuitFetching'));
  let result = action.response.Result;
  //判断是否显示概览页
  if (!result.DeviceAgingData && !result.BreakerDeviceId && result.Parameters.length === 0 &&
    result.Sensors.length === 0) {
    return state.set('showOverview', false);
  }
  let AgingData = result.DeviceAgingData;

  if (AgingData && AgingData.State !== 0 && AgingData.State !== -3 && AgingData.State !== -7) {
    let status = AgingData.State;
    let errStr = null;
    switch (status) {
      case -1:
        errStr = '该型号的断路器不支持老化参数计算';
        break;
      case -2:
        errStr = '环境参数配置不全，请检查断路器所在配电柜信息的【环境参数】';
        break;
      case -4:
        errStr = '断路器负载率运行时间为无效值，请检查断路器的【维护参数】';
        break;
      case -5:
        errStr = '断路器老化参数计算初始化异常';
        break;
      case -6:
        errStr = '断路器老化参数计算出现异常';
        break;
      case -8:
        errStr = '断路器触头磨损率为无效值，请检查断路器的【维护参数】';
        break;
      default:
        errStr = null;
    }
    state = state.set('agingData', Immutable.fromJS({
      value: AgingData.Aging,
      errStr
    }))
  }
  state = state.set('showOverview', true);
  let parameters = [];
  let power = [];
  let monitorDot = [];
  let runtimeDot = [];
  let monitorDeviceIds = [];
  let paramGroup = [];
  if (result.Parameters && result.Parameters.length > 0) {
    result.Parameters.forEach(g => {
      if (!g.MonitorParameters || g.MonitorParameters.length === 0) return;
      let group = null;
      if (g.GroupOrder >= 0 && g.Name) {
        group = {
          title: g.Name,
          isExpanded: true,
          data: []
        };
        paramGroup.push(group);
      }

      g.MonitorParameters.forEach(p => {
        if (p.Type === 2) {
          monitorDot.push(p.UniqueId);
          monitorDeviceIds.push(p.DeviceId);
        }
        if (p.Type === 5) {
          runtimeDot.push(p.UniqueId);
        }
        switch (p.DeviceParameterName) {
          case '长延时保护电流（Ir）':
            power[0] = {
              value: p.Value,
              uid: p.UniqueId
            };
            return;
          case 'A相电流最大需量':
            power[1] = {
              value: p.Value,
              uid: p.UniqueId
            };
            return;
          case 'B相电流最大需量':
            power[2] = {
              value: p.Value,
              uid: p.UniqueId
            };
            return;
          case 'C相电流最大需量':
            power[3] = {
              value: p.Value,
              uid: p.UniqueId
            };
            return;
        }
        let value = `${p.FinVal === null ? '--' : p.FinVal}${p.Unit}`;

        group && group.data.push({
          title: p.DeviceParameterName,
          value,
          type: p.Type,
          id: p.UniqueId,
          unit: p.Unit
        })
        //非以上名称，通用显示
        parameters.push({
          title: p.DeviceParameterName,
          value,
          type: p.Type,
          id: p.UniqueId,
          unit: p.Unit
        });
      });
    });

  }
  //power显示必须要有4个值
  if (power.length !== 4) {
    power = [];
  } else {
    power.forEach(p => {
      if (!p) power = [];
    })
  }

  //排序
  parameters.sort((p1, p2) => p2.type - p1.type);
  state = state.set('power', Immutable.fromJS(power)).set('parameters', Immutable.fromJS(parameters))
    .set('bid', result.BreakerDeviceId).set('sensors', Immutable.fromJS(result.Sensors)).
    set('monitorDot', monitorDot).set('runtimeDot', runtimeDot).set('monitorDeviceIds', monitorDeviceIds)
    .set('paramGroup', Immutable.fromJS(paramGroup));
  return state;
}

function updateMonitorData(state, action) {
  let data = action.response.Result;
  let parameters = state.get('paramGroup');
  if (data && data.length > 0) {
    data.forEach(dot => {
      parameters.forEach((g, gid) => {
        let index = g.get('data').findIndex(p => p.get('id') === dot.Id);
        if (index >= 0) {
          let unit = g.getIn(['data', index, 'unit']);
          let value = `${dot.Val === null ? '--' : dot.Val}${unit || ''}`;
          g = g.setIn(['data', index, 'value'], value);
          parameters = parameters.set(gid, g);
        }
      })

    });
  }
  return state.set('paramGroup', parameters);
}

function updateRuntimeData(state, action) {
  let data = action.response.Result.Parameters;
  let parameters = state.get('paramGroup');
  let power = state.get('power');
  if (data && data.length > 0) {
    data.forEach(dot => {
      if (parameters) {
        parameters.forEach((g, gid) => {
          let index = g.get('data').findIndex(p => p.get('id') === dot.UniqueId);
          if (index >= 0) {
            let value = `${dot.FinVal === null ? '--' : dot.FinVal}${dot.Unit || ''}`;
            g = g.setIn(['data', index, 'value'], value);
            parameters = parameters.set(gid, g);
          }
        })
      }

      let index = power.findIndex(p => p.get('uid') === dot.UniqueId);
      if (index >= 0) {
        power = power.setIn([index, 'value'], dot.FinVal);
      }
    });
  }
  return state.set('paramGroup', parameters).set('power', power);
}

function loadRiskHistoryData(state, action) {
  return state.set('riskData', Immutable.fromJS(action.response.Result)).set('riskFetching', false);
}

function setSensorDeviceData(state, id, data) {
  let sensorData = state.get('sensorData');
  if (!sensorData) {
    sensorData = Immutable.fromJS({});
  }
  sensorData = sensorData.set(id, data);
  return state.set('sensorData', sensorData);
}

function loadSensorsData(state, action) {
  let deviceId = action.body.DeviceId;
  let data = {
    isFetching: false,
    data: action.response.Result.ThermalSensorData
  }
  return setSensorDeviceData(state, deviceId, data);
}

function loadRedDotData(state, action) {
  let data = action.response.Result;
  return state.set('redDot', data);
}

function handleError(state, action) {
  var err = action.error.Error;
  // console.warn('handleError',Error);
  var strError = null;
  switch (err) {
    case '040001307022':
      strError = '您没有这一项的操作权限，请联系系统管理员';
      action.error = null;
      break;
    case '040000307009':
      strError = '无查看资产权限，联系管理员';
      action.error = null;
      break;
  }
  if (action.error === '403') {
    action.error = Error;
    strError = '';
  }
  if (action.error === '404') {
    action.error = null;
    strError = '404';
  }
  return state.set('isFetching', false).set('errorMessage', strError);
}


export default function (state = defaultState, action) {
  switch (action.type) {
    case CIRCUIT_LOAD_REQUEST:
      return state.set('isFetching', true).set('circuitFetching', true);
    case CIRCUIT_LOAD_ALL_PARAMETERS_REQUEST:
      return state.set('paramFetching', true);
    case CIRCUIT_LOAD_ALL_PARAMETERS_SUCCESS:
      return loadAllParameters(state, action);
    case CIRCUIT_LOAD_RISK_HISTORY_DATA_SUCCESS:
      return loadRiskHistoryData(state, action);
    case CIRCUIT_LOAD_RISK_HISTORY_DATA_REQUEST:
      return state.set('riskFetching', true).set('riskErr', null);
    case CIRCUIT_LOAD_REDDOT_DATA_FAILURE:
    case CIRCUIT_LOAD_RUNTIME_SETTING_DATA_FAILURE:
    case CIRCUIT_LOAD_MONITOR_DATA_FAILURE:
      action.error = null;
      return state;
    case CIRCUIT_LOAD_RUNTIME_SETTING_DATA_SUCCESS:
      return updateRuntimeData(state, action);
    case CIRCUIT_LOAD_MONITOR_DATA_SUCCESS:
      return updateMonitorData(state, action);
    case CIRCUIT_CHANGE_RISK_DATE:
      return state.set('riskDate', action.date);
    case CIRCUIT_LOAD_REDDOT_DATA_SUCCESS:
      return loadRedDotData(state, action);
    case CIRCUIT_LOAD_SUCCESS:
      return updateAssetDetailData(state, action);
    case CIRCUIT_LOAD_SENSOR_DATA_REQUEST:
      return setSensorDeviceData(state, action.body.DeviceId, { isFetching: true });
    case CIRCUIT_LOAD_SENSOR_DATA_SUCCESS:
      return loadSensorsData(state, action);
    case CIRCUIT_LOAD_SENSOR_DATA_FAILURE:
      action.error = null;
      return setSensorDeviceData(state, action.body.DeviceId, { isFetching: false, err: true });

    case CIRCUIT_LOAD_ALL_PARAMETERS_FAILURE:
      state = state.set('paramFetching', false).set('isFetching', state.get('circuitFetching'))
      return handleError(state, action);

    case CIRCUIT_LOAD_FAILURE:
      state = state.set('circuitFetching', false).set('isFetching', state.get('paramFetching'))
      return handleError(state, action);
    case CIRCUIT_PARAM_EXPAND:
      let index = action.index;
      let value = state.getIn(['paramGroup', index, 'isExpanded'])
      console.log('---->', index, value);
      return state.setIn(['paramGroup', index, 'isExpanded'], !value);
    case CIRCUIT_LOAD_RISK_HISTORY_DATA_FAILURE:
      return handleError(state, action);
    case CIRCUIT_RESET:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
