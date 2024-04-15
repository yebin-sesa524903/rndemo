
'use strict';
import React, { Component } from 'react';
import {
  Platform, Alert,
  InteractionManager,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import trackApi from '../../utils/trackApi.js';

import SignView from '../../components/signature/SignView';
import { signatureImage, saveCacheSign } from '../../actions/ticketAction';
import { uploadBillSign } from '../../actions/monitionAction'
import { cacheTicketModify, TICKET_TYPE_SAVE_SIGN, TICKET_TYPE_SAVE_SIGN_BZ } from '../../utils/sqliteHelper';
import Toast from 'react-native-root-toast';
var Orientation = require('react-native-orientation');
var _startToExit = false;
class TicketSign extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] }
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  _orientationDidChange(orientation) {
    if (this.props && this.props.isModal) return;
    if (Platform.OS === 'android' || _startToExit) {
      // Orientation.lockToPortrait();
      return;
    }
    if (orientation === 'LANDSCAPE') {
      //do something with landscape layout
    } else {
      //do something with portrait layout
      console.warn('history..._orientationDidChange');
      Orientation.lockToLandscape();
    }
  }
  componentDidMount() {
    if (this.props.isModal) return;
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id, () => {
      Orientation.lockToPortrait();//when hardware back
      this.props.navigation.pop();
    });
    Orientation.lockToLandscape();//ios is here
    Orientation.addOrientationListener(this._orientationDidChange.bind(this));

  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.posting === 2 && this.props.posting !== nextProps.posting) {
      //提交成功，返回
      this.context.hideHud()
      InteractionManager.runAfterInteractions(() => {
        if (this.props.sanpiao) {
          this.props.saveSign(nextProps.signKey);
        }
        this.onBack();
      });
    }
    if (nextProps.posting === 3 && this.props.posting !== nextProps.posting) {
      this.context.hideHud()
      InteractionManager.runAfterInteractions(() => {
        //提交失败，给出错误提示
        // Toast.show('签名上传失败',{
        //   duration: Toast.durations.LONG,
        //   position: Toast.positions.BOTTOM,
        // });
        Alert.alert('', '签名上传失败', [{ text: '确认', onPress: () => { } }]);
      });
    }
  }
  componentWillUnmount() {
    if (this.props.isModal) return;
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    Orientation.removeOrientationListener(this._orientationDidChange);
  }

  saveSign(base64Image) {
    if (!base64Image) {
      // Toast.show('请先签名，再确认！',{
      //   duration: Toast.durations.LONG,
      //   position: Toast.positions.CENTER,
      // });
      Alert.alert('', '请先签名，再确认！', [{ text: '确认', onPress: () => { } }]);
      return;
    }
    if (this.props.sanpiao) {
      // this.props.saveSign('data:image/jpeg;base64,'+base64Image);
      // this.onBack();
      this.context.showSpinner();
      this.props.uploadBillSign({
        'fileName': 'bill_sign',
        'fileContent': base64Image
      })
      return;
    }

    if (this.props.offlineMode) {
      let fn = async () => {
        let op_type = TICKET_TYPE_SAVE_SIGN;
        if (this.props.type === 1) op_type = TICKET_TYPE_SAVE_SIGN_BZ;//值班长签名
        await cacheTicketModify(this.props.ticketId, op_type, base64Image);
        //离线模式 保存到数据库里面
        this.props.saveCacheSign('data:image/jpeg;base64,' + base64Image, this.props.type);
        this.onBack();
      }
      fn();
    } else {
      this.context.showSpinner();
      this.props.signatureImage({
        'ticketId': this.props.ticketId || 'bill_sign',
        'content': base64Image,
        signatureType: this.props.type || 0
      })
    }

  }

  onBack() {
    if (this.props.isModal) {
      this.props.onModalBack();
      return;
    }
    _startToExit = true;
    Orientation.removeOrientationListener(this._orientationDidChange);
    Orientation.lockToPortrait();//when left top button back

    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.pop();
    });
  }

  render() {
    return (
      <SignView sanpiao={this.props.sanpiao}
        isModal={this.props.isModal}
        onBack={this.onBack.bind(this)}
        saveSign={this.saveSign.bind(this)}
      />
    );
  }
}

function mapStateToProps(state, ownProps) {
  let props = {}
  if (ownProps.sanpiao) {
    props = {
      posting: state.monition.monitionList.get('signPosting'),
      signKey: state.monition.monitionList.get('signKey'),
    }
  } else {
    props = {
      posting: state.ticket.ticket.get('ticketSignPosting')
    }
    //posting:ticket.get('ticketSignPosting')
  }
  //let ticket=state.ticket.ticket;
  return props;
}

export default connect(mapStateToProps, { signatureImage, saveCacheSign, uploadBillSign })(TicketSign);
