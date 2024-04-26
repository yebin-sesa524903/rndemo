import immutable from 'immutable';
import {
  SERVICE_TICKET_LOAD_TREE_HIERARCHY_REQUEST,
  SERVICE_TICKET_LOAD_TREE_HIERARCHY_SUCCESS,
  SERVICE_TICKET_LOAD_TREE_HIERARCHY_FAILURE,
  SERVICE_TICKET_TREE_EXPAND, SERVICE_TICKET_LOAD_CACHE_HIERARCHY,
} from '../../actions/ticketAction'

let defaultState = immutable.fromJS({
  isFetching: false
})

function flatItem(data, row, level) {
  let rowIndex = data.length;
  row.rowIndex = rowIndex;
  row.rowLevel = level;
  row.rowExpand = true;
  data.push(row);
  if (row.Children && row.Children.length > 0) {
    row.Children.forEach(item => {
      item.rowParent = row;
      flatItem(data, item, level + 1);
    });
  }
}

function treeExpand(state, action) {
  let row = action.row;
  row.rowExpand = !row.rowExpand;
  let start = row.rowIndex + 1;
  let end = start;
  let allData = state.get('allData');
  let count = allData.length;
  let children = [];
  for (let i = start; i < count; i++) {
    let item = allData[i];
    if (item.rowLevel <= row.rowLevel) {
      break;
    }
    if (row.rowExpand) item.rowExpand = true;
    children.push(item);
    end = i;
  }
  let filter = state.get('data');
  if (row.rowExpand) {
    //追加
    let index = filter.indexOf(row) + 1;
    filter.splice(index, 0, ...children);
  } else {
    //删除
    filter = filter.filter(item => item.rowIndex < start || item.rowIndex > end);
  }
  return state.set('data', [].concat(filter));
}

function loadTree(state, action) {
  let res = action.response.Result;
  let data = [];
  let level = 2;
  res.forEach(item => flatItem(data, item, level));
  return state.set('isFetching', false).set('data', data).set('allData', [].concat(data));
}

function loadCacheTree(state, action) {
  let res = action.data;
  let data = [];
  let level = 2;
  res.forEach(item => flatItem(data, item, level));
  return state.set('data', data).set('allData', [].concat(data));
}

function handleError(state, action) {
  let err = action.error.Error;
  switch (err) {
    case '040001307022':
      err = '您没有这一项的操作权限，请联系系统管理员';
      break;
    case '050001251500':
      err = '抱歉，您查看的工单已被删除';
      break;
    case '050001251009':
      err = '抱歉，您没有查看该工单权限';
      break;
    case '050001251402':
      err = null;
      action.error = '抱歉，不能删除有关联维护任务的工单';
      break;
    case '050001251415':
      err = null;
      action.error = '工单已关闭无法接单';
      break;
    case '050001251413':
      err = null;
      action.error = '用户已接单，无法重复接单';
      break;
  }
  if (err && err !== '403') {
    action.error = null;
  } else {
    err = '';
  }
  return state.set('isFetching', false).set('errorMessage', err);
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case SERVICE_TICKET_LOAD_TREE_HIERARCHY_REQUEST:
      return state.set('isFetching', true);
    case SERVICE_TICKET_LOAD_TREE_HIERARCHY_FAILURE:
      return handleError(state, action);
    case SERVICE_TICKET_LOAD_TREE_HIERARCHY_SUCCESS:
      return loadTree(state, action);
    case SERVICE_TICKET_LOAD_CACHE_HIERARCHY:
      return loadCacheTree(state, action);
    case SERVICE_TICKET_TREE_EXPAND:
      return treeExpand(state, action);
  }
  return state;
}
