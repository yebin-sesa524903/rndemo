
'use strict';

import React, { Component } from 'react';
import {
  Alert
} from 'react-native';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import PropTypes from 'prop-types';

import { saveDeviceEnv } from '../../actions/assetsAction';
import EnvEditView from '../../components/assets/EnvEditView';
import trackApi from '../../utils/trackApi.js';
import { Keyboard } from 'react-native';

class DeviceEnvEdit extends Component {
  constructor(props) {
    super(props);
  }
  _save(text) {
    var type = this.props.data.get('type');
    Keyboard.dismiss();
    if (isNaN(text) || text === 0) {
      Alert.alert('', '仅支持数字');
      return;
    }
    if (type === 'humidity' || type === 'dust') {
      var numValue = Number(text);
      if (numValue < 0) {
        Alert.alert('', '仅支持正数');
        return;
      }
    }
    if (text === '' || text === null || text.match(/^\s*$/)) {
      text = null;
    }
    if (type === 'temperature1') {
      type = 'Temperature1';
    }
    else if (type === 'temperature2') {
      type = 'Temperature2';
    }
    else if (type === 'temperature3') {
      type = 'Temperature3';
    }

    this.props.saveDeviceEnv(this.props.env.set(type, text).toObject());
    this.props.navigation.pop();
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  render() {
    return (
      <EnvEditView
        save={(text) => this._save(text)}
        data={this.props.data}
        onBack={() => { this.props.navigation.pop() }} />
    );
  }
}

DeviceEnvEdit.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  data: PropTypes.object,
  env: PropTypes.object,
  asset: PropTypes.object,
  saveDeviceEnv: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  var deviceDetailData = state.asset.deviceDetailData;
  return {
    env: deviceDetailData.get('envObj')
  };
}

export default connect(mapStateToProps, { saveDeviceEnv })(DeviceEnvEdit);
