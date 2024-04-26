'use strict';

import {
  BUILDINGHIERARCHY_LOAD_REQUEST,
  BUILDINGHIERARCHY_LOAD_SUCCESS,
  BUILDINGHIERARCHY_LOAD_FAILURE,
  BUILDING_ADD_ASSET, CLEAR_HIERARCHY_CACHE,
  LOGBOOK_ADD_ROOM_REQUEST, LOGBOOK_ADD_ROOM_FAILURE, LOGBOOK_ADD_ROOM_SUCCESS,
  LOGBOOK_DEL_ROOM_REQUEST, LOGBOOK_DEL_ROOM_SUCCESS, LOGBOOK_DEL_ROOM_FAILURE,
  LOGBOOK_UPDATE_ROOM_REQUEST, LOGBOOK_UPDATE_ROOM_SUCCESS, LOGBOOK_UPDATE_ROOM_FAILURE,
  LOGBOOK_ADD_PANEL_REQUEST, LOGBOOK_ADD_PANEL_SUCCESS, LOGBOOK_ADD_PANEL_FAILURE,
  LOGBOOK_DEL_PANEL_REQUEST, LOGBOOK_DEL_PANEL_SUCCESS, LOGBOOK_DEL_PANEL_FAILURE,
  LOGBOOK_UPDATE_PANEL_REQUEST, LOGBOOK_UPDATE_PANEL_SUCCESS, LOGBOOK_UPDATE_PANEL_FAILURE,
  LOGBOOK_UPDATE_DEVICE_REQUEST, LOGBOOK_UPDATE_DEVICE_SUCCESS, LOGBOOK_UPDATE_DEVICE_FAILURE,
  LOGBOOK_DEL_DEVICE_REQUEST, LOGBOOK_DEL_DEVICE_SUCCESS, LOGBOOK_DEL_DEVICE_FAILURE,
  LOGBOOK_ADD_DEVICE_REQUEST, LOGBOOK_ADD_DEVICE_SUCCESS, LOGBOOK_ADD_DEVICE_FAILURE,
  MANUAL_ADD_DEVICE_REQUEST, MANUAL_ADD_DEVICE_SUCCESS, MANUAL_ADD_DEVICE_FAILURE,
  MANUAL_UPDATE_DEVICE_REQUEST, MANUAL_UPDATE_DEVICE_SUCCESS, MANUAL_UPDATE_DEVICE_FAILURE,
  LOGBOOK_ADD_CIRCLE_REQUEST, LOGBOOK_ADD_CIRCLE_SUCCESS, LOGBOOK_ADD_CIRCLE_FAILURE,
  LOGBOOK_DELETE_CIRCLE_REQUEST, LOGBOOK_DELETE_CIRCLE_SUCCESS, LOGBOOK_DELETE_CIRCLE_FAILURE,
  LOGBOOK_UPDATE_CIRCLE_REQUEST, LOGBOOK_UPDATE_CIRCLE_SUCCESS, LOGBOOK_UPDATE_CIRCLE_FAILURE,
  ADD_FLOOR_REQUEST, ADD_FLOOR_SUCCESS, ADD_FLOOR_FAILURE,
  LOGBOOK_ADD_SWITCH_BOX_REQUEST, LOGBOOK_ADD_SWITCH_BOX_SUCCESS, LOGBOOK_ADD_SWITCH_BOX_FAILURE,
  LOGBOOK_UPDATE_SWITCH_BOX_REQUEST, LOGBOOK_UPDATE_SWITCH_BOX_SUCCESS, LOGBOOK_UPDATE_SWITCH_BOX_FAILURE,
  BUILDING_SEARCH_CHANGE,
  LOAD_DEVICE_MODELS_REQUEST, LOAD_DEVICE_MODELS_SUCCESS, LOAD_DEVICE_MODELS_FAILURE,
} from '../../actions/assetsAction.js';

import { LOGOUT_SUCCESS } from '../../actions/loginAction.js';

import Immutable, { List } from 'immutable';
import { BUILDING_CHANGE_ASSET_EXPAND } from "../../actions/assetsAction";
import trackApi from "../../utils/trackApi";

var defaultState = Immutable.fromJS({
  scanData: null,
  scanHierarchyId: null,
  buildId: null,
  buildName: null,
  customerName: null,
  customerId: null,
  data: null,
  searchText: '',
  filterData: null,
  isFetching: false,
  isAddRoomPosting: 0,//1请求中，2请求失败，0请求成功
  isDelRoomPosting: 0,//同上
  isUpdateRoomPosting: 0,
  isAddPanelPosting: 0,
  isDelPanelPosting: 0,
  isUpdatePanelPosting: 0,
  isUpdateDevicePosting: 0,
  isDelDevicePosting: 0,
  isAddDevicePosting: 0,
  isAddCirclePosting: 0,
  isUpdateCirclePosting: 0,
  isDelCirclePosting: 0,
  isAddFloorPosting: 0,
  isUpdateFloorPosting: 0,
  isDelFloorPosting: 0,
  isAddSwitchBoxPosting: 0,
  isUpdateSwitchBoxPosting: 0,
  isDelSwitchBoxPosting: 0,
  panelCount: 0,//在添加配电柜时用于计算滚动到新添加的配电柜位置
  deviceCount: 0,//同上，添加设备时用到
});

let _maxRoom = 0, _maxPanel = 0, _maxDevice = 0;
let _currentRoomName = '';
let _currentPanelName = '';
let _lastRoomName = '';

function _addSubElementToList(obj, arrList, showType, fromScan = false) {
  if (showType === 3) _maxRoom = obj.length;
  if (obj instanceof Array) {
    obj.forEach(function (subEle) {
      if (subEle) {
        subEle.showType = showType;
        subEle.isFolder = (!fromScan && (showType === 5 || showType === 6)) ? true : false;
        subEle.isSubFolder = (!fromScan && (showType === 5 || showType == 4 || showType === 6)) ? true : false;
        subEle.rowIndex = arrList.length;
        arrList.push(subEle);
        if (subEle.Children) {
          if (showType === 3) {
            _currentRoomName = subEle.Name;
            _maxPanel = Math.max(_maxPanel, subEle.Children.length);
          }
          if (showType === 4) {
            if (subEle.Children.length > _maxDevice) {
              _currentPanelName = subEle.Name;
              _lastRoomName = _currentRoomName;
            }
            _maxDevice = Math.max(_maxDevice, subEle.Children.length);
          }
          _addSubElementToList(subEle.Children, arrList, showType + 1, fromScan)
        }
      }
    });
  } else if (obj !== 'undefined') {
    obj.showType = showType;
    obj.isFolder = false;
    obj.isSubFolder = false;
    obj.rowIndex = arrList.length;
    arrList.push(obj);
    if (obj.Children) {
      _addSubElementToList(obj.Children, arrList, showType + 1, fromScan)
    }
  }

}

function updateCircle(state, action) {
  state = state.set('isUpdateCirclePosting', 0);
  let newData = state.get('data');
  if (!newData) return state;
  let index = newData.findIndex(item => item.Id === action.body.Id);
  if (index >= 0) {
    let item = newData.get(index);
    item.Name = action.body.Name;//item.set('Name', action.body.Name);
    newData = newData.set(index, item);
  }
  state = state.set('data', newData);
  return state;
}

function deleteCircle(state, action) {
  state = state.set('isDelCirclePosting', 0);
  let newData = state.get('data');
  if (!newData) {
    return state;
  }
  let index = newData.findIndex(item => item.Id === action.body.id);
  if (index >= 0) {
    let parentId = newData.get(index).ParentId;
    let circleChildren = newData.get(index).Children || [];
    newData = newData.delete(index);
    let offset = 0;
    for (let i = 0; i < circleChildren.length; i++) {
      if (newData.get(index + offset).Id === circleChildren[i].Id) {
        newData = newData.delete(index + offset);
      } else {
        offset++;
      }
    }
    //如果回路下有子节点，一起移除
    index = newData.findIndex(item => item.Id === parentId);
    if (index >= 0) {
      let parentIndex = index;
      let parentData = newData.get(parentIndex);
      //还要从其父级节点删除
      index = parentData.Children.findIndex(item => item.Id === action.body.id);
      if (index >= 0) {
        let children = parentData.Children;
        if (!children) children = [];//Immutable.fromJS([]);
        // children=children.delete(index);
        children.splice(index, 1);
        // parentData=parentData.set('Children',children);
        parentData.Children = children;
        newData = newData.set(parentIndex, parentData);
      }
    }
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  return state;
}

function updateDevice(state, action) {
  state = state.set('isUpdateDevicePosting', 0);
  let newData = state.get('data');
  if (!newData) return state;
  let index = newData.findIndex(item => item.Id === action.body.Id);
  if (index >= 0) {
    let item = newData.get(index);
    item.Name = action.body.Name;//item.set('Name', action.body.Name);
    newData = newData.set(index, item);
  }
  state = state.set('data', newData);
  return state;
}

function delDevice(state, action) {
  state = state.set('isDelDevicePosting', 0);
  let newData = state.get('data');
  if (!newData) {
    return state;
  }
  let index = newData.findIndex(item => item.Id === action.body.id);
  if (index >= 0) {
    let parentId = newData.get(index).ParentId;
    newData = newData.delete(index);
    index = newData.findIndex(item => item.Id === parentId);
    if (index >= 0) {
      let parentIndex = index;
      let parentData = newData.get(parentIndex);
      //还要从其父级节点删除
      index = parentData.Children.findIndex(item => item.Id === action.body.id);
      if (index >= 0) {
        let children = parentData.Children;
        if (!children) children = [];//Immutable.fromJS([]);
        // children=children.delete(index);
        children.splice(index, 1);
        // parentData=parentData.set('Children',children);
        parentData.Children = children;
        newData = newData.set(parentIndex, parentData);
      }
    }
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  return state;
}

function traceAddLogbook(state, type, name) {
  trackApi.onTrackEvent('App_LogbookAdd', {
    asset_type: ['', '', '', '配电室', '配电柜', '设备'][type],
    // asset_name:name,
    customer_id: String(state.get('customerId') || ''),
    customer_name: state.get('customerName') || '',
    building_id: String(state.get('buildId') || ''),
    building_name: state.get('buildName') || ''
  })
}

function addCircle(state, action) {
  let { Name, ParentId } = action.body;
  state = state.set('isAddCirclePosting', 0);
  //模拟返回结果
  let newData = state.get('data');
  let result = action.response.Result;
  result.showType = 5;
  result.isFolder = true;
  result.isSubFolder = true;
  result.Type = 200;
  result.searchHide = false;

  let index = newData.findIndex(item => item.Id === action.body.ParentId);
  if (index >= 0) {
    //先添加，然后再做展开处理
    let assetData = result;//Immutable.fromJS(result);
    let parentData = newData.get(index);
    let children = parentData.Children;
    if (!children) children = [];//Immutable.fromJS([]);
    // children=children.unshift(assetData);
    children.push(assetData);
    // parentData=parentData.set('Children',children);
    parentData.Children = children;
    newData = newData.set(index, parentData);

    //现在多了回路层级，所以直接这样写插入位置不准确，需要重新查找
    let totalCount = newData.size;
    let insertIndex = index + 1
    for (; insertIndex < totalCount; insertIndex++) {
      let next = newData.get(insertIndex);
      if (next.showType <= parentData.showType) {
        break;
      }
    }
    newData = newData.insert(insertIndex, assetData);
    let assetType = newData.get(index).showType;
    newData = doFolder2(newData, index, newData.size, assetType, false);
    // state=state.set('deviceCount',children.length);
    state = state.set('circleCount', getVisibleChildrenCount(index, newData, 4));
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  return state;
}

function addPanel(state, action) {
  state = state.set('isAddPanelPosting', 0);
  let newData = state.get('data');
  let result = action.response.Result;
  result.showType = 4;
  result.isFolder = true;
  result.isSubFolder = true;
  result.Type = 4;
  result.IsAsset = true;
  result.searchHide = false;
  traceAddLogbook(state, 4, result.Name);
  let index = newData.findIndex(item => item.Id === action.body.ParentId);
  if (index >= 0) {
    //先添加，然后再做展开处理
    let assetData = result;//Immutable.fromJS(result);
    let parentData = newData.get(index);
    let children = parentData.Children;
    if (!children) children = [];//Immutable.fromJS([]);
    // children=children.unshift(assetData);
    children.push(assetData);
    // parentData=parentData.set('Children',children);
    parentData.Children = children;
    newData = newData.set(index, parentData);
    //位置的计算规则是插入到一个类型为3的位置处
    let insertIndex = getInsertIndex(index, newData, 3);
    newData = newData.insert(insertIndex, assetData);
    let assetType = newData.get(index).showType;
    newData = doFolder2(newData, index, newData.size, assetType, false);
    state = state.set('panelCount', getVisibleChildrenCount(index, newData, 3));
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  //更新索引
  return state;
}

function updateDataIndex(data) {
  for (let i = 0; i < data.size; i++) {
    let row = data.get(i);
    row.rowIndex = i;
    data.set(i, row);
  }
  return data;
}

function getVisibleChildrenCount(startIndex, data, type) {
  let count = 0;
  for (let i = startIndex + 1; i < data.size; i++) {
    let currentType = data.get(i).showType;
    if (currentType <= type) return count;
    if (!data.get(i).isFolder && !data.get(i).searchHide) {//非搜索隐藏
      count++;
    }
  }
  return count;
}

function getInsertIndex(startIndex, data, type) {
  for (let i = startIndex + 1; i < data.size; i++) {
    if (data.get(i).Type === type) {
      return i;
    }
  }
  return data.size;//startIndex+1;
}

function addDevice(state, action) {
  state = state.set('isAddDevicePosting', 0);
  let newData = state.get('data');
  let result = action.response.Result;
  result.showType = 5;
  result.isFolder = true;
  result.isSubFolder = true;
  result.Type = 5;
  result.IsOnline = true;
  result.IsAsset = true;
  result.searchHide = false;
  traceAddLogbook(state, 5, result.Name);
  let index = newData.findIndex(item => item.Id === action.body.ParentId);
  if (index >= 0) {
    //先添加，然后再做展开处理
    let assetData = result;//Immutable.fromJS(result);
    let parentData = newData.get(index);
    let children = parentData.Children;
    if (!children) children = [];//Immutable.fromJS([]);
    // children=children.unshift(assetData);
    children.push(assetData);
    // parentData=parentData.set('Children',children);
    parentData.Children = children;
    newData = newData.set(index, parentData);
    //现在多了回路层级，所以直接这样写插入位置不准确，需要重新查找
    let totalCount = newData.size;
    let insertIndex = index + 1;
    //如果是从回路添加，则插入的位置是回路子节点数，如果是从盘柜添加，则下面逻辑不变
    if (parentData.Type === 200) {
      result.showType = 6;
    }
    for (; insertIndex < totalCount; insertIndex++) {
      let next = newData.get(insertIndex);
      if (next.showType <= parentData.showType) {
        break;
      }
    }
    newData = newData.insert(insertIndex, assetData);
    let assetType = newData.get(index).showType;
    newData = doFolder2(newData, index, newData.size, assetType, false);
    state = state.set('deviceCount', getVisibleChildrenCount(index, newData, 4));
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  return state;
}

function updatePanel(state, action) {
  state = state.set('isUpdatePanelPosting', 0);
  let newData = state.get('data');
  if (!newData) return state;
  let index = newData.findIndex(item => item.Id === action.body.Id);
  if (index >= 0) {
    let item = newData.get(index);
    // item=item.set('Name',action.body.Name);
    item.Name = action.body.Name;
    newData = newData.set(index, item);
  }
  state = state.set('data', newData);
  return state;
}

function delPanel(state, action) {
  state = state.set('isDelPanelPosting', 0);
  let newData = state.get('data');
  if (!newData) {
    return state;
  }
  let index = newData.findIndex(item => item.Id === action.body.id);
  if (index >= 0) {
    let parentId = newData.get(index).ParentId;
    newData = newData.delete(index);
    index = newData.findIndex(item => item.Id === parentId);
    if (index >= 0) {
      let parentIndex = index;
      let parentData = newData.get(parentIndex);
      //还要从其父级节点删除
      index = parentData.Children.findIndex(item => item.Id === action.body.id);
      if (index >= 0) {
        let children = parentData.Children;
        if (!children) children = [];//Immutable.fromJS([]);
        // children=children.delete(index);
        children.splice(index, 1);
        // parentData=parentData.set('Children',children);
        parentData.Children = children;
        newData = newData.set(parentIndex, parentData);
      }
    }
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  return state;
}

function addRoom(state, action) {
  state = state.set('isAddRoomPosting', 0);
  let newData = state.get('data');
  let result = action.response.Result;
  result.showType = 3;
  result.isFolder = true;
  result.isSubFolder = true;
  result.Type = 3;
  result.searchHide = false;
  // newData=newData.unshift(Immutable.fromJS(result));
  newData = newData.push(result);
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  traceAddLogbook(state, 3, result.Name);
  return state;
}

function updateRoom(state, action) {
  state = state.set('isUpdateRoomPosting', 0);
  let newData = state.get('data');
  if (!newData) return state;
  let index = newData.findIndex(item => item.Id === action.body.Id);
  if (index >= 0) {
    let item = newData.get(index);
    // item=item.set('Name',action.body.Name);
    item.Name = action.body.Name;
    newData = newData.set(index, item);
  }
  state = state.set('data', newData);
  return state;
}

function delRoom(state, action) {
  state = state.set('isDelRoomPosting', 0);
  let newData = state.get('data');
  if (!newData) return state;
  let index = newData.findIndex(item => item.Id === action.body.id);
  if (index >= 0) {
    newData = newData.delete(index);
  }
  newData = updateDataIndex(newData);
  state = state.set('data', newData);
  return state;
}

function addAsset(state, action) {
  let { data: { type, asset, parentData } } = action;
  let newData = state.get('data');
  let assetData = Immutable.fromJS(asset);
  switch (type) {
    case 'add_room':
      newData = newData.unshift(Immutable.fromJS(asset));
      break;
    case 'add_box':
      let index = newData.indexOf(parentData);
      if (index >= 0) {
        let children = parentData.get('Children');
        if (!children) children = Immutable.fromJS([]);
        children = children.unshift(assetData);
        parentData = parentData.set('Children', children);
        newData = newData.set(index, parentData);
        newData = newData.insert(index + 1, assetData);
        let assetType = newData.get(index).get('showType');
        newData = doFolder2(newData, index, newData.size, assetType, false);
      }
      break;
  }
  state = state.set('data', newData);
  return state;
}

function searchByText(state, action) {
  let newState = state;
  let { text, isFromScan } = action.data;
  // console.warn(text,isFromScan,action);
  let dataSource = isFromScan ? 'scanData' : 'data';
  let newData = newState.get(dataSource);
  newState = newState.set('searchText', text + (Date.now()));
  //修改状态 根据查询关键字重新分配各项的收起展开状态
  if (!newData) return state;
  let count = newData.size;
  for (let i = 0; i < count; i++) {
    let item = newData.get(i);
    item.isFolder = false;
    item.isSubFolder = false;
    item.searchHide = false;//表示是否是由于搜索的原因被隐藏掉
    // newData=newData.set(i,item);
  }
  if (text.length > 0) {//根据查询关键字显示收起展开
    let lowText = text.toLowerCase();
    for (let i = 0; i < count; i++) {
      let item = newData.get(i);
      let name = item.Name.toLowerCase();
      let showType = item.showType;
      if (name.includes(lowText)) {
        item.isFolder = false;
        item.isSubFolder = false;
        item.searchHide = false;
        newData = newData.set(i, item);
        //父项展开,向上面找比自己大的,并且pid=id,设置为展开可见
        newData = findUp(newData, i);
        //搜索子项，都设置为展开
        for (let n = i + 1; n < count; n++) {
          let item2 = newData.get(n);
          if (item2.showType <= showType) {
            i = n - 1;
            break;
          }
          item.isFolder = false;
          item.isSubFolder = false;
          item.searchHide = false;
          i = n;
          // newData=newData.set(n,item);
        }
      } else {
        item.isFolder = true;
        item.isSubFolder = true;
        item.searchHide = true;
        // newData=newData.set(i,item);
      }
    }
  }
  newState = newState.set(dataSource, newData);
  return newState;
}

function findUp(data, begin) {
  let item = data.get(begin);
  if (item.showType === 3) return data;
  let pid = item.ParentId;
  if (begin > 0) {
    for (let i = begin - 1; i >= 0; i--) {
      let item2 = data.get(i);
      if (pid === item2.Id) {
        item2.isFolder = false;
        item2.isSubFolder = false;
        item2.searchHide = false;
        // data=data.set(i,item2);
        return findUp(data, i);
      }
    }
  }
  return data;
}

function folderData(state, action) {
  // console.log('folderData',state.toJS(),action);
  let begin = new Date().getTime();
  //获取操作数据：对指定位置的节点进行收起展开操作
  let { data: { index, type, fromScan } } = action;
  let dataSource = fromScan ? 'scanData' : 'data';
  let newData = state.get(dataSource);
  let assetType = newData.get(index).showType;//.get('showType');
  // console.warn('expand item',newData.get(index).Name);
  newData = doFolder2(newData, index, newData.size, assetType, type);
  state = state.set(dataSource, newData);
  let op = state.get('op') || 0;
  op += 1;
  state = state.set('op', op);
  // console.warn('folder use time:',new Date().getTime()-begin);
  return state;
}

function doFolder2(newData, index, size, type, folder) {
  for (let i = index; i < size; i++) {
    let row = newData.get(i);
    let showType = row.showType;
    if (i > index && showType <= type) return newData;
    let isFolderSave = row.isFolder;
    // console.warn('folder',folder);
    if (folder) {//收起,如果是保险柜，在自己不隐藏，设备隐藏
      // row = row.set('isFolder', true);
      // row=row.set('isSubFolder',true);
      row.isFolder = true;
      row.isSubFolder = true;
    } else {//展开，是逐级的
      if (showType == type || showType == type + 1) {
        // row = row.set('isFolder', false);
        // if(!row.searchHide)//考虑到搜索关键字结果的影响
        row.isFolder = false;
      }
    }
    if (i == index && (type == 4 || type === 5)) {
      // row=row.set('isSubFolder',folder);
      // row=row.set('isFolder',isFolderSave);
      row.isSubFolder = folder;
      row.isFolder = isFolderSave;
    }
    newData = newData.set(i, row);
  }
  return newData;
}

function doFolder(newData, index, size, type, folder) {
  for (let i = index; i < size; i++) {
    let row = newData.get(i);
    let showType = row.get('showType');
    if (i > index && showType <= type) return newData;
    let isFolderSave = row.get('isFolder');
    if (folder) {//收起,如果是保险柜，在自己不隐藏，设备隐藏
      row = row.set('isFolder', true);
      row = row.set('isSubFolder', true);
    } else {//展开，是逐级的
      if (showType == type || showType == type + 1) {
        row = row.set('isFolder', false);
      }
    }
    if (i == index && type == 4) {
      row = row.set('isSubFolder', folder);
      row = row.set('isFolder', isFolderSave);
    }
    newData = newData.set(i, row);
  }
  return newData;
}

function updateHierarchyData(state, action) {
  var { body: { buildingId, isFromScan } } = action;
  var res = action.response.Result;//.Hirarchies;
  // console.warn('------updateHierarchyData',action);
  var allElements = new Array();
  _addSubElementToList(isFromScan ? res : res.Children, allElements, 3, isFromScan);
  var arrDatas = List(allElements);//Immutable.fromJS(allElements);

  var newState = state;
  if (isFromScan) {
    newState = newState.set('scanData', arrDatas);
    newState = newState.set('scanHierarchyId', buildingId);
  }
  else {
    newState = newState.set('data', arrDatas);
    newState = newState.set('buildId', buildingId);
  }

  newState = newState.set('isFetching', false).set('customerId', res.CustomerId)
    .set('buildName', res.Name).set('customerName', action.opt).set('filterData', null);

  return newState;
}

function restoreOldState(newState, oldState) {
  if (newState && newState.size > 0 && oldState && oldState.size > 0) {
    let size = newState.size;
    let oldSize = oldState.size ? oldState.size : 0;
    for (let i = 0; i < size; i++) {
      let item = newState.get(i);
      for (let n = 0; n < oldSize; n++) {
        let oldItem = oldState.get(n);
        if (oldItem.get('Id') == item.get('Id')) {
          item = item.set('isFolder', oldItem.get('isFolder')).set('isSubFolder', oldItem.get('isSubFolder'));
          break;
        }
      }
      newState = newState.set(i, item);
    }
  }
  return newState;
}

function loadDeviceModels(state, action) {
  return state.set('deviceModels', action.response.Result).set('loadingDeviceModels', false);
}

function handleError(state, action) {
  let err = action.error.Error;
  // console.warn('handleError',action);
  switch (err) {
    case '050001251009':
      action.error = '无查看资产权限，联系管理员';
      break;
    case '050001207024':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      break;
  }
  return state;
}

function handleLogbookError(action) {
  console.warn('handleLogbookError', action);
  let err = action.error.Error;
  // console.warn('handleError',action);
  let typeName = '';
  switch (action.type) {
    case LOGBOOK_UPDATE_PANEL_FAILURE:
    case LOGBOOK_DEL_PANEL_FAILURE:
    case LOGBOOK_ADD_PANEL_FAILURE:
      typeName = '配电柜';
      break;
    case LOGBOOK_ADD_ROOM_FAILURE:
    case LOGBOOK_DEL_ROOM_FAILURE:
    case LOGBOOK_UPDATE_ROOM_FAILURE:
      typeName = '配电室';
      break;
    case LOGBOOK_UPDATE_DEVICE_FAILURE:
    case LOGBOOK_DEL_DEVICE_FAILURE:
      typeName = '设备';
      break;
    case LOGBOOK_ADD_CIRCLE_FAILURE:
    case LOGBOOK_DELETE_CIRCLE_FAILURE:
    case LOGBOOK_UPDATE_CIRCLE_FAILURE:
      typeName = '回路';
      break;
    case ADD_FLOOR_FAILURE:
      typeName = '楼层';
      break;
    case LOGBOOK_ADD_SWITCH_BOX_FAILURE:
    case LOGBOOK_UPDATE_SWITCH_BOX_FAILURE:
      typeName = '配电箱';
      break;
  }
  if (err) {
    //截取后三位给出对应的错误提示
    let code = err.substr(-3, 3);
    let errorText = null;
    switch (code) {
      case '005':
        if (typeName === '配电室' || typeName === '楼层') {
          typeName = '配电室或楼层';
        }
        errorText = typeName + '名称重复';
        break;
      case '006':
        errorText = typeName + '数量达到上限';
        break;
      case '007':
        errorText = '请移除所有子节点后重试';
        break;
    }
    if (errorText) {
      action.error = errorText;
    }
  }

}

export default function (state = defaultState, action) {
  switch (action.type) {
    case CLEAR_HIERARCHY_CACHE:
      let datasource = action.data.isFromScan ? 'scanData' : 'data';
      return state.set(datasource, null);
    case BUILDINGHIERARCHY_LOAD_REQUEST:
      return state.set('isFetching', true);
    case BUILDINGHIERARCHY_LOAD_SUCCESS:
      return updateHierarchyData(state, action);
    case BUILDINGHIERARCHY_LOAD_FAILURE:
      return handleError(state, action);
    case LOGOUT_SUCCESS:
      return defaultState;
    case BUILDING_CHANGE_ASSET_EXPAND:
      return folderData(state, action);
    case BUILDING_ADD_ASSET:
      return addAsset(state, action);

    case LOGBOOK_ADD_ROOM_REQUEST:
      return state.set('isAddRoomPosting', 1);
    case LOGBOOK_ADD_ROOM_SUCCESS:
      return addRoom(state, action);
    case LOGBOOK_ADD_ROOM_FAILURE:
      return state.set('isAddRoomPosting', 2);

    case LOGBOOK_DEL_ROOM_REQUEST:
      return state.set('isDelRoomPosting', 1);
    case LOGBOOK_DEL_ROOM_SUCCESS:
      return delRoom(state, action);
    case LOGBOOK_DEL_ROOM_FAILURE:
      handleLogbookError(action);
      return state.set('isDelRoomPosting', 2);

    case LOGBOOK_UPDATE_ROOM_REQUEST:
      return state.set('isUpdateRoomPosting', 1);
    case LOGBOOK_UPDATE_ROOM_SUCCESS:
      return updateRoom(state, action);
    case LOGBOOK_UPDATE_ROOM_FAILURE:
      handleLogbookError(action);
      return state.set('isUpdateRoomPosting', 2);

    case LOGBOOK_ADD_PANEL_REQUEST:
      return state.set('isAddPanelPosting', 1);
    case LOGBOOK_ADD_PANEL_SUCCESS:
      return addPanel(state, action);
    case LOGBOOK_ADD_PANEL_FAILURE:
      handleLogbookError(action);
      return state.set('isAddPanelPosting', 2);

    case LOGBOOK_DEL_PANEL_REQUEST:
      return state.set('isDelPanelPosting', 1);
    case LOGBOOK_DEL_PANEL_SUCCESS:
      return delPanel(state, action);
    case LOGBOOK_DEL_PANEL_FAILURE:
      handleLogbookError(action);
      return state.set('isDelPanelPosting', 2);

    case LOGBOOK_UPDATE_PANEL_REQUEST:
      return state.set('isUpdatePanelPosting', 1);
    case LOGBOOK_UPDATE_PANEL_SUCCESS:
      return updatePanel(state, action);
    case LOGBOOK_UPDATE_PANEL_FAILURE:
      handleLogbookError(action);
      return state.set('isUpdatePanelPosting', 2);

    case LOGBOOK_UPDATE_DEVICE_REQUEST:
    case MANUAL_UPDATE_DEVICE_REQUEST:
      return state.set('isUpdateDevicePosting', 1);
    case LOGBOOK_UPDATE_DEVICE_SUCCESS:
    case MANUAL_UPDATE_DEVICE_SUCCESS:
      return updateDevice(state, action);
    case LOGBOOK_UPDATE_DEVICE_FAILURE:
    case MANUAL_UPDATE_DEVICE_FAILURE:
      handleLogbookError(action);
      return state.set('isUpdateDevicePosting', 2);

    case LOGBOOK_DEL_DEVICE_REQUEST:
      return state.set('isDelDevicePosting', 1);
    case LOGBOOK_DEL_DEVICE_SUCCESS:
      return delDevice(state, action);
    case LOGBOOK_DEL_DEVICE_FAILURE:
      handleLogbookError(action);
      return state.set('isDelDevicePosting', 2);

    case LOGBOOK_ADD_DEVICE_REQUEST:
    case MANUAL_ADD_DEVICE_REQUEST:
      return state.set('isAddDevicePosting', 1);
    case LOGBOOK_ADD_DEVICE_FAILURE:
    case MANUAL_ADD_DEVICE_FAILURE:
      handleLogbookError(action);
      return state.set('isAddDevicePosting', 2);
    case LOGBOOK_ADD_DEVICE_SUCCESS:
    case MANUAL_ADD_DEVICE_SUCCESS:
      return addDevice(state, action);

    case LOGBOOK_ADD_CIRCLE_REQUEST:
      return state.set('isAddCirclePosting', 1);
    case LOGBOOK_ADD_CIRCLE_FAILURE:
      handleLogbookError(action);
      return state.set('isAddCirclePosting', 2);
    case LOGBOOK_ADD_CIRCLE_SUCCESS:
      return addCircle(state, action);

    case LOGBOOK_UPDATE_CIRCLE_REQUEST:
      return state.set('isUpdateCirclePosting', 1);
    case LOGBOOK_UPDATE_CIRCLE_FAILURE:
      handleLogbookError(action);
      return state.set('isUpdateCirclePosting', 2);
    case LOGBOOK_DELETE_CIRCLE_REQUEST:
      return state.set('isDelCirclePosting', 1);
    case LOGBOOK_DELETE_CIRCLE_FAILURE:
      handleLogbookError(action);
      return state.set('isDelCirclePosting', 2);

    case LOGBOOK_UPDATE_CIRCLE_SUCCESS:
      return updateCircle(state, action);

    case LOGBOOK_DELETE_CIRCLE_SUCCESS:
      return deleteCircle(state, action);

    //添加删除修改楼层
    case ADD_FLOOR_REQUEST:
      return state.set('isAddFloorPosting', 1);
    case ADD_FLOOR_SUCCESS:
      //由于复用addRoom逻辑，需要还原isAddRoomPosting值
      let isAddRoomPosting = state.get('isAddRoomPosting');
      state = addRoom(state, action);
      return state.set('isAddFloorPosting', 0).set('isAddRoomPosting', isAddRoomPosting);
    case ADD_FLOOR_FAILURE:
      handleLogbookError(action);
      return state.set('isAddFloorPosting', 2);

    //添加删除修改配电箱
    case LOGBOOK_ADD_SWITCH_BOX_REQUEST:
      return state.set('isAddSwitchBoxPosting', 1);
    case LOGBOOK_ADD_SWITCH_BOX_SUCCESS:
      //由于复用addRoom逻辑，需要还原isAddRoomPosting值
      let isAddPanelPosting = state.get('isAddPanelPosting');
      state = addPanel(state, action);
      return state.set('isAddSwitchBoxPosting', 0).set('isAddPanelPosting', isAddPanelPosting);
    case LOGBOOK_ADD_SWITCH_BOX_FAILURE:
      handleLogbookError(action);
      return state.set('isAddSwitchBoxPosting', 2);

    case LOGBOOK_UPDATE_SWITCH_BOX_REQUEST:
      return state.set('isUpdateSwitchBoxPosting', 1);
    case LOGBOOK_UPDATE_SWITCH_BOX_FAILURE:
      handleLogbookError(action);
      return state.set('isUpdateSwitchBoxPosting', 2);
    case LOGBOOK_UPDATE_SWITCH_BOX_SUCCESS:
      let isUpdatePanelPosting = state.get('isUpdatePanelPosting')
      return updatePanel(state, action).set('isUpdateSwitchBoxPosting', 0)
        .set('isUpdatePanelPosting', isUpdatePanelPosting);
    case BUILDING_SEARCH_CHANGE:
      return searchByText(state, action);

    case LOAD_DEVICE_MODELS_REQUEST:
      if (state.get('deviceModels'))
        return state;
      return state.set('loadingDeviceModels', true);
    case LOAD_DEVICE_MODELS_SUCCESS:
      return loadDeviceModels(state, action);
    case LOAD_DEVICE_MODELS_FAILURE:
      handleLogbookError(action);
      return state.set('loadingDeviceModels', false);

    default:

  }
  return state;
}
