
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { loginByPassword, loginInfoChanged, getVerificationCode, resetLoginItem, agreePrivacy, loginSaveUserName } from '../actions/loginAction';
import Login from '../components/login/Login';
import ForgetPassword from "./ForgetPassword";
import { DeviceEventEmitter, Keyboard } from 'react-native';
import WebPage from "../components/WebPage";
import appInfo from "../utils/appInfo";
import HostConfig from "./HostConfig";
import JSSM4 from '../utils/sm4/index';

const ENCRYPTION_KEY = "1412423432232233";
const sm4 = new JSSM4(ENCRYPTION_KEY);

class LoginWithPassword extends Component {
  constructor(props) {
    super(props);
  }
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  _switch(type) {
  }

  _gotoPrivacyPage() {
    let privacyEntryUri = appInfo.get().privacyEntryUri;
    console.warn('url', privacyEntryUri);
    this.props.navigation.push({
      id: 'webpage', component: WebPage,
      passProps: {
        url: privacyEntryUri,
        showPrivacyAction: true,
        doBack: () => this.props.navigation.pop()
      }
    });
  }

  _hasLogined() {
    return !!this.props.user;
  }
  _trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  }
  _submit() {
    Keyboard.dismiss();
    var login = this.props.login;

    let password = this._trim(login.get("password"));
    let newpassword = password//sm4.encryptData_ECB(password);
    this.context.showSpinner();
    this.props.loginByPassword({
      userName: this._trim(login.get('userName')),
      password: newpassword,
    });
  }
  _onGetVerifyCode() {
    // this.props.getVerificationCode();
  }
  _onInputChanged(input, value) {
    this.props.loginInfoChanged({ type: 'password', input, value });
  }
  componentDidMount() {
    this._onGetVerifyCode()
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.user.get('user') && !this.props.user.get('user')) {
      ///登录成功
      DeviceEventEmitter.emit('User_Login_Success');
      setTimeout(() => {
        this.context.hideHud();
      }, 1000)
    }
    if (!this.props.errCode && nextProps.errCode) {
      this.context.hideHud();
    }

    if (nextProps.error) {
      this.context.hideHud();
    }

  }

  _forgetPassword() {
    this.props.navigation.push({
      id: 'email_success',
      component: ForgetPassword,
    });
  }

  _doHostConfig() {
    this.props.navigation.push('PageWarpper', {
      id: 'host_config',
      component: HostConfig,
      passProps: {
        host: this.props.login.get('host'),
        doBack: () => this.props.navigation.pop()
      }
    });
  }

  _onClickSaveUserName(isCanSave) {
    this.props.loginSaveUserName(!isCanSave)
  }

  render() {
    return (
      <Login
        type="password"
        errCode={this.props.errCode}
        isCanSaveUserName={this.props.isCanSaveUserName}
        data={this.props.login}
        gotoPrivacy={() => this._gotoPrivacyPage()}
        onBack={() => this.props.navigation.pop()}
        onGetVerifyCode={() => this._onGetVerifyCode()}
        onSubmit={(type) => this._submit(type)}
        onSwitch={(type) => this._switch(type)}
        forgetPassword={this._forgetPassword.bind(this)}
        doHostConfig={this._doHostConfig.bind(this)}
        onInputChanged={(type, value) => this._onInputChanged(type, value)}
        onNeedResetItem={(type) => {
          this.props.resetLoginItem(type);
        }}
        onClickSaveUserName={(isCanSave) => this._onClickSaveUserName(isCanSave)}
      />);
  }
}

LoginWithPassword.propTypes = {
  navigation: PropTypes.object.isRequired,
  loginWithAuth: PropTypes.func,
  getAuthCode: PropTypes.func,
  loginByPassword: PropTypes.func,
  loginInfoChanged: PropTypes.func,
  getVerificationCode: PropTypes.func,
  countDown: PropTypes.func,
  resetLoginItem: PropTypes.func,
  login: PropTypes.object,
  user: PropTypes.any,
  route: PropTypes.object,
  errCode: PropTypes.string,
  isCanSaveUserName: PropTypes.bool.isRequired,
  onClickSaveUserName: PropTypes.func,
}



function mapStateToProps(state) {
  return {
    login: state.login.get('password'),
    errCode: state.login.get('errCode'),
    error: state.error,
    user: state.user,
    logoutTime: state.user.get('logoutTime'),
    showPrivacyDialog: state.user.get('showPrivacyDialog'),
    isCanSaveUserName: state.user.get('isCanSaveUserName')
  };
}

export default connect(mapStateToProps, {
  loginByPassword, loginInfoChanged, getVerificationCode,
  resetLoginItem, agreePrivacy, loginSaveUserName
})(LoginWithPassword);
