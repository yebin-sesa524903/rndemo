'use strict';

export const TICKET_LOAD_REQUEST = 'TICKET_LOAD_REQUEST';
export const TICKET_LOAD_SUCCESS = 'TICKET_LOAD_SUCCESS';
export const TICKET_LOAD_FAILURE = 'TICKET_LOAD_FAILURE';

export function loadTickets(body, typeTicketTask) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_LOAD_REQUEST, TICKET_LOAD_SUCCESS, TICKET_LOAD_FAILURE],
      url: '/popapi/api/tickets/searchbydate',
      typeTicketTask,
      body: body,//{TicketTaskType:1,"CurrentPage":1, "ItemsPerPage":20, "SearchDate":"2019-11-14"}
    });

  }
}

export const OFFLINE_TICKETS = 'OFFLINE_TICKETS';

export function loadOfflineTickets(body, typeTicketTask, SearchDate) {
  return (dispatch, getState) => {
    return dispatch({
      type: OFFLINE_TICKETS,
      typeTicketTask,
      offline: true,
      body: { "CurrentPage": 1, SearchDate },//{TicketTaskType:1,"CurrentPage":1, "ItemsPerPage":20, "SearchDate":"2019-11-14"}
      response: body
    });

  }
}
export const DOWNLOAD_TICKET_IMAGES = 'DOWNLOAD_TICKET_IMAGES';

export function downloadTicketImages(body) {
  return (dispatch, getState) => {
    return dispatch({
      type: DOWNLOAD_TICKET_IMAGES,
    });

  }
}

export const TICKET_DOWNLOAD_REQUEST = 'TICKET_DOWNLOAD_REQUEST';
export const TICKET_DOWNLOAD_SUCCESS = 'TICKET_DOWNLOAD_SUCCESS';
export const TICKET_DOWNLOAD_FAILURE = 'TICKET_DOWNLOAD_FAILURE';

export function downloadTickets(body, typeTicketTask, isService) {
  return (dispatch, getState) => {
    let prefix = isService ? '/popapi/api/LogBookTickets/DownloadOfflineTicket' : '/popapi/api/tickets/downloadticketsbydate/detail';
    return dispatch({
      types: [TICKET_DOWNLOAD_REQUEST, TICKET_DOWNLOAD_SUCCESS, TICKET_DOWNLOAD_FAILURE],
      url: prefix,
      typeTicketTask, isService,
      body: body,//{TicketTaskType:1,"CurrentPage":1, "ItemsPerPage":20, "SearchDate":"2019-11-14"}
    });

  }
}

export const TICKET_COUNT_LOAD_REQUEST = 'TICKET_COUNT_LOAD_REQUEST';
export const TICKET_COUNT_LOAD_SUCCESS = 'TICKET_COUNT_LOAD_SUCCESS';
export const TICKET_COUNT_LOAD_FAILURE = 'TICKET_COUNT_LOAD_FAILURE';

export function loadTicketCount(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_COUNT_LOAD_REQUEST, TICKET_COUNT_LOAD_SUCCESS, TICKET_COUNT_LOAD_FAILURE],
      url: '/popapi/api/tickets/ticketcount',
      body: body
    });

  }
}

export const OFFLINE_TICKET_COUNT_LOAD = 'OFFLINE_TICKET_COUNT_LOAD';
export function loadOfflineTicketCount(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: OFFLINE_TICKET_COUNT_LOAD,
      data
    })
  }
}

export const TICKET_CHACHE_COUNT_LOAD = 'TICKET_CHACHE_COUNT_LOAD';

export function loadCacheTicketCount(body) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_CHACHE_COUNT_LOAD,
      data: body
    });

  }
}

export const TICKET_LOAD_BYID_REQUEST = 'TICKET_LOAD_BYID_REQUEST';
export const TICKET_LOAD_BYID_SUCCESS = 'TICKET_LOAD_BYID_SUCCESS';
export const TICKET_LOAD_BYID_FAILURE = 'TICKET_LOAD_BYID_FAILURE';

export function loadTicketById(ticketId, data, isHex) {
  //先判断指定的工单是否在本地有修改，有修改，则取本地相应的工单
  if (isConnected()) {

  }


  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_LOAD_BYID_REQUEST, TICKET_LOAD_BYID_SUCCESS, TICKET_LOAD_BYID_FAILURE],
      url: isHex ? `/popapi/api/tickets/hex/${ticketId}` : `/popapi/api/tickets/${ticketId}`,
      ticketId,
      data: { ticketId },
    });
  }
}

export const SERVICE_TICKET_LOAD_BYID_REQUEST = 'SERVICE_TICKET_LOAD_BYID_REQUEST';
export const SERVICE_TICKET_LOAD_BYID_SUCCESS = 'SERVICE_TICKET_LOAD_BYID_SUCCESS';
export const SERVICE_TICKET_LOAD_BYID_FAILURE = 'SERVICE_TICKET_LOAD_BYID_FAILURE';
export function serviceTicketLoadById(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_LOAD_BYID_REQUEST, SERVICE_TICKET_LOAD_BYID_SUCCESS, SERVICE_TICKET_LOAD_BYID_FAILURE],
      url: `/popapi/api/LogBookTickets/GetTicketByTicketId/${ticketId}`,
    })
  }
}

export const SERVICE_TICKET_LOAD_CACHE = 'SERVICE_TICKET_CACHE_LOAD';
export function serviceTicketLoadCacheById(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: SERVICE_TICKET_LOAD_CACHE,
      data
    })
  }
}

export const SERVICE_TICKET_LOAD_REQUEST = 'SERVICE_TICKET_LOAD_REQUEST';
export const SERVICE_TICKET_LOAD_SUCCESS = 'SERVICE_TICKET_LOAD_SUCCESS';
export const SERVICE_TICKET_LOAD_FAILURE = 'SERVICE_TICKET_LOAD_FAILURE';
export function serviceTicketLoad(body, typeTicketTask) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_LOAD_REQUEST, SERVICE_TICKET_LOAD_SUCCESS, SERVICE_TICKET_LOAD_FAILURE],
      url: `/popapi/api/LogBookTickets/GetTicketsByDate`,
      typeTicketTask,
      body
    })
  }
}

export const SERVICE_TICKET_FILTER_LOAD_REQUEST = 'SERVICE_TICKET_FILTER_LOAD_REQUEST';
export const SERVICE_TICKET_FILTER_LOAD_SUCCESS = 'SERVICE_TICKET_FILTER_LOAD_SUCCESS';
export const SERVICE_TICKET_FILTER_LOAD_FAILURE = 'SERVICE_TICKET_FILTER_LOAD_FAILURE';
export function serviceTicketFilterLoad(body, typeTicketTask) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_FILTER_LOAD_REQUEST, SERVICE_TICKET_FILTER_LOAD_SUCCESS, SERVICE_TICKET_FILTER_LOAD_FAILURE],
      url: `/popapi/api/LogBookTickets/GetTickets`,
      typeTicketTask,
      body
    })
  }
}

export const SERVICE_TICKET_EXECUTING_REQUEST = 'SERVICE_TICKET_EXECUTING_REQUEST';
export const SERVICE_TICKET_EXECUTING_SUCCESS = 'SERVICE_TICKET_EXECUTING_SUCCESS';
export const SERVICE_TICKET_EXECUTING_FAILURE = 'SERVICE_TICKET_EXECUTING_FAILURE';
export function serviceTicketExecute(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_EXECUTING_REQUEST, SERVICE_TICKET_EXECUTING_SUCCESS, SERVICE_TICKET_EXECUTING_FAILURE],
      url: `/popapi/api/LogBookTickets/ExecuteTicket/${ticketId}`,
      body: { ticketId }
    })
  }
}

export const SERVICE_TICKET_VALIDATE_REQUEST = 'SERVICE_TICKET_VALIDATE_REQUEST';
export const SERVICE_TICKET_VALIDATE_SUCCESS = 'SERVICE_TICKET_VALIDATE_SUCCESS';
export const SERVICE_TICKET_VALIDATE_FAILURE = 'SERVICE_TICKET_VALIDATE_FAILURE';
export function serviceTicketValidate(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_VALIDATE_REQUEST, SERVICE_TICKET_VALIDATE_SUCCESS, SERVICE_TICKET_VALIDATE_FAILURE],
      url: `/popapi/api/LogBookTickets/ValidateTicket/${ticketId}`,
      body: { ticketId }
    })
  }
}

export const SERVICE_TICKET_SUBMIT_REQUEST = 'SERVICE_TICKET_SUBMIT_REQUEST';
export const SERVICE_TICKET_SUBMIT_SUCCESS = 'SERVICE_TICKET_SUBMIT_SUCCESS';
export const SERVICE_TICKET_SUBMIT_FAILURE = 'SERVICE_TICKET_SUBMIT_FAILURE';
export function serviceTicketSubmit(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_SUBMIT_REQUEST, SERVICE_TICKET_SUBMIT_SUCCESS, SERVICE_TICKET_SUBMIT_FAILURE],
      url: `/popapi/api/LogBookTickets/SubmitTicket/${ticketId}`,
      body: { ticketId }
    })
  }
}

export const SERVICE_TICKET_UPDATE_CONTENT_BYID_REQUEST = 'SERVICE_TICKET_UPDATE_CONTENT_BYID_REQUEST';
export const SERVICE_TICKET_UPDATE_CONTENT_BYID_SUCCESS = 'SERVICE_TICKET_UPDATE_CONTENT_BYID_SUCCESS';
export const SERVICE_TICKET_UPDATE_CONTENT_BYID_FAILURE = 'SERVICE_TICKET_UPDATE_CONTENT_BYID_FAILURE';
export function serviceTicketUpdateContentById(ticketId, content) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_UPDATE_CONTENT_BYID_REQUEST, SERVICE_TICKET_UPDATE_CONTENT_BYID_SUCCESS, SERVICE_TICKET_UPDATE_CONTENT_BYID_FAILURE],
      url: `/popapi/api/LogBookTickets/UpdateTicketContent/${ticketId}`,
      body: content
    })
  }
}

export const SERVICE_TICKET_LOAD_TREE_HIERARCHY_REQUEST = 'SERVICE_TICKET_LOAD_TREE_HIERARCHY_REQUEST';
export const SERVICE_TICKET_LOAD_TREE_HIERARCHY_SUCCESS = 'SERVICE_TICKET_LOAD_TREE_HIERARCHY_SUCCESS';
export const SERVICE_TICKET_LOAD_TREE_HIERARCHY_FAILURE = 'SERVICE_TICKET_LOAD_TREE_HIERARCHY_FAILURE';
export function serviceTicketLoadHierarchy(userId, assetId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SERVICE_TICKET_LOAD_TREE_HIERARCHY_REQUEST, SERVICE_TICKET_LOAD_TREE_HIERARCHY_SUCCESS, SERVICE_TICKET_LOAD_TREE_HIERARCHY_FAILURE],
      url: `/popapi/api/${userId}/${assetId}/abovepanel/hierarchy`,
    })
  }
}

export const SERVICE_TICKET_LOAD_CACHE_HIERARCHY = 'SERVICE_TICKET_LOAD_CACHE_HIERARCHY';
export function serviceTicketLoadCacheHierarchy(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: SERVICE_TICKET_LOAD_CACHE_HIERARCHY,
      data
    })
  }
}

export const SERVICE_TICKET_TREE_EXPAND = 'SERVICE_TICKET_TREE_EXPAND';
export function serviceTicketTreeExpand(row) {
  return (dispatch, getState) => {
    return dispatch({
      type: SERVICE_TICKET_TREE_EXPAND,
      row
    })
  }
}

export const SERVICE_CHANGE_IGNORE = 'SERVICE_CHANGE_IGNORE';
export function changeServiceTaskIgnore(data) {
  return (dispatch, getState) => {
    return dispatch(
      {
        type: SERVICE_CHANGE_IGNORE,
        data
      }
    )
  }
}

export const TICKET_LOAD_IN_CACHE = 'TICKET_LOAD_IN_CACHE';
export function loadCacheTicketById(ticket) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_LOAD_IN_CACHE,
      ticket: ticket,
    });
  }
}

export const TICKET_NEXTPAGE = 'TICKET_NEXTPAGE';
export function nextPage(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_NEXTPAGE,
      data,
    });
  }
}

export const TICKET_FOLD = 'TICKET_FOLD';
export function foldTickets(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FOLD,
      data,
    });
  }
}

export const TICKET_CHANGED_SEARCH_DATE = 'TICKET_CHANGED_SEARCH_DATE';
export function changeSearchDate(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_CHANGED_SEARCH_DATE,
      data,
    });
  }
}

export const TICKET_ACCEPT_REQUEST = 'TICKET_ACCEPT_REQUEST';
export const TICKET_ACCEPT_SUCCESS = 'TICKET_ACCEPT_SUCCESS';
export const TICKET_ACCEPT_FAILURE = 'TICKET_ACCEPT_FAILURE';
//抢单
export function acceptTicket(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_ACCEPT_REQUEST, TICKET_ACCEPT_SUCCESS, TICKET_ACCEPT_FAILURE],
      url: `/popapi/api/tickets/accept/${ticketId}`,
      body: { ticketId }
    });
  }
}

export const TICKET_REJECT_REQUEST = 'TICKET_REJECT_REQUEST';
export const TICKET_REJECT_SUCCESS = 'TICKET_REJECT_SUCCESS';
export const TICKET_REJECT_FAILURE = 'TICKET_REJECT_FAILURE';
//拒单
export function rejectTicket(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_REJECT_REQUEST, TICKET_REJECT_SUCCESS, TICKET_REJECT_FAILURE],
      url: `/popapi/api/tickets/reject/${ticketId}`,
      body: { ticketId }
    });
  }
}

export const TICKET_EXECUTE_REQUEST = 'TICKET_EXECUTE_REQUEST';
export const TICKET_EXECUTE_SUCCESS = 'TICKET_EXECUTE_SUCCESS';
export const TICKET_EXECUTE_FAILURE = 'TICKET_EXECUTE_FAILURE';

export function execute(data, urgenceTicket) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_EXECUTE_REQUEST, TICKET_EXECUTE_SUCCESS, TICKET_EXECUTE_FAILURE],
      url: urgenceTicket ? '/popapi/api/tickets/executorarrived' : '/popapi/api/tickets/StartWithLocation',//`tickets/start/${ticketId}`,//
      // body:{ticketId}
      body: data
    });

  }
}

export const TICKET_SUMMARY_REQUEST = 'TICKET_SUMMARY_REQUEST';
export const TICKET_SUMMARY_SUCCESS = 'TICKET_SUMMARY_SUCCESS';
export const TICKET_SUMMARY_FAILURE = 'TICKET_SUMMARY_FAILURE';

export function setSummary(tid, summary) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_SUMMARY_REQUEST, TICKET_SUMMARY_SUCCESS, TICKET_SUMMARY_FAILURE],
      url: '/popapi/api/tickets/setSummary',
      body: {
        "ticketId": tid,
        "content": summary
      }
    });
  }
}

export const TICKET_SUMMARY_CHANGE = 'TICKET_SUMMARY_CHANGE';
export function changeSummary(summary, isResult) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_SUMMARY_CHANGE,
      summary,
      isResult
    })
  }
}

export const TICKET_SUBMIT_REQUEST = 'TICKET_SUBMIT_REQUEST';
export const TICKET_SUBMIT_SUCCESS = 'TICKET_SUBMIT_SUCCESS';
export const TICKET_SUBMIT_FAILURE = 'TICKET_SUBMIT_FAILURE';

export function submitTicket(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_SUBMIT_REQUEST, TICKET_SUBMIT_SUCCESS, TICKET_SUBMIT_FAILURE],
      url: `/popapi/api/tickets/auth/${ticketId}`,
      body: { ticketId }
    });

  }
}

export const TICKET_FINISH_REQUEST = 'TICKET_FINISH_REQUEST';
export const TICKET_FINISH_SUCCESS = 'TICKET_FINISH_SUCCESS';
export const TICKET_FINISH_FAILURE = 'TICKET_FINISH_FAILURE';

export function finish(ticketId, content) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_FINISH_REQUEST, TICKET_FINISH_SUCCESS, TICKET_FINISH_FAILURE],
      url: `/popapi/api/tickets/close`,
      body: { id: ticketId, content }
    });

  }
}


export const TICKET_LOGS_REQUEST = 'TICKET_LOGS_REQUEST';
export const TICKET_LOGS_SUCCESS = 'TICKET_LOGS_SUCCESS';
export const TICKET_LOGS_FAILURE = 'TICKET_LOGS_FAILURE';

export function loadTicketLogs(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_LOGS_REQUEST, TICKET_LOGS_SUCCESS, TICKET_LOGS_FAILURE],
      url: `/popapi/api/tickets/${ticketId}/logs`,
      ticketId
    });

  }
}

export const TICKET_LOG_CACHE_LOAD = 'TICKET_LOG_CACHE_LOAD';
export function loadTicketLogsFromCache(ticketId, logs) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_LOG_CACHE_LOAD,
      ticketId, logs
    });
  }
}

export const TICKET_LOG_SAVE_REQUEST = 'TICKET_LOG_SAVE_REQUEST';
export const TICKET_LOG_SAVE_SUCCESS = 'TICKET_LOG_SAVE_SUCCESS';
export const TICKET_LOG_SAVE_FAILURE = 'TICKET_LOG_SAVE_FAILURE';

export function saveLog(body, isCreate) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_LOG_SAVE_REQUEST, TICKET_LOG_SAVE_SUCCESS, TICKET_LOG_SAVE_FAILURE],
      url: isCreate ? '/popapi/api/tickets/ticketlogs/create' : '/popapi/api/tickets/ticketlogs/update',
      body,
      opt: !isCreate
    });

  }
}

export const TICKET_LOG_DELETE_REQUEST = 'TICKET_LOG_DELETE_REQUEST';
export const TICKET_LOG_DELETE_SUCCESS = 'TICKET_LOG_DELETE_SUCCESS';
export const TICKET_LOG_DELETE_FAILURE = 'TICKET_LOG_DELETE_FAILURE';

export function deleteLog(ticketId, ticketLogId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_LOG_DELETE_REQUEST, TICKET_LOG_DELETE_SUCCESS, TICKET_LOG_DELETE_FAILURE],
      url: `/popapi/api/tickets/ticketlogs/delete/${ticketLogId}`,
      body: { ticketId, ticketLogId }
    });

  }
}



export const TICKET_LOGINFO_CHANGED = 'TICKET_LOGINFO_CHANGED';

export function logInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_LOGINFO_CHANGED,
      data
    });
  }
}

export const TICKET_INSPECTION_REMARK_CHANGED = 'TICKET_INSPECTION_REMARK_CHANGED';

export function inspectionRemarkChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_INSPECTION_REMARK_CHANGED,
      data
    });
  }
}

export const TICKET_DELETE_IMAGE_REQUEST = 'TICKET_DELETE_IMAGE_REQUEST';
export const TICKET_DELETE_IMAGE_SUCCESS = 'TICKET_DELETE_IMAGE_SUCCESS';
export const TICKET_DELETE_IMAGE_FAILURE = 'TICKET_DELETE_IMAGE_FAILURE';

export function deleteLogImage(names) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_DELETE_IMAGE_REQUEST, TICKET_DELETE_IMAGE_SUCCESS, TICKET_DELETE_IMAGE_FAILURE],
      url: `/popapi/api/images/delete`,
      body: names
    });

  }
}

export const TICKET_MESSAGES_REQUEST = 'TICKET_MESSAGES_REQUEST';
export const TICKET_MESSAGES_SUCCESS = 'TICKET_MESSAGES_SUCCESS';
export const TICKET_MESSAGES_FAILURE = 'TICKET_MESSAGES_FAILURE';

export function loadTicketMsgs(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_MESSAGES_REQUEST, TICKET_MESSAGES_SUCCESS, TICKET_MESSAGES_FAILURE],
      url: `/popapi/api/tickets/discuss/${ticketId}`,
      ticketId
    });
  }
}

export const TICKET_MESSAGES_COUNT = 'TICKET_MESSAGES_COUNT';


export function setTicketMsgsCount(count) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_MESSAGES_COUNT,
      count
    });
  }
}

export const TICKET_UPDATE_INSPECTION_CONTENT = 'TICKET_UPDATE_INSPECTION_CONTENT';
export function updateTicketInspectionContentItems(index, item) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_UPDATE_INSPECTION_CONTENT,
      data: { index, item }
    });
  }
}

export const TICKET_SIGN_SAVE_REQUEST = 'TICKET_SIGN_SAVE_REQUEST';
export const TICKET_SIGN_SAVE_SUCCESS = 'TICKET_SIGN_SAVE_SUCCESS';
export const TICKET_SIGN_SAVE_FAILURE = 'TICKET_SIGN_SAVE_FAILURE';

export function signatureImage(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_SIGN_SAVE_REQUEST, TICKET_SIGN_SAVE_SUCCESS, TICKET_SIGN_SAVE_FAILURE],
      url: '/popapi/api/tickets/sign',
      body
    });
  }
}

export const TICKET_SIGN_CACHE_SAVE = 'TICKET_SIGN_CACHE_SAVE';
export function saveCacheSign(img, signType) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_SIGN_CACHE_SAVE,
      signImage: img,
      signType
    });
  }
}

export const TICKET_MESSAGE_SAVE_REQUEST = 'TICKET_MESSAGE_SAVE_REQUEST';
export const TICKET_MESSAGE_SAVE_SUCCESS = 'TICKET_MESSAGE_SAVE_SUCCESS';
export const TICKET_MESSAGE_SAVE_FAILURE = 'TICKET_MESSAGE_SAVE_FAILURE';

export function saveMessage(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_MESSAGE_SAVE_REQUEST, TICKET_MESSAGE_SAVE_SUCCESS, TICKET_MESSAGE_SAVE_FAILURE],
      url: '/popapi/api/tickets/creatediscuss',
      body
    });

  }
}

export const TICKET_MESSAGE_DELETE_REQUEST = 'TICKET_MESSAGE_DELETE_REQUEST';
export const TICKET_MESSAGE_DELETE_SUCCESS = 'TICKET_MESSAGE_DELETE_SUCCESS';
export const TICKET_MESSAGE_DELETE_FAILURE = 'TICKET_MESSAGE_DELETE_FAILURE';

export function deleteMessage(ticketId, ticketLogId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_MESSAGE_DELETE_REQUEST, TICKET_MESSAGE_DELETE_SUCCESS, TICKET_MESSAGE_DELETE_FAILURE],
      url: `/popapi/api/tickets/deletediscuss/${ticketLogId}`,
      data: { ticketId, ticketLogId }
    });

  }
}

export const TICKET_MESSAGE_READED_REQUEST = 'TICKET_MESSAGE_READED_REQUEST';
export const TICKET_MESSAGE_READED_SUCCESS = 'TICKET_MESSAGE_READED_SUCCESS';
export const TICKET_MESSAGE_READED_FAILURE = 'TICKET_MESSAGE_READED_FAILURE';

export function setMessageToRead(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_MESSAGE_READED_REQUEST, TICKET_MESSAGE_READED_SUCCESS, TICKET_MESSAGE_READED_FAILURE],
      url: `/popapi/api/tickets/readdiscuss/${ticketId}`,
      data: { ticketId }
    });

  }
}

export const TICKET_MESSAGEINFO_CHANGED = 'TICKET_MESSAGEINFO_CHANGED';

export function messageInfoChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_MESSAGEINFO_CHANGED,
      data
    });
  }
}

export const TICKET_MESSAGE_CLEAN = 'TICKET_MESSAGE_CLEAN';

export function cleanTicketMessage() {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_MESSAGE_CLEAN,
    });
  }
}

export const CUSTOMER_LOAD_REQUEST = 'CUSTOMER_LOAD_REQUEST';
export const CUSTOMER_LOAD_SUCCESS = 'CUSTOMER_LOAD_SUCCESS';
export const CUSTOMER_LOAD_FAILURE = 'CUSTOMER_LOAD_FAILURE';

export function getCustomer() {
  return (dispatch, getState) => {
    return dispatch({
      types: [CUSTOMER_LOAD_REQUEST, CUSTOMER_LOAD_SUCCESS, CUSTOMER_LOAD_FAILURE],
      // url: `/popapi/api/building/myBuildings`,
      url: `/popapi/api/user/current/customers`,
    });
  }
}

export const CREATE_TICKET_DATA_INIT = 'CREATE_TICKET_DATA_INIT';
export function loadCreateTicketData(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: CREATE_TICKET_DATA_INIT,
      data
    });
  }
}

export const TICKET_CREATE_CONDITION_CHANGED = 'TICKET_CREATE_CONDITION_CHANGED';
export function ticketCreateConditionChange(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_CREATE_CONDITION_CHANGED,
      data
    });
  }
}

export const CUSTOMER_USERS_REQUEST = 'CUSTOMER_USERS_REQUEST';
export const CUSTOMER_USERS_SUCCESS = 'CUSTOMER_USERS_SUCCESS';
export const CUSTOMER_USERS_FAILURE = 'CUSTOMER_USERS_FAILURE';

export function getUsersFromCustomer(customerId, startTime, endTime) {
  return (dispatch, getState) => {
    return dispatch({
      types: [CUSTOMER_USERS_REQUEST, CUSTOMER_USERS_SUCCESS, CUSTOMER_USERS_FAILURE],
      url: `/popapi/api/tickets/users/${customerId}/${startTime}/${endTime}`,
    });
  }
}

export const ASSETS_USERS_REQUEST = 'ASSETS_USERS_REQUEST';
export const ASSETS_USERS_SUCCESS = 'ASSETS_USERS_SUCCESS';
export const ASSETS_USERS_FAILURE = 'ASSETS_USERS_FAILURE';

export function getUsersFromAssets(body, data) {
  return (dispatch, getState) => {
    return dispatch({
      types: [ASSETS_USERS_REQUEST, ASSETS_USERS_SUCCESS, ASSETS_USERS_FAILURE],
      url: `/bff/eh/rest/ticket/executorDetailList`,
      body, data
    });
  }
}

export const USER_SELECT_CHANGED = 'USER_SELECT_CHANGED';
export function updateUserSelectInfo(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: USER_SELECT_CHANGED,
      data
    });
  }
}

export const ASSET_SELECT_CHANGED = 'ASSET_SELECT_CHANGED';
export function updateAssetsSelectInfo(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: ASSET_SELECT_CHANGED,
      data
    });
  }
}

export const TICKET_RESET = 'TICKET_RESET';
export function resetTicket(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_RESET,
      data
    });
  }
}

export const PATROL_TICKET_ITEM_CHANGED = 'PATROL_TICKET_ITEM_CHANGED';
export function patrolTicketItemChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: PATROL_TICKET_ITEM_CHANGED,
      data
    });
  }
}

export const PATROL_CLEAR_RECORD = 'PATROL_CLEAR_RECORD';
export function clearPatrolUpdateIndex() {
  return (dispatch, getState) => {
    return dispatch({
      type: PATROL_CLEAR_RECORD
    })
  }
}

export const PATROL_TICKET_STATUS_CHANGED = 'PATROL_TICKET_STATUS_CHANGED';
export function patrolTicketStatusChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: PATROL_TICKET_STATUS_CHANGED,
      data
    });
  }
}

export const TICKET_CREATE_REQUEST = 'TICKET_CREATE_REQUEST';
export const TICKET_CREATE_SUCCESS = 'TICKET_CREATE_SUCCESS';
export const TICKET_CREATE_FAILURE = 'TICKET_CREATE_FAILURE';

export function createTicket(body, edit) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_CREATE_REQUEST, TICKET_CREATE_SUCCESS, TICKET_CREATE_FAILURE],
      url: edit ? '/bff/eh/rest/ticket/update' : '/bff/eh/rest/ticket/create',
      body: body,
    });
  }
}

export const TICKET_GET_ASSET_CHILDREN_REQUEST = 'TICKET_GET_ASSET_CHILDREN_REQUEST';
export const TICKET_GET_ASSET_CHILDREN_SUCCESS = 'TICKET_GET_ASSET_CHILDREN_SUCCESS';
export const TICKET_GET_ASSET_CHILDREN_FAILURE = 'TICKET_GET_ASSET_CHILDREN_FAILURE';

export function getAssetChildren(assetId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_GET_ASSET_CHILDREN_REQUEST, TICKET_GET_ASSET_CHILDREN_SUCCESS, TICKET_GET_ASSET_CHILDREN_FAILURE],
      url: '/bff/eh/rest/ticket/getChildrenByHierarchyId',
      body: {
        "id": assetId,
        "isDeep": true
      },
    });
  }
}

export const TICKET_CREATE_RESET = 'TICKET_CREATE_RESET';
export function resetCreateTicket(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_CREATE_RESET,
      data
    });
  }
}


export const TICKET_DELETE_REQUEST = 'TICKET_DELETE_REQUEST';
export const TICKET_DELETE_SUCCESS = 'TICKET_DELETE_SUCCESS';
export const TICKET_DELETE_FAILURE = 'TICKET_DELETE_FAILURE';

export function deleteTicket(ticketId) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_DELETE_REQUEST, TICKET_DELETE_SUCCESS, TICKET_DELETE_FAILURE],
      url: `/bff/eh/rest/ticket/delete`,
      body: { id: ticketId }
    });
  }
}

export const TICKET_LOG_CLEAN = 'TICKET_LOG_CLEAN';

export function cleanTicketLog() {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_LOG_CLEAN,
    });
  }
}

export const TICKET_LOG_CACHE_RELOAD = 'TICKET_LOG_CACHE_RELOAD';
export function reloadCacheTicketLog() {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_LOG_CACHE_RELOAD
    })
  }
}

export const TICKET_FILTER_RESET = 'TICKET_FILTER_RESET';

export function resetFilterData() {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_RESET,
    });
  }
}

export const TICKET_FILTER_CLOSED = 'TICKET_FILTER_CLOSED';

export function filterClosed() {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_CLOSED,
    });
  }
}

export const TICKET_FILTER_CHANGED = 'TICKET_FILTER_CHANGED';

export function filterChanged(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_CHANGED,
      data
    });
  }
}

export const TICKET_FILTER_BUILDING_REQUEST = 'TICKET_FILTER_BUILDING_REQUEST';
export const TICKET_FILTER_BUILDING_SUCCESS = 'TICKET_FILTER_BUILDING_SUCCESS';
export const TICKET_FILTER_BUILDING_FAILURE = 'TICKET_FILTER_BUILDING_FAILURE';
export function loadTicketBuildings() {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_FILTER_BUILDING_REQUEST, TICKET_FILTER_BUILDING_SUCCESS, TICKET_FILTER_BUILDING_FAILURE],
      url: '/popapi/api/building/myBuildings',
      body: {}
    });
  }
}

export const TICKET_FILTER_NEXTPAGE = 'TICKET_FILTER_NEXTPAGE';
export function nextFilterPage(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_NEXTPAGE,
      data,
    });
  }
}

export const TICKET_FILTER_SEARCH = 'TICKET_FILTER_SEARCH';
export function filterReadyToSearch(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_SEARCH,
      data,
    });
  }
}

export const TICKET_FILTER_FOLDER = 'TICKET_FILTER_FOLDER';
export function folderTicketFilter(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_FOLDER,
      data
    });
  }
}

export const TICKET_FILTER_REQUEST = 'TICKET_FILTER_REQUEST';
export const TICKET_FILTER_SUCCESS = 'TICKET_FILTER_SUCCESS';
export const TICKET_FILTER_FAILURE = 'TICKET_FILTER_FAILURE';
export function loadTicketFilterResult(params) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_FILTER_REQUEST, TICKET_FILTER_SUCCESS, TICKET_FILTER_FAILURE],
      url: `/popapi/api/tickets/searchme`,
      body: { ...params }
    });
  }
}

export const TICKET_FILTER_RESETRESULT = 'TICKET_FILTER_RESETRESULT';
export function resetTicketFilterResult(data) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_RESETRESULT,
      data
    });
  }
}

export const TICKET_FILTER_SET_TYPE = 'TICKET_FILTER_SET_TYPE';
export function setTicketFilterType(isService) {
  return (dispatch, getState) => {
    return dispatch({
      type: TICKET_FILTER_SET_TYPE,
      isService,
    })
  }
}

export const SUBMIT_PATROL_TICKET_ITEM_REQUEST = 'SUBMIT_PATROL_TICKET_ITEM_REQUEST';
export const SUBMIT_PATROL_TICKET_ITEM_SUCCESS = 'SUBMIT_PATROL_TICKET_ITEM_SUCCESS';
export const SUBMIT_PATROL_TICKET_ITEM_FAILURE = 'SUBMIT_PATROL_TICKET_ITEM_FAILURE';
export function submitPatrolTicketItems(ticketId, content) {
  return (dispatch, getState) => {
    return dispatch({
      types: [SUBMIT_PATROL_TICKET_ITEM_REQUEST, SUBMIT_PATROL_TICKET_ITEM_SUCCESS, SUBMIT_PATROL_TICKET_ITEM_FAILURE],
      url: `/popapi/api/tickets/execute/${ticketId}`,
      body: content//{Content:content}
    });
  }
}


export const TICKET_REJECT_NO_REQUEST = 'TICKET_REJECT_NO_REQUEST';
export const TICKET_REJECT_NO_SUCCESS = 'TICKET_REJECT_NO_SUCCESS';
export const TICKET_REJECT_NO_FAILURE = 'TICKET_REJECT_NO_FAILURE';
export function ticketReject(ticketId, content) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_REJECT_NO_REQUEST, TICKET_REJECT_NO_SUCCESS, TICKET_REJECT_NO_FAILURE],
      url: `/popapi/api/tickets/dismiss`,
      body: {
        TicketId: ticketId,
        RejectReason: content
      }
    });
  }
}

/**
 * 先获取cookie 在请求执行人列表详情
 * {"userId":814235,"userName":"test_admin","sysId":"128","privileges":[]}
 * @returns {function(*, *): *}
 */
export function ticketGetCookie(body) {
  return (dispatch, getState) => {
    return dispatch({
      types: [TICKET_REJECT_NO_REQUEST, TICKET_REJECT_NO_SUCCESS, TICKET_REJECT_NO_FAILURE],
      url: `/bff/eh/rest/getCookie`,
      body,
    });
  }
}


export const TICKET_EXECUTORS_REQUEST = 'TICKET_EXECUTORS_REQUEST';
export const TICKET_EXECUTORS_SUCCESS = 'TICKET_EXECUTORS_SUCCESS';
export const TICKET_EXECUTORS_FAILURE = 'TICKET_EXECUTORS_FAILURE';
/**
 * 执行人列表
 * @returns {function(*, *): *}
 */
export function loadExecutors(ids, body) {
  return (dispatch, getState) => {
    console.log('dis', ids);
    return dispatch({
      types: [TICKET_EXECUTORS_REQUEST, TICKET_EXECUTORS_SUCCESS, TICKET_EXECUTORS_FAILURE],
      url: `/bff/eh/rest/ticket/edit/spotExecutors?hierarchyIds=${ids.join(',')}`,//`/bff/eh/rest/ticket/executors`,
      //body,
    });
  }
}


// /bff/eh/rest/getCookie
