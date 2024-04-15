
'use strict';
import React, { Component } from 'react';
import {
  View,
  Alert,
  BackHandler,
  ToastAndroid,
  Platform,
  Linking,
  AppState,
  InteractionManager,
  LogBox,
  NativeModules, DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';
import NetInfo from "@react-native-community/netinfo";
import { connect } from 'react-redux';

import Scene from '../components/Scene.js';
import Loading from '../components/Loading';
import Main from './Main';
import LoginWithPassword from './LoginWithPassword';
import { loadUser, logout, agreePrivacy, loadCustomerList, updateUserCustomerId } from '../actions/loginAction.js';
import { checkVersion, loadSubStation, apiGetOssPath } from '../actions/myAction.js';
import { resetError } from '../actions/errorAction.js';
import { emptyClipboard } from '../actions/appAction.js';
import SplashScreen from "rn-splash-screen";
import storage from '../utils/storage.js';
import appInfo from '../utils/appInfo.js';
import pinch from 'react-native-pinch';
import SelectPartner from "./SelectPartner";
import { loginInfoChanged } from '../actions/loginAction';
import SndToast from "../utils/components/SndToast";
import { localStr } from "../utils/Localizations/localization";
import SndAlert from "../utils/components/SndAlert";
import { NavigationActions } from "react-navigation";
import SQLite from '../utils/SqliteStorage.js';

var sqLite = null;

var _exitHandler = null;
var _exitFlag = false;
var mainLoginView = null;

class Entry extends Component {
  constructor(props) {
    super(props);
    this._initTrace();
    // Orientation.lockToPortrait();
    this.state = {
      showPrivacy: true,
      appState: AppState.currentState,
      hasHost: false,
      saveCustomerId: 0
    };
    NativeModules.REMAppInfo.getAppInfo().then(res => {
      var { prod, host } = res;
      console.warn('host', host);
      if (prod) {
        console.log = function () { };
        console.warn = function () { };
      }
      storage.getOssBucket().then((local_host) => {
        if (local_host) {
          //设置到
          this.props.loginInfoChanged({ type: 'password', input: 'host', value: local_host })
          this.setState({ hasHost: true })
        } else {
          //读取打包配置，保存在本地
          ///这里存在本地的host不知为何获取不到值了  如果出现这种情况 将本地配置的host赋值给
          storage.setOssBucket(host).then();
          this.props.loginInfoChanged({ type: 'password', input: 'host', value: host })
        }
      })
    });

    LogBox.ignoreAllLogs();
  }

  _initTrace() {
    //根据本地记录的trace,效用是开启还是关闭
    appInfo.isTraceEnabled().then(res => {
      //防止null之类的
      let enable = res === 'true';
      if (!res) {
        enable = true;
      }
      appInfo.enableTrace(enable);
    });
  }

  _hasLogin() {
    return this.props.user.get('hasLogin');
  }
  _readyExitApp() {
    if (!this.props.version.get('canIgnore')) {
      if (Platform.OS !== 'ios') {
        // console.warn('aaaa');
        return;
      }
    }
    console.warn('back button press');
    // var routes = this.refs.scene.getNavigator().getCurrentRoutes();
    // if (routes.length > 1) {
    //   // console.log('routes',this.refs.navigator);
    //   this.refs.scene.getNavigator().pop();
    //   return true;
    // }
    if (_exitFlag === true) {
      if (this.props.user && this.props.user.get('isDemoUser')) {
        storage.removeToken();
      }
      BackHandler.exitApp();
      return false;
    }
    _exitFlag = true;
    //exitApp
    ToastAndroid.show(localStr('lang_exit_app'), ToastAndroid.SHORT);
    setTimeout(() => {
      _exitFlag = false;
    }, 2000);

    return true; //return true to cancel exit
  }
  _showNetworkToast(isConnected) {
    var text = '';
    if (!isConnected) {
      text = '您的网络出现了问题，可能无法连接到系统';
      this._isConnected = false;
    }
    else {
      if (this._isConnected === false) {
        text = '您的网络已恢复';
        this._isConnected = true;
        this._checkCurrentUser();
      }
    }
    // if(text){
    //   Toast.show(text, {
    //       duration: Toast.durations.LONG,
    //       position: Toast.positions.BOTTOM,
    //   });
    // }

  }
  _checkNetwork() {
    NetInfo.fetch();
    // .then((isConnected) => {
    //   // console.log('First, is ' + (isConnected ? 'online' : 'offline'));
    //   if(!isConnected){
    //     this._showNetworkToast(isConnected);
    //   }
    //
    //
    // });
    this._netInfoEvent = NetInfo.addEventListener(
      (isConnected) => this._networkChanged(isConnected.isConnected)
    );
  }
  async _networkChanged(isConnected) {
    this._showNetworkToast(isConnected);
  }
  _showUpgradeWebPage() {
    // console.warn('webpage');
    var url = this.props.version.get('upgradeUri');
    if (!url) {
      Alert.alert(
        '',
        '没有配置APP的下载地址，请联系您的管理员',
        [
          {
            text: '好', onPress: () => {
            }
          }
        ]);
      return;
      // url='http://www.energymmost.com';
    }
    Linking.openURL(url);
    if (!this.props.version.get('canIgnore')) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          this._showUpdateAlert(this.props);
        }, 100);
      });
    }
  }
  _checkCurrentUser() {
    if (!this.props.user.get('user')) {
      // console.warn('loadUser');
      this.props.loadUser();
    }
  }

  async _checkSSLPinning() {
    NativeModules.REMAppInfo.getAppInfo().then(res => {
      var { prod } = res;
      var host = prod;
      // host='https://mobile.fm.energymost.com/api/';
      if (!host || host.length === 0 || host.indexOf('http://') >= 0) {
        return;
      }
      // console.warn('host....',host,res);
      pinch.fetch(host, {
        method: 'post',
        timeoutInterval: 10000, // timeout after 10 seconds
        sslPinning: {
          certs: ['rock2020', 'rock2021'], // cert file name without the `.cer`
        }
      })
        .then(res => {
          console.warn(`We got your response! Response - ${res}`)
        })
        .catch(err => {
          console.log('err.....', err);
          SndAlert.alert(
            '',
            '您EnergyHubAPP版本过低，请升级到最新版本',
            [
              {
                text: '好', onPress: () => {
                  if (Platform.OS === 'ios') {
                    NativeModules.REMAppInfo.exitApp();
                  } else {
                    BackHandler.exitApp();
                  }
                }
              }
            ],
            { cancelable: false }
          )
          console.warn(`Error - ${err}`)
        })
    })
    // headers: { customHeader: 'customValue' },
    // body: '{"firstName": "Jake", "lastName": "Moxey"}',
    // certs: ['cert-file-name-1', 'cert-file-name-2'], // optionally specify multiple certificates

  }

  componentWillMount() {
    if (!sqLite) {
      sqLite = SQLite.getInstance();
    }
    ///离线工单创表
    this.createUserTable();
    this.createTicketTable();
    this.createTicketLogTable();
    this.createTicketOperationTable();
    // this.createServiceTicketTable();
    // this.createServiceTicketOperationTable();
    ///获取用户信息
    this.props.loadUser();
    ///检查网络
    this._checkNetwork();
  }
  createTicketTable() {
    sqLite.executeSql('CREATE TABLE IF NOT EXISTS tickets(' +
      'id integer PRIMARY KEY AUTOINCREMENT,' +
      'ticket_id text ,' +
      'ticket_detail text,' +
      'download_date nvarchar,' +
      'status integer,' +
      'content text' +
      ')', [], () => {
        console.warn("create ticket table success")
      }, (e) => {
        console.warn("create fail", e)
      })
  }

  createTicketLogTable() {
    sqLite.executeSql('CREATE TABLE IF NOT EXISTS ticket_logs(' +
      'id integer PRIMARY KEY AUTOINCREMENT,' +
      'log_id text,' +
      'ticket_id text,' +
      'log_detail text' +
      ')', [], () => {
        console.warn("create ticket table success")
      }, (e) => {
        console.warn("create fail", e)
      })
  }

  createTicketOperationTable() {
    sqLite.executeSql('CREATE TABLE IF NOT EXISTS ticket_operation(' +
      'id integer PRIMARY KEY AUTOINCREMENT,' +
      'ticket_id text,' +
      'log_id text,' +
      'operation_time nvarchar,' +
      'operation_type integer,' +
      'new_status integer,' +
      'new_content text' +
      ')', [], () => {
        console.warn("create ticket table success")
      }, (e) => {
        console.warn("create fail", e)
      })
    sqLite.executeSql('pragma table_info(ticket_operation)', [], (tx, res) => {
      let len = res.rows.length;
      if (len > 0) {
        let hasLogIdField = false;
        for (let i = 0; i < len; i++) {
          let item = res.rows.item(i);
          if (item.name === 'log_id') {
            hasLogIdField = true;
            break;
          }
        }
        if (!hasLogIdField) {
          console.warn('没有log_id字段，给其添加')
          //给表添加此字段
          sqLite.executeSql('alter table ticket_operation add log_id integer;');
        } else {
          console.warn('有log_id字段，不用添加')
        }
      }
    })
  }
  createUserTable() {
    sqLite.executeSql('CREATE TABLE IF NOT EXISTS userinfo(' +
      'id integer PRIMARY KEY AUTOINCREMENT,' +
      'name varchar,' +
      'userinfo text)'
      , [], () => {
        console.warn("create success")
      }, (e) => {
        console.warn("create fail", e)
      })
  }
  componentDidMount() {
    LogBox.ignoreLogs([
      'Require cycle:',
    ]);
    if (Platform.OS !== 'ios') {
      _exitHandler = () => this._readyExitApp();
      if (this.props.version.get('canIgnore')) {
        // BackHandler.addEventListener('hardwareBackPress', _exitHandler);
      }
      SplashScreen.hide();
    }

    this._initListener = DeviceEventEmitter.addListener('User_Login_Success', () => {
      ///登录成功
      this.setState({})
    });

    this._initListener2 = DeviceEventEmitter.addListener('User_Select_Partner', (params) => {
      ///选择租户成功
      mainLoginView = null;
      this.setState({ saveCustomerId: params.passCustomerId });
    });


    storage.initEncVersion();
    storage.getCustomerId().then((id) => {
      if (id) {
        this.setState({
          saveCustomerId: id,
        })
      } else {
        this.setState({
          saveCustomerId: 0,
        })
      }
    })
  }
  componentWillReceiveProps(nextProps) {

    if (this.props.user.get('user') && !nextProps.user.get('user')) {
      mainLoginView = null;
      if (nextProps.user.get('user') === null) {
        ///用户登出, 重置保存的customerId
        this.setState({
          saveCustomerId: 0
        })
      }
    }

    if (nextProps.error) {
      // console.warn('next error...',nextProps.error);
      if (nextProps.error === '403' || nextProps.error === '008') {
        let text = localStr('lang_permission_expired');
        if (nextProps.error === '008') {
          text = localStr('lang_account_deleted');
        }
        if (nextProps.user.get('user')) {//已登录情况下，才给出提提示
          SndAlert.alert(
            '',
            text,
            [
              {
                text: localStr('lang_profile_alert_done'), onPress: () => {
                  this.props.resetError();
                  this.props.loadUser();
                  this.setState({}, () => {
                    this.props.navigation.reset([NavigationActions.navigate({ routeName: 'Entry' })]);
                  })
                }
              }
            ],
            { cancelable: false }
          )
        } else {
          this.props.logout();
        }

      } else if (nextProps.error === '401') {
        let text = localStr('lang_cookie_invalid');
        SndAlert.alert(
          '',
          text,
          [
            {
              text: localStr('lang_profile_alert_done'), onPress: () => {
                this.props.resetError();
                this.props.logout();
              }
            }
          ],
          { cancelable: false }
        )
      } else if (nextProps.error === '503') {

        let text = localStr('lang_server_error');
        SndAlert.alert(
          '',
          text,
          [
            {
              text: localStr('lang_profile_alert_done'), onPress: () => {
                this.props.resetError();
              }
            }
          ],
          { cancelable: false }
        )
      } else {
        // this.props.logout();
        SndAlert.alert(
          '',
          nextProps.error,
          [
            {
              text: localStr('lang_profile_alert_done'), onPress: () => {
                this.props.resetError();
                SndToast.dismiss();
              }
            }
          ],
          { cancelable: false }
        )
      }
    }

    if (nextProps.user.get('user') && !this.props.user.get('user')) {
      ///登录成功
      if (isConnected()) {//只有有网时取检查版本
        this.props.apiGetOssPath();
        this.props.loadCustomerList();
      }
    }

    // if (!this.props.version.get('hasNewVersion')
    //     && nextProps.version.get('hasNewVersion')) {
    //   if (!nextProps.version.get('canIgnore')) {
    //     if (Platform.OS !== 'ios') {
    //       console.warn('removeEventListener');
    //       BackHandler.removeEventListener('hardwareBackPress', _exitHandler);
    //     }
    //   }
    //   this._showUpdateAlert(nextProps);
    // }

    //登录状态有改变
    if (nextProps.user.get('hasLogin') && !this.props.user.get('hasLogin')) {
      if (nextProps.user.get('customerList') && !this.props.user.get('customerList')) {
        let customerList = nextProps.user.get('customerList');
        if (customerList.length > 1) {
          ///多个租户将存储的 customerId赋值
          storage.getCustomerId().then((id) => {
            if (id) {
              this.props.updateUserCustomerId(id);
            }
          })
        } else if (customerList.length === 1) {
          ///如果只有一个租户
          let customerId = customerList[0].Id;
          let customerName = customerList[0].Name;
          storage.setCustomerId(String(customerId)).then();
          storage.setCustomerName(customerName).then();
          this.setState({
            saveCustomerId: customerId,
          })
        }
      }
    }
  }


  _showUpdateAlert(nextProps) {
    var arrBtns = [
      {
        text: '取消', onPress: () => {
          this.props.emptyClipboard();
        }, style: 'cancel'
      },
      { text: '立即更新', onPress: () => this._showUpgradeWebPage() }
    ];
    if (!nextProps.version.get('canIgnore')) {
      arrBtns.splice(0, 1);
    }
    SndAlert.alert(
      '发现新版本',
      `请更新至EnergyHubV${nextProps.version.get('version')}，马上体验！`,
      arrBtns,
      { cancelable: false, onDismiss: () => DeviceEventEmitter.emit('substation', true) }
    )
  }
  componentWillUnmount() {
    if (Platform.OS !== 'ios') {
      BackHandler.removeEventListener('hardwareBackPress', _exitHandler);

    }
    this._initListener.remove();
    this._initListener2.remove();
  }

  _goBack() {
    this.refs.scene.getNavigator().pop();
    this.setState({ showPrivacy: true });
  }

  _doAgreePrivacy() {
    // this.setState({showPrivacy:false});
    // this.props.agreePrivacy(this.props.user.getIn(['user','Id']));
  }

  //判断是显示Main还是Partner
  getMainOrPartner() {
    if (!this.state.saveCustomerId) return SelectPartner;
    let customerList = this.props.user.get('customerList');
    if (customerList && customerList.length > 1 && !this.state.saveCustomerId) return SelectPartner
    return Main;
  }

  _changeHost() {
    this.setState({ hasHost: true })
  }

  render() {
    if (this._hasLogin() === null) {
      return (
        <Loading />
      );
    }
    let entry = null;

    if (this._hasLogin()) {
      if (!mainLoginView) {
        //TODO 这里需要判断有没有选择过 或者有没有partner
        //let target=Main;
        let target = this.getMainOrPartner();
        entry = { component: target };
        mainLoginView = entry;
      } else {
        entry = mainLoginView;
      }
    }
    else {
      entry = { component: LoginWithPassword, navigatorBar: false };
    }
    // if (this._hasLogin() && !this.state.hasHost) {
    //   entry = {
    //     component: HostConfig,
    //     passProps: { hostChanged: () => this._changeHost() }
    //   };
    // }
    return (
      <Scene ref="scene" initComponent={entry} navigation={this.props.navigation} route={{ id: '' }} />
    );
  }
}

Entry.propTypes = {
  navigation: PropTypes.object,
  version: PropTypes.object,
  user: PropTypes.object.isRequired,
  loadUser: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  checkVersion: PropTypes.func.isRequired,
  apiGetOssPath: PropTypes.func.isRequired,
  resetError: PropTypes.func.isRequired,
  loadSubStation: PropTypes.func.isRequired,
  emptyClipboard: PropTypes.func,
  loadCustomerList: PropTypes.func,
  updateUserCustomerId: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    version: state.version,
    user: state.user,
    error: state.error,
    sync: state.sync
  }
}

export default connect(mapStateToProps, {
  loadUser, agreePrivacy, logout, resetError, loadSubStation, loadCustomerList, updateUserCustomerId,
  checkVersion, apiGetOssPath, emptyClipboard, loginInfoChanged
})(Entry);
