'use strict';


import {
  ASSET_LOGINFO_CHANGED,
  ASSET_LOG_CLEAN
} from '../../actions/assetsAction';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';


var defaultState = null;


function generateName(pics,hierarchyId,userId) {
  //key image-ticket-log-${ticketId}-${userId}-time
  var time = new Date().getTime();
  return `image-asset-log-${hierarchyId}-${userId}-${time}-${pics.size}`;
}


function initDefaultState(state,action) {

  var {data:{old,hierarchyId}} = action;
  if(!old){
    return Immutable.fromJS({
      HierarchyId:hierarchyId,
      Content:'',
      Pictures:[]
    });
  }
  else {
    return old;
  }

}

function infoChanged(state,action1) {

  var {data:{hierarchyId,userId,type,action,value}} = action1;

  if(type === 'init'){
    return initDefaultState(state,action1);
  }
  if(!state) return state; //fast back #14581,must put behind init

  var newState = state;
  if(type === 'content'){
    return newState.set('Content',value);
  }
  else {
    var pics = newState.get('Pictures');
    if(action === 'add'){
      //[{name,uri}]
      // console.warn('value',value);
      value.forEach((item)=>{
        pics = pics.push(
          Immutable.Map({
            PictureId:generateName(pics,hierarchyId,userId),
            uri:item.uri
          }));
      })

    }
    else if (action === 'uploaded') {
      // console.warn('uploaded');
      var index = pics.findIndex((item)=>item === value);
      pics = pics.update(index,(item)=>item.set('loaded',true));
    }
    else if (action === 'delete'){
      var index = pics.findIndex((item)=>item === value);
      pics = pics.delete(index);
    }
    // console.warn('pics',pics);
    return newState.set('Pictures',pics);
  }


}


export default function(state=defaultState,action){

  switch (action.type) {
    case ASSET_LOGINFO_CHANGED:
      return infoChanged(state,action);
    case LOGOUT_SUCCESS:
    case ASSET_LOG_CLEAN:
      return defaultState;
    default:

  }
  return state;
}
