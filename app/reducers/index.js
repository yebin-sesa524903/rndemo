
import { combineReducers } from 'redux'
import user from './userReducer';
import login from './loginReducer';
import alarm from './alarm';
import notify from './notify';
import monition from './monition';
import ticket from './ticket';
import asset from './assets';
import version from './versionReducer';
import boot from './bootReducer';
import feedBack from './feedbackReducer';
import statistics from './statisticsReducer';
import reg from './regReducer';
import sync from './syncReducer';
import acidBucket from './acidBucket'
import { RESET_ERROR_MESSAGE } from '../actions/errorAction.js';
import { LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../actions/loginAction.js';
import airBottle from "./airBottle";
import inspection from "./inspection";
import repair from "./repair";
import maintain from "./maintain";
import workbench from "./workbench/workbenchReducer";
import consumables from "./consumables";
import abnormal from "./abnormal"
import spareTools from "./spareTools/spareToolsReducer";
import fileList from "./fileList/fileListReducer";
import spareOutStore from "./spareOutStore";
import spareRepertory from "./spareRepertory";
import knowledge from "./knowledge/index";
import callIn from "./callIn";
import workBoard from "./workBoard";
import device from './device'
import {alarmDetail, alarmList} from "../containers/alarmManager/reducer";
import {localStr} from "../utils/Localizations/localization";
// Updates error message to notify about the failed fetches.
function error(state = null, action) {
  const { type, error } = action
  if (type === RESET_ERROR_MESSAGE || type === LOGOUT_REQUEST || type === LOGOUT_FAILURE || type === LOGOUT_SUCCESS) {
    return null
  } else if (error) {
    if (typeof error === 'string') {
      return action.error
    }
    else if (error['message']) {
      // console.warn('error message',error['message']);
      if (error['message'] === 'Network request failed') {
        return localStr('lang_network_error');
      }
      return error['message'];
    }
    else if (error['Error'] === '401') {
      return '401';//授权鉴定失败
    }
    else if (error['Error'] === '403') {
      return '403';//登录失效，请重新登录
    } else if (error['Error'] === '503') {
      return '503';//服务器升级中
    } else if (error['Error'] === '404') {
      return '404';//服务器升级中
    }
    else if (error['Error'] && error['Error'].length > 3) {
      let code = error['Error'].substr(-3, 3);
      if (code === '008') {
        return '008';
      } else {
        return localStr('lang_unknown_error');
      }
    }
    else {
      console.warn('error', action);
      // return '未知错误2';
    }

  }

  return state
}

const rootReducer = combineReducers({
  user, login, reg, asset, alarm, notify, ticket, version, boot, feedBack, statistics, sync, monition, error,
  acidBucket, airBottle, inspection, repair, maintain, workbench, consumables, abnormal, spareTools, fileList, spareOutStore, spareRepertory, callIn, knowledge,
  workBoard,device,
  alarmList,alarmDetail,
})

export default rootReducer
