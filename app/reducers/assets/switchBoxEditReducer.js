'use strict';


import {
  SWITCH_BOX_INFO_CHANGED,
} from '../../actions/assetsAction';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import Immutable from 'immutable';

var defaultState = Immutable.fromJS({
  name:'',location:'',number:'',logo:{},images:[]
});
function generateName(pics,hierarchyId='switch_box',userId) {
  let time = new Date().getTime();
  return `box-${time}-${pics.size}`;
}

function initDefaultState(state,action) {
  let {data:{boxData,isCreate}} = action;
  let data=boxData;
  if(isCreate){
    return defaultState;
  }else{
    let images=data.get('LocationImages').map(item=>{
      return Immutable.fromJS({
        PictureId:item
      });
    });
    state=state.set('name',data.get('Name')).set('location',data.get('Location'))
      .set('number',data.get('Number')).set('images',images)
      .setIn(['logo','PictureId'],data.get('LogoKey'));
    return state;
  }

}

function infoChanged(state,action1) {
  let {data:{hierarchyId,userId,type,action,value}} = action1;
  if(type === 'init'){
    return initDefaultState(state,action1);
  }
  if(!state) return state; //fast back #14581,must put behind init
  let newState = state;
  if(type === 'name'){
    return newState.set('name',value);
  }else if(type==='number'){
    return newState.set('number',value);
  }else if(type==='location'){
    return newState.set('location',value);
  }else if(type==='logo'){
    if(action==='add'){
      return newState.set('logo',Immutable.Map({
        PictureId:generateName({size:'logo'},hierarchyId,userId),
        uri:value[0].uri
      }))
    }
    if(action==='uploaded'){
      return newState.setIn(['logo','loaded'],true);
    }
  }
  else {
    var pics = newState.get('images');
    if(action === 'add'){
      value.forEach((item)=>{
        pics = pics.push(
          Immutable.Map({
            PictureId:generateName(pics,hierarchyId,userId),
            uri:item.uri
          }));
      })
    }
    else if (action === 'uploaded') {
      var index = pics.findIndex((item)=>item === value);
      if(index>=0)
        pics = pics.update(index,(item)=>item.set('loaded',true));
    }
    else if (action === 'delete'){
      var index = pics.findIndex((item)=>item === value);
      if(index>=0)
        pics = pics.delete(index);
    }
    return newState.set('images',pics);
  }
}


export default function(state=defaultState,action){

  switch (action.type) {
    case SWITCH_BOX_INFO_CHANGED:
      return infoChanged(state,action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
