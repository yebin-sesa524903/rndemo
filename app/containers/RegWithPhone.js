
'use strict';

import React, { Component } from 'react';
import { Alert, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { getRegAuthCode, valideRegAuthCode } from '../actions/loginAction';
import trackApi from '../utils/trackApi.js';
import RegWithPhoneView from '../components/login/RegWithPhoneView';
import { Keyboard } from 'react-native';
import RegWithUser from './RegWithUser';
import WebPage from "../components/WebPage";
import appInfo from "../utils/appInfo";
import Toast from 'react-native-root-toast';
import LoginWithPassword from "./LoginWithPassword";
import LoginWithMobile from "./LoginWithMobile";

class RegWithPhone extends Component {

  constructor(props) {
    super(props);
    this.state = {
      countDown: 0,
      inputCode: ''
    }
  }
  _codeChanged(code) {

  }

  _trim(s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  }
  _submit() {
    Keyboard.dismiss();
  }
  _onGetVerifyCode() {
    this.props.getVerificationCode();
  }
  _switch(user) {
    this.props.navigator.resetTo({ id: 'login_passowrd', component: LoginWithPassword });
    //然后在push到loginWithMoile
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.push('PageWarpper', {
        id: 'login_mobile',
        // sceneConfig:'HorizontalSwipeJump',
        component: LoginWithMobile
      });
    });

  }
  _onInputChanged(input) {
    this.setState({
      inputCode: input
    })
  }

  _bindTimer() {
    if (!this._timer) {
      this._timer = setInterval(() => {
        let countDown = this.state.countDown;
        if (countDown) {
          countDown -= 1;
          if (countDown <= 0) {
            countDown = 0;
            this._clearTimer();
          }
        } else {
          countDown = 60;
        }
        this.setState({
          countDown
        })
      }, 1000);
    }
  }

  _getAuthCode(phone) {
    //发送验证码
    this.props.getRegAuthCode(phone);
  }

  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  componentDidMount() {
    trackApi.onPageBegin('regWithPhone');
  }
  componentWillReceiveProps(nextProps) {
    //验证码发送成功，给出一个toast提示
    if (nextProps.getCodePosting !== this.props.getCodePosting) {
      if (nextProps.getCodePosting === 0) {
        this._bindTimer();
        Toast.show('验证码已发送', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
      } else if (nextProps.getCodePosting === 4) {
        //手机号已存在，直接给出提示是否跳转到手机号登陆
        Alert.alert(null, '手机号码已注册，是否切换\n登录页面？', [
          { text: '否' },
          { text: '是', onPress: () => this._switch() }
        ]);
        return;
      }
    }
    if (nextProps.validCodePosting !== this.props.validCodePosting) {
      if (nextProps.validCodePosting === 0) {
        //验证通过，进行下一步
        this.setState({ inputCode: '' });
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.push('PageWarpper', {
            id: 'reg_with_user',
            component: RegWithUser,
            passProps: {
              phone: this._phone,
              code: this._code
            }
          })
        })
      } else if (nextProps.validCodePosting === 4) {
        //手机号已存在，直接给出提示是否跳转到手机号登陆
        Alert.alert(null, '手机号码已注册，是否切换\n登录页面？', [
          { text: '否' },
          { text: '是', onPress: () => this._switch() }
        ]);
        return;
      } else if (nextProps.validCodePosting === 5) {
        //验证码有误
        Alert.alert(null, '验证码输入有误', [
          { text: '好', onPress: () => this.setState({ inputCode: '' }) }
        ]);
        return;
      } else if (nextProps.validCodePosting === 6) {
        //验证码有误
        Alert.alert(null, '验证码已过期，请重新获取', [
          { text: '好', onPress: () => this.setState({ inputCode: '' }) }
        ]);
        return;
      }
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd('regWithPhone');
    // backHelper.destroy(this.props.route.id);
    this._clearTimer();
  }

  _openWebview(type) {
    let title, url;
    switch (type) {
      case 'agreement':
        title = '施耐德电气数字化服务平台用户协议';
        url = appInfo.get().privacyEntryUri;
        break;
      case 'privacy':
        title = '施耐德电气数字化服务平台数据隐私声明';
        url = appInfo.get().privacyMyUri;
        break;
    }
    this.props.navigation.push('PageWarpper', {
      id: 'webpage', component: WebPage, passProps: {
        title,
        url
      }
    });
  }

  _next(phone, code) {
    this._phone = phone;
    this._code = code;
    this.props.valideRegAuthCode(phone, code);
  }

  render() {
    return (
      <RegWithPhoneView
        openLink={(url) => this._openWebview(url)}
        onBack={() => this.props.navigation.pop()}
        onSend={(phone) => this._getAuthCode(phone)}
        code={this.state.inputCode}
        onChangeInputCode={text => this._onInputChanged(text)}
        onNext={(phone, code) => this._next(phone, code)}
        countDown={this.state.countDown}
      />);
  }
}

function mapStateToProps(state) {
  return {
    getCodePosting: state.reg.get('isGetCodePosting'),
    validCodePosting: state.reg.get('isValidCodePosting')
  };
}

export default connect(mapStateToProps, { getRegAuthCode, valideRegAuthCode })(RegWithPhone);
