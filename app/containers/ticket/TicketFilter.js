
'use strict';
import React, { Component } from 'react';

import {
  InteractionManager,
  Alert, DeviceEventEmitter,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import {
  filterChanged, filterClosed, resetFilterData, getCustomer,
  filterDidChanged, loadTicketBuildings, filterReadyToSearch
} from '../../actions/ticketAction';
import TicketFilterView from '../../components/ticket/TicketFilter';
import TicketFilterResult from './TicketFilterResult';

import { Keyboard } from 'react-native';
import trackApi from '../../utils/trackApi.js';

class TicketFilter extends Component {
  constructor(props) {
    super(props);

  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    // InteractionManager.runAfterInteractions(()=>{
    //   this.props.loadTicketBuildings();
    // });
    // backHelper.init(this.props.navigator,this.props.route.id);

    //注册抽屉开关监听器
    this._drawerListener = DeviceEventEmitter.addListener('ticketFilterOpen', (isOpen) => {
      if (isOpen) {
        //服务报告不需要查询
        if (this.props.isService) {
          this.props.getCustomer();
        } else {
          this.props.loadTicketBuildings();
        }
      } else {
      }
    });
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    //去掉监听
    this._drawerListener.remove();
    // backHelper.destroy(this.props.route.id);
  }
  _checkTimeIsTrue() {
    var StartTime = this.props.selectDatas.get('ticketStartTime');
    var EndTime = this.props.selectDatas.get('ticketEndTime');
    console.warn(StartTime, (typeof StartTime), EndTime, (typeof EndTime));
    if (StartTime > EndTime) {
      Alert.alert(
        '',
        '开始时间不能晚于结束时间',
        [
          { text: '好', onPress: () => console.log('Cancel Pressed') }
        ]
      )
      return false;
    }
    return true;
  }
  render() {
    return (
      <TicketFilterView
        selectDatas={this.props.selectDatas}
        isFetching={this.props.isFetching}
        arrBuildsName={this.props.arrBuildsName}
        buildings={this.props.buildings}
        ticketTypes={this.props.ticketTypes}
        ticketStatus={this.props.ticketStatus}
        isService={this.props.isService}
        customers={this.props.customers}
        customerFetching={this.props.customerFetching}
        onClose={() => {
          this.props.navigation.pop()
        }}
        doFilter={() => {
          Keyboard.dismiss();
          if (!this._checkTimeIsTrue()) {
            return;
          }
          trackApi.onTrackEvent('App_LogbookTicket', {
            ticket_operation: ['开始执行', '忽略任务项', '添加日志', '筛选', '提交审批', '自定义编辑'][3]
          })
          this.props.filterReadyToSearch();
          this.props.close();
          // this.props.navigation.push('PageWarpper',{id:'ticket_filter_result',component:TicketFilterResult,
          //     passProps:{traceData:this._getTraceData()}});
        }}
        doReset={() => {
          this.props.resetFilterData();
        }}
        filterChanged={(type, value) => this.props.filterChanged({ type, value })} />
    );
  }

  _getTraceData() {
    let { ticketStartTime, ticketEndTime, ticketStrId, ticketStatus, ticketTypes, selectBuilds }
      = this.props.selectDatas.toJS();
    if (ticketStatus && ticketStatus.length > 0) {
      for (let i = 0; i < ticketStatus.length; i++) {
        ticketStatus[i] = ['待接单', '未开始', '执行中', '已提交', '已完成', '逾期'][ticketStatus[i]];
      }
    }
    if (ticketTypes && ticketTypes.length > 0) {
      for (let i = 0; i < ticketTypes.length; i++) {
        ticketTypes[i] = ['', '计划工单', '报警工单', '随工工单', '现场工单', '方案工单', '巡检工单', '抢修工单'][ticketTypes[i]];
      }
    }
    if (selectBuilds && selectBuilds.length > 0) {
      for (let i = 0; i < selectBuilds.length; i++) {
        selectBuilds[i] = this.props.arrBuildsName[selectBuilds[i]];
      }
    }
    return {
      start_date: ticketStartTime,
      end_date: ticketEndTime,
      workorder_id: ticketStrId,
      workorder_status_list: ticketStatus,
      workorder_type_list: ticketTypes,
      building_list: selectBuilds
    };
  }
}


TicketFilter.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  rawCodes: PropTypes.object,
  selectDatas: PropTypes.object,
  isFetching: PropTypes.bool,
  codes: PropTypes.object,
  arrBuildsName: PropTypes.array,
  doFilter: PropTypes.func,
  filterChanged: PropTypes.func,
  filterClosed: PropTypes.func,
  loadTicketBuildings: PropTypes.func,
  filterDidChanged: PropTypes.func,
  resetFilterData: PropTypes.func,
  filterReadyToSearch: PropTypes.func,
  buildings: PropTypes.any,
}

function mapStateToProps(state) {
  let ticketFilter = state.ticket.ticketFilter;
  let selectDatas = ticketFilter.get('selectDatas');
  let buils = ticketFilter.get('arrBuildsName');
  let customers = state.ticket.customers;
  return {
    selectDatas, isService: ticketFilter.get('isService'), customers, customerFetching: customers.get('isFetching'),
    isFetching: ticketFilter.get('isFetching'),
    arrBuildsName: buils.toArray(),
    buildings: ticketFilter.get('buildingsData'),
    ticketTypes: selectDatas.get('ticketTypes'),
    ticketStatus: selectDatas.get('ticketStatus')
  };
}

export default connect(mapStateToProps, {
  filterChanged, filterClosed, filterDidChanged, resetFilterData, loadTicketBuildings, filterReadyToSearch,
  getCustomer
})(TicketFilter);
