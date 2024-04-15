'use strict';


export const NOTIFY_LOAD_REQUEST = 'NOTIFY_LOAD_REQUEST';
export const NOTIFY_LOAD_SUCCESS = 'NOTIFY_LOAD_SUCCESS';
export const NOTIFY_LOAD_FAILURE = 'NOTIFY_LOAD_FAILURE';

export function loadNotify(body){
  return (dispatch, getState) => {
    return dispatch({
      types: [NOTIFY_LOAD_REQUEST, NOTIFY_LOAD_SUCCESS, NOTIFY_LOAD_FAILURE],
      url: '/ticketapi/v1/message/list',
      body
    });

  }
}

export const NOTIFY_FIRSTPAGE = 'NOTIFY_FIRSTPAGE';
export function firstPage(){
  return (dispatch,getState)=>{
    return dispatch({
      type:NOTIFY_FIRSTPAGE,
    });
  }
}

export const NOTIFY_NEXTPAGE = 'NOTIFY_NEXTPAGE';
export function nextPage(){
  return (dispatch,getState)=>{
    return dispatch({
      type:NOTIFY_NEXTPAGE,
    });
  }
}

export const NOTIFY_UPDATE_UNREAD_REQUEST = 'NOTIFY_UPDATE_UNREAD_REQUEST';
export const NOTIFY_UPDATE_UNREAD_SUCCESS = 'NOTIFY_UPDATE_UNREAD_SUCCESS';
export const NOTIFY_UPDATE_UNREAD_FAILURE = 'NOTIFY_UPDATE_UNREAD_FAILURE';

export function updateUnReadNotify(body){
  return (dispatch, getState) => {
    return dispatch({
      types: [NOTIFY_UPDATE_UNREAD_REQUEST, NOTIFY_UPDATE_UNREAD_SUCCESS, NOTIFY_UPDATE_UNREAD_FAILURE],
      url: '/ticketapi/v1/message/unread',
      body
    });

  }
}
