import { NativeModules } from 'react-native';

import storage from './storage';
// import sensorsApi from 'sensorsdata-analytics-react-native'

let uid = null;

var appPageTrackList = {
  'my_asset': 'App_我的资产',
  'fault_list': 'App_故障报警',
  'ticket_management': 'App_工单管理',
  'sys_overview': 'App_系统概览',//健康状况
  'maintance_log': 'App_维护日志',
  'data_monitor': 'App_数据监视',
  'O&M_parameters': 'App_运维参数',
}

export default class trackApi {
  static userLoginPreSuccess(uid) {
    if (!uid) {
      return;
    }
    // sensorsApi.login(String(uid));
  }
  static profileSignInWithPUID(puid, user, spInfo) {
    return;
  }
  static registerSuperProperties(objProperty) {
    return;
    // console.warn('objProperty',objProperty,);
    // sensorsApi.registerSuperProperties(objProperty);
  }
  static profileSignOff() {
  }
  static formatValueWithUid(pid) {
    if (uid) {
      return pid + ':' + uid;
    } else {
      return pid;
    }
  }
  static onPageBegin(pid, customerId, customerName) {
    // console.warn('trackApi...',this.formatValueWithUid(pid));
    return;
  }
  static onPageEnd(pid) {
  }
  static onTrackEvent(sName, params) {
    return;
    // sensorsApi.track(sName,params);
    // console.warn(sName,params);
  }

  static profileSetSp(profile) {
    return;
    // sensorsApi.profileSet(profile);
  }

  static onTraceInstall() {
    return;
    //判断是否记录了安装标志，没有就记录，否则不处理
    // sensorsApi.trackInstallation('AppInstall',{});
  }
}
