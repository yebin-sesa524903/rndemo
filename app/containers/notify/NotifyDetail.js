
'use strict';
import React, { Component } from 'react';

import {
  InteractionManager,
  // Alert,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import AlarmDetailView from '../../components/alarm/AlarmDetail';
import TicketDetail from '../ticket/TicketDetail.js';
import CreateTicket from '../ticket/CreateTicket.js';
import Device from '../assets/Device.js';
import Circuit from '../assets/Circuit.js';
import Room from '../assets/Room.js';
import Immutable from 'immutable';
import { loadAlarmById, resetAlarm } from '../../actions/alarmAction.js';
import trackApi from '../../utils/trackApi.js';
import moment from 'moment';
import Toast from 'react-native-root-toast';
import Floor from "../assets/Floor";
import Panel from "../assets/Panel";
import SwitchBox from "../assets/SwitchBox";

class AlarmDetail extends Component {
  constructor(props) {
    super(props);
    // console.warn('props',this.props.rowData);
  }
  _onPostingCallback(type) {
    console.warn('AlarmDetail _onPostingCallback', type);
    this.props.onPostingCallback();
    if (type === 'create' || type === 'finish') {
      InteractionManager.runAfterInteractions(() => {
        this.props.navigation.pop();
      });
    }
    this._loadAlarm(this.props.alarmId, this.props.fromHex);
  }
  _createOrEditTicket(rowData) {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_create',
      component: CreateTicket,
      passProps: {
        customer: Immutable.fromJS({
          'CustomerId': this.props.customerId,
          'CustomerName': this.props.customerName,
        }),
        alarm: rowData,
        ticketInfo: null,
        onPostingCallback: (type) => this._onPostingCallback(type),
      }
    });

  }
  _gotoAsset(rowData) {
    var asset = rowData.get('AlarmHierarchy');
    var type = asset.get('Type');
    var subType = asset.get('SubType');
    // if (subType===8||subType===70) {
    //   Toast.show('暂不支持查看此类资产详情',{
    //     duration:1500
    //   });
    //   return;
    // }
    var container = Room;
    var _traceType = '配电室';
    if (type === 3) {
      container = Room;
      _traceType = '配电室';
      if (subType === 8) {
        container = Floor;
        _traceType = '楼层';
      }
    } else if (type === 4) {
      container = Panel;
      _traceType = '配电柜';
      if (subType === 70) {
        container = SwitchBox;
        _traceType = '配电箱';
      }
    }
    else if (type === 5) {
      container = Device;
      _traceType = '设备';
    } else if (type === 200) {
      container = Circuit;
      _traceType = '回路';
    }
    var customer = rowData.get('Customer');
    var customer_id = (customer && customer.get('Id')) || '';
    var customer_name = (customer && customer.get('Name')) || '';
    var building_id = String(asset.get('BuildingId') || '');
    var building_name = String(asset.get('BuildName') || '');

    // let path=['','',''];
    // if(rowData.get('Paths')&&rowData.get('Paths').size>0){
    //   let tmp=rowData.get('Paths').get(0).split('-');
    //   if(tmp&&tmp.length>0){
    //     let i=0;
    //     for(i=0;i<tmp.length;i++){
    //       if(i<=2){
    //         path[i]=tmp[i];
    //       }
    //     }
    //   }
    // }

    this.props.navigation.push('PageWarpper', {
      id: 'asset_detail',
      from: 'alarm',
      component: container,
      passProps: {
        ownData: asset,
        CustomerId: String(customer_id || ''),
        CustomerName: customer_name,
        BuildingName: building_name,
        BuildingId: building_id,
      }
    });
    trackApi.onTrackEvent('App_ViewAssetDetail', {
      from: '报警详情',
      asset_type: _traceType,
      customer_id: String(customer_id || ''),
      customer_name: customer_name,
      building_name: building_name,
      building_id: building_id,
      // switching_room_name:path[1],
      // distribution_box_name:path[2],
      // equipment_name:rowData.get('DeviceName')
    });
  }
  _gotoTicket() {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_detail',
      component: TicketDetail,
      passProps: {
        ticketId: String(this.props.rowData.get('TicketId')),
        fromAlarm: true,
        onPostingCallback: (type) => { this._onPostingCallback(type) },
      }
    });
  }
  _loadAlarm(alarmId, isHex) {
    this.props.loadAlarmById(alarmId, isHex);
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.rowData) {
        this._loadAlarm(this.props.alarmId, this.props.fromHex);
      }
    });
  }
  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    this.props.resetAlarm();

  }

  _traceAlarmDetail() {
    if (this.props.rowData && !this._trace) {
      this._trace = true;
      let rowData = this.props.rowData;
      trackApi.onTrackEvent('App_ViewAlarmDetail', {
        issue_grade: ['', '低级', '中级', '高级'][rowData.get('Level')],
        issue_status: rowData.get('SecureTime') ? '已解除' : '未解除',
        // equipment_name:rowData.get('DeviceName'),
        // issue:rowData.get('Parameter'),
        // actual_value:rowData.get('ActualValue'),
        // set_value:rowData.get('ThresholdValue'),
        start_time: moment(rowData.get('AlarmTime')).format('YYYY-MM-DD'),
        position: rowData.get('Paths').reverse().join('\n'),
        customer_name: this.props.customerName,
        customer_id: String(this.props.customerId || ''),
        // issue_logfile_count:rowData.get('Status').size
      })
    }
  }

  render() {
    this._traceAlarmDetail();
    return (
      <AlarmDetailView
        isFetching={this.props.isFetching}
        rowData={this.props.rowData}
        customerName={this.props.customerName}
        viewTicket={() => this._gotoTicket()}
        onAssetClick={(rowData) => this._gotoAsset(rowData)}
        onBack={() => {
          var arrRoutes = this.props.navigator.getCurrentRoutes();
          var currCount = 0;
          arrRoutes.forEach((item) => {
            if (item.id === 'alarm_detail') {
              currCount++;
            }
          });
          if (currCount > 1) {
            this.props.navigation.popToTop();
          } else {
            this.props.navigation.pop();
          }
        }}
        createOrEditTicket={(rowData) => this._createOrEditTicket(rowData)} />
    );
  }
}

AlarmDetail.propTypes = {
  navigator: PropTypes.object,
  isFetching: PropTypes.bool,
  route: PropTypes.object,
  alarmId: PropTypes.string,
  loadAlarmById: PropTypes.func,
  resetAlarm: PropTypes.func,
  user: PropTypes.object,
  rowData: PropTypes.object,//immutable
  onPostingCallback: PropTypes.func,
  customerId: PropTypes.number,
  customerName: PropTypes.string,
  fromHex: PropTypes.bool,
}


function mapStateToProps(state, ownProps) {
  // var id = ownProps.alarmId;
  var rowData = null;
  var isFetching = false;
  var customerId = 0;
  var customerName = '';
  var alarm = state.alarm.alarm.get('data');
  var alarmFirstId = state.alarm.alarm.get('alarmFirstId');
  if (alarm) {
    // console.warn('mapStateToProps...',ownProps.alarmId,alarmFirstId);
    customerId = alarm.getIn(['Customer', 'Id']);
    customerName = alarm.getIn(['Customer', 'Name']);
    if (ownProps.alarmId === String(alarmFirstId)) {
      rowData = alarm;
    }
  }
  isFetching = state.alarm.alarm.get('isFetching');
  return {
    user: state.user.get('user'),
    rowData,
    isFetching,
    customerId,
    customerName
  };
}

export default connect(mapStateToProps, { loadAlarmById, resetAlarm })(AlarmDetail);
