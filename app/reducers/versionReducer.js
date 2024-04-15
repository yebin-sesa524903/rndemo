'use strict';


import {
  VERSION_SUCCESS
} from '../actions/myAction';
import {LOGOUT_SUCCESS} from '../actions/loginAction';
import appInfo from '../utils/appInfo.js';
import Immutable from 'immutable';
import versionCompare from '../utils/versionCompare.js';
import semver from 'semver';

var defaultState = Immutable.fromJS({
  hasNewVersion:false,
  version:'',
  upgradeUri:'',
  canIgnore:true,
  guideInfos:null,
});

function checkVersion(state,action) {
  let {response} = action;
  let version = response.newVersion,newState = state;
  version=version.replace(/v/ig,'');
  if (!version) {
    return state;
  }
  let appVersion=appInfo.get().versionName;
  appVersion=appVersion.replace(/v/ig,'');

  let canIgnore=true;
  try {
    if (response.forceUpdate) {
      canIgnore=response.forceUpdate===0||response.forceUpdate==='0';
    }
  } catch (e) {
    return newState;
  } finally {

  }
  if (response.guideInfos) {
    newState=newState.set('guideInfos',Immutable.fromJS(response.guideInfos));
  }
  if (appVersion&&version&&versionCompare(appVersion,version)) {
  // console.warn('checkVersion',arrAppVersion,arrSerVersion,arrAppVersion[1],arrSerVersion[1]);
    newState = newState.set('hasNewVersion',true);
    newState=newState.set('canIgnore',canIgnore);
    // console.warn('version',version);
    newState = newState.set('version',version);
  }
  newState = newState.set('upgradeUri',response.upgradeUrl)
  return newState;
}

export default function(state=defaultState,action){
  // console.log('userReducer');
  // console.log(action);
  switch (action.type) {
    case VERSION_SUCCESS:
      return checkVersion(defaultState,action);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
