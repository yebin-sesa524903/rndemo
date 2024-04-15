
'use strict';
import React, { Component } from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import Scanner from '../Scanner';
import Text from '../Text.js';
import Loading from '../Loading';
import Toolbar from '../Toolbar';
import ViewFinder from '../ViewFinder.js';
import Toast from 'react-native-root-toast';
import InputDialog from '../InputDialog';

export default class ScanView extends Component {
  constructor(props) {
    super(props);
    this.state = { inputText: '' };
  }
  _barcodeReceived(e) {
    console.warn('barcode', e);
    // if(e.type === 'QR_CODE' || e.type === 'org.iso.QRCode'){
    this.props.barCodeComplete(e.data);
    // }
  }
  _getScanner() {
    var scanText = this.props.scanText;

    return (
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>
        <Scanner
          zoom={this.props.zoom}
          hasCameraAuth={this.props.hasCameraAuth}
          flashMode={this.props.flashMode}
          onBarCodeRead={(e) => this._barcodeReceived(e)}
        />
        <View style={{
          position: 'absolute',
          left: 0, right: 0,
          justifyContent: 'center',
          alignItems: 'center',
          bottom: 100,
        }}>
          <Text style={{
            fontSize: 17, color: 'white', textAlign: 'center'
          }}>{scanText}</Text>
        </View>
      </View>
    );
  }
  _inputDialogClick(text, type) {
    text = text.trim();

    this.props.onConfirmInputDialog(text);
  }
  render() {
    var scanner = null;
    if (this.props.openCamera) {
      scanner = this._getScanner();
    }
    else {
      scanner = (<ViewFinder />);
    }

    if (this.props.isFetching) {
      scanner = (<Loading />);
    }

    // console.warn('ScanView...');
    return (
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {scanner}
        <View style={{
          position: 'absolute',
          left: 0, right: 0,
          top: 0,
        }}>
          <Toolbar
            title={this.props.scanTitle}
            color='transparent'
            tintColor="white"
            titleColor='white'
            navIcon="back"
            onIconClicked={() => {
              this.props.onBack();
            }}
          />
          <InputDialog title={'新建设备'} type={'device'} hint={'请输入配电设备名称'}
            onClick={(text, type) => this._inputDialogClick(text, type)} inputText={this.state.inputText}
            onCancel={() => {
              this.props.onOncancelInputDialog();
            }}
            modalShow={this.props.modalShow} />
        </View>
      </View>
    );
  }
}

ScanView.propTypes = {
  navigator: PropTypes.object,
  isFetching: PropTypes.bool.isRequired,
  openCamera: PropTypes.bool.isRequired,
  barCodeComplete: PropTypes.func.isRequired,
  isFromPanelAdd: PropTypes.bool,
  onBack: PropTypes.func.isRequired,
  scanText: PropTypes.string,
  scanTitle: PropTypes.string,
  hasCameraAuth: PropTypes.bool,
  onOncancelInputDialog: PropTypes.func.isRequired,
  onConfirmInputDialog: PropTypes.func.isRequired,
  modalShow: PropTypes.bool,
}

ScanView.defaultProps = {
  scanText: '将二维码放入框内，即可自动扫描',
  scanTitle: '',
}
