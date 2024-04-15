'use strict'

export const IMAGE_DELETE_REQUEST = 'IMAGE_DELETE_REQUEST';
export const IMAGE_DELETE_SUCCESS = 'IMAGE_DELETE_SUCCESS';
export const IMAGE_DELETE_FAILURE = 'IMAGE_DELETE_FAILURE';

export function deleteImages(names){
  return (dispatch, getState) => {
    return dispatch({
        types: [IMAGE_DELETE_REQUEST, IMAGE_DELETE_SUCCESS, IMAGE_DELETE_FAILURE],
        url: `/popapi/api/images/delete`,
        body:names
    });

  }
}
