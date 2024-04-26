
'use strict';
import React, { Component } from 'react';
import {
  View, Text,
  Image, Platform, ScrollView, RefreshControl
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import List from '../List.js';
import AlarmRow from './AlarmRow.js';
import Section from '../Section.js';
import PagerBar from '../PagerBar.js';
import TouchFeedback from "../TouchFeedback";
import { isPhoneX } from '../../utils';
import { GREEN, LINE, LIST_BG } from "../../styles/color";
import Icon from '../Icon';
import { Icon as Icon2 } from '@ant-design/react-native';
let MarginTop = isPhoneX() ? 20 : 0;
if (Platform.OS === 'android') {
  MarginTop = 24;
}

export default class Alarm extends Component {
  constructor(props) {
    super(props);
  }
  _renderRow(rowData, sectionId, rowId) {
    // console.warn('rowData',rowData);
    let topLine = this._getTopLine();
    if (topLine > 0 && rowId === '0' && sectionId === '0') {
      return (
        <View style={{ paddingTop: topLine }}>
          <AlarmRow rowData={rowData} onRowClick={this.props.onRowClick} />
        </View>
      );
    }
    return (
      <AlarmRow rowData={rowData} onRowClick={this.props.onRowClick} />
    );
  }

  _renderSection(sectionData, sectionId, rowId) {
    if (true) return null;
    var sectionTitle = this.props.sectionData.get(sectionId);
    if (!sectionTitle) return null;
    return (
      <Section text={sectionTitle} />
    );
  }
  _getTabControl() {
    var array = ['未解除', '已解除'];
    let mb = Platform.OS === 'ios' ? 10 : 14;
    if (array.length > 1) {
      return (
        <View style={{
          marginTop: MarginTop,
          backgroundColor: 'transparent',
          paddingVertical: 0,
          height: Platform.OS === 'ios' ? 64 : 56,
          flexDirection: 'row',
          borderBottomColor: LINE,
          borderBottomWidth: 1
        }}>
          <View style={{ flex: 1 }} />
          <View style={{ width: 200, justifyContent: 'flex-end' }}>
            <PagerBar
              barStyle={{
                marginTop: -1,
                backgroundColor: 'white',
                borderBottomWidth: 0,
                borderColor: '#e6e6e6',
                alignItems: 'flex-end',
                height: 48,
              }}
              styleBarItem={{
                paddingHorizontal: 0,
                marginTop: 0,
                // marginBottom:10,
              }}
              styleBarLineItem={{
                marginHorizontal: 12,
                height: 3,
              }}
              styleBarItemText={{
                marginBottom: 4,
                color: '#333',
                fontSize: 17
              }}
              array={array}
              currentIndex={this.props.currentIndex}
              onClick={(index) => this.props.onIndexChanged(index)} />
          </View>
          <View style={{
            flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end',
            backgroundColor: 'white'
          }}>
            <TouchFeedback onPress={() => this.props.onFilterClick()}>
              <View style={{ paddingHorizontal: 16, backgroundColor: '#fff' }}>
                <Icon2 name="filter" size="sm" color={'#333'} style={{ marginBottom: mb, marginTop: 4 }} />
              </View>
            </TouchFeedback>
          </View>
        </View>
      )
    }
  }

  _getToolbar() {
    let toolbar = (
      <Toolbar title='故障报警'
        navIcon={'task'}
        numberOfCount={this.props.taskCount}
        actions={[{
          title: '筛选',
          icon: require('../../images/filter/filter.png'),
          show: 'always', showWithText: false
        }]}
        onIconClicked={() => {
          this.props.onTasksIconClick();
        }}
        onActionSelected={[this.props.onFilterClick]} />
    );
    return null;
  }

  _renderTip() {
    if (!this.props.hasFilter && this.props.currentIndex === 1) {
      return (
        <View style={{ flexDirection: 'row', backgroundColor: '#fef7e9', padding: 10, alignItems: 'center' }}>
          <View style={{ marginTop: Platform.OS === 'ios' ? 1.2 : 0 }}>
            <Icon type='icon_info_empty' size={13} color={'#fbb325'} />
          </View>
          <Text style={{ color: '#fbb325', fontSize: 12 }}>
            {' 仅显示1年内已解除报警，如需更多，请“筛选”相应时间段查看'}
          </Text>
        </View>
      );
    } else if (!this.props.hasFilter && this.props.currentIndex === 0 &&
      this.props.listData && this.props.listData.getRowCount() > 0) {
      // return <View style={{height:10,backgroundColor:LIST_BG}}/>
    }
  }

  _getTopLine() {
    if (!this.props.hasFilter && this.props.currentIndex === 0 &&
      this.props.listData && this.props.listData.getRowCount() > 0) {
      return 8;
    }
    return 0;
  }

  _renderEmptyView() {
    let emptyText = '';
    if (this.props.currentIndex === 0) {
      emptyText = '暂无未解除报警';
    } else {
      emptyText = '暂无已解除报警';
    }

    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flex: 1 }}
          removeClippedSubviews
          scrollEventThrottle={16}
          // 指定RefreshControl组件, 用于为ScrollView提供下拉刷新功能
          refreshControl={
            <RefreshControl
              refreshing={this.props.isFetching}
              onRefresh={this.props.onRefresh}
              tintColor={GREEN}
              title="加载中，请稍候..."
              colors={[GREEN]}
            />
          }
        >
          <View style={{ backgroundColor: '#fff', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, color: '#888' }}>{emptyText}</Text>
          </View>
        </ScrollView>
      </View>
    )
  }

  render() {
    let emptyText = '';
    if (this.props.currentIndex === 0) {
      emptyText = '暂无未解除报警';
    } else {
      emptyText = '暂无已解除报警';
    }
    if (this.props.hasFilter) {
      emptyText = '没有符合筛选条件的报警';
    }
    let showEmpty = (!this.props.hasFilter && this.props.listData && this.props.listData.getRowCount() === 0);

    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this._getTabControl()}
        {this._renderTip()}
        {showEmpty ? (this._renderEmptyView()) : <List
          needGotoTop={true}
          isFetching={this.props.isFetching}
          listData={this.props.listData}
          hasFilter={this.props.hasFilter}
          currentPage={this.props.currentPage}
          nextPage={this.props.nextPage}
          onRefresh={this.props.onRefresh}
          totalPage={this.props.totalPage}
          clearFilter={this.props.clearFilter}
          onFilterClick={this.props.onFilterClick}
          renderSeperator={(sid, rid) => {
            return <View style={{ height: 8 }} />
          }}
          renderRow={(rowData, sectionId, rowId) => this._renderRow(rowData, sectionId, rowId)}
          renderSectionHeader={(sectionData, sectionId) => this._renderSection(sectionData, sectionId)}
          emptyText={emptyText}
          filterEmptyText='没有符合筛选条件的报警'
        />}
      </View>

    );
  }
}

Alarm.propTypes = {
  user: PropTypes.object,
  currentPage: PropTypes.number,
  totalPage: PropTypes.number,
  hasFilter: PropTypes.bool.isRequired,
  onRowClick: PropTypes.func.isRequired,
  onFilterClick: PropTypes.func.isRequired,
  clearFilter: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  listData: PropTypes.object,
  sectionData: PropTypes.object,
  onRefresh: PropTypes.func.isRequired,
  nextPage: PropTypes.func.isRequired,
}
