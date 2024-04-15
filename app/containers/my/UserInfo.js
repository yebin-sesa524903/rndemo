
'use strict';

import React, { Component } from 'react';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import trackApi from '../../utils/trackApi.js';
import {
  InteractionManager, View, Text, Image, Alert, Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import Toolbar from "../../components/Toolbar";
import { GRAY } from "../../styles/color";
import Icon from "../../components/Icon";
import TouchFeedback from "../../components/TouchFeedback";
import SchActionSheet from "../../components/actionsheet/SchActionSheet";
import NameEdit from "./NameEdit";
import ImagePicker from 'react-native-image-crop-picker';
import ImagePicker2 from '../ImagePicker.js';
import NetworkImage from "../../components/NetworkImage";
import { uploadUserIcon, updateUser } from '../../actions/loginAction';
import Permissions, { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Keyboard } from 'react-native';

class UserInfo extends Component {
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
    if (this.props.uploadUserIconPosting === 1 && nextProps.uploadUserIconPosting !== 1) {
      if (nextProps.uploadUserIconPosting === 2) {
        this.context.hideHud();
        return;
      }
      this.changeUserIcon(nextProps.iconKey)
    }
    if (this.props.user !== nextProps.user ||
      this.props.user.get('UserPhoto') !== nextProps.user.get('UserPhoto')) {
      this.context.hideHud();
    }
    //更新失败
    if (this.props.updateUserPosting && this.props.updateUserPosting !== nextProps.updateUserPosting) {
      this.context.hideHud();
    }
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
      icon = <Icon type='arrow_right' size={16} color={GRAY} style={{ marginLeft: 16 }} />;
    }
    return (
      <TouchFeedback enabled={showIcon} onPress={click}>
        <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
          <Text style={{ fontSize: 17, color: '#333', }}>{title}</Text>
          <Text numberOfLines={1} style={{ fontSize: 20, textAlign: 'right', color: '#888', flex: 1, marginLeft: 16 }}>{value}</Text>
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
    }, 800);
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
      let fn = () => {
        ImagePicker.openCamera(data).then(async image => {
          this.context.showSpinner();
          this.props.uploadUserIcon(this.props.userId, image.data);
        }).catch(err => {
        });
      };
      if (Platform.OS === 'android') {
        fn();
      } else {
        this.checkCameraPermission(fn);
      }

    } else {
      this.props.navigation.push('PageWarpper', {
        id: 'imagePicker',
        component: ImagePicker2,
        passProps: {
          title: '选择图像',
          max: 1,
          dataChanged: (chosenImages) => {
            console.warn(chosenImages)
            ImagePicker.openCropper({
              width: 300,
              height: 300,
              path: chosenImages[0].uri,
              cropping: true,
              includeBase64: true,
              cropperChooseText: '完成',
              cropperCancelText: '取消'
            }).then(async image => {
              this.context.showSpinner();
              this.props.uploadUserIcon(this.props.userId, image.data);
            }).catch(err => {
            })
          }
        }
      });
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

  async checkCameraPermission(fn) {
    try {
      let res = check(PERMISSIONS.IOS.CAMERA);
      if (!(res === RESULTS.GRANTED || res === RESULTS.LIMITED)) {
        res = await request(PERMISSIONS.IOS.CAMERA);
        if (!(res === RESULTS.GRANTED || res === RESULTS.LIMITED)) {
          Alert.alert(
            '',
            '请在手机的' + '"' + '设置' + '"' + '中，允许EnergyHub访问您的摄像头',
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
            ]
          )
          return;
        }
      }

    } catch (err) {
      console.warn('check ios camera:' + err);
      return;
    }
    fn();
  }

  render() {
    let name = this.props.user.get('Name');
    let realName = this.props.user.get('RealName');
    let userAvatar = <Text style={{ fontSize: 20, color: '#888' }}>{name[0]}</Text>;
    let key = this.props.user.get('UserPhoto');
    if (key) {
      userAvatar = (
        <NetworkImage
          style={{}}
          resizeMode="cover"
          imgType='jpg'
          defaultSource={require('../../images/building_default/building.png')}
          width={62} height={62}
          name={key} />);
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <Toolbar
          title={'个人信息'}
          navIcon="back"
          onIconClicked={() => this.props.navigation.pop()} />
        <View style={{ backgroundColor: '#fff', paddingLeft: 16, }}>
          <TouchFeedback onPress={this._showMenu.bind(this)}>
            <View style={{ flexDirection: 'row', height: 96, alignItems: 'center' }}>
              <Text style={{ fontSize: 17, color: '#333', flex: 1 }}>头像</Text>
              <View style={{
                width: 64, height: 64, borderRadius: 2, backgroundColor: '#f2f2f2',
                borderColor: '#d9d9d9', borderWidth: 1, justifyContent: 'center', alignItems: 'center'
              }}>
                {userAvatar}
              </View>
              <Icon type='arrow_right' size={16} color={GRAY} style={{ marginHorizontal: 16 }} />
            </View>
          </TouchFeedback>
          {this.renderDiv()}
          {this.renderRow('用户名', name, false, null)}
          {this.renderDiv()}
          {this.renderRow('显示名称', realName, true, () => this.props.navigation.push('PageWarpper', { id: 'nameEdit', component: NameEdit }))}
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
    iconKey: state.user.get('iconKey'),
    updateUserPosting: state.user.get('updateUserPosting'),
  };
}

export default connect(mapStateToProps, { uploadUserIcon, updateUser })(UserInfo);
