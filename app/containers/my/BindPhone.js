
'use strict';

import React, { Component } from 'react';
import { Alert, InteractionManager, View, Text, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { updateUser } from '../../actions/myAction';
import { connect } from 'react-redux';
import Toolbar from "../../components/Toolbar";
import Icon from "../../components/Icon";
import TouchFeedback from '../../components/TouchFeedback';
import backHelper from "../../utils/backHelper";
import trackApi from "../../utils/trackApi";
import { Keyboard } from 'react-native';
class BindPhone extends Component {

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
    if (this.props.user !== nextProps.user) {
      this.props.navigation.pop();
    }
  }

  _clear(type) {
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
          numberOfLines={1} value={value} placeholder={'请输入11位手机号码'}
          keyboardType={"numeric"} maxLength={11}
          placeholderTextColor={'#d0d0d0'} onChangeText={(text) => this.onChangeText(type, text)}
        />
        {clearIcon}
      </View>
    )
  }

  changeUserPhone(phone) {
    this.props.updateUser({
      'Id': this.props.user.get('Id'),
      'Name': this.props.user.get('Name'),
      'RealName': this.props.user.get('RealName'),
      'Telephone': phone,
      'UserPhoto': this.props.user.get('UserPhoto'),
      'Email': this.props.user.get('Email')
    });
  }

  isEmpty(str) {
    if (str && str.length > 0) return false;
    return true;
  }

  enableNext() {
    if (this.isEmpty(this.state.phone)) return false;
    if (this.isEmpty(this.state.phone.trim())) return false;
    return true;
  }

  doNext() {
    Keyboard.dismiss();
    let phone = this.state.phone.trim();
    let REG = /^[0-9]{11}$/;

    if (!REG.test(phone)) {
      Alert.alert(null, '请输入11位手机号码', [
        { text: '好', onPress: () => this.setState({ email: '' }) }
      ]);
      return;
    }
    this.changeUserPhone(phone);
  }

  render() {
    let phone = this.props.user.get('Telephone');
    let actions = [{ title: '完成', disable: !this.enableNext() }];
    return (
      <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <Toolbar
          title={'绑定手机'}
          navIcon="back"
          actions={actions}
          onActionSelected={[this.doNext.bind(this, false)]}
          onIconClicked={() => this.props.navigation.pop()} />
        {phone ?
          <Text style={{ margin: 16, fontSize: 14, color: '#888' }}>
            {`更换手机号后，下次可使用新手机号登录。当前手机号：${phone}`}
          </Text>
          : null
        }
        <View style={{ backgroundColor: '#fff', }}>
          {this._renderInput('手机', 'phone')}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user.get('user'),
  };
}

export default connect(mapStateToProps, { updateUser })(BindPhone);
