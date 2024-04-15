
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
  DeviceEventEmitter, Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import { Navigator } from 'react-native-deprecated-custom-components';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { loadNotify, filterDidChanged, firstPage, nextPage, updateUnReadNotify } from '../../actions/notifyAction';
import NotifyView from '../../components/notify/NotifyView';
// import NotifyDetail from './NotifyDetail';
import notificationHelper from '../../utils/notificationHelper.js';
import Immutable from 'immutable';
import trackApi from '../../utils/trackApi.js';
import moment from 'moment';
import JobBill from "../monition/JobBill";
import TicketDetail from "../ticket/TicketDetail";
import DeviceInfo from "react-native-device-info";
import CommandBill from "../monition/CommandBill";

class Notify extends Component {
  constructor(props) {
    super(props);
    this._traceDoOperate = false;
    // if (!this.props.hasFilter) {
    //   this.ds = new ListView.DataSource({
    //     rowHasChanged: (r1, r2) => r1 !== r2,
    //     // sectionHeaderHasChanged:(r1, r2) => r1 !== r2,
    //   });
    //   var data = props.alarm.get('data');
    //   if (data) {
    //     var obj = data.map((item)=>item.toArray()).toArray();
    //     this.state = { dataSource:this.ds.cloneWithRows(obj),currentIndex:props.alarm.get('currentIndex')};
    //   }else {
    //     this.state = { dataSource:null,currentIndex:props.alarm.get('currentIndex')};
    //   }
    // }else {
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    var data = props.notify.get('data');
    if (data) {
      data = data.toArray();
      this.state = { dataSource: this.ds.cloneWithRows(data), currentIndex: props.notify.get('currentIndex') };
    } else {
      this.state = { dataSource: null, currentIndex: props.notify.get('currentIndex') };
    }
    // }
  }
  _loadNotifys(tFilter) {
    var filter = tFilter.toJSON();
    filter.hierarchyId = 0;
    filter.typeId = 2;//"typeId"：类型 1三票 2异常工单 3 所有
    if (Platform.OS === 'android' && DeviceInfo.isTablet()) {
      if (!this._checkSubstation()) return;
      filter.typeId = 3;
      filter.hierarchyId = this.props.substation.id;
    }
    this.props.loadNotify(filter);
  }
  _onPostingCallback(type) {
    // InteractionManager.runAfterInteractions(() => {
    this._refreshOnFocus = true;
    // });
  }
  _gotoDetail(rowData) {
    //if(!this._checkSubstation()) return;
    let cmp = null;
    let id = null;
    switch (rowData.get('messageType')) {
      case 10:
      case 11:
      case 12:
      case 13:
        cmp = JobBill;
        break;
      case 14:
      case 15:
        cmp = CommandBill;
        break;
      case 20:
        cmp = TicketDetail;
        break;
      default:
        break;

    }
    this.props.updateUnReadNotify({
      "id": rowData.get('id'),
      "unread": false
    })
    this.props.navigation.push('PageWarpper', {
      id: 'notify_jobbill',
      component: cmp,
      passProps: {
        billId: rowData.get('objectId'),
        ticketId: String(rowData.get('objectId')),
        onPostingCallback: (type) => { },
      }
    });
  }
  _onRefresh() {
    // this._loadNotifys(this.props.filter);
    if (this.props.filter.get('pageIndex') === 1) {
      this._loadNotifys(this.props.filter);
    } else {
      this.props.firstPage();
    }
  }
  _bindEvent() {
    var navigator = this.props.navigator;
    // console.warn('navigator',navigator);
    if (navigator) {
      var callback = (event) => {
        if (!event.data.route || !event.data.route.id || (event.data.route.id === 'main')) {
          if (this._refreshOnFocus) {
            this._onRefresh();
            this._refreshOnFocus = false;
          }
        }
      };
      // Observe focus change events from the owner.
      this._listener = navigator.navigationContext.addListener('didfocus', callback);
    }
  }
  componentDidMount() {
    trackApi.onPageBegin('fault_list');
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.notify.get('data')) {
        this._loadNotifys(this.props.filter);
      }

    });
    // setInterval(()=>this._onRefresh(),10000);
    this._bindEvent();
    this.resetOperatorListener = DeviceEventEmitter.addListener('resetAlarmOperator', () => {
      this._resetOperator();
    });
    this._notifyRefreshListener = DeviceEventEmitter.addListener('notifyRefresh', () => {
      this._onRefresh()
    });
    // backHelper.init(this.props.navigator,'alarm');
  }
  componentWillReceiveProps(nextProps) {
    var data = nextProps.notify.get('data');
    var origData = this.props.notify.get('data');

    if ((data !== origData) && data) {// && data.size >= 1){
      this.ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2,
      });
      if (data && data.size > 0) {
        // var obj = data.map((item)=>item;
        InteractionManager.runAfterInteractions(() => {
          this.setState({ dataSource: this.ds.cloneWithRows(data.toArray()) });
        });
      } else {
        this.setState({ dataSource: this.ds.cloneWithRows([]) });
      }
    }

    if (this.props.filter !== nextProps.filter) {
      //this is a hack for following senario
      //when back from filter page
      //sometimes list is empty
      //but when _loadNotifys included in runAfterInteractions it is fixed
      // InteractionManager.runAfterInteractions(()=>{
      //   setTimeout(()=>{
      //     this._loadNotifys(nextProps.filter);
      //   },100);
      // });

      //如果刚好是页码增加1，说明是在当前基础上请求下一页,不情况数据
      let ds = { dataSource: null };
      if (nextProps.filter.get('pageIndex') === this.props.filter.get('pageIndex') + 1) {
        ds = {};
      }
      this.setState(ds, () => {
        InteractionManager.runAfterInteractions(() => {
          // this.props.clearFilterResult();
          setTimeout(() => {
            this._loadNotifys(nextProps.filter);
          }, 100);

        });

      });
    }
    if (nextProps.substation !== this.props.substation) {
      setTimeout(() => {
        this._onRefresh()
      })
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd('fault_list');
    // backHelper.destroy('alarm');
    notificationHelper.resetData('alarm');
    notificationHelper.unregister('alarm');
    this.resetOperatorListener.remove();
    this._notifyRefreshListener && this._notifyRefreshListener.remove();
  }

  _trace(nextProps) {
    if (this._traceIndex !== this.state.currentIndex) {
      this._traceIndex = this.state.currentIndex;
      trackApi.onTrackEvent('App_ViewTab', {
        module_name: '报警',
        tab_name: ['未解除', '已解除'][this._traceIndex]
      })
    }
  }

  _checkSubstation() {
    if (!this.props.substation) {
      DeviceEventEmitter.emit('substation', true)
      return false;
    }
    return true
  }

  //记录操作
  _traceOperate(op = '点击条目') {
    if (!this._traceDoOperate) {
      this._traceDoOperate = true;
      trackApi.onTrackEvent('App_ModuleOperation', {
        operation: op,
        module_name: '报警'
      });
    }
  }

  _resetOperator() {
    this._traceDoOperate = false;
  }

  render() {
    return (
      <NotifyView
        loadNotify={() => this._loadNotify()}
        isFetching={this.props.notify.get('isFetching')}
        listData={this.state.dataSource}
        hasFilter={this.props.hasFilter}
        nextPage={() => {
          this._traceOperate('加载更多');
          this.props.nextPage();
        }}
        clearFilter={() => {
          this._traceOperate('点击筛选');
          this.props.clearFilterResult();
        }}
        currentPage={this.props.filter.get('pageIndex')}
        onRefresh={() => {
          this._traceOperate('下拉刷新');
          this._onRefresh();
        }}
        currentIndex={this.state.currentIndex}
        totalPage={this.props.notify.get('pageCount')}
        onRowClick={(rowData) => {
          this._traceOperate();
          this._gotoDetail(rowData);
        }} />
    );
  }
}

Notify.propTypes = {
  navigator: PropTypes.object,
  notify: PropTypes.object,
  filter: PropTypes.object,
  hasFilter: PropTypes.bool,
  loadNotify: PropTypes.func,
  firstPage: PropTypes.func,
  nextPage: PropTypes.func,
  clearFilterResult: PropTypes.func,
  filterDidChanged: PropTypes.func,
}


function mapStateToProps(state) {
  var notifyFilter = state.notify.notifyFilter;
  return {
    notify: state.notify.notifyList,
    hasFilter: notifyFilter.get('hasFilter'),
    filter: notifyFilter.get('stable'),
    trace: notifyFilter.get('trace'),
    substation: state.user.get('substation'),
    isFetching: state.notify.notifyList.get('isFetching')
  };
}

export default connect(mapStateToProps, { loadNotify, firstPage, nextPage, updateUnReadNotify })(Notify);
