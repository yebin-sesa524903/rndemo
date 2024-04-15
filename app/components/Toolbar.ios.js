'use strict';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { View, StyleSheet, Image, ViewPropTypes, Platform, StatusBar } from 'react-native';
import { GREEN, IOS_NAVBAR, IOS_NAVBAR_BORDER, LIGHTGRAY } from '../styles/color.js';
import Text from './Text.js';
import TouchFeedback from './TouchFeedback';
import privilegeHelper from '../utils/privilegeHelper.js';
import Icon from './Icon';
import { Icon as AntIcon } from '@ant-design/react-native';
import Orientation from 'react-native-orientation';

import { isPhoneX } from '../utils';
import Colors from "../utils/const/Colors";

var dH = isPhoneX() ? 20 : 0;

const tHeight = 64;
const statusBarHeight = 20;
const sideWidth = 48;
const navHeight = 44;

const isIOS13 = Number.parseInt(Platform.Version) >= 13;


export default class Toolbar extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    var { navIcon, onIconClicked, tintColor, color, borderColor, title, titleColor, actions } = this.props;
    var navView = null;
    var width = 16;
    var navImage = null;
    if (navIcon === 'back') {
      navImage = require('../images/back_arrow/back_arrow.png');
    }
    else if (navIcon === 'close') {
      navImage = require('../images/close/close.png');
    } else if (navIcon === 'icon') {
      navImage = 'icon';
    }
    var marginLeft = 12;
    // if(!titleColor)
    //   tintColor='#333';
    if (navImage) {
      navView = (
        <TouchFeedback style={{ width: sideWidth, height: navHeight }} onPress={onIconClicked}>
          <View style={{ marginHorizontal: marginLeft, flex: 1, justifyContent: 'center', }}>
            {
              navIcon === 'icon' ?
                <AntIcon name={'left-square'} color={Colors.white} size={24} /> :
                <Image style={{ tintColor: titleColor ? tintColor : '#fff', width, height: width }} source={navImage} resizeMode='contain' />
            }
          </View>
        </TouchFeedback>

      );
    }
    else {
      navView = (
        <View style={{ width: sideWidth, marginLeft }}>
        </View>
      );
    }
    var actionsView = null;
    if (actions) {
      actions = actions.filter((item) => {
        if (!item.code) return true;
        // console.warn('item.code',item.code);
        if (privilegeHelper.hasAuth(item.code)) return true;
        return false;
      });
      actionsView = actions.map((item, index) => {
        // console.warn('actions.map((item,index)=>{',item);
        var imageOrText = null;
        var enabled = !item.disable;
        if (item.iconType || item.icon) {
          if (item.iconType === 'add') {
            item.icon = require('../images/add/add.png');
          }
          else if (item.iconType === 'edit') {
            item.icon = require('../images/edit/edit.png');
          }
          else if (item.iconType === 'delete') {
            item.icon = require('../images/delete/delete.png');
          } else if (item.iconType === 'filter') {
            item.icon = require('../images/filter/filter.png');
          } else if (item.iconType === 'share') {
            item.icon = require('../images/share/screen_share.png');
          } else if (item.iconType === 'calender') {
            item.icon = require('../images/aaxiot/nav/calender.png');
          }
          imageOrText = (
            <Image style={{ tintColor: '#fff', width, height: width }} source={item.icon} />
          );
        } else if (item.isFontIcon) {
          imageOrText = <Icon type={item.type} color={enabled ? '#fff' : '#33333380'} size={16} />
        }
        else {
          width = null;
          imageOrText = (
            <Text style={{ color: enabled ? '#fff' : '#33333380', fontSize: 15 }}>{item.title}</Text>
          );
        }
        if (!enabled) {
          return (
            <View key={index} style={{
              paddingHorizontal: 8, height: navHeight,
              justifyContent: 'center', alignItems: 'center'
            }}>
              {imageOrText}
            </View>
          )
        } else {
          return (
            <TouchFeedback key={index} style={{}} onPress={() => {
              if (enabled) {
                this.props.onActionSelected[index](item);
              }
            }}>
              <View style={{
                paddingHorizontal: 8, height: navHeight,
                justifyContent: 'center', alignItems: 'center'
              }}>
                {imageOrText}
              </View>
            </TouchFeedback>
          );
        }
      });
    }
    else {
      actionsView = (
        <View style={{ width: sideWidth }}>
        </View>
      );
    }

    var titleStyle = [styles.titleText];
    // titleColor='#333';
    if (titleColor) {
      titleStyle.push({ color: titleColor });
    } else {
      titleStyle.push({ color: '#fff' });
    }

    if (color === 'transparent') {
      borderColor = 'transparent';
    } else {
      // color='#fff';
      if (!borderColor) {
        borderColor = Colors.text.toolbar_border_color;
      }
    }

    var top = this.props.isLandscape ? statusBarHeight : statusBarHeight + dH;
    var height = this.props.isLandscape ? tHeight : tHeight + dH;
    let landscapeStyle = {}
    if (this.props.isLandscape && isIOS13) {
      top = 0;
      landscapeStyle = { alignItems: 'flex-start' }
      height = navHeight;
    }
    return (
      <View style={[styles.navSty, landscapeStyle, {
        backgroundColor: color, borderColor: borderColor,
        paddingTop: top, height: height
      }]}>
        <StatusBar barStyle={'light-content'} backgroundColor={Colors.seBrandNomarl} />
        <View style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // backgroundColor:'red',
          position: 'absolute', left: 50, right: 50, top: top, height: navHeight
        }}>
          {/*<View style={{flex:1,justifyContent:'center'}}>*/}
          {/*<Text style={titleStyle} numberOfLines={1}>*/}
          {/*{title}*/}
          {/*</Text>*/}
          {/*</View>*/}
          {this._renderTitle(titleStyle, title)}
        </View>
        {navView}
        <View style={{ flexDirection: 'row', paddingRight: 8 }}>
          {actionsView}
        </View>

      </View>
    );
  }

  _renderTitleSuffix() {
    if (!this.props.titleSuffix) return null;
    return (
      <Text style={styles.titleSuffixText} numberOfLines={1}>
        {this.props.titleSuffix}
      </Text>
    );
  }

  _renderTitle(titleStyle, title) {
    if (this.props.titleClick) {
      return (
        <TouchFeedback onPress={() => {
          this.props.titleClick()
        }}>
          <View style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
            <Text style={titleStyle} numberOfLines={1}>
              {title}
            </Text>
            {this._renderTitleSuffix()}
            <Icon style={{ marginLeft: 6 }} type={'icon_arrow_down'} color={'#333'} size={14} />
          </View>
        </TouchFeedback>
      );
    } else {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
          <Text style={titleStyle} numberOfLines={1}>
            {title}
          </Text>
          {this._renderTitleSuffix()}
        </View>
      )
    }
  }
}

Toolbar.propTypes = {
  noShadow: PropTypes.bool,
  style: ViewPropTypes.style,
  opacity: PropTypes.number,
  titleColor: PropTypes.string,
  color: PropTypes.string,
  navIcon: PropTypes.string,
  onIconClicked: PropTypes.func,
  tintColor: PropTypes.string,
  title: PropTypes.string,
  actions: PropTypes.any,
  onActionSelected: PropTypes.any,
  borderColor: PropTypes.string,
  isLandscape: PropTypes.bool,
}

Toolbar.defaultProps = {
  noShadow: false,
  color: IOS_NAVBAR,
  tintColor: '#333',//GREEN,
  borderColor: '#e6e6e6',//IOS_NAVBAR_BORDER,
  opacity: 1,
  isLandscape: false,
}

var styles = StyleSheet.create({
  navSty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // justifyContent:'center',
    backgroundColor: GREEN,
    borderBottomWidth: 1,

  },
  titleText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
    color: 'white',
    flexShrink: 1
  },
  titleSuffixText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#888',
    marginLeft: 4
  }
});
