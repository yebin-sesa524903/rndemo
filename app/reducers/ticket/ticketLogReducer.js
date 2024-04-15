'use strict';


import {
  TICKET_LOGINFO_CHANGED,
  TICKET_LOG_CLEAN,
  TICKET_LOG_SAVE_REQUEST, TICKET_LOG_SAVE_SUCCESS, TICKET_LOG_SAVE_FAILURE,
} from '../../actions/ticketAction';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';


var defaultState = null;


function generateName(pics,ticketId,userId) {
  //key image-ticket-log-${ticketId}-${userId}-time
  var time = new Date().getTime();
  return `image-ticket-log-${ticketId}-${userId}-${time}-${pics.size}`;
}


function initDefaultState(state,action) {

  var {data:{old,ticketId}} = action;
  if(!old){
    return Immutable.fromJS({
      TicketId:ticketId,
      Content:'',
      isPosting:1,
      Pictures:[]
    });
  }
  else {
    return old;
  }

}

function infoChanged(state,action1) {
  var {data:{ticketId,userId,type,action,value}} = action1;

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
      value.forEach((item)=>{
        pics = pics.push(
          Immutable.Map({
            PictureId:generateName(pics,ticketId,userId),
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
      if (index!==-1) {
        pics = pics.delete(index);
      }

    }
    // console.warn('pics',pics);
    return newState.set('Pictures',pics);
  }


}

export default function(state=defaultState,action){

  switch (action.type) {
    case TICKET_LOGINFO_CHANGED:
      return infoChanged(state,action);
    case TICKET_LOG_SAVE_REQUEST:
      return state.set('isPosting',1);
    case TICKET_LOG_SAVE_SUCCESS:
      return state.set('isPosting',2);
    case TICKET_LOG_SAVE_FAILURE:
      return state.set('isPosting',3);
    case LOGOUT_SUCCESS:
    case TICKET_LOG_CLEAN:
      return defaultState;
    default:

  }
  return state;
}
