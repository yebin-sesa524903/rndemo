'use strict';

import {
  BINDHIERARCHY_LOAD_REQUEST, BINDHIERARCHY_LOAD_SUCCESS, BINDHIERARCHY_LOAD_FAILURE,
  HIERARCHY_BIND_QR_SUCCESS, BIND_HIERARCHY_FILTER, BIND_HIERARCHY_CLEAR
} from '../../actions/assetsAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';

import Immutable from 'immutable';
import trackApi from "../../utils/trackApi";



var defaultState = Immutable.fromJS({
  scanData: null,
  scanHierarchyId: null,
  buildId: null,
  data: null,
  isFetching: false,
  customerId: null,
  customerName: null,
  buildName: null,
  keyword: null
});

function _addSubElementToList(obj, arrList, showType) {
  if (obj instanceof Array) {
    obj.forEach(function (subEle) {
      if (subEle) {
        subEle.showType = showType;
        arrList.push(subEle);
        if (subEle.Children) {
          _addSubElementToList(subEle.Children, arrList, showType + 1)
        }
      }
    });
  } else if (obj !== 'undefined') {
    obj.showType = showType;
    arrList.push(obj);
    if (obj.Children) {
      _addSubElementToList(obj.Children, arrList, showType + 1)
    }
  }
}

function updateAssetBindInfo(state, action) {
  var res = action.response.Result;
  var arrDatas = state.get('data');
  if (!res) {
    return state;
  }
  var index = arrDatas.findIndex((item) => item.get('QRCode') === res.QRCode);
  if (index !== -1) {
    arrDatas = arrDatas.update(index, (item) => {
      item = item.set('QRCode', null);
      return item;
    });
  }

  index = arrDatas.findIndex((item) => item.get('Id') === res.HierarchyId);
  if (index === -1) {
    return state;
  }
  arrDatas = arrDatas.update(index, (item) => {
    item = item.set('QRCode', res.QRCode);
    traceBind(state, item);
    return item;
  });
  state = state.set('data', arrDatas);
  if (state.get('keyword')) {
    state = filter(state, state.get('keyword'));
  }
  return state;
}

function filter(state, keyword) {
  let newState = state;
  newState = newState.set('keyword', keyword);
  //显示匹配项及其父级
  if (keyword) {
    keyword = keyword.toLowerCase();
    let allData = newState.get('data');
    let size = allData.size;
    let findAll = [];
    for (let i = 0; i < size; i++) {
      let row = allData.get(i);
      let name = row.get('Name');
      if (name && name.toLowerCase().includes(keyword)) {
        //找到了匹配的，然后继续找其父级
        let type = row.get('Type');
        let tmp = [row];
        let parentType = null;
        if (type > 3) {
          for (let n = i - 1; n >= 0; n--) {
            let row2 = allData.get(n);
            let type2 = row2.get('Type');
            if (parentType) {
              if (type2 < parentType) {
                parentType = type2;
                //判断有没有加入到节点中
                let findIndex = findAll.findIndex(item => item.get('Id') === row2.get('Id'));
                if (findIndex < 0) {
                  tmp.unshift(row2);
                }
              }
            } else {
              if ((type2 < type && type2 !== 5) || (type2 === 200 && type === 5)) {
                parentType = type2;
                if (parentType === 200) parentType = 5;
                //判断有没有加入到节点中
                let findIndex = findAll.findIndex(item => item.get('Id') === row2.get('Id'));
                if (findIndex < 0) {
                  tmp.unshift(row2);
                }
              }
            }

            if (row2.get('Type') === 3) break;
          }
          findAll = findAll.concat(tmp);
        }
      }
    }
    newState = newState.set('filterData', Immutable.fromJS(findAll));
  } else {
    newState = newState.set('filterData', Immutable.fromJS([]));
  }
  return newState;
}

//记录绑定二维码
function traceBind(state, item) {
  trackApi.onTrackEvent('App_BindQrCode', {
    asset_type: item.get('Type') === 4 ? '配电柜' : '设备',
    customer_id: String(state.get('customerId') || ''),
    customer_name: state.get('customerName'),
    building_id: String(state.get('buildId') || ''),
    building_name: state.get('buildName'),
    //asset_name:item.get('Name')
  })
}

function updateHierarchyData(state, action) {
  var { body: { buildingId, isFromScan, customerId, customerName } } = action;
  // let {url,body,types} = action;
  var res = action.response.Result;//.Hirarchies;
  var allElements = new Array();
  _addSubElementToList(isFromScan ? res : res.Children, allElements, 3);
  var arrDatas = Immutable.fromJS(allElements);

  var newState = state;
  if (isFromScan) {
    newState = newState.set('scanData', arrDatas);
    newState = newState.set('scanHierarchyId', buildingId);
  }
  else {
    newState = newState.set('data', arrDatas);
    newState = newState.set('buildId', buildingId);
  }

  newState = newState.set('isFetching', false);
  newState = newState.set('buildName', res.Name).set('customerId', customerId)
    .set('customerName', customerName);
  if (newState.get('keyword')) {
    newState = filter(state, state.get('keyword'));
  }
  return newState;
}

function handleError(state, action) {
  let err = action.error.Error;
  // console.warn('handleError',action);

  switch (err) {
    case '050001207024':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      break;
  }
  return defaultState;
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case BINDHIERARCHY_LOAD_REQUEST:
      return state.set('isFetching', true);
    case BINDHIERARCHY_LOAD_SUCCESS:
      return updateHierarchyData(state, action);
    case HIERARCHY_BIND_QR_SUCCESS:
      return updateAssetBindInfo(state, action);
    case BINDHIERARCHY_LOAD_FAILURE:
      return handleError(state, action);
    case LOGOUT_SUCCESS:
    case BIND_HIERARCHY_CLEAR:
      return defaultState;
    case BIND_HIERARCHY_FILTER:
      return filter(state, action.data);
    default:

  }
  return state;
}
