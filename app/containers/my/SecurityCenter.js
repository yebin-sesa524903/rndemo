
'use strict';

import React, { Component } from 'react';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import trackApi from '../../utils/trackApi.js';
import {
  InteractionManager, View, Text, Image
} from 'react-native';
import PropTypes from 'prop-types';
import Toolbar from "../../components/Toolbar";
import { GRAY } from "../../styles/color";
import Icon from "../../components/Icon";
import TouchFeedback from "../../components/TouchFeedback";
import SchActionSheet from "../../components/actionsheet/SchActionSheet";
import NameEdit from "./NameEdit";
import ImagePicker from 'react-native-image-crop-picker';
import NetworkImage from "../../components/NetworkImage";
import { uploadUserIcon, updateUser } from '../../actions/loginAction'
import PassEdit from "./PassEdit";
import BindEmail from "./BindEmail";
import BindPhone from "./BindPhone";
import { Keyboard } from 'react-native';

class SecurityCenter extends Component {
  constructor(props) {
    super(props);
    this.state = { isFetching: false };
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
  }

  changeUserIcon(iconKey) {
    this.props.updateUser({
      'Id': this.props.user.get('Id'),
      'Name': this.props.user.get('Name'),
      'RealName': this.props.user.get('RealName'),
      'Telephone': this.props.user.get('Telephone'),
      'UserPhoto': iconKey,
      'Email': this.props.user.get('Email')
    });
  }

  renderRow(title, value, showIcon, click) {
    let icon = null;
    if (showIcon) {
      icon = <Icon type='arrow_right' size={17} color={GRAY} style={{ marginLeft: 16 }} />;
    }
    return (
      <TouchFeedback enabled={showIcon} onPress={click}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
          <Text style={{ fontSize: 17, color: '#333', }}>{title}</Text>
          <Text numberOfLines={1} style={{ fontSize: 17, textAlign: 'right', color: '#888', flex: 1, marginLeft: 16 }}>{value}</Text>
          {icon}
        </View>
      </TouchFeedback>
    )
  }

  renderDiv() {
    return (
      <View style={{ height: 1, backgroundColor: '#d8d8d8' }} />
    )
  }

  _menuClick(item) {
    this.setState({ 'modalVisible': false, });
    let useCamera = false;
    switch (item.index) {
      case 0:
        useCamera = true;
        break;
      case 1:
        break;
    }
    setTimeout(() => {
      this._takePhoto(useCamera);
    }, 500);
  }

  _takePhoto(camera) {
    let data = {
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true,
      cropperChooseText: '完成',
      cropperCancelText: '取消'
    }
    if (camera) {
      ImagePicker.openCamera(data).then(async image => {
        console.warn(image);
        this.context.showSpinner();
        this.props.uploadUserIcon(this.props.userId, image.data);
      }).catch(err => {
      });
    } else {
      ImagePicker.openPicker(data).then(async image => {
        console.warn(image);
        this.context.showSpinner();
        this.props.uploadUserIcon(this.props.userId, image.data);
      }).catch(err => {
      })
    }
  }

  _showMenu() {
    let arr = ['拍照', '从相册上传'].map((item, index) => {
      return { title: item, select: true, index }
    });
    this.setState({ 'modalVisible': true, arrActions: arr });
  }

  _getActionSheet() {
    var arrActions = this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => this._menuClick(item)}>
        </SchActionSheet>
      )
    }
  }

  render() {
    let phone = '';
    let email = '';
    if (this.props.user) {
      phone = this.props.user.get('Telephone') || '未绑定';
      email = this.props.user.get('Email') || '未绑定';
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <Toolbar
          title={'个人信息'}
          navIcon="back"
          onIconClicked={() => this.props.navigation.pop()} />
        <View style={{ marginVertical: 10, backgroundColor: '#fff', paddingLeft: 16 }}>
          {this.renderRow('修改密码', null, true, () => this.props.navigation.push('PageWarpper', { id: 'passEdit', component: PassEdit }))}
        </View>
        <View style={{ backgroundColor: '#fff', paddingLeft: 16, }}>
          {this.renderRow('邮箱', email, true, () => this.props.navigation.push('PageWarpper', { id: 'bindEmail', component: BindEmail }))}
          {this.renderDiv()}
          {this.renderRow('手机', phone, true, () => this.props.navigation.push('PageWarpper', { id: 'bindPhone', component: BindPhone }))}
        </View>
        {this._getActionSheet()}
      </View>
    );
  }
}



function mapStateToProps(state) {
  return {
    user: state.user.get('user'),
    uploadUserIconPosting: state.user.get('uploadUserIconPosting'),
    userId: state.user.get('Id'),
    iconKey: state.user.get('iconKey')
  };
}

export default connect(mapStateToProps, { uploadUserIcon, updateUser })(SecurityCenter);
