'use strict';

import {LOGOUT_SUCCESS} from '../actions/loginAction.js';

import unit from '../utils/unit.js';

export function commonReducer(fn,defaultState) {

  return (state,action)=>{
    switch (action.type) {
      case LOGOUT_SUCCESS:
        return defaultState;
    }
    return fn(state || defaultState,action);
  }

}

export function getDefStrIfValueNull(value)
{
  return !value?'-':value;
}

export function findSectioniIndexByType(arrObjs,secType)
{
  var envIndex=-1;
  if (!arrObjs) {
    return envIndex;
  }
  arrObjs.forEach((item,index)=>{
    if (item&&item.size>0) {
      var type=item.get(0).get('secType');
      if (type===secType) {
        envIndex=index;
        return false;
      }
    }
  });
  return envIndex;
}

export function formatNumber(v,digit,isDust){
  var ret=v;
  if(v===null||v===undefined)
  {
    ret=null;
  }else{
    v=String(v);
    if(v.indexOf('.') >= 0){
      // ret=Number(v).toFixed(digit);
      if (isDust) {
        ret=String(unit.fillZeroAfterPointWithRound(v,digit));
      }else {
        ret=String(unit.toFixed(v,digit));
      }
    }else {
      ret=String(unit.toFixed(Number(v),0));
    }
  }
  // console.warn('_formatNumber',v,digit,ret);
  return ret;
}
