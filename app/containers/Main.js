
'use strict';
import React, { Component, PureComponent, useState, useEffect } from 'react';
import {
  View, SafeAreaView,
  // Alert
  Platform, StatusBar,
  BackHandler,
  AppState,
  InteractionManager,
  DeviceEventEmitter,
  Alert,
  UIManager,
  Dimensions,
  ActionSheetIOS,
  Linking,
  Share, PermissionsAndroid
} from 'react-native';
import PropTypes from 'prop-types';
import NetInfo from "@react-native-community/netinfo";
import { connect } from 'react-redux';
import backHelper from '../utils/backHelper';
import TabBar from '../components/TabBar';
import My from './my/My';
import Alarm from './alarm/Alarm';
import Ticket from './ticket/Ticket';
import Assets from './assets/Assets';
import Notify from './notify/Notify';
import notificationHelper from '../utils/notificationHelper.js';
import ViewPager from '../components/ViewPager';
import privilegeHelper from "../utils/privilegeHelper";
import permissionCode from "../utils/permissionCode";
import { detectClipboard, emptyClipboard } from '../actions/appAction.js';
// console.warn('ViewPager',ViewPager);
// import CameraRoll from 'rn-camera-roll';
import CameraRoll from "@react-native-community/cameraroll";
import Permissions from 'react-native-permissions';
import Scan from './assets/Scan';

import ReactNativeDetectNewPhoto from 'react-native-detect-new-photo';
import * as ScreenshotDetector from 'react-native-screenshot-detector';
import RNFS, { DocumentDirectoryPath } from 'react-native-fs';

import TicketDetail from './ticket/TicketDetail';
import AlarmDetail from './alarm/AlarmDetail';
import SchActionSheet from "../components/actionsheet/SchActionSheet";

import AlarmFilter from './alarm/AlarmFilter';
import { Drawer } from '@ant-design/react-native';
import Device from "./assets/Device";
import trackApi from "../utils/trackApi";
import { registerDevice, unregisterDevice, getCustomerPrivilegeCodes, postBkgLocation, setSubstation } from '../actions/myAction';
//var DeviceInfo = require('react-native-device-info');
import DeviceInfo, { getManufacturer, isTablet } from 'react-native-device-info';
import storage from '../utils/storage';

import { syncAbort, initSync, checkTicketById, syncTicketById } from '../actions/syncAction';
import { queryUserHierarchyPath } from '../actions/myAction.js';
import {
  getUnSyncTickets, getDownloadTimeByTicketId, TICKET_LOG_UPDATE,
  TICKET_LOG_ADD, TICKET_LOG_DELETE, TICKET_TYPE_SAVE_SIGN, getUnSyncServiceTickets, TICKET_TYPE_SAVE_SIGN_BZ
} from '../utils/sqliteHelper';
import appInfo from '../utils/appInfo.js';
import { getAddressByLocation, uploadLocation } from '../utils/locationHelper'
import Toast from 'react-native-root-toast';
import { getMethodUri } from '../middleware/api.js';
import AlertDialog from "../components/AlertDialog";
import Loading from '../components/Loading';
import { syncUploadImages } from "../utils/patrolImageUtil";
import { clearCompressImages } from '../utils/imageCompress';
import TicketFilter from "./ticket/TicketFilter";
import TouchFeedback from "../components/TouchFeedback";
import NetworkImage from "../components/NetworkImage";
import { isPhoneX } from "../utils";
import SelectPartner from "./SelectPartner";
import { requestPhotoPermission } from "../utils/devicePermission";
import Monition from "./monition/Monition";
import SingleSelect from "../components/assets/AssetInfoSingleSelect";
import { getBaseUri, TOKENHEADER, JWTTOKENHEADER, HEADERDEVICEID } from '../middleware/api.js';
import SubstationList from "./monition/SubstationList";
import JobBill from "./monition/JobBill";
import Immutable from 'immutable';
// import AM, { amConfig, amChangeTheme } from 'react-native-ds-assets-maintance';

var { NativeModules } = require('react-native');
import socketUtil from '../utils/socketUtil';
import CommandBill from "./monition/CommandBill";
import Workbench from "./fmcs/workbench/workbench";
import WorkBoard from "./fmcs/workBoard/workBoard";
import Profile from "./fmcs/profile/Profile";
import { isEmptyString } from "../utils/const/Consts";

//import { TicketList as ZdgdTicketList, configCookie as ZdgdConfigCookie,  } from "rn-module-diagnosis-ticket";
import { TicketList as XwycTicketList, configCookie as XwycConfigCookie, updateAbnormalCustomerId } from "rn-module-abnormal-ticket";
import { TicketList as PdTicketList, configCookie as PdConfigCookie, updateInventoryCustomerId } from "rn-module-inventory-ticket";

import AssetManager from "./assetManager/container/AssetManager";
import AlarmManager from "./alarmManager/container/AlarmManager";
import { loadAlarmCount } from "./alarmManager/actions";
import SndAlert from "../utils/components/SndAlert";

var remNotification = NativeModules.REMNotification;
var _stateChangedHandler = null;
const WIDTH = Dimensions.get('window').width;

let statusHeight = 0;
let navHeight = 64;
if (isPhoneX()) navHeight = 74;
if (Platform.OS === 'android') {
  statusHeight = StatusBar.currentHeight;
  navHeight = 50;
}

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedIndex: 0, imgUri: null, arrTabConfig: [] };
    this.appIsActive = true;
    this.showViewIsVisible = false;
    this.timestamp = 0;
  }
  _getTabIndex(type) {
    let findIndex = this.state.arrTabConfig.findIndex((item) => item.type === type);
    if (findIndex === -1) {
      findIndex = this.state.arrTabConfig.length - 1;
    }
    return findIndex;
  }
  _resetOperator(type) {
    if ((typeof type) !== 'string') {
      if (type) {
        type = type.type;
      }
    }
    if (type === 'ticket') {
      DeviceEventEmitter.emit('resetTicketListOperator');
    } else if (type === 'alarm') {
      DeviceEventEmitter.emit('resetAlarmOperator');
    } else if (type === 'assets') {
      DeviceEventEmitter.emit('resetAssetsOperator');
    } else if (type === 'my') {
      DeviceEventEmitter.emit('resetMyOperator');
    }
  }
  _tabChanged(index, cb) {
    if (index === 0 && this.state.selectedIndex !== 0) {
      this._resetOperator(this.state.arrTabConfig[index])
    }
    if (index === 1 && this.state.selectedIndex !== 1) {
      this._resetOperator(this.state.arrTabConfig[index])
    }
    if (index === 2 && this.state.selectedIndex !== 2) {
      this._resetOperator(this.state.arrTabConfig[index])
    }
    if (index === 3 && this.state.selectedIndex !== 3) {
      this._resetOperator(this.state.arrTabConfig[index])
    }
    // var nav = this.props.navigation;
    // // console.warn('nav',nav.getCurrentRoutes().length);
    // if(nav.getCurrentRoutes().length > 1){
    //   // console.warn('pop');
    //   nav.popToTop();
    // }
    // if (index

    // =2) {
    //   trackApi.onTrackEvent('App_Scan',{
    //     from:'首页'
    //   });
    //   this.props.navigation.push({
    //     id:'scan_from_main',
    //     component:Scan,
    //     sceneConfig:'FloatFromBottomAndroid',
    //     passProps:{
    //       // isFromPanelAdd:true,
    //       // scanTitle:'某某配电柜',
    //     }
    //   });
    //   return;
    // }
    if (this.viewPager && this.viewPager.setPage) {
      this.viewPager.setPage(index);
    }
    this.setState({ selectedIndex: index }, () => {
      if (cb) {
        InteractionManager.runAfterInteractions(() => {
          cb();
        });
      }
    });
    let name = '';
    switch (index) {
      case 0:
        name = '工单';
        break;
      case 1:
        name = '报警';
        break;
      case 2:
        name = '资产';
        break;
      case 3:
        name = '我的';
        break;
    }
    // trackApi.onTrackEvent('App_ViewModule',{module_name:name});
  }
  _onPageSelected(e) {
    if (e.nativeEvent.position !== this.state.selectedIndex) {
      let index = e.nativeEvent.position;
      this.setState({ selectedIndex: index });
    }

  }
  _getTabView(index) {
    var component = null;
    var selectedIndex = this.state.selectedIndex;
    let objTab = this.state.arrTabConfig[selectedIndex];
    // console.warn('_getTabView',this.state.arrTabConfig.length,selectedIndex);
    if (index === selectedIndex) {
      if (objTab.type === 'assetManager') {
        component = (<AssetManager navigation={this.props.navigation} route={{ id: 'assetManager' }} />);
      } else if (objTab.type === 'ticket') {
        component = (<XwycTicketList navigation={this.props.navigation} route={{ id: 'xwycTicketList' }} />);
      } else if (objTab.type === 'alarm') {
        component = (<AlarmManager navigation={this.props.navigation} route={{ id: 'alarm' }} />);
      } else if (objTab.type === 'profile') {
        component = (<Profile navigation={this.props.navigation} route={{ id: 'profile' }} />);
      }
    }

    return component;
  }

  _standardImageType(content) {
    if (content) {
      for (let key in content) {
        let task = content[key];
        //判断可能存在图片的项目
        if (task.ItemInfo && task.ItemInfo.InspectionInfoList
          && task.ItemInfo.InspectionInfoList.length > 0) {
          task.ItemInfo.InspectionInfoList.forEach(log => {
            if (log && log.Images && log.Images.Value) {
              log.Images.Value.forEach((img, index) => {
                if (img && typeof img === 'object') {
                  log.Images.Value[index] = img.PictureId;
                }
              });
            }
          });
        }
        if (task.ItemInfo && task.ItemInfo.LowVoltageConstantValueInfo
          && task.ItemInfo.LowVoltageConstantValueInfo.Images
          && task.ItemInfo.LowVoltageConstantValueInfo.Images.Value) {
          let optImages = task.ItemInfo.LowVoltageConstantValueInfo.Images.Value;
          for (let imgKey in optImages) {
            let img = optImages[imgKey];
            if (img && typeof img === 'object') {
              optImages[imgKey] = img.PictureId;
            }
          }
        }
      }
    }
  }


  /**
   * 本地缓存工单信息
   * @returns {Promise<void>}
   * @private
   */
  async _querySyncTask() {
    //读取本地
    let arr = await getUnSyncTickets();
    let result = [];
    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        let index = result.findIndex(item2 => {
          return item2.id === item.ticket_id;
        });
        //获取指定工单对应的下载时间（判断冲突时需要使用到）
        let downloadTime = await getDownloadTimeByTicketId(item.ticket_id);
        let op = null;
        if (item.operation_type === 1) {
          //状态更新
          switch (String(item.new_status)) {
            case '3'://关闭工单
              op = { "OperationType": 4, "Payload": { 'CloseDateTime': item.operation_time } };
              break;
            case '4'://提交工单
              op = { "OperationType": 2, "Payload": { 'AuthDateTime': item.operation_time } };
              break;
          }
        } else if (item.operation_type === 2) {
          console.warn('item...', item);
          //修改了巡检项
          //这里可能包括了2部分：巡检项  和 summary字段
          let data = JSON.parse(item.new_content);
          let para = {}
          if (data.update) {
            para.TicketExecutionResult = JSON.stringify(data.update);
          }
          if (data.summary) {
            para.Summary = data.summary;
          }
          op = { OperationType: 3, Payload: { UpdateDateTime: item.operation_time, ...para } }

        } else if (item.operation_type === TICKET_LOG_ADD) {
          //添加日志
          let log = JSON.parse(item.new_content);
          let logData = {
            "TicketId": log.TicketId,
            "Content": log.Content,
            "Pictures": log.Pictures,
            ...log.amap
          }
          op = {
            OperationType: 5,
            Payload: {
              OperateTime: item.operation_time,
              OperationType: 1,
              TicketLogContent: logData
            }
          }
        } else if (item.operation_type === TICKET_LOG_UPDATE) {
          //修改日志
          op = {
            OperationType: 5,
            Payload: {
              OperateTime: item.operation_time,
              OperationType: 2,
              TicketLogContent: JSON.parse(item.new_content)
            }
          }
        } else if (item.operation_type === TICKET_LOG_DELETE) {
          //删除日志
          op = {
            OperationType: 5,
            Payload: {
              OperateTime: item.operation_time,
              OperationType: 3,
              TicketLogContent: JSON.parse(item.new_content)
            }
          }
        }

        if (index >= 0) {
          result[index].data.push(op);
        } else {
          result.push({ id: item.ticket_id, beginTime: downloadTime, data: [op], isService: false });
        }
      }
    }
    //把service ticket离线操作也添加进去
    arr = await getUnSyncServiceTickets();
    let serviceResult = [];
    if (arr && arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        let body = {
          ticketId: item.ticket_id
        }
        if (item.new_status) {
          body.status = Number(item.new_status);
        }
        if (item.new_content) {
          let full = JSON.parse(item.new_content);
          if (full && full.content) {
            this._standardImageType(full.content);
            body.content = full.content;
          }
        }
        //获取指定工单对应的下载时间（判断冲突时需要使用到）
        let downloadTime = await getDownloadTimeByTicketId(item.ticket_id, 'service_tickets');
        serviceResult.push({ id: item.ticket_id, beginTime: downloadTime, data: [body], isService: true });
      }
    }
    result = result.concat(serviceResult);
    this.props.initSync(result);
  }

  async _networkChanged(isConnected) {

    let lastUpdateTime = this._lastNetworkChangedTime || 0;
    let lastNetworkChanged = this._lastNetworkChanged;
    //防止网络变化回调频繁被调用
    if (isConnected === lastNetworkChanged && (Date.now() - lastUpdateTime < 3)) {
      return;
    }
    this._lastNetworkChangedTime = Date.now();
    this._lastNetworkChanged = isConnected;

  }

  _onNotification(notification) {
    // var message = notification.getMessage();
    // console.warn('remote message',message,typeof notification.getData(),notification.getData());
    var data = notification.getData();
    if (data.Key === 'Ticket') {
      this._tabChanged(this._getTabIndex('ticket'), () => {
        notificationHelper.setNotification(data);
      });
    }
    else if (data.Key === 'Alarm') {
      this._tabChanged(this._getTabIndex('alarm'), () => {
        notificationHelper.setNotification(data);
      });
    }
  }
  async _setPrivilege() {
    privilegeHelper.setPrivilegeCodes(this.props.user.getIn(['user', 'PrivilegeCodes']))
  }
  _configViewByAuth() {
    let arrTabs = this.state.arrTabConfig;
    //有台账或者盘点权限
    if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.LedgerRead) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.LedgerFull) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketExecute) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketFull) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketRead)) {
      arrTabs.push({
        type: 'assetManager',
        name: '资产管理',
      })
    }

    //这里要做权限判断，如果没有权限，不显示此入口
    if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketExecute) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketFull) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketRead)) {
      arrTabs.push({
        type: 'ticket',
        name: '运维工单',
      })
    }

    if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.AlarmRead) ||
      privilegeHelper.hasAuth(privilegeHelper.CodeMap.AlarmFull)) {
      arrTabs.push({
        type: 'alarm',
        name: '报警管理',
      })
    }
    arrTabs.push({
      type: 'profile',
      name: '个人中心',
    })
    this.setState({
      arrTabConfig: arrTabs,
    })
  }
  _handleAppStateChange(appState) {
    if (appState === 'active') {
      if (Platform.OS === 'android') {
        setTimeout(() => {
          this.props.detectClipboard();
        }, 1000);
      } else {
        this.props.detectClipboard();
      }
      this.appIsActive = true;
      this.timestamp = new Date().getTime();
      // console.warn('isactive...',this.timestamp);
    } else {
      // console.warn('background...');
      this.appIsActive = false;
    }
  }
  _startCheckNewPhoto() {
    // console.warn('ReactNativeDetectNewPhoto init...');
    if (Platform.OS === 'ios') {
      this.eventEmitter = ScreenshotDetector.subscribe(
        () => {
          // AlertManager.invalidateAllAlert();
          console.warn('will share...0', new Date().getTime());
        }
        , () => {
          console.warn('new photo detected! appIsActive:', this.appIsActive);
          if (this.appIsActive) {
            this._startGetFirstPhotos();
          }
        });
    } else {
      // console.warn('device name...',DeviceInfo.getManufacturer(),DeviceInfo.getModel(),DeviceInfo.getSystemName());
      getManufacturer().then(band => {
        if (band.toLowerCase().indexOf('huawei') >= 0) {
          // console.warn('this is huawei mobile...');
          return;
        }
        ReactNativeDetectNewPhoto.init(() => {
          // console.warn('accept');
        }, () => {
          // console.warn('reject');
        });
        ReactNativeDetectNewPhoto.registerCallback(() => {
          // console.warn('new photo detected! appIsActive:',this.appIsActive)
          if (this.appIsActive) {
            this._startGetFirstPhotos();
          }
        });
      })

    }
  }
  _startCheckAppState() {
    _stateChangedHandler = (appState) => this._handleAppStateChange(appState);
    AppState.addEventListener('change', _stateChangedHandler);
  }

  async _getImagesWithInit(isInit) {
    var obj = await CameraRoll.getPhotos({ first: 1 });
    //uri is: content://media/external/images/media/35627
    //ios is: assets-library://asset/asset.PNG?id=B0951C5B-F643-4E34-84A1-F5FFA5EFAF5D&ext=PNG

    var uri = obj.edges[0].node.image.uri;
    var image = obj.edges[0].node.image;
    console.warn('showViewIsVisible.....', this.showViewIsVisible);
    if (this.state.imgUri === uri || this.showViewIsVisible) {
      return;
    }
    // console.warn('will share...',obj.edges[0].node);
    var timestamp = obj.edges[0].node.timestamp * 1000;

    console.warn('will share 1...', new Date().getTime());
    // if (timestamp!==0&&timestamp<this.timestamp) {
    //   return;
    // }
    // ./storage/emulated/0/Pictures/image-ff34cb59-aaa8-4607-870a-2cc2fec39131.jpg
    //./storage/emulated/0/Pictures/Screenshots/Screenshot_2017-03-31-20-26-44.png
    this.setState({ imgUri: uri });
    if (Platform.OS === 'android') {
      if (uri.toLowerCase().indexOf('screen') < 0) {
        console.warn('the image is not screen shot ...', uri);
        return;
      }
      uri = uri.replace('file:/', './');
      console.warn('_getImages', uri);
      if (!isInit) {
        Share.share({
          imgPath: uri,
          message: ''
        });
      }
    } else {
      if (!isInit) {
        // UIManager.takeSnapshot('window').then((uri) => {
        //   ActionSheetIOS.showShareActionSheetWithOptions({
        //     url: uri,
        //     excludedActivityTypes: [
        //     ]
        //   },
        //   (error) => {
        //     this.showViewIsVisible=false;
        //     this.timestamp=new Date().getTime();
        //   },
        //   (success, method) => {
        //     this.showViewIsVisible=false;
        //     this.timestamp=new Date().getTime();
        //   });
        // });

        this.showViewIsVisible = true;
        var imageName = image.filename.toLowerCase();
        var index = imageName.lastIndexOf('.');
        var type = imageName.substring(index + 1).toLowerCase();
        var subName = imageName.substring(0, index).toLowerCase();
        var obj = {
          imagePath: uri,
          imageName: subName,
          imageType: type,
          width: image.width,
          height: image.height,
        };
        var successCallBack = () => {
          this.showViewIsVisible = true;
          var path = RNFS.DocumentDirectoryPath + '/' + imageName;
          ActionSheetIOS.showShareActionSheetWithOptions({
            url: path,
            excludedActivityTypes: [
              'com.apple.UIKit.activity.PostToTwitter'
            ]
          },
            (error) => {
              this.showViewIsVisible = false;
              this.timestamp = new Date().getTime();
            },
            (success, method) => {
              this.showViewIsVisible = false;
              this.timestamp = new Date().getTime();
            });
        };
        var errorCallback = (error) => {
          console.log('error: ', error);
        };
        ScreenshotDetector.saveImage(obj, successCallBack, errorCallback);
      }
    }
  }

  async requestExternalStorageAccess() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this._getImagesWithInit();
      } else {
        SndAlert.alert(
          '',
          '请在手机的' + '"' + '设置' + '"' + '中，允许EnergyHub访问您的存储',
          [
            {
              text: '取消', onPress: () => {
              }
            },
            {
              text: '允许', onPress: () => {
                if (Permissions.openSettings()) {
                  Permissions.openSettings();
                }
              }
            }
          ],
          { cancelable: false }
        )


        //this.setState({ rollPermissionExists: false })
        //直接返回
        // this.props.onBack();
      }
    } catch (err) {
      console.warn(err);
    }
  }

  _startGetFirstPhotos() {
    console.warn('start to get photo ...');
    if (Platform.OS === 'android') {
      InteractionManager.runAfterInteractions(() => {
        // this._getImagesWithInit();
        this.requestExternalStorageAccess();
      });
    } else {
      requestPhotoPermission(() => {
        InteractionManager.runAfterInteractions(() => {
          this._getImagesWithInit();
        });
      });
    }
  }

  _onPostingCallback(type) {
  }

  /**
   * 跳转命令票详情
   * @param billId
   */
  _gotoCommandBillDetail(billId) {
    this.props.navigation.popToTop();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push({
        id: 'notify_command_bill',
        component: CommandBill,
        passProps: {
          billId: billId,
        },
      });
    })
  }
  /***
   * 跳转工作票详情
   * @param billId
   */
  gotoJobBillDetail(billId) {
    this.props.navigation.popToTop();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push({
        id: 'notify_jobbill',
        component: JobBill,
        passProps: {
          billId: billId,
        },
      });
    })
  }
  _gotoTicketDetail(ticketId, fromHex, isFutureTask) {
    let showTicket =
      privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
      privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
    if (!showTicket) {
      Toast.show('您没有这一项的查看权限，请联系系统管理员', {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
      });
      return;
    }
    this.props.navigation.popToTop();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push({
        id: 'ticket_detail',
        component: TicketDetail,
        passProps: {
          onPostingCallback: (type) => { this._onPostingCallback(type) },
          ticketId: ticketId,
          fromHex: fromHex,
          fromFilterResult: false,
          isFutureTask,
        },
      });
    })
  }
  _gotoAlarmDetail(alarmId, fromHex) {
    let showAlarm = privilegeHelper.checkModulePermission(permissionCode.SP_FAULT_ALARM);
    if (!showAlarm) {
      Toast.show('您没有这一项的查看权限，请联系系统管理员', {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
      });
      return;
    }
    this.props.navigation.popToTop();
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push({
        id: 'alarm_detail',
        component: AlarmDetail,
        barStyle: 'light-content',
        passProps: {
          onPostingCallback: (type) => { this._onPostingCallback(type) },
          alarmId: alarmId,
          fromHex
        }
      });
    })

  }

  //每次app启动时，判断有没有未同步离线工单，没有就清除压缩缓存目录
  async _clearCompressImages() {
    let arr = await getUnSyncTickets();
    if (arr && arr.constructor.name === 'Array' && arr.length > 0) {
      //说明有未同步工单，不处理
    } else {
      clearCompressImages();
    }
  }
  getUrlParamsToMap = (url) => {
    var params = {}
    //去除所有空格
    url = url.replace(/\s/ig, '');
    //正则表达式匹配
    url.replace(/([^?&=]+)=([^&]+)/g, (_, key, value) => {
      params[key] = value
    });
    return params;
  };
  handleUrl = (url) => {
    if (url) {
      // alert('捕捉的URL地址为: ' + url);
      let urlObj = this.getUrlParamsToMap(url);
      console.warn('捕捉的URL地址为: ' + url, urlObj);
      let params = '';
      if (urlObj && urlObj.id && urlObj.type) {
        this.onNotificationOpened({
          PushInfoType: urlObj.type,
          InfoKey: urlObj.id,
        })
      }
    } else {
      console.log('url为空');
    }
  };
  handleOpenURL(event) {
    console.warn('-----handleOpenURL,', event.url);
    this.handleUrl(event.url);
  };
  async _connectSocketIoClient() {
  }
  async _connectTicketClient() {
  }

  async _configTicketModule() {
    let userId = this.props.user.getIn(['user', 'Id']);//381525
    let userName = this.props.user.getIn(['user', 'Name']);
    let privileges = this.props.user.getIn(['user', 'PrivilegeCodes']);
    let spId = this.props.user.getIn(['user', 'SpId']);
    //hierarchyId
    let hierarchyId = null
    let prod = "";
    let host = await storage.getOssBucket();
    var token = await storage.getToken();
    // await ZdgdConfigCookie({
    //   host: `${host}/bff/eh/rest/`,
    //   token, sysId: 128, userId, tokenKey: 'Brownie-Token', userName, privileges, hierarchyId, prod
    // })
    let customerId = this.props.user.getIn(['user', 'CustomerId']);
    await XwycConfigCookie({
      host: `${host}/bff/eh/rest/`,
      customerId,
      token, sysId: 128, userId, tokenKey: 'Cookie', userName, privileges, hierarchyId, prod
    })

    await PdConfigCookie({
      host, customerId, spId,
      token, sysId: 128, userId, tokenKey: 'Cookie', userName, privileges, hierarchyId, prod
    })
  }

  _loadAlarmCount(customerId) {
    if (isConnected()) {
      if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.AlarmRead) ||
        privilegeHelper.hasAuth(privilegeHelper.CodeMap.AlarmFull)) {
        this.props.loadAlarmCount('1', customerId);
        this.props.loadAlarmCount('2', customerId);
      }
    }

  }

  componentDidMount() {
    this._startCheckNewPhoto();
    this._clearCompressImages();
    this._setPrivilege();
    this._startCheckAppState();

    this.props.detectClipboard();

    // this._configViewByAuth();

    let customerId = this.props.user.getIn(['user', 'CustomerId']);
    if (isEmptyString(customerId)) {
      SndAlert.alert('账号异常提醒', '当前账号下有多个租户,可能会导致厂务相关模块接口异常', [{ text: '知道了' }]);
    } else {
      // this.props.queryUserHierarchyPath({ "userId": this.props.user.getIn(['user', 'Id']), 'customerId': customerId });
    }

    this.showDrawer = DeviceEventEmitter.addListener('showDrawer', () => {
      this.drawer && this.drawer.openDrawer();
    });
    this.hideDrawer = DeviceEventEmitter.addListener('hideDrawer', () => {
      this.drawer && this.drawer.closeDrawer();
    })
    //添加back监听
    if (Platform.OS === 'android') {
      this._back = BackHandler.addEventListener('hardwareBackPress', () => {
        //如果抽屉打开，则关闭抽屉
        if (this.drawer && this.state.isOpen) {
          this.drawer.closeDrawer();
          return true;
        }
        return false;
      });
    }
    this._netInfoEvent = NetInfo.addEventListener(
      (isConnected) => {
        this._networkChanged(isConnected.isConnected)
      }
    );
    ///配置工单入口
    this._configTicketModule().then(() => {
      this._configViewByAuth();
    })
    ///获取报警未解除个数
    this._loadAlarmCount(customerId);

  }

  componentWillReceiveProps(nextProps) {
    // console.warn('componentWillReceiveProps',nextProps.itemType,this.props.itemId,nextProps.itemId,nextProps.itemId!==this.props.itemId);
    if (nextProps.itemType && nextProps.itemId && (nextProps.itemId !== this.props.itemId)) {
      InteractionManager.runAfterInteractions(() => {
        var index = 0;
        if (nextProps.itemType === 'alarm') {
          index = 1;
        }
        this._tabChanged(index, () => {
          // notificationHelper.setNotification({Value:nextProps.itemId,Key:'ticket'});
          SndAlert.alert(
            '',
            this.props.content,
            [
              {
                text: '取消', onPress: () => {
                  this.props.emptyClipboard();
                  return;
                }
              },
              {
                text: '立即查看', onPress: () => {
                  this.props.emptyClipboard();
                  if (nextProps.itemType === 'alarm') {
                    this._gotoAlarmDetail(nextProps.itemId, true);
                  } else if (nextProps.itemType === 'ticket') {
                    this._gotoTicketDetail(nextProps.itemId, true, false);
                  }
                  return;
                }
              }
            ], { cancelable: false }
          )
        });
      });
    }

    if (nextProps.user.getIn(['user', 'CustomerId']) !== this.props.user.getIn(['user', 'CustomerId'])) {
      ///customerId更新
      let newCustomerId = nextProps.user.getIn(['user', 'CustomerId']);
      updateAbnormalCustomerId(newCustomerId);
      updateInventoryCustomerId(newCustomerId);
      ///刷新报警数据
      this._loadAlarmCount(newCustomerId);
    }

    //在这里处理后台同步的问题
    if (nextProps.sync.get('waitingSyncTickets') !== this.props.sync.get('waitingSyncTickets')) {
      if (isConnected()) {
        //处理同步问题
        // this._processSync(nextProps);
      }
    }
  }

  _processSync(nextProps) {
    //取非关闭，失败，需要确认的一条，
    //同步的规则是
    let nextWating = nextProps.sync.get('waitingSyncTickets');
    let wating = this.props.sync.get('waitingSyncTickets');
    let size = nextWating.size;
    if (size <= 0) {
      return;
    }
    let username = this.props.user.getIn(['user', 'Name']);
    let doCheck = () => {
      for (let i = 0; i < size; i++) {
        let status = nextWating.getIn([i, 'status']);
        let isService = nextWating.getIn([i, 'isService']);
        if (status === null || status === undefined) {
          this.props.checkTicketById(nextWating.getIn([i, 'id']), username, isService);
          return;
        }
      }
    }

    if (size !== wating.size) {
      //直接处理第一条
      //如有本地图片没有上传，则先上传本地图片，然后再进行更新
      let fnSync = () => {
        //可能会出现重新检测，这里需要判断下(可能本条已经同步过)，所以应该是找一个没有处理的过的进行预处理
        doCheck();
      }
      let fnUpdateSyncData = () => {
        this._querySyncTask();
        // this._networkChanged(true)
      };
      syncUploadImages(fnSync, fnUpdateSyncData);
      return;
    }
    for (let i = 0; i < size; i++) {
      if (nextWating.get(i) !== wating.get(i) && nextWating.getIn([i, 'status']) !== wating.getIn([i, 'status'])) {
        let status = nextWating.getIn([i, 'status']);
        let isService = nextWating.getIn([i, 'isService']);
        if (status === 1) {
          this.props.syncTicketById(nextWating.getIn([i, 'id']), nextWating.getIn([i, 'data']).toJS(), isService);
          return;
        } else if (status > 1) {
          //两种情况：检查或者同步设备，需要用户点重试；工单有冲突，需要判断是否覆盖或者放弃；工单被关闭了，需要放弃
          //如果不是最后一条，则下一条进行检查
          // if(i<size-1)
          //   this.props.checkTicketById(nextWating.getIn([i+1,'id']),username);
          // return;
        } else if (!status) {//重试，有2变成null
          this.props.checkTicketById(nextWating.getIn([i, 'id']), username, isService);
          return;
        }
      }
    }
    //到这里了，说明变化的部分 等待用户处理，如果有未处理的任务，则开始进行
    doCheck();
  }


  componentWillUnmount() {
    // backHelper.destroy('main');
    // notificationHelper.removeEventListener();
    AppState.removeEventListener('change', _stateChangedHandler);
    this.appIsActive = false;
    if (Platform.OS === 'ios') {
      ScreenshotDetector.unsubscribe(this.eventEmitter);
    }
    //移除监听事件
    // this.showMenuListener.remove();
    // this.showDrawer.remove();
    // this.hideDrawer.remove();
    if (this._back) {
      this._back.remove();
    }
    if (this._substation) this._substation.remove();
    if (this._netInfoEvent) { this._netInfoEvent() }
    if (this._onMessageReminder) this._onMessageReminder.remove();
    if (this._onNotificationOpened) this._onNotificationOpened.remove();
    if (this._onNotificationReminder) this._onNotificationReminder.remove();
    if (this._onNotifiConfigInfo) this._onNotifiConfigInfo.remove();
    if (this._onNotificationRemoved) this._onNotificationRemoved.remove();
    if (this._netInfoEvent) { this._netInfoEvent() }
    this.alarmCountInterval && clearInterval(this.alarmCountInterval);
  }
  gotoTicketDetail(ticketId) {
    let routes = this.props.navigation.getCurrentRoutes();
    if (routes && routes.length > 0) {
      let lastRoute = routes[routes.length - 1];
      // console.warn('current route',lastRoute);
      // if(lastRoute.id!=='ticket_detail'){
      this.props.navigation.push({
        id: 'ticket_detail',
        component: TicketDetail,
        passProps: {
          onPostingCallback: () => { },
          ticketId: String(ticketId),
          fromFilterResult: false,
        },
      });
      // }
    }
  }

  gotoAlarmDetail(alarmId) {
    this.props.navigation.push({
      id: 'alarm_detail',
      component: AlarmDetail,
      barStyle: 'light-content',
      passProps: {
        alarmId: String(alarmId),
        onPostingCallback: () => { },
      }
    });
  }

  handleNotification(obj) {
    let type = obj.PushInfoType;
    let id = obj.InfoKey;
    switch (type) {
      case 'job_bill':
        this._tabChanged(3, () => {
          if (id) {
            InteractionManager.runAfterInteractions(() => {
              this.gotoJobBillDetail(id);
            });
          }
        });
        break;
      case 'command_bill':
        this._tabChanged(3, () => {
          if (id) {
            InteractionManager.runAfterInteractions(() => {
              this._gotoCommandBillDetail(id);
            });
          }
        });
        break;
      case 'ticket':
        this._tabChanged(1, () => {
          if (id) {
            InteractionManager.runAfterInteractions(() => {
              this.gotoTicketDetail(id);
            });
          }
        });
        break;
    }
  }

  onMessageReminder(obj) {
    console.warn('obj', obj);
    if (!appInfo.get().prod) {
      Toast.show('MessageReceivedtitle:' + obj.title + ',' + obj.body, {
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
      });
    }
    // console.warn("MessageReceivedtitle:" + obj.title + ", body:" + obj.body,obj);
    if (obj.title === 'close') {//Open, Close

    }
    // this.sendNotificateUpdate(obj.title);
  }
  sendNotificateUpdate(type) {
    let lastTime = 0;
    switch (type) {
      case 'alarm':
        lastTime = this._lastAlarmTime || 0;
        if (Date.now() - lastTime > 3000) {
          DeviceEventEmitter.emit('notificateAlarmUpdate');
          this._lastAlarmTime = Date.now();
        }
        break;

      case 'ticket':
        lastTime = this._lastTicketTime || 0;
        if (Date.now() - lastTime > 3000) {
          DeviceEventEmitter.emit('notificateTicketUpdate');
          this._lastTicketTime = Date.now();
        }
        break;
    }
  }
  onNotificationReminder(obj) {
  }
  onNotificationOpened(obj) {
    console.warn('-------------onNotificationOpened', obj);
    let lastClick = this._lastClickPush || 0;
    let duration = Date.now() - lastClick;
    let execute = () => {
      this._lastClickPush = Date.now();
      //这里判断
      let routes = this.props.navigation.getCurrentRoutes();
      if (routes && routes.length > 1) {
        this.props.navigation.popToTop();
        setTimeout(() => {
          this.handleNotification(obj);
        }, 200);
        // InteractionManager.runAfterInteractions(()=>{
        //   this.handleNotification(obj);
        // })
      } else {
        this.handleNotification(obj);
      }
      // this._tabChanged(1);//测试从任意页面跳转回工单页面
    }
    // console.warn('duration',duration);
    if (duration > 1500) {
      execute();
    }

    /**
    Alert.alert(obj.title ,obj.content,
      [
        {text: '关闭', onPress: () =>{}},
        {text: '查看', onPress: () => {
            //跳转到首页
            // this.props.navigation.popToTop();
            // // this._tabChanged(1);//测试从任意页面跳转回工单页面
            // this.handleNotification(obj);
            let lastClick=this._lastClickPush || 0;
            let duration= Date.now()-lastClick;
            let execute=()=>{
              this._lastClickPush = Date.now();
              this.props.navigation.popToTop();
              // this._tabChanged(1);//测试从任意页面跳转回工单页面
              InteractionManager.runAfterInteractions(()=>{
                this.handleNotification(obj);
              })
            }
            if(duration>1000){
              execute();
            }
          }},
      ],
      { cancelable: false }
    );
    /**/
  }
  onNotificationRemoved(obj) {

  }

  onNotifiConfigInfo(obj) {
    if (obj.NotifiDeviceId) {
      console.warn('onNotifiToken_DeviceId', obj.NotifiDeviceId);
    }
  }
  _showMenu() {
    let arr = ['编辑建筑', '删除'].map((item, index) => {
      return { title: item, select: true, index, type: 'Building' }
    });
    this.setState({ 'modalVisible': true, arrActions: arr, title: '' });
  }

  _showTicketMenu() {
    let arr = [{ name: '现场工单', type: 4 }, { name: '随工工单', type: 3 }].map((item, index) => {
      return { title: item.name, index, type: 'Ticket', ticketType: item.type }
    });
    this.setState({ 'modalVisible': true, arrActions: arr, title: '请选择工单类型' });
  }

  _onDialogClick(index) {
    this.setState({
      pushAlertShow: false
    }, () => {
      if (index === 1) {
        //根据时间判断处理
        let lastClick = this._lastClickPush || 0;
        let duration = Date.now() - lastClick;
        let execute = () => {
          this._lastClickPush = Date.now();
          this.props.navigation.popToTop();
          // this._tabChanged(1);//测试从任意页面跳转回工单页面
          InteractionManager.runAfterInteractions(() => {
            this.handleNotification(this.state.pushObj);
          })
        }
        if (duration > 500) {
          execute();
        }
      }
    })

  }

  _showAlertDialog() {
    let buttons = [{ text: '关闭', textColor: '#007aff' }, { text: '查看', textColor: '#ff4d4d' }]
    if (this.state.pushAlertShow) {
      return (
        <AlertDialog modalShow={this.state.pushAlertShow} buttons={buttons}
          title={this.state.pushTitle} message={this.state.pushContent}
          onClick={index => this._onDialogClick(index)} />
      );
    } else {
      return null;
    }
  }

  _getActionSheet() {
    var arrActions = this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={this.state.title} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => {
            this.setState({ modalVisible: false }, () => {
              //发送点击事件
              DeviceEventEmitter.emit('actionSheetItemClick', item);
            });
          }}
        >
        </SchActionSheet>
      )
    }
  }

  _renderSideBar() {
    let tabConfig = this.state.arrTabConfig[this.state.selectedIndex];
    if (tabConfig && tabConfig.type === 'alarm') {
      return <AlarmFilter route={{ id: 'alarm_filter' }} close={() => this.drawer && this.drawer.closeDrawer()} />;
    } else if (tabConfig && tabConfig.type === 'ticket') {
      return <TicketFilter navigation={this.props.navigation} route={{ id: 'ticket_filter' }} close={() => this.drawer && this.drawer.closeDrawer()} />;
    }
    return null;
  }

  _gotoPartner() {
    this.props.navigation.push({
      id: 'select_partner',
      component: SelectPartner,
      passProps: {
        back: true
      },
    });
  }

  _renderSwitchLogo() {
    if (!this.props.showSwitchLogo) return;
    return (
      <SafeAreaView style={{ marginTop: statusHeight, height: navHeight, justifyContent: 'center' }}>
        <TouchFeedback onPress={() => this._gotoPartner()}>
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <NetworkImage
              style={{}}
              imgType='jpg'
              defaultSource={require('../images/building_default/building.png')}
              width={30} height={30}
              name={this.props.logoUrl} />
          </View>
        </TouchFeedback>
      </SafeAreaView>

    )
  }

  _checkSubstation() {
    if (!this.props.substation) {
      this._showSubstationDialog();
    } else {
      this._connectSocketIoClient();
    }
  }
  _showSubstationDialog() {
    if (global._substationFlag) return
    global._substationFlag = true;
    this._manualFlag = false;
    SndAlert.alert("", "为了您的正常使用，请先选择所在变电所", [
      {
        text: '前往设置', onPress: () => {
          global._substationFlag = false;
          this._manualFlag = true;
          this._gotoSelectSubstation()
        }
      }
    ], {
      cancelable: false, onDismiss: () => {
        if (!this._manualFlag && global._substationFlag) global._substationFlag = false;
      }
    })
  }

  _gotoSelectSubstation() {
    this.props.navigation.push({
      id: 'substation_list',
      component: SubstationList,
    });
  }

  _renderContentView() {
    if (this.state.arrTabConfig.length === 0) {
      return (
        <View style={{ flex: 1 }}>
          <Loading />
        </View>
      )
    }
    return (
      <View style={{ flex: 1 }}>

        <ViewPager
          ref={(viewPager) => { this.viewPager = viewPager; }}
          style={{ flex: 1 }}
          initialPage={this.state.selectedIndex}
          onPageSelected={(e) => this._onPageSelected(e)}
          totalPage={this.state.arrTabConfig.length}
          renderPage={(page) => this._getTabView(page, this.state.selectedIndex)}
        >
        </ViewPager>
        <TabBar needUpdate={this.props.hasNewVersion && Platform.OS !== 'ios'}
          arrTabConfig={this.state.arrTabConfig} notifyCount={5}
          unReadAlarmCount={this.props.unReadAlarmCount}
          selectedIndex={this.state.selectedIndex}
          onSelectedChanged={(index) => this._tabChanged(index)} />
        {this._getActionSheet()}
        <View style={{ position: 'absolute', left: 16, top: 0 }}>
          {this._renderSwitchLogo()}
        </View>
      </View>
    )
  }
  render() {
    return this._renderContentView();
  }
  render3332() {
    return (
      <Drawer
        sidebar={this._renderSideBar()}
        position="right"
        open={false}
        drawerLockMode={'locked-closed'}
        drawerWidth={WIDTH - 75}
        drawerRef={el => (this.drawer = el)}
        onOpenChange={(isOpen) => {
          let filter = null;
          let tabConfig = this.state.arrTabConfig[this.state.selectedIndex];
          if (tabConfig && tabConfig.type === 'alarm') {
            filter = 'alarmFilterOpen';
          } else if (tabConfig && tabConfig.type === 'ticket') {
            filter = 'ticketFilterOpen';
          }
          if (filter) {
            //发送抽屉开关的状态
            DeviceEventEmitter.emit(filter, isOpen);
            this.setState({ isOpen })
          }
        }}
        drawerBackgroundColor="#ccc">
        {this._renderContentView()}
      </Drawer>
    );
  }
}

Main.propTypes = {
  navigation: PropTypes.object.isRequired,
  user: PropTypes.object,
  containAlarm: PropTypes.bool,
  itemId: PropTypes.string,
  itemType: PropTypes.string,
  content: PropTypes.string,
  detectClipboard: PropTypes.func,
  emptyClipboard: PropTypes.func,
  initSync: PropTypes.func,
  registerDevice: PropTypes.func,
  currSpid: PropTypes.number,
  currSpname: PropTypes.string,
  queryUserHierarchyPath: PropTypes.func,
  syncAbort: PropTypes.func,
  checkTicketById: PropTypes.func,
  sync: PropTypes.any,
}

function mapStateToProps(state) {
  var boot = state.boot;
  let count1 = state.alarmList.ywCount;
  let count2 = state.alarmList.txCount;

  let showSwitchLogo = false;
  let logoUrl = null;
  let partners = state.user.get('partners');
  let currSpid = '';
  let currSpname = '';
  if (partners && partners.size > 1) {
    showSwitchLogo = true;
    let sid = state.user.get('partner');
    if (sid) {
      currSpid = sid;
    }
    partners.forEach(item => {
      if (String(item.get('Id')) === sid) {
        logoUrl = item.get('LogoUrl');
        currSpname = item.get('Name');
      }
    });
  } else {
    if (partners) {
      currSpid = partners.getIn([0, 'Id']);
      currSpname = partners.getIn([0, 'Name']);
    }
  }
  // console.warn('mapStateToProps',boot,boot.get('itemId'),boot.get('itemType'));
  return {
    user: state.user,
    itemId: boot.get('itemId'),
    itemType: boot.get('itemType'),
    content: boot.get('content'),
    unReadAlarmCount: count1 + count2,
    substation: state.user.get('substation'),
    hasNewVersion: state.version.get('hasNewVersion'),
    notifyCount: state.notify.notifyList.get('count'),
    sync: state.sync,
    showSwitchLogo, logoUrl, currSpid, currSpname
  };
}

export default connect(mapStateToProps, {
  detectClipboard, emptyClipboard, registerDevice, loadAlarmCount,
  syncAbort, initSync, checkTicketById, syncTicketById, setSubstation, queryUserHierarchyPath
})(Main);
