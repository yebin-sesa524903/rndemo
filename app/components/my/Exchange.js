
'use strict';
import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Platform,
  InteractionManager,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import { BLACK, GRAY, GREEN } from '../../styles/color';
import Icon from '../Icon.js';
import Button from '../Button';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from "react-native-view-shot";
import appInfo from '../../utils/appInfo.js';
import Toast from 'react-native-root-toast';
import Permissions from 'react-native-permissions';
import { PermissionsAndroid } from 'react-native';
import moment from 'moment';
import CameraRoll from "@react-native-community/cameraroll";
import { requestPhotoPermission } from "../../utils/devicePermission";

moment.locale('zh-cn');

export default class Exchange extends Component {
  constructor(props) {
    super(props);
  }

  async _requestExternalStorageAccess() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this._saveQRCodeToCamera();
      } else {
        Alert.alert(
          '',
          '请在手机的' + '"' + '设置' + '"' + '中，允许EnergyHub访问您的存储',
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
          ],
          { cancelable: false }
        )
      }
    } catch (err) {
      console.warn(err);
    }
  }

  _saveQRCodeToCamera() {
    this.refs.viewShot.capture().then(uri => {
      CameraRoll.saveToCameraRoll(uri, 'photo');
      Toast.show('保存成功', {
        duration: 2000,
        position: -30,
      });
      // console.warn("do something with ", uri);
    })
  }
  render() {
    let exchangeUri = appInfo.get().exchangeUri;
    var nowTime = moment().format('YYYYMMDD');
    var userId = this.props.user.get('Id');
    exchangeUri = exchangeUri.replace('userid', userId);
    exchangeUri = exchangeUri.replace('yymmdd', nowTime);
    console.warn('exchangeUri', exchangeUri);
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Toolbar
          title='去兑换'
          navIcon="back"
          onIconClicked={() => this.props.onBack()} />
        <View style={styles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ViewShot ref="viewShot" style={{}}>
              <QRCode
                value={exchangeUri}
                size={150}
                backgroundColor='white'
                color='#333' />
            </ViewShot>
            <Button
              style={[styles.button, {
                backgroundColor: GREEN,
              }]}
              textStyle={{
                fontSize: 18,
                color: '#fff'
              }}
              text='保存到相册' onClick={() => {
                if (Platform.OS === 'android') {
                  // this._saveQRCodeToCamera();
                  this._requestExternalStorageAccess();
                } else {
                  requestPhotoPermission(() => {
                    this._saveQRCodeToCamera();
                  });
                }
              }} />
          </View>
          <View style={{ marginBottom: 64 }}>
            <View style={{ height: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8, }}>
              <Text style={{ fontSize: 17, fontWeight: '500', color: '#333' }}>{'二维码使用流程'}</Text>
            </View>
            <View style={{ height: 21, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.text}>{'1.请保存二维码到相册'}</Text>
            </View>
            <View style={{ height: 21, alignItems: 'center', justifyContent: 'center' }}>
              <Icon type="icon_arrow_down" color={GREEN} size={13} />
            </View>
            <View style={{ height: 21, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.text}>{'2.打开微信扫一扫'}</Text>
            </View>
            <View style={{ height: 21, alignItems: 'center', justifyContent: 'center' }}>
              <Icon type="icon_arrow_down" color={GREEN} size={13} />
            </View>
            <View style={{ height: 21, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.text}>{'3.对相册中的二维码进行识别'}</Text>
            </View>
          </View>
        </View>
      </View>

    );
  }
}


Exchange.propTypes = {
  onBack: PropTypes.func,
  user: PropTypes.object,
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  qrcode: {
    marginBottom: 20,
    width: 150,
    height: 150,
  },
  text: {
    fontSize: 15,
    // marginBottom:7,
    color: '#888'
  },
  button: {
    marginTop: 30,
    height: 44,
    width: 243,
    borderRadius: 2,
  }
});
