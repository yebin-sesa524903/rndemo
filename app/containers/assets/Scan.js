
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Alert,
  Platform,
  View,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import ScanView from '../../components/assets/ScanView';
import Permissions, { PERMISSIONS, RESULTS, request, check } from 'react-native-permissions';
import { localStr } from "../../utils/Localizations/localization";
import { getLanguage } from "rn-module-inventory-ticket/app/utils/Localizations/localization";
import Colors, { isDarkMode } from "../../utils/const/Colors";
import { Icon } from "@ant-design/react-native";

export default class Scan extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  constructor(props) {
    super(props);
    this.state = { openCamera: false, hasCameraAuth: false, modalShow: false, zoom: 0, flashMode: 'off' };
  }
  _getScanData(data) {
    this._clearZoom();
    if (!this.state.openCamera) return;//如果状态不对，不处理
    //处理扫描结果，是跳转到页面还是提示错误
    //如果两次扫描结果一样，增加延迟处理
    if (data === this._preData) {
      let lastTime = this._lastTime || 0;
      //相同结果，两次扫描结果1秒内，不重复处理
      if (Date.now() - lastTime < 1000) return;
      this._lastTime = Date.now();
    } else {
      this._preData = data;
      this._lastTime = Date.now();
    }

    if (data && this.props.scanResult) {
      this.props.scanResult(data);
      if (!this.props.pushToComponent) {
        this._mounted(false, () => {
          this.props.navigation.pop()
        })
      }
    }
  }

  _delayZoom() {
    this._clearZoom();
    this._zoomTimer = setTimeout(() => {
      this.setState({ zoom: Platform.OS === 'ios' ? 0.07 : 0.2 })
    }, 5000);
  }

  _mounted(v, cb = () => { }) {
    this.setState({ openCamera: v }, cb);
    if (v) {
      this._delayZoom();
    } else {
      this._clearZoom();
    }
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      let cameraPermission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
      check(cameraPermission).then(response => {
        if (response === RESULTS.GRANTED || response === RESULTS.LIMITED) {
          this._mounted(true);
          this.setState({ hasCameraAuth: true });
        } else if (response === RESULTS.BLOCKED || response === RESULTS.DENIED) {
          request(cameraPermission).then(response => {
            if (response === RESULTS.GRANTED || response === RESULTS.LIMITED) {
              this._mounted(true);
              this.setState({ hasCameraAuth: true });
            } else {
              this.setState({ hasCameraAuth: false });
              Alert.alert(
                '',
                localStr('lang_camera_permission'),
                [
                  { text: localStr('lang_alarm_time_picker_cancel'), onPress: () => { } },
                  {
                    text: localStr('lang_alarm_time_picker_ok'), onPress: () => {
                      if (Permissions.openSettings()) {
                        Permissions.openSettings();
                      }
                    }
                  }
                ],
                { cancelable: false }
              )
              this._mounted(false);
            }
          })
        }
      });
      let that = this;
      let navigation = this.props.navigation;
      if (navigation) {
        let callback = (event) => {
          console.log('event', event, this.props);
          if (event.state.params && event.state.params.id && event.state.params.id === this.props.route.id) {
            InteractionManager.runAfterInteractions(() => {
              this._mounted(true, () => this.setState({ hidden: false }));
            })
          }
          if (event.state.params && event.state.params.id && event.state.params.id !== this.props.route.id) {
            //导航切换到其他页面，关闭
            InteractionManager.runAfterInteractions(() => {
              that.setState({
                openCamera: false, flashMode: 'off', hidden: true,
              })
            })
          }
        };

        if (navigation && navigation.addListener) {
          this._listener = navigation.addListener('willFocus', () => {
            InteractionManager.runAfterInteractions(() => {
              this._mounted(true, () => this.setState({ hidden: false }));
            })
          });
          this._listener2 = navigation.addListener('willBlur', (event) => {
            InteractionManager.runAfterInteractions(() => {
              that.setState({
                openCamera: false, flashMode: 'off', hidden: true,
              })
            })
          });
        }
      }
    });
  }

  _clearZoom() {
    clearTimeout(this._zoomTimer);
    this._zoomTimer = null;
  }

  componentWillUnmount() {
    this._lastTime = null;
    this._preData = null;
    this._listener && this._listener.remove();
    this._listener2 && this._listener2.remove();
    console.log('add will focus listener....')
    this._clearZoom();
  }


  _didSwitchLight = () => {
    let flash = this.state.flashMode;
    let modeString = '';
    if (flash === 'off') {
      modeString = 'on';
    } else {
      modeString = 'off';
    }
    this.setState({
      flashMode: modeString,
    })
  }

  _getLightText(flashMode) {
    let lan = getLanguage();
    //{`${this.state.flashMode === 'on' ? localStr('lang_scan_page_light_off') : localStr('lang_scan_page_light_on')}${localStr('lang_scan_page_light')}`}</Text>
    if (lan === 'en')
      return `${localStr('lang_scan_page_light')} ${this.state.flashMode === 'on' ? localStr('lang_scan_page_light_off') : localStr('lang_scan_page_light_on')}`
    return `${this.state.flashMode === 'on' ? localStr('lang_scan_page_light_off') : localStr('lang_scan_page_light_on')}${localStr('lang_scan_page_light')} `
  }

  _getLightIcon() {
    if (isDarkMode()) {
      return this.state.flashMode === 'on' ? require('../../images/scan_light/light_on_dark.png') : require('../../images/scan_light/light_off_dark.png')
    } else {
      return this.state.flashMode === 'on' ? require('../../images/scan_light/light_on_light.png') : require('../../images/scan_light/light_off_light.png')
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScanView
          hidden={this.state.hidden}
          hasCameraAuth={this.state.hasCameraAuth}
          openCamera={this.state.openCamera}
          scanText={this.props.scanText}
          scanTitle={this.props.scanTitle}
          modalShow={this.state.modalShow}
          zoom={this.state.zoom}
          flashMode={this.state.flashMode}
          onOncancelInputDialog={() => {
          }}
          onConfirmInputDialog={(name) => {
          }}
          onBack={() => {
            this._mounted(false, () => {
              this.props.navigation.pop()
            })
          }}
          barCodeComplete={(data) => this._getScanData(data)} />
        <View style={{ height: 160, backgroundColor: Colors.seBgContainer, alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => this._didSwitchLight()}>
            <Image style={{ width: 56, height: 56, }} source={this._getLightIcon()} />
          </TouchableOpacity>
          <Text style={{ color: Colors.seTextPrimary, fontSize: 16, marginTop: 12 }}>
            {this._getLightText(this.state.flashMode)}
          </Text>
        </View>
      </View>

    );
  }
}
