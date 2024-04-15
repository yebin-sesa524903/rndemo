'use strict'

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE';


export function resetError() {
  return (dispatch, getState) => {
    return dispatch({
        type:RESET_ERROR_MESSAGE
    });
  }
}
