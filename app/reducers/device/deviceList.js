import {
  LOAD_DEVICE_LIST_REQUEST,
  LOAD_DEVICE_LIST_FAILED,
  LOAD_DEVICE_LIST_SUCCESS,
  SAVE_DEVICE_LIST_INPUT,
  CLEAR_DEVICE_LIST_INPUT,
  SAVE_DEVICE_LIST_SEARCH,
  LOAD_DEVICE_STATUS_SUCCESS,
  LOAD_DEVICE_STATUS_REQUEST, LOAD_DEVICE_STATUS_FAILED,
} from '../../actions/device/deviceAction'
import moment from "moment";
import {
  HIERARCHY_LIST_FAILURE,
  HIERARCHY_LIST_REQUEST,
  HIERARCHY_LIST_SUCCESS
} from '../../containers/alarmManager/actions';
import { LOGOUT_SUCCESS } from '../../actions/loginAction';

let initState = {
  isFetching: false,
  needLoadStatus: false,
  hierarchyListFetching: false,
  input: {
    pageIndex: 1,
    pageSize: 100,
  }
}

function formatDocument(documents) {
  if (!documents) return null;
  const TIME_FORMAT = 'YYYY-MM-DD HH:mm';
  return documents.map(item => {
    let size = item.fileSize;
    let displaySize = '';
    let _1m = 1024 * 1024;
    let _1k = 1024;
    if (size >= _1m) {
      displaySize = `${(size / _1m).toFixed(1)}MB`
    } else if (size >= _1k) {
      displaySize = `${(size / _1k).toFixed(1)}KB`
    } else {
      displaySize = `${size}B`
    }
    return {
      ...item,
      displaySize,
      formatTime: moment(item.createTime).format(TIME_FORMAT),
    }
  })
}

function composeData(newState, action) {
  const body = action.body;
  const responseResult = action.response;
  if (responseResult && responseResult.list) {
    responseResult.list.forEach(item => {
      //这里格式化要显示的层级和图片
      if (item.fullHierarchyNames) {
        item.displayHierarchy = item.fullHierarchyNames.join(' / ');
      }
      if (item.files && item.files.imageList && item.files.imageList.length > 0) {
        item.imageId = item.files.imageList[0].id;
      }
      if (item.files && item.files.documentList && item.files.documentList.length > 0) {
        item.files.documentList = formatDocument(item.files.documentList);
      }
    })
  }
  let dataSource = [];
  if (body.pageIndex === 1) {
    dataSource = responseResult.list;
  } else {
    dataSource = newState.data[0].data.concat(responseResult.list);
  }
  newState.page = responseResult.pageIndex;
  newState.data = dataSource.length > 0 ? [{ data: dataSource }] : dataSource;
  return newState;
}

function filterNoAuthDevice(state, actions) {
  let filterDevice = [];
  if (state.data && state.data.length > 0) {
    let listDevice = state.data[0].data;
    let deviceStatus = actions.response;
    for (const deviceObj of listDevice) {
      let founded = false;
      for (const statusObj of deviceStatus) {
        if (statusObj.deviceId == deviceObj.id) {
          if (statusObj.deviceStatus === -1 || statusObj.deviceStatus === 5 || statusObj.deviceStatus === 1) {
            ///-1 不存在/  5 报废
            founded = true;
            break;
          }
        }
      }
      if (!founded) {
        filterDevice.push(deviceObj);
      }
    }

    for (const deviceObj of filterDevice) {
      for (const statusObj of deviceStatus) {
        if (statusObj.deviceId == deviceObj.id) {
          deviceObj.deviceStatus = statusObj.deviceStatus;
        }
      }
    }
  }
  return filterDevice;
}

function loadHierarchyListData(state, data) {
  let ret = [];
  let map = {};
  let spc = [];
  if (data && data.length > 0) {
    data.forEach(node => {
      node.children = []
      //如何对这个无序的数据结构排序
      if (!node.parentId) {
        //这是一个root节点
        ret.push(node)
      }
      map[node.id] = node;
      if (map[node.parentId]) {
        map[node.parentId].children.push(node)
      }
      if (node.id < node.parentId) spc.push(node)
    })
  }
  // console.log('spc', spc);
  spc.forEach(s => {
    let p = map[s.parentId];
    if (p) p.children.push(s);
  })

  let sort = [];
  ret.forEach(item => {
    flatHierarchyTree(1, item, sort)
  })
  // let sub = [];
  // sort.forEach(s => {
  //   if (map[s.id]) map[s.id] = undefined;
  // })
  // console.log('sort', sort, map);
  state.hierarchyListData = sort;
  state.hierarchyTreeData = ret;
}

function flatHierarchyTree(level, item, data) {
  item.level = level;
  item.__lowcase = item.name.toLowerCase();
  data.push(item)
  if (item.children && item.children.length > 0) {
    item.children.forEach(child => {
      child.__parent = item;
      flatHierarchyTree(level + 1, child, data)
    })
  }
}

export default function (state = initState, action) {
  let newState = { ...state };
  switch (action.type) {
    case LOAD_DEVICE_LIST_REQUEST:
      newState.isFetching = true;
      return newState;
    case LOAD_DEVICE_LIST_SUCCESS:
      newState.needLoadStatus = true;
      newState = composeData(newState, action)
      return newState;
    case LOAD_DEVICE_LIST_FAILED:
      newState.isFetching = false;
      break;
    case LOAD_DEVICE_STATUS_REQUEST:
      break;
    case LOAD_DEVICE_STATUS_SUCCESS:
      newState.isFetching = false;
      let device = filterNoAuthDevice(state, action);
      newState.data = device.length > 0 ? [{ data: device }] : device;
      newState.needLoadStatus = false;
      break;
    case LOAD_DEVICE_STATUS_FAILED:
      newState.isFetching = false;
      break;

    case SAVE_DEVICE_LIST_INPUT:
      newState.input = { ...action.input };
      break;
    case CLEAR_DEVICE_LIST_INPUT:
      return initState;
    case SAVE_DEVICE_LIST_SEARCH:
      newState.searchText = action.search;
      break;

    case HIERARCHY_LIST_REQUEST:
      newState.hierarchyListFetching = true;
      break;
    case HIERARCHY_LIST_SUCCESS:
      newState.hierarchyListFetching = false;
      loadHierarchyListData(newState, action.response)
      break;
    case HIERARCHY_LIST_FAILURE:
      newState.hierarchyListFetching = false;
      break;

    case LOGOUT_SUCCESS:
      return initState
  }

  return newState;
}
