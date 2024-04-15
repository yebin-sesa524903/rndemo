
'use strict';
import React, { Component } from 'react';
import {
  Alert, View, Image, DeviceEventEmitter, Platform
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { logout } from '../../actions/loginAction';
import About from './About';
import QRCode from './QRCode';
import NameEdit from './NameEdit';
import PassEdit from './PassEdit';
import MyView from '../../components/my/My';
import notificationHelper from '../../utils/notificationHelper';
import appInfo from '../../utils/appInfo.js';
import FeedBack from './FeedBack.js';
import trackApi from '../../utils/trackApi.js';
import WebPage from '../../components/WebPage';
import DeviceStatistics from './DeviceStatistics';
// import VideoPlayer from './VideoPlayer';
import LogbookTech from './LogbookTech';
import { Navigator } from 'react-native-deprecated-custom-components';

import { getCacheTicketCount, clearCacheTicket } from '../../utils/sqliteHelper';
import { syncAbort } from '../../actions/syncAction';

import { unregisterDevice, setSubstation } from '../../actions/myAction';
var { NativeModules } = require('react-native');
var remNotification = NativeModules.REMNotification;
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import UserInfo from "./UserInfo";
import SecurityCenter from "./SecurityCenter";
import SingleSelect from "../../components/assets/AssetInfoSingleSelect";

class My extends Component {
  constructor(props) {
    super(props);
    this._traceDoOperate = false;
    this.state = { cacheCount: 0 }
  }
  _logout() {
    this._traceOperate();
    Alert.alert(
      '',
      '您要退出这个账号吗？',
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '退出', onPress: () => {

            clearCacheTicket();//退出登录清除掉本地的缓存记录
            //退出登录停止上传
            // BackgroundGeolocation.stop();
            //解绑设备
            remNotification.getDeviceId().then(res => {
              this.props.unregisterDevice(res.NotifiDeviceId);
              this.props.logout();
            });
            if (Platform.OS === 'android') {
              remNotification.unbindPhoneNumber(res => {
                console.warn('unbind phone', res);
              });
            }
          }
        }
      ]
    )
  }
  _checkDispatchScreenAuth() {
    let userTypeName = this.props.user.getIn(['UserTypeName']);
    let roleObjectType = this.props.user.getIn(['RoleObjectType']);
    //2207 大屏定位权限
    let hasPrivilege = false;
    if (this.props.customerCodes) {
      hasPrivilege = this.props.customerCodes.findIndex(item => item === '2207') >= 0;
    }
    let reject = [];
    if (!((userTypeName === '驻场工程师' || userTypeName === '巡检班长') && roleObjectType === 5)) {//&& Platform.OS === 'android'
      reject.push('您的角色不是驻场工程师或巡检班长');
    }
    if (!hasPrivilege) {
      reject.push('您还没开通EnergyHub运维大屏功能');
    }
    // BackgroundGeolocation.checkStatus(res => {
    //   console.warn('ok', res);
    //   if (res && res.locationServicesEnabled && res.authorization > 0) {
    //     if (Platform.OS === 'ios' && res.authorization !== 1) {
    //       reject.push('您还未给“EnergyHub”开启系统定位权限（始终允许)');
    //     } else {
    //       if (reject.length === 0) {
    //         //说明权限满足
    //         reject = ['检测通过，您的手机可以给运维大屏发送定位！'];
    //       }
    //     }

    //   } else {
    //     reject.push('您还未给“EnergyHub”开启系统定位权限（始终允许)')
    //   }
    //您有调度大屏相关的权限
    //   Alert.alert(
    //     '',
    //     reject.join('\n'),
    //     [
    //       { text: '好', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
    //     ]
    //   )
    // }, fail => {
    // console.warn('err', fail);
    // reject.push('您还未给“EnergyHub”开启系统定位权限（始终允许)')
    // //您有调度大屏相关的权限
    // Alert.alert(
    //   '',
    //   reject.join('\n'),
    //   [
    //     { text: '好', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
    //   ]
    // )
    // });


  }
  _clearCacheTicket() {
    Alert.alert(
      '',
      '清空本地工单将丢失未同步工单，确定清除？',
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '清空', onPress: () => {
            clearCacheTicket().then(() => {
              this.setState({ cacheCount: 0 });
              //同时需要恢复默认值
              this.props.syncAbort();
            })
          }
        }
      ]
    )
  }

  _onRowClick(rowId) {
    this._traceOperate();
    if (rowId === 2) {
      this.props.navigation.push('PageWarpper', { id: 'about', component: About });
    }
    else if (rowId === 1) {
      this.props.navigation.push('PageWarpper', { id: 'qrcode', component: QRCode });
    } else if (rowId === 3) {
      this.props.navigation.push('PageWarpper', { id: 'nameEdit', component: NameEdit });
    } else if (rowId === 6) {
      this.props.navigation.push('PageWarpper', { id: 'passEdit', component: PassEdit });
    } else if (rowId === 4) {
      this.props.navigation.push('PageWarpper', { id: 'feedback', component: FeedBack });
    } else if (rowId === 5) {
      this.props.navigation.push('PageWarpper', {
        id: 'webpage', component: WebPage, passProps: {
          title: '施耐德电气数字化服务平台数据隐私声明',
          showPrivacyAction: true,
          url: appInfo.get().privacyMyUri
        }
      });
    } else if (rowId === 7) {
      this.props.navigation.push('PageWarpper', { id: 'statistics', component: DeviceStatistics });
    } else if (rowId === 8) {
      var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
      sceneConfig.gestures = {};
      // console.warn('aaaaa',this.props.version.get('guideInfos'),);
      this.props.navigation.push('PageWarpper', {
        id: 'videoplayer',
        component: LogbookTech,
        passProps: {
          guideInfos: this.props.version.get('guideInfos'),
        }
      });
    } else if (rowId === 9) {
      this._clearCacheTicket();
    } else if (rowId === 10) {
      this._checkDispatchScreenAuth();
    } else if (rowId === 11) {
      //点击了用户信息
      this.props.navigation.push('PageWarpper', { id: 'user_info', component: UserInfo });
    } else if (rowId === 12) {
      //点击了账户安全
      console.warn('账户安全');
      this.props.navigation.push('PageWarpper', { id: 'user_info', component: SecurityCenter });
    } else if (rowId === 15) {
      DeviceEventEmitter.emit('substation')
    }
  }

  //记录操作
  _traceOperate() {
    if (!this._traceDoOperate) {
      this._traceDoOperate = true;
      trackApi.onTrackEvent('App_ModuleOperation', {
        operation: '点击条目',
        module_name: '我的'
      });
    }
  }

  _resetMyOperator() {
    this._traceDoOperate = false;
  }

  _readCacheCount() {
    getCacheTicketCount().then(res => {
      if (isNaN(res)) {
        this.setState({ cacheCount: 0 });
      } else {
        this.setState({ cacheCount: res });
      }
    })
  }

  componentDidMount() {
    // backHelper.init(this.props.navigator,this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);

    trackApi.onTrackEvent('App_ViewTab', {
      module_name: '我的',
    });
    this.resetOperatorListener = DeviceEventEmitter.addListener('resetMyOperator', () => {
      this._resetMyOperator();
      this._readCacheCount();
    });
    this._readCacheCount();
  }
  componentWillReceiveProps(nextProps) {
  }
  componentWillUnmount() {
    // backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
    this.resetOperatorListener.remove();
  }
  render() {
    var appInfomation = appInfo.get();
    return (
      <MyView
        showSwitch={this.props.showSwitch}
        cacheCount={this.state.cacheCount}
        onLogout={() => this._logout()}
        substation={this.props.substation}
        user={this.props.user}
        canEditRealName={!this.props.demoUser}
        oldVersion={appInfomation.versionName}
        hasNewVersion={this.props.version.get('hasNewVersion')}
        guideInfos={this.props.version.get('guideInfos')}
        onRowClick={(rowId) => this._onRowClick(rowId)} />
    );
  }
}

My.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  version: PropTypes.object,
  demoUser: PropTypes.bool,
  unregisterDevice: PropTypes.func,
  logout: PropTypes.func,
}

function mapStateToProps(state) {
  var demoUser = !!(state.user.get('isDemoUser') && state.user.get('user'));
  return {
    user: state.user.get('user'),
    version: state.version,
    demoUser,
    substation: state.user.get('substation') || {},
    customerCodes: state.user.get('customerPrivilegeCodes')
  };
}

export default connect(mapStateToProps, { logout, unregisterDevice, syncAbort, setSubstation })(My);
