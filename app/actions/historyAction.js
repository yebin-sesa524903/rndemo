'use strict';

export const HISTORY_LOAD_REQUEST = 'HISTORY_LOAD_REQUEST';
export const HISTORY_LOAD_SUCCESS = 'HISTORY_LOAD_SUCCESS';
export const HISTORY_LOAD_FAILURE = 'HISTORY_LOAD_FAILURE';

export function loadHistoryData(body){
  return (dispatch, getState) => {
    return dispatch({
        types: [HISTORY_LOAD_REQUEST, HISTORY_LOAD_SUCCESS, HISTORY_LOAD_FAILURE],
        url: '/bff/eh/rest/tagHistory',
        body
    });
  }
}

export const HISTORY_STEP_CHANGED = 'HISTORY_STEP_CHANGED';

export function updateStepData(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:HISTORY_STEP_CHANGED,
      data
    });
  }
}

export const HISTORY_DATA_RESET = 'HISTORY_DATA_RESET';

export function resetHistoryData(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:HISTORY_DATA_RESET,
      data
    });
  }
}
