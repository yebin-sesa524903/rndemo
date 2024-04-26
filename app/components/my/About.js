
'use strict';
import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import { BLACK, GREEN } from '../../styles/color';
import Button from '../Button';
import QRCode from "react-native-qrcode-svg";

export default class About extends Component {
  constructor(props) {
    super(props);
    // console.warn('my props',props.appInfo);
  }
  _getSpFullName() {
    var spName = this.props.user.get('SpFullName');
    if (!spName) {
      spName = '施耐德电气（中国）有限公司 版权所有';
    }
    return spName;
  }
  _getIsSpCustomer() {
    var spName = this._getSpFullName();
    return spName.indexOf('施耐德') === -1;
  }
  _renderFooter() {
    var hasNewVersion = this.props.version.get('hasNewVersion') && Platform.OS !== 'ios';
    var { width } = Dimensions.get('window');
    var version = this.props.version.get('version');
    if (!hasNewVersion) {
      return null;
    }
    return (
      <Button
        style={{
          backgroundColor: GREEN,
          marginTop: 42,
          height: 48, marginHorizontal: 16,
          borderRadius: 6,
          width: width - 32,
        }}
        textStyle={{
          fontSize: 15,
          color: '#ffffff'
        }}
        text={"下载新版本 V" + version} onClick={() => this.props.updateClick()} />
    );
  }
  _getLatestText(hasNewVersion) {
    if (!hasNewVersion && Platform.OS === 'android') {
      return (
        <Text style={styles.versionText}>{`${'(已为最新版本)'}`}</Text>
      );
    } else {
      return null;
    }
  }
  // {this.props.version.get('version')}
  // hasNewVersion={this.props.version.get('hasNewVersion')}
  // upgradeUri={this.props.version.get('upgradeUri')}
  render() {
    var hasNewVersion = this.props.version.get('hasNewVersion') && Platform.OS !== 'ios';
    var appInfo = this.props.appInfo;
    var spCopyRightColor = this._getIsSpCustomer() ? 'transparent' : '#888';
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <Toolbar
          title={'关于EnergyHub'}
          navIcon="back"
          onIconClicked={() => this.props.onBack()} />
        <View style={styles.container}>

          <View style={{ width: 200, height: 200, marginTop: 78 }}>
            {
              !this.props.host ? null :
                <QRCode size={200} style={{ width: 200, height: 200 }} value={this.props.host} />
            }
          </View>
          <Text style={{ fontSize: 17, color: '#333', marginTop: 12 }}>扫码下载EnergyHubApp</Text>
          {this._renderFooter()}
          <View style={styles.bottom}>
            <Text style={{ fontSize: 17, color: '#888' }}>{`${hasNewVersion ? '当前版本' : '版本'}V${appInfo.versionName}`}</Text>
            <Text style={{ fontSize: 14, color: '#888', marginVertical: 8 }}>{this._getSpFullName()}</Text>
            <Text style={[styles.copyrightText, { color: spCopyRightColor }]}>Copyright © 2021 Schneider Electric.All Rights</Text>
            <Text style={[styles.copyrightText, { color: spCopyRightColor }]}>Reserved.</Text>
          </View>
        </View>
      </View>

    );
  }
}

About.propTypes = {
  onBack: PropTypes.func,
  appInfo: PropTypes.object,
  user: PropTypes.object,
  updateClick: PropTypes.func,
  version: PropTypes.object,
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  productNameText: {
    marginTop: 20,
    color: BLACK,
    fontSize: 14,
  },
  versionText: {
    marginTop: 7,
    color: BLACK,
    fontSize: 14,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 64,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal:40,
  },
  corpText: {
    marginBottom: 7,
    fontSize: 12,
    color: BLACK
  },
  copyrightText: {
    color: '#888',
    fontSize: 14,
  }
});
