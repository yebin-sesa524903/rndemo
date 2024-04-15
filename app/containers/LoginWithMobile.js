
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { loginByPhone, getAuthCode, loginInfoChanged, countDown, agreePrivacy } from '../actions/loginAction';
import backHelper from '../utils/backHelper';
import Login from '../components/login/Login';
// import LoginWithPassword from './LoginWithPassword';
import Main from './Main';
import Scan from './assets/Scan';
import trackApi from '../utils/trackApi.js';
import ForgetPassword from "./ForgetPassword";
import { Keyboard } from 'react-native';
import WebPage from "../components/WebPage";
import appInfo from "../utils/appInfo";
import SelectPartner from "./SelectPartner";

// const COUNTER = 60;

class LoginWithMobile extends Component {
  constructor(props) {
    super(props);
  }
  _send() {
    // console.warn('phoneNumber:',this.props.login.get("phoneNumber"));
    this.props.getAuthCode(this.props.login.get("phoneNumber"));
  }
  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }
  _switch() {
    // this.props.navigator.replace({id:'login_password',component:LoginWithPassword})
    this.props.navigation.pop();
  }
  _hasLogined() {
    return !!this.props.user;
  }

  _gotoPrivacyPage() {
    let privacyEntryUri = appInfo.get().privacyEntryUri;
    console.warn('url', privacyEntryUri);
    this.props.navigation.push('PageWarpper', {
      id: 'webpage', component: WebPage,
      passProps: {
        url: privacyEntryUri,
        showPrivacyAction: true,
        doBack: () => this.props.navigation.pop()
      }
    });
  }

  //判断是显示Main还是Partner
  getMainOrPartner(user) {
    let partners = user.get('partners');
    let partner = user.get('partner');
    if (partners && partners.size > 1 && (!partner))
      return SelectPartner;
    return Main;
  }

  _submit() {
    Keyboard.dismiss();
    var login = this.props.login;
    this.props.loginByPhone({
      Telephone: login.get("phoneNumber"),
      AuthCode: login.get("validCode")
    });

  }
  _bindTimer() {
    if (!this._timer) {
      this._timer = setInterval(() => {
        this.props.countDown();
      }, 1000);
    }

  }
  _gotoMainPage(user) {
    console.warn('user', user);
    // trackApi.profileSignInWithPUID(String(user.get('Id')),user);
    this.props.navigator.resetTo({ id: 'main', component: this.getMainOrPartner(user) });
    this.props.agreePrivacy(user.get('Id'));
  }
  _onInputChanged(input, value) {
    // console.warn('input:%s,value:%s',input,value);
    this.props.loginInfoChanged({ type: 'mobile', input, value });
  }
  _forgetPassword() {
    this.props.navigation.push('PageWarpper', {
      id: 'email_success',
      component: ForgetPassword,
    });
  }
  componentDidMount() {
    trackApi.onPageBegin('login');
    // console.warn('LoginWithMobile mount');
    // backHelper.init(this.props.navigator,'login_mobile');
    this.props.loginInfoChanged({ type: 'mobile', input: 'phoneNumber', value: this.props.login.get('phoneNumber') });
  }
  componentWillReceiveProps(nextProps) {
    // console.warn('nextProps',nextProps.login.get('counter'));
    if (nextProps.login.get('counter')) {
      this._bindTimer();
    }
    else {
      this._clearTimer();
    }

    // console.warn('LoginWithMobile componentWillReceiveProps');

    if (nextProps.user && !this.props.user) {
      this._gotoMainPage(nextProps.user);
    }
  }
  componentWillUnmount() {
    // backHelper.destroy('login_mobile');
    trackApi.onPageEnd('login');
    this._clearTimer();
    this._onInputChanged('phoneNumber', '');
    this.props.loginInfoChanged({ type: 'password', input: 'password', value: this.props.login.get('password') });
  }
  render() {
    return (
      <Login
        type="mobile"
        data={this.props.login}
        onBack={() => this.props.navigation.popToTop()}
        onSend={() => this._send()}
        gotoPrivacy={() => this._gotoPrivacyPage()}
        onSubmit={(type) => this._submit(type)}
        onSwitch={() => this._switch()}
        forgetPassword={this._forgetPassword.bind(this)}
        onInputChanged={(type, value) => this._onInputChanged(type, value)}
      />
    );
  }
}

LoginWithMobile.propTypes = {
  navigator: PropTypes.object.isRequired,
  loginWithAuth: PropTypes.func,
  getAuthCode: PropTypes.func,
  loginByPhone: PropTypes.func,
  loginInfoChanged: PropTypes.func,
  countDown: PropTypes.func,
  login: PropTypes.object,
  user: PropTypes.any,
}



function mapStateToProps(state) {
  if (state.user.get('user')) {
    console.warn('user--->', state.user.get('user'));
  }
  return {
    login: state.login.get('mobile'),
    user: state.user.get('user'),
    showPrivacyDialog: state.user.get('showPrivacyDialog')
  };
}

export default connect(mapStateToProps, {
  loginByPhone, getAuthCode, loginInfoChanged,
  countDown, agreePrivacy
})(LoginWithMobile);
