'use strict';


import {
  MONITION_LOAD_SUCCESS,
  MONITION_LOAD_REQUEST,
  MONITION_LOAD_FAILURE,
  MONITION_FILTER_DIDCHANGED, MONITION_FILTER_CLEAR_RESULT,
  MONITION_CHANGE_TAB, MONITION_NEXT_PAGE,
  BILL_SIGN_UPLOAD_REQUEST, BILL_SIGN_UPLOAD_SUCCESS, BILL_SIGN_UPLOAD_FAILURE,
  MONITION_FIRSTPAGE
} from '../../actions/monitionAction';
import { CHANGE_PARTNER_SUCCESS } from '../../actions/loginAction'
// import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import { commonReducer } from '../commonReducer.js';

import Immutable from 'immutable';

function getSubTab() {
  return {
    currentIndex: 0,
    data: null,
    pageCount: 0,
    isFetching: false,
    sectionData: null,
    filter: {
      CurrentPage: 1,
      ItemsPerPage: 20,
    }
  }
}

function getTab() {
  return [getSubTab(), getSubTab()]
}

let defaultState = Immutable.fromJS({
  tabIndex: 0, subIndex: 0,
  tabs: [
    getTab(), getTab(), getTab(), getTab()
  ]
});



function clearResult(state, action) {
  let newState = state;
  newState = newState.set('data', null);
  newState = newState.set('allDatas', null);
  newState = newState.set('sectionData', null);
  return newState;
}

function mergeData(state, action) {
  let response = action.response.Result;
  let newState = state;
  let page = action.body.CurrentPage;
  let tabIndex = state.get('tabIndex');
  let subIndex = state.get('subIndex');
  let tab = state.getIn(['tabs', tabIndex, subIndex]);
  let items = response.Items;
  if (items === null) {
    items = [];
  }
  let data = tab.get('data')
  if (page === 1) {
    //直接设置
    data = Immutable.fromJS(items);
  } else {
    //追加模式
    data = data.push(...Immutable.fromJS(items).toArray())
  }
  let sectionData = Immutable.fromJS(['test'])
  tab = tab.set('data', data).set('sectionData', sectionData);
  tab = tab.set('isFetching', false);
  tab = tab.set('pageCount', response.PageCount);
  return newState.setIn(['tabs', tabIndex, subIndex], tab);
}

function handleError(state, action) {
  let { Error: err, Message } = action.error;
  let tabIndex = state.get('tabIndex');
  let subIndex = state.get('subIndex');
  switch (err) {

    default:
      if (err !== '-1')
        action.error = Message
  }
  return state.setIn(['tabs', tabIndex, subIndex, 'isFetching'], false)
}

function changeTab(state, action) {
  let { tabIndex, isMain } = action.data;
  if (isMain) {
    state = state.set('tabIndex', tabIndex);
  } else {
    state = state.set('subIndex', tabIndex);
  }
  state = firstPage(state, action)
  return state;
}

function loadRequest(state, action) {
  let tabIndex = state.get('tabIndex');
  let subIndex = state.get('subIndex');
  return state.setIn(['tabs', tabIndex, subIndex, 'isFetching'], true);
}

function nextPage(state, action) {
  let tabIndex = state.get('tabIndex');
  let subIndex = state.get('subIndex');
  let currentPage = state.getIn(['tabs', tabIndex, subIndex, 'filter', 'CurrentPage']) + 1;
  return state.setIn(['tabs', tabIndex, subIndex, 'filter', 'CurrentPage'], currentPage);
}

function firstPage(state, action) {
  let tabIndex = state.get('tabIndex');
  let subIndex = state.get('subIndex');
  //let currentPage = state.getIn(['tabs',tabIndex,subIndex,'filter','CurrentPage'])+1;
  return state.setIn(['tabs', tabIndex, subIndex, 'filter', 'CurrentPage'], 1);
}

export default commonReducer((state, action) => {
  switch (action.type) {
    case MONITION_FILTER_DIDCHANGED:
      return state;//state.set('isFetching',true);
    case MONITION_LOAD_REQUEST:
      return loadRequest(state, action)
    case MONITION_LOAD_SUCCESS:
      return mergeData(state, action);
    case MONITION_FILTER_CLEAR_RESULT:
      return state;
    case MONITION_LOAD_FAILURE:
      return handleError(state, action);
    case MONITION_CHANGE_TAB:
      return changeTab(state, action);
    case MONITION_NEXT_PAGE:
      return nextPage(state, action);
    case CHANGE_PARTNER_SUCCESS:
      return defaultState;
    case BILL_SIGN_UPLOAD_REQUEST:
      return state.set('signPosting', 1)
    case BILL_SIGN_UPLOAD_SUCCESS:
      return state.set('signPosting', 2).set('signKey', action.response.Result)
    case BILL_SIGN_UPLOAD_FAILURE:
      state = state.set('signPosting', 3)
      handleError(state, action)
    case MONITION_FIRSTPAGE:
      return firstPage(state, action)
    default:

  }
  return state;
}, defaultState);
