
'use strict';
import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import Button from '../Button';
import TouchFeedback from '../TouchFeedback';
import { LINE, LOGOUT_RED, LIST_BG, GRAY } from '../../styles/color';
import ListSeperator from '../ListSeperator';
import Icon from '../Icon.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import permissionCode from "../../utils/permissionCode";
import { isPhoneX } from '../../utils';
import NetworkImage from "../NetworkImage";
import DeviceInfo from "react-native-device-info";
const PADDING_BOTTOM = Platform.select(
  {
    ios: isPhoneX() ? 34 : 0,
    android: 0,
  }
);

export default class MyView extends Component {
  constructor(props) {
    super(props);
    // var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    // this.state = {dataSource: ds.cloneWithRows([0,1,2,3])};
  }
  _logout() {
    this.props.onLogout();
  }
  _renderName() {
    var text = this.props.user.get('Name');

    return (
      <View style={styles.row}>
        <Text style={styles.rowPrimaryText}>用户名</Text>
        <Text style={styles.rowSecondaryText}>{text}</Text>
      </View>
    )
  }
  _getNavIcon(isNav) {
    if (isNav) {
      return (
        <Icon type='arrow_right' size={16} color={GRAY} style={{ marginLeft: 4 }} />
      )
    }
  }
  _renderDisplayName() {
    var value = this.props.user.get('RealName')
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        if (this.props.canEditRealName) {
          this.props.onRowClick(3);
        }
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'昵称'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.valueText}>
              {value}
            </Text>
            {this._getNavIcon(this.props.canEditRealName)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderPassEdit() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(6);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'修改密码'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.valueText}>
              {''}
            </Text>
            {this._getNavIcon(this.props.canEditRealName)}
          </View>
        </View>
      </TouchFeedback>
    );
  }
  _renderLogbookRow() {
    if (!privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode')) {
      return null;
    }
    var viewUserTech = (
      <View style={{}}>
        <ListSeperator marginWithLeft={16} />
        {this._renderUseTech()}
      </View>
    )
    if (!this.props.guideInfos || this.props.guideInfos.size === 0) {
      viewUserTech = null;
    }
    return (
      <View>
        <ListSeperator />
        {this._renderDeviceList()}
        {viewUserTech}
        <ListSeperator marginWithLeft={16} />
      </View>
    )
  }
  _renderDeviceList() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(7);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'Logbook设备统计'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.valueText}>
              {''}
            </Text>
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderUseTech() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(8);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'Logbook使用教程'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.valueText}>
              {''}
            </Text>
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderQRCode() {
    return (
      <TouchFeedback onPress={() => { this.props.onRowClick(1) }}>
        <View style={styles.row}>
          <Text style={styles.rowPrimaryText}>EnergyHub二维码</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 6, }}>
              <Image style={styles.qrcode} source={require("../../images/qrcode/qrcode.png")} />
            </View>
            {this._getNavIcon(true)}
          </View>


        </View>
      </TouchFeedback>
    )
  }
  _getVersion(isShow) {
    return isShow && (
      <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.versionText}>
        {this.props.oldVersion}
      </Text>
    );
  }
  _getNeedUpgradeIcon() {
    var upIcon = null;
    if (this.props.hasNewVersion && Platform.OS !== 'ios') {
      upIcon = (
        <View style={{ backgroundColor: 'red', width: 10, height: 10, borderWidth: 1, borderColor: 'red', borderRadius: 5, }}>
        </View>
      );
    }
    return upIcon;
  }
  _renderFeedback() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(4);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'用户反馈'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.versionText}>
              {''}
            </Text>
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderSubstation() {
    //只有andorid pad才显示地点
    if (!(Platform.OS === 'android' && DeviceInfo.isTablet())) return;
    let substation = this.props.substation;
    if (!substation) {
      substation = {}
    }
    return (
      <>
        {this._getSection(10, true, false)}
        <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
          this.props.onRowClick(15);
        }}>
          <View style={[styles.row]}>
            <Text style={styles.rowPrimaryText}>
              {'所在地点'}
            </Text>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
              <Text numberOfLines={1} lineBreakModel='charWrapping' style={[styles.versionText, { flex: 1 }]}>
                {substation.name || ''}
              </Text>
              {this._getNavIcon(true)}
            </View>
          </View>
        </TouchFeedback>
      </>
    );
  }

  _renderCacheTicket() {
    let showTicket =
      privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
      privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
    if (!showTicket) {
      return null;
    }
    return (
      <View style={{ flex: 1 }}>
        <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
          this.props.onRowClick(9);
        }}>
          <View style={[styles.row]}>
            <Text style={styles.rowPrimaryText}>
              {'清空本地工单'}
            </Text>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
              <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.versionText}>
                {`${this.props.cacheCount || 0}条`}
              </Text>
              {this._getNavIcon(true)}
            </View>
          </View>
        </TouchFeedback>
        <ListSeperator marginWithLeft={16} />
      </View>
    );
  }

  _renderAbout() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(2);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            关于北创**
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
            {this._getNeedUpgradeIcon()}
            {this._getVersion(Platform.OS === 'android')}
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderSecurity() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(12);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'账户安全'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderCheckScreenLocation() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(10);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'检测大屏定位权限'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }

  _renderPrivacyStatement() {
    return (
      <TouchFeedback style={[{ backgroundColor: 'white' }, styles.rowHeight]} onPress={() => {
        this.props.onRowClick(5);
      }}>
        <View style={[styles.row]}>
          <Text style={styles.rowPrimaryText}>
            {'数据隐私声明'}
          </Text>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
            <Text numberOfLines={1} lineBreakModel='charWrapping' style={styles.versionText}>
              {''}
            </Text>
            {this._getNavIcon(true)}
          </View>
        </View>
      </TouchFeedback>
    );
  }


  _renderSeparator(sectionId, rowId) {
    return (
      <View key={rowId} style={styles.sepView}></View>
    )
  }

  _renderFooter() {
    return (
      <View style={{ marginTop: 10, paddingBottom: 30, }}>
        <ListSeperator />
        <Button
          style={{
            backgroundColor: 'white',
            // marginTop:10,
            height: 56,
            // marginHorizontal:16,
            // borderRadius:6,
          }}
          textStyle={{
            fontSize: 17,
            color: '#ff4d4d'
          }}
          text="退出登录" onClick={() => this._logout()} />
        <ListSeperator />
      </View>
    );
  }
  _getSection(height, isTop, isBottom) {
    if (!height) {
      height = 10;
    }
    return (
      <View style={{}}>
        {isTop && <View style={{ height: 1, backgroundColor: LINE }}></View>}
        <View style={{
          borderColor: LIST_BG,
          borderBottomWidth: height,
        }}>
          { }
        </View>
        {isBottom && <View style={{ height: 1, backgroundColor: LINE }}></View>}
      </View>
    );
  }
  _getToolbar(data) {
    return (
      <Toolbar title='我的' switchLogo={this.props.showSwitch} />
    );
  }

  renderUserInfo() {
    let name = this.props.user.get('Name')
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
      <TouchFeedback onPress={this.props.onRowClick.bind(this, 11)}>
        <View style={{
          backgroundColor: '#fff', height: 124, flexDirection: 'row',
          alignItems: 'center', padding: 16
        }}>
          <View style={{
            width: 64, height: 64, borderRadius: 2, backgroundColor: '#f2f2f2',
            borderColor: '#d9d9d9', borderWidth: 1, justifyContent: 'center', alignItems: 'center'
          }}>
            {userAvatar}
          </View>
          <View style={{ flex: 1, marginHorizontal: 16 }}>
            <Text numberOfLines={1} style={{ fontSize: 22, color: '#333' }}>{this.props.user.get('RealName')}</Text>
            <Text numberOfLines={1} style={{ fontSize: 17, color: '#888', marginTop: 10 }}>{`用户名:${name}`}</Text>
          </View>
          {this._getNavIcon(true)}
        </View>
      </TouchFeedback>
    )
  }

  render() {
    if (!this.props.user) {
      return (
        <View style={{ flex: 1, backgroundColor: LIST_BG }}>
          {this._getToolbar(this.props.user)}
        </View>
      )
    }
    return (
      <View style={{ flex: 1, backgroundColor: LIST_BG }}>
        {this._getToolbar(this.props.user)}
        <ScrollView style={{ flex: 1, }}>

          {this.renderUserInfo()}

          {this._renderSubstation()}
          {/*/}
            {this._getSection(10,false,false)}
            <ListSeperator/>
            {this._renderName()}
            <ListSeperator marginWithLeft={16}/>
            {this._renderDisplayName()}
            <ListSeperator marginWithLeft={16}/>
            {this._renderPassEdit()}
          {/*/}
          {this._getSection(10, true, false)}
          {/*
            {this._renderLogbookRow()}
            {this._renderCheckScreenLocation()}

          <ListSeperator marginWithLeft={16}/>
          */}
          {this._renderCacheTicket()}
          {/*
            {this._getSection(10,true,false)}
            <ListSeperator/>
            */}

          {/*{this._renderSecurity()}*/}
          {
            // <ListSeperator marginWithLeft={16}/>
          }
          {
            // this._renderPrivacyStatement()
          }
          {/*<ListSeperator marginWithLeft={16}/>*/}
          {/*{this._renderQRCode()}*/}
          {/*<ListSeperator marginWithLeft={16}/>*/}
          {this._renderAbout()}
          <ListSeperator />

          {this._renderFooter()}
        </ScrollView>

      </View>
    );
  }
}

MyView.propTypes = {
  navigator: PropTypes.object,
  user: PropTypes.object,
  guideInfos: PropTypes.object,
  canEditRealName: PropTypes.bool,
  oldVersion: PropTypes.string,
  hasNewVersion: PropTypes.bool,
  onLogout: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16
  },
  rowPrimaryText: {
    fontSize: 17,
    color: '#333'
  },
  rowSecondaryText: {
    fontSize: 17,
    color: '#888'
  },
  valueText: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
    fontSize: 17,
    color: '#888'
  },
  versionText: {
    textAlign: 'right',
    // flex:1,
    marginLeft: 10,
    fontSize: 17,
    color: '#888'
  },
  qrcode: {
    width: 20,
    height: 20,
  },
  sepView: {
    height: 1,
    // flex:1,
    backgroundColor: LINE
  }
});
