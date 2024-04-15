'use strict';


import {
  FEEDBACK_LOGINFO_CHANGED,
  FEEDBACK_LOG_CLEAN,
  FEEDBACK_LOG_SAVE_SUCCESS,
  FEEDBACK_LOG_SAVE_FAILURE,
  CACHE_ALBUM_DATA,REFRESH_ALBUM_DATA
} from '../actions/myAction';

import {LOGOUT_SUCCESS} from '../actions/loginAction.js';

import Immutable from 'immutable';


var defaultState = Immutable.fromJS({
  FeedId:0,
  Content:'',
  ContactInfo:'',
  Pictures:[],
  isPostSuccess:false,
  Albums:[],
  refreshAlbum:false
});


function generateName(pics,feedId,userId) {
  //key image-ticket-log-${feedId}-${userId}-time
  var time = new Date().getTime();
  return `image-feedback-log-${feedId}-${userId}-${time}-${pics.size}`;
}


function initDefaultState(state,action) {
  return state;
  // var {data:{old,feedId}} = action;
  // if(!old){
  //   return Immutable.fromJS({
  //     FeedId:feedId,
  //     Content:'',
  //     ContactInfo:'',
  //     Pictures:[],
  //     isPostSuccess:false,
  //   });
  // }
  // else {
  //   return old;
  // }

}

function refreshAlbum(state,action) {
  return state.set('refreshAlbum',true);
}

function cacheAlbum(state,action) {
  // console.warn('cache',action);
  let data=action.data;
  return state.set('Albums',Immutable.fromJS(data)).set('refreshAlbum',false);
}

function infoChanged(state,action1) {
  var {data:{feedId,userId,type,action,value}} = action1;

  if(type === 'init'){
    return initDefaultState(state,action1);
  }
  if(!state) return state; //fast back #14581,must put behind init

  var newState = state;
  if(type === 'content'){
    return newState.set('Content',value);
  }else if(type === 'contacts'){
    return newState.set('ContactInfo',value);
  }
  else {
    var pics = newState.get('Pictures');
    if(action === 'add'){
      //[{name,uri}]
      value.forEach((item)=>{
        pics = pics.push(
          Immutable.Map({
            PictureId:generateName(pics,feedId,userId),
            uri:item.uri
          }));
      })

    }
    else if (action === 'uploaded') {
      // console.warn('uploaded');
      var index = pics.findIndex((item)=>item === value);
      if (index!==-1) {
        pics = pics.update(index,(item)=>item.set('loaded',true));
      }
    }
    else if (action === 'delete'){
      var index = pics.findIndex((item)=>item === value);
      pics = pics.delete(index);
    }
    // console.warn('pics',pics);
    return newState.set('Pictures',pics);
  }
}

function saveSuccess(state,action1) {
  return state.set('isPostSuccess',true);
}

export default function(state=defaultState,action){

  switch (action.type) {
    case FEEDBACK_LOGINFO_CHANGED:
      return infoChanged(state,action);
    case FEEDBACK_LOG_SAVE_SUCCESS:
    case FEEDBACK_LOG_SAVE_FAILURE:
      return saveSuccess(state,action);
    case LOGOUT_SUCCESS:
    case FEEDBACK_LOG_CLEAN:
      return defaultState;
    case CACHE_ALBUM_DATA:
      return cacheAlbum(state,action);
    case REFRESH_ALBUM_DATA:
      return refreshAlbum(state,action);
    default:

  }
  return state;
}
