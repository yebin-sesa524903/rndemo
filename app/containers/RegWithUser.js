
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import trackApi from '../utils/trackApi.js';
import { reg } from '../actions/loginAction';
import RegWithUserView from '../components/login/RegWithUserView';
import { verifyPass } from '../utils';
import LoginWithPassword from "./LoginWithPassword";
import { Keyboard } from 'react-native';
const RE_EMAIL = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
const RE_USERNAME = /^[a-zA-Z0-9\u4E00-\u9FA5][\w\s+\-@.\u4E00-\u9FA5]{0,99}$/;

class RegWithUser extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      pwd: '',
      pwd2: ''
    };
  }

  _clearTimer() {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  _bindTimer() {
    if (!this._timer) {
      this._timer = setInterval(() => {
        this._clearTimer();
        //5分钟后给出页面超时提示
        Alert.alert(null, '页面超时，请重新注册', [
          {
            text: '好', onPress: () => {
              //回到上一步
              this.props.navigation.pop();
            }
          }
        ]);
      }, 1000 * 60 * 5);
    }
  }

  _submit() {
    let { name, email, pwd, pwd2 } = this.state;
    name = name.trim();
    email = email.trim();
    pwd = pwd.trim();
    pwd2 = pwd2.trim();
    Keyboard.dismiss();

    if (name.length < 4 || name.length > 20) {
      Alert.alert(null, '名称长度在4-20', [
        { text: '好', onPress: () => this.setState({ name: '' }) }
      ]);
      return;
    }
    if (!RE_USERNAME.test(name)) {
      Alert.alert(null, '必须以中文、英文或数字开头，英文字母不区分大小写，支持中文、英文、数字，“-”、“_”、“.”、“@”、“空格”的组合，最大支持100个字符', [
        { text: '好', onPress: () => this.setState({ name: '' }) }
      ]);
      return;
    }
    //判断邮箱格式
    if (!RE_EMAIL.test(email)) {
      Alert.alert(null, '请按user@example.com格式\n输入邮箱', [
        { text: '好', onPress: () => this.setState({ email: '' }) }
      ]);
      return;
    }
    //判断两次密码是否相同
    if (pwd !== pwd2) {
      Alert.alert(null, '两次密码输入不一致！', [
        { text: '好', onPress: () => this.setState({ pwd: '', pwd2: '' }) }
      ]);
      return;
    }
    //判断密码是否符合规则要求
    if (!verifyPass(pwd)) {
      Alert.alert(null, '密码需8位以上，包含大小写\n字母、数字及特殊字符！', [
        { text: '好', onPress: () => this.setState({ pwd: '', pwd2: '' }) }
      ]);
      return;
    }
    this.context.showSpinner('posting');
    this.props.reg(this.props.phone, this.props.code, name, email, pwd);
  }
  _onGetVerifyCode() {
    this.props.getVerificationCode();
  }
  _gotoMainPage(user) {
    // trackApi.profileSignInWithPUID(String(user.get('Id')),user);

  }
  _onInputChanged(type, value) {
    let obj = {};
    obj[type] = value;
    this.setState(obj);
  }
  componentDidMount() {
    trackApi.onPageBegin('regWithUser');
    this._bindTimer();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.regPosting !== this.props.regPosting) {
      if (nextProps.regPosting !== 1) this.context.hideHud();
      if (nextProps.regPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          //注册成功，给出提示，跳转到登录页面
          this.context.showSpinner('regsuccess');
          //延迟2秒跳转
          setTimeout(() => {
            this.props.navigator.resetTo({ id: 'login_passowrd', component: LoginWithPassword });
          }, 1500)
        })

      } else if (nextProps.regPosting === 4) {//表示注册的验证码有效期过期，需要返回上一级重新效验
        this.props.navigation.pop();
      } else if (nextProps.regPosting === 5) {//表示用户存在，清空name
        Alert.alert(null, '用户名已存在', [
          { text: '好', onPress: () => this.setState({ name: '' }) }
        ]);
      } else if (nextProps.regPosting === 6) {//表示密码格式不对
        Alert.alert(null, '密码需8位以上，包含大小写\n字母、数字及特殊字符！', [
          { text: '好', onPress: () => this.setState({ pwd: '', pwd2: '' }) }
        ]);
      }
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd('regWithUser');
    this._clearTimer();
    // backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <RegWithUserView
        onInputChange={(type, value) => this._onInputChanged(type, value)}
        viewProps={this.state}
        onBack={() => this.props.navigation.pop()}
        submit={() => this._submit()}
      />);
  }
}

function mapStateToProps(state) {
  return {
    regPosting: state.reg.get('isRegPosting')
  };
}

export default connect(mapStateToProps, { reg })(RegWithUser);
