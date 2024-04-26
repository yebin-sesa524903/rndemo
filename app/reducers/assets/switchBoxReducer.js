'use strict';

import {
  BUILDING_INFO_LOAD_SUCCESS,
  SWITCH_BOX_LOAD_REQUEST, SWITCH_BOX_LOAD_SUCCESS, SWITCH_BOX_LOAD_FAILURE,
  LOGBOOK_UPDATE_SWITCH_BOX_SUCCESS,
  ASSET_IMAGE_CHANGED,
  ASSET_IMAGE_CHANGED_COMPLETE,
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';
import unit from '../../utils/unit.js';
import privilegeHelper from '../../utils/privilegeHelper.js';


var defaultState = Immutable.fromJS({
  panelId: null,
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
  var { body: { panelId }, response: { Result } } = action;
  var res = Result;
  var panelType = [];
  if (res.Number) {
    panelType.push({ 'title': '资产编号', 'value': res.Number, 'isNav': false, });
  }

  var logCount = res.SceneLogs.length;
  var tendingCount = res.HistoryTicketsCount;
  var ticketsCount = res.RunningTicketsCount;
  var singleLineCount = res.SingleLineDiagrams.length;
  var runningCount = res.RunningPlanCount;
  var allElements = [
    [{ title: '', value: res.LogoKey }],
    panelType,
  ];
  var allSecTitle = [
    '',
    '',
  ];

  //给维护日志tab组装数据
  let logPageData = [
    [{ title: '未完成工单', value: ticketsCount, isNav: true, type: 'ticketing' }],
    [{ title: '已完成工单', value: tendingCount, isNav: true, type: 'tending' }]
  ];
  let logPageSection = ['', '', '', ''];

  //地图显示相关
  let building = state.get('building');
  allSecTitle.push({ title: '配电箱位置', type: 'box_location' });
  allElements.push([{ type: 'location', title: '', boxLocation: res.Location, building }]);

  //添加父节点分组
  allSecTitle.push({ title: '', type: 'parent_node' });
  allElements.push([{ title: '父节点', value: res.ParentName, gotoParent: true }]);
  let parent = {
    Id: res.ParentId,
    Name: res.ParentName,
    parentType: res.ParentType,
    parentSubType: res.ParentSubType
  }

  return Immutable.fromJS({
    data: Immutable.fromJS(allElements),
    logPageData: Immutable.fromJS(logPageData),
    logPageSectionData: Immutable.fromJS(logPageSection),
    sectionData: Immutable.fromJS(allSecTitle),
    isFetching: false,
    logCount,
    isLogbook: res.IsLogbook === 1,
    locationImages: res.LocationImages,
    panelType: res.PanelType,
    boxData: res,
    panelId,
    parent
  });
}

function loadBuildingInfo(state, action) {
  let building = action.response.Result;
  building = Immutable.fromJS(building);
  state = state.set('building', building);
  //如果此接口后返回，则需要更新对应的值
  if (state.get('data')) {
    let data = state.get('data');
    let index = data.findIndex(item => {
      if (item && item.size > 0) {
        let find = item.findIndex(sub => sub.get('type') === 'location');
        if (find >= 0) return true;
      }
      return false;
    });
    if (index >= 0) {
      state = state.setIn(['data', index, 0, 'building'], building);
    }
  }
  return state;
}

function imageChanged(state, action) {
  let { data, hierarchyType } = action;
  if (hierarchyType !== 'switch_box') return state;
  if (data.length > 0) {
    let image = data[0];
    let newState = state.setIn(['data', 0, 0, 'pendingImageUri'], image.uri);
    return newState;
  }

  return state;

}

function imageChangedComplete(state, action) {
  let { data } = action;
  let newState = state;
  newState = newState.setIn(['data', 0, 0, 'value'], data);

  return newState;
}

function handleError(state, action) {
  let err = action.error.Error;
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
    action.error = err;
    strError = '';
  }
  return state.set('isFetching', false).set('errorMessage', strError);
}


export default function (state = defaultState, action) {
  switch (action.type) {
    case SWITCH_BOX_LOAD_REQUEST:
      return state.set('isFetching', true);
    case SWITCH_BOX_LOAD_SUCCESS:
      return updateAssetDetailData(state, action);
    case SWITCH_BOX_LOAD_FAILURE:
      state = state.set('isFetching', false);
      return handleError(state, action);
    case BUILDING_INFO_LOAD_SUCCESS:
      return loadBuildingInfo(state, action);
    case ASSET_IMAGE_CHANGED:
      return imageChanged(state, action);
    case ASSET_IMAGE_CHANGED_COMPLETE:
      return imageChangedComplete(state, action);
    default:

  }
  return state;
}
