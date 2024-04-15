'use strict'

import React, { Component } from 'react';

import { View, StyleSheet, Image, Platform, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import TouchFeedback from './TouchFeedback';
import Text from './Text';
// import Icon from './Icon.js';
import { TAB, TAB_BORDER, GREEN, TAB_TEXT } from '../styles/color';
import { isPhoneX } from '../utils';
import { localStr } from "../utils/Localizations/localization";
import Colors from "../utils/const/Colors";
const PADDING_BOTTOM = Platform.select(
  {
    ios: isPhoneX() ? 34 : 0,
    android: 0,
  }
);

export default class TabBar extends Component {
  constructor(props) {
    super(props);
  }
  _getNewVersionIcon(text) {
    if (text === '我的' && this.props.needUpdate) {
      return (
        <View style={{
          backgroundColor: 'red', width: 10, height: 10, borderRadius: 20,
          position: 'absolute', right: -8, top: 7,
        }}>
        </View>
      );
    }
    if (text === '报警' && this.props.continUnresolvedAlarm) {
      return (
        <View style={{
          backgroundColor: 'red', width: 10, height: 10, borderRadius: 20,
          position: 'absolute', right: -8, top: 7,
        }}>
        </View>
      );
    }
    return null;
  }

  _getNotifyUnread(type) {
    if (type === 'alarm' && this.props.unReadAlarmCount) {
      return (
        <View style={{
          backgroundColor: '#ff4d4d', height: 16, borderRadius: 8, alignItems: 'center',
          position: 'absolute', right: -10, top: 8, paddingHorizontal: 6, justifyContent: 'center',
        }}>
          <Text style={{ fontSize: 10, color: '#fff', marginBottom: 2 }}>{this.props.unReadAlarmCount}</Text>
        </View>
      );
    }
  }
  _getIconAndTextWith(image, item, selectedColor) {
    var itemText = (
      <Text style={[styles.tabText, { color: selectedColor }]}>{item.text}</Text>
    );
    let imgSize = 24;
    if (!item.text) {
      itemText = null;
      imgSize = 48;
      return (
        <View style={{ marginTop: -20, width: imgSize }}>

        </View>
      )
    }
    return (
      <View style={styles.tabText}>
        <Image
          source={image}
          style={{ width: imgSize, height: imgSize, tintColor: selectedColor }} />
        {itemText}
      </View>
    );
  }
  render() {
    var items = [];
    this.props.arrTabConfig.forEach((item) => {
      if (item.type === 'assetManager') {
        items.push(
          {
            text: localStr('lang_tabbar_asset'),
            normal: require('../images/tab/tab_icon1_nor.png'),
            selected: require('../images/tab/tab_icon1_sel.png')
          }
        )
      } else if (item.type === 'ticket') {
        items.push(
          {
            text: localStr('lang_tabbar_ticket'),
            normal: require('../images/tab/tab_icon2_nor.png'),
            selected: require('../images/tab/tab_icon2_sel.png')
          }
        )
      } else if (item.type === 'alarm') {
        items.push(
          {
            text: localStr('lang_tabbar_alarm'),
            type: 'alarm',
            normal: require('../images/tab/tab_icon3_nor.png'),
            selected: require('../images/tab/tab_icon3_sel.png')
          }
        )
      } else if (item.type === 'profile') {
        items.push(
          {
            text: localStr('lang_tabbar_profile'),
            normal: require('../images/tab/tab_icon4_nor.png'),
            selected: require('../images/tab/tab_icon4_sel.png'),
          }
        )
      }
      // else if (item.type==='ticket') {
      //   items.push(
      //       {text:'工单',
      //         normal:require('../images/tab_tickets_normal/tickets_normal.png'),
      //         selected:require('../images/tab_tickets_selected/tickets_selected.png'),}
      //   )
      // }

    })
    var content = items.map((item, key) => {
      var selectedColor = TAB_TEXT, image = item.normal;
      if (key === this.props.selectedIndex) {
        selectedColor = GREEN;
        image = item.selected;
      }
      return (
        <TouchFeedback style={styles.tab} key={key} onPress={() => this.props.onSelectedChanged(key)}>
          <View style={[styles.tab, { flexDirection: 'column' }]}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {
                this._getNewVersionIcon(item.text)
              }
              {
                this._getIconAndTextWith(image, item, selectedColor)
              }
              {
                this._getNotifyUnread(item.type)
              }
            </View>
          </View>
        </TouchFeedback>
      );
    })

    return (
      <View style={{ marginTop: 0 }}>
        <View style={styles.bottom}>
          {content}
        </View>
      </View>
    );
  }
}

TabBar.propTypes = {
  selectedIndex: PropTypes.number,
  onSelectedChanged: PropTypes.func.isRequired,
  needUpdate: PropTypes.bool,
  continUnresolvedAlarm: PropTypes.bool,
  arrTabConfig: PropTypes.array,
};

TabBar.defaultProps = {
  selectedIndex: 0,
};

const styles = global.amStyleProxy(() => StyleSheet.create({
  bottom: {
    backgroundColor: Colors.seBgContainer,
    height: 56 + PADDING_BOTTOM,
    borderTopWidth: 1,
    borderColor: Colors.seBorderSplit,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: PADDING_BOTTOM,
    // marginTop:24
    // alignItems:'center'
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor:'red'
  },
  tabText: {
    color: Colors.seTextPrimary,
    fontSize: 10,
    marginTop: 4,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}));
