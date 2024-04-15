
'use strict';
import React, { Component } from 'react';
import { Modal } from 'react-native';
import {
  InteractionManager,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import {
  filterChanged, filterClosed,
  filterDidChanged, loadAlarmCode, loadAlarmBuildings, clearBuildingsData,
  alarmBuldingFolder, resetCurrentAlarmFilterParam, clearFilterResult
} from '../../actions/alarmAction';
import AlarmFilterView from '../../components/alarm/AlarmFilter';
import trackApi from '../../utils/trackApi.js';
import Toast from 'react-native-root-toast';

class AlarmFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    //注册抽屉开关监听器
    this._drawerListener = DeviceEventEmitter.addListener('alarmFilterOpen', (isOpen) => {
      if (isOpen) {
        this.props.loadAlarmCode();
        this.props.loadAlarmBuildings();
      } else {
        this.props.filterClosed();
        this.props.clearBuildingsData();
      }
    });
    trackApi.onPageBegin(this.props.route.id);
    // InteractionManager.runAfterInteractions(()=>{
    //   this.props.loadAlarmCode();
    //   this.props.loadAlarmBuildings();
    // });
    // backHelper.init(this.props.navigator,this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    // backHelper.destroy(this.props.route.id);
    // this.props.clearBuildingsData();
    // this.props.clearFilterResult();

    //去掉监听
    this._drawerListener.remove();
  }
  _checkTimeIsTrue() {
    var StartTime = this.props.filter.get('StartTime');
    var EndTime = this.props.filter.get('EndTime');
    if (StartTime > EndTime) {
      // Alert.alert(
      //   '',
      //   '开始时间不能晚于结束时间',
      //   [
      //     {text: '好', onPress: () => console.log('Cancel Pressed')}
      //   ]
      // )
      Toast.show('结束时间不能早于开始时间');
      return false;
    }
    return true;
  }
  render() {
    return (
      <AlarmFilterView
        filter={this.props.filter}
        closeTime={this.state.closeTime}
        isFetching={this.props.isFetching}
        codes={this.props.codes.toArray()}
        rawCodes={this.props.rawCodes}
        buildings={this.props.buildings}
        buildingFolder={
          cid => this.props.alarmBuldingFolder(cid)
        }
        onClose={() => {
          this.props.filterClosed();
          // this.props.navigation.pop();
          this.props.close();
        }
        }
        doFilter={() => {
          if (!this._checkTimeIsTrue()) {
            return;
          }
          this.props.filterDidChanged(this.props.filter);
          // this.props.navigation.pop();
          DeviceEventEmitter.emit('hideDrawer');
        }}
        doReset={() => {
          this.props.resetCurrentAlarmFilterParam();
        }}
        filterChanged={(type, value) => this.props.filterChanged({ type, value })} />
    );
  }
}

AlarmFilter.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  rawCodes: PropTypes.object,
  filter: PropTypes.object,
  isFetching: PropTypes.bool,
  codes: PropTypes.object,
  buildings: PropTypes.any,
  doFilter: PropTypes.func,
  filterChanged: PropTypes.func,
  filterClosed: PropTypes.func,
  clearBuildingsData: PropTypes.func,
  resetCurrentAlarmFilterParam: PropTypes.func,
  loadAlarmCode: PropTypes.func,
  loadAlarmBuildings: PropTypes.func,
  filterDidChanged: PropTypes.func,
}

function mapStateToProps(state) {
  var alarmFilter = state.alarm.alarmFilter;
  var filter = alarmFilter.get('temp');
  return {
    filter,
    rawCodes: alarmFilter.get('codes'),
    isFetching: alarmFilter.get('isFetching'),
    codes: alarmFilter.get('filterCodes'),
    buildings: alarmFilter.get('buildingsData'),
  };
}

export default connect(mapStateToProps, {
  filterChanged, filterDidChanged, loadAlarmCode, clearBuildingsData, resetCurrentAlarmFilterParam, loadAlarmBuildings,
  alarmBuldingFolder, filterClosed, clearFilterResult
})(AlarmFilter);
