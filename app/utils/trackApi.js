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
    uid = puid;
    if (!user) {
      return;
    }
    let objType = user.get('RoleObjectType');
    let user_type = '客户级用户';
    if (objType === 2 || objType === 3) {
      user_type = 'BU级用户';
    } else if (objType === 4 || objType === 5) {
      user_type = 'SP级用户';
    } else if (objType === 6 || objType === 7) {
      user_type = '客户级用户';
    }
    console.warn('profileSignInWithPUID', objType, user_type, spInfo, user.getIn(['BizLineList', 0, 'Name']));
    let product = 'FA';//FA,EA,DA,MA,ITA
    //用户属性
    this.profileSetSp({
      'ds_user_id': puid,
      'user_name': user.get('Name') || '',
      'role': user.get('UserTypeName') || '',
      'user_type': user_type,
      'user_sp_id': spInfo.currSpid || '',
      'user_sp_name': spInfo.currSpname || '',
    });
    //公共属性
    this.registerSuperProperties({
      'sp_id': spInfo.currSpid || '',
      'sp_name': spInfo.currSpname || '',
      'businessLine_id': user.getIn(['BizLineList', 0, 'Id']) || '',
      'businessLine_name': user.getIn(['BizLineList', 0, 'Name']) || '',
      'product': product,
    })
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
    var item = appPageTrackList[pid];
    if (item) {

      var objParam = {
        "$title": item,
        "$screen_name": item,
      }
      if (customerId && customerName) {
        objParam = {
          ...objParam, ...{
            customer_id: String(customerId || ''),
            customer_name: customerName
          }
        }
      }
      // sensorsApi.trackViewScreen(null,objParam);
    }
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
