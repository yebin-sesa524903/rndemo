'use strict';

import storage from '../utils/storage.js';

export const LOAD_CLIPBOARD = 'LOAD_CLIPBOARD';

export function detectClipboard(){
  return (dispatch, getState) => {
    storage.getClipboardContent((content='')=>{
      return dispatch({
        type:LOAD_CLIPBOARD,
        content
      });
    })
  }
}

export const RESET_CLIPBOARD = 'RESET_CLIPBOARD';

export function emptyClipboard(){
  storage.emptyClipboardContent();
  return (dispatch,getState)=>{
    return dispatch({
      type:RESET_CLIPBOARD,
    });
  }
}
