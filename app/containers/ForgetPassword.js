
'use strict';

import React, { Component } from 'react';
import { Alert, InteractionManager, View, Text, TextInput } from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { resetPassword } from '../actions/loginAction';
import Toolbar from "../components/Toolbar";
import Icon from "../components/Icon";
import TouchFeedback from '../components/TouchFeedback';
import EmailSuccess from "./EmailSuccess";
import backHelper from "../utils/backHelper";
import trackApi from "../utils/trackApi";
import { Keyboard } from 'react-native';
class ForgetPassword extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
  }
  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.emailResetPosting === 1 && nextProps.emailResetPosting !== 1) {
      this.context.hideHud();
      if (nextProps.emailResetPosting === 0) {
        //调整到成功页面
        this.gotoEmailSuccess();
        return;
      }
      //如果有错误码，给出错误提示
      let resetErrorCode = nextProps.resetErrorCode;
      this.processError(resetErrorCode);
    }
  }

  processError(code) {
    //邮箱对应多个账号
    if (code === '060001212020') {
      Alert.alert(null, '当前邮箱绑定多个用户，一旦修改密码将导致相关用户的密码都被修改', [
        { text: '取消', onPress: () => { } },
        { text: '继续修改', onPress: () => this.doNext(true) }
      ]);
      return;
    }
    let errText = '';
    let data = { email: '' }
    switch (code) {
      case '050001312008'://用户名不存在
        errText = '用户名不存在';
        data = { user: '' }
        break;
      case '050001312101'://邮箱不匹配
        errText = '邮箱与用户名不匹配';
        break;
      case '050001312019'://邮箱不存在
        errText = '邮箱不存在';
        break;
    }
    Alert.alert(null, errText, [
      { text: '好', onPress: () => this.setState(data) }
    ]);

  }

  gotoEmailSuccess() {
    this.props.navigation.push('PageWarpper', {
      id: 'email_success',
      component: EmailSuccess,
      passProps: {
        email: this.state.email
      }
    })
  }

  _clear(type) {
    console.warn('clear')
    Keyboard.dismiss();
    let data = {};
    data[type] = '';
    this.setState({ ...data })
  }

  onChangeText(type, text) {
    let data = {};
    data[type] = text;
    this.setState(data)
  }

  _renderInput(label, type) {
    let clearIcon = null;
    let value = this.state[type];
    if (value && value.length > 0) {
      clearIcon = (
        <TouchFeedback onPress={() => this._clear(type)}>
          <View>
            <Icon type="icon_unselect" color={'#ccc'} size={15} />
          </View>
        </TouchFeedback>
      );
    }
    return (
      <View style={{
        flexDirection: 'row', height: 56, alignItems: 'center',
        backgroundColor: '#fff', paddingHorizontal: 16
      }}>
        <Text style={{ fontSize: 17, color: '#333', width: 56 }}>{label}</Text>
        <TextInput style={[{ fontSize: 17, color: '#888', flex: 1, marginHorizontal: 6, padding: 0, marginLeft: 30 }]}
          numberOfLines={1} value={value} placeholder={'请输入'}
          placeholderTextColor={'#d0d0d0'} onChangeText={(text) => this.onChangeText(type, text)}
        />
        {clearIcon}
      </View>
    )
  }

  isEmpty(str) {
    if (str && str.length > 0) return false;
    return true;
  }

  enableNext() {
    if (this.isEmpty(this.state.user) || this.isEmpty(this.state.email)) return false;
    return true;
  }

  doNext(affirm) {
    Keyboard.dismiss();
    //检查邮箱格式是否符合要求
    let RE_EMAIL = /^[\w\-\.]+@[a-zA-Z\d\-]+(\.[a-zA-Z]{2,8}){1,2}$/ig
    if (!RE_EMAIL.test(this.state.email.trim())) {
      console.warn(this.state.email);
      Alert.alert(null, '请输入正确格式的邮箱', [
        { text: '好', onPress: () => this.setState({ email: '' }) }
      ]);
      return;
    }
    this.context.showSpinner();
    this.props.resetPassword(this.state.user.trim(), this.state.email.trim(), affirm);
  }

  render() {
    let actions = [{ title: '下一步', disable: !this.enableNext() }];
    return (
      <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <Toolbar
          title={'忘记密码'}
          navIcon="back"
          actions={actions}
          onActionSelected={[this.doNext.bind(this, false)]}
          onIconClicked={() => this.props.navigation.pop()} />
        <View style={{ backgroundColor: '#fff', marginTop: 10, }}>
          {this._renderInput('用户名', 'user')}
          <View style={{ height: 1, backgroundColor: '#d8d8d8', marginLeft: 16 }} />
          {this._renderInput('邮箱', 'email')}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    emailResetPosting: state.login.get('emailResetPosting'),
    resetErrorCode: state.login.get('resetErrorCode')
  };
}

export default connect(mapStateToProps, { resetPassword })(ForgetPassword);
