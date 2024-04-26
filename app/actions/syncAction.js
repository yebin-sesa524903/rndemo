'use strict';

export const SYNC_ABORT = 'SYNC_ABORT';
//同步终止（通过过长中断网了）
export function syncAbort() {
  return (dispatch, getState) => {
    return dispatch({
      type: SYNC_ABORT,
    });
  }
}

export const ININT_SYNC = 'ININT_SYNC';
//初始化同步内容（无网切换到有网状态）
export function initSync(syncData) {
  return (dispatch, getState) => {
    return dispatch({
      type: ININT_SYNC,
      data: syncData
    });
  }
}

export const SYNC_GIVE_UP = 'SYNC_GIVE_UP';
//放弃指定id工单的本地修改
export function giveUpSync(ticketId, isService) {
  return (dispatch, getState) => {
    return dispatch({
      type: SYNC_GIVE_UP,
      data: { ticketId, isService }
    });
  }
}

export const SYNC_COVER = 'SYNC_COVER';
//覆盖提交指定id工单的本地修改
export function coverSync(ticketId, isService) {
  return (dispatch, getState) => {
    return dispatch({
      type: SYNC_COVER,
      data: { ticketId, isService }
    });
  }
}

export const SYNC_RETRY = 'SYNC_RETRY';
//覆盖提交指定id工单的本地修改
export function retrySync(ticketId, isService) {
  return (dispatch, getState) => {
    return dispatch({
      type: SYNC_RETRY,
      data: { ticketId, isService }
    });
  }
}

export const SYNC_TICKET_BY_ID_REQUEST = 'SYNC_TICKET_BY_ID_REQUEST';
export const SYNC_TICKET_BY_ID_SUCCESS = 'SYNC_TICKET_BY_ID_SUCCESS';
export const SYNC_TICKET_BY_ID_FAILURE = 'SYNC_TICKET_BY_ID_FAILURE';

export function syncTicketById(ticketId, body, isService) {
  let url = isService ? '/popapi/api/LogBookTickets/UploadOfflineTicket' : `/popapi/api/tickets/submit/${ticketId}`;
  return (dispatch, getState) => {
    return dispatch({
      types: [SYNC_TICKET_BY_ID_REQUEST, SYNC_TICKET_BY_ID_SUCCESS, SYNC_TICKET_BY_ID_FAILURE],
      url: url,//`${prefix}/${ticketId}`,
      body,
      data: { ticketId, isService },
    });

  }
}

export const UPDATE_IMAGE_UPLOAD_RECORD = 'UPDATE_IMAGE_UPLOAD_RECORD';
//更新同步时，图片上传记录(哪些本地图片已经上传了)
export function updateImageUploadRecord(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: UPDATE_IMAGE_UPLOAD_RECORD,
      data: data
    });
  }
}

export const CHECK_TICKET_BY_ID_REQUEST = 'CHECK_TICKET_BY_ID_REQUEST';
export const CHECK_TICKET_BY_ID_SUCCESS = 'CHECK_TICKET_BY_ID_SUCCESS';
export const CHECK_TICKET_BY_ID_FAILURE = 'CHECK_TICKET_BY_ID_FAILURE';
export const CHECK_SERVICE_TICKET = 'CHECK_SERVICE_TICKET';

export function checkTicketById(ticketId, userName, isService) {
  return (dispatch, getState) => {
    if (isService) {
      return dispatch({
        type: CHECK_SERVICE_TICKET,
        data: { ticketId, userName, isService },
      });
    }
    let prefix = isService ? 'LogBookTickets/GetTicketByTicketId' : 'tickets';
    return dispatch({
      types: [CHECK_TICKET_BY_ID_REQUEST, CHECK_TICKET_BY_ID_SUCCESS, CHECK_TICKET_BY_ID_FAILURE],
      url: `/popapi/api/${prefix}/${ticketId}`,
      data: { ticketId, userName, isService },
    });

  }
}
