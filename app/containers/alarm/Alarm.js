
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';

import { loadAlarm, filterDidChanged, firstPage, nextPage, clearFilterResult, alarmChangeTab } from '../../actions/alarmAction';
import AlarmView from '../../components/alarm/AlarmView';
import AlarmFilter from './AlarmFilter';
import AlarmDetail from './AlarmDetail';
import notificationHelper from '../../utils/notificationHelper.js';
import Immutable from 'immutable';
import moment from 'moment';

class Alarm extends Component {
  constructor(props) {
    super(props);
    this._traceDoOperate = false
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    var data = props.alarm.get('data');
    if (data) {
      data = data.toArray();
      this.state = { dataSource: this.ds.cloneWithRows(data), currentIndex: props.alarm.get('currentIndex') };
    } else {
      this.state = { dataSource: null, currentIndex: props.alarm.get('currentIndex') };
    }
    // }
  }
  _loadAlarms(tFilter) {
    var filter = tFilter.toJSON();
    console.warn('filter', filter);
    filter.BeginTime = filter.StartTime;
    filter.IsSecure = this.state.currentIndex === 1;
    //如果没有筛选，并且是已解除分类，则查询近一年的数据
    if (filter.IsSecure && !this.props.hasFilter) {
      //设置一个默认的查询近一年的数据
      let today = moment();
      let year = moment(today.format('YYYY-MM-DD'))
        .add('day', 1).subtract('millisecond', 1).format('YYYY-MM-DD HH:mm:ss');
      let lastYear = moment(today).subtract(1, 'Y').format('YYYY-MM-DD');
      filter.BeginTime = lastYear;
      filter.EndTime = year;
    }
    if (this.props.hasFilter) {
      //如果有过滤条件，需要处理结束时间
      if (filter.EndTime) {
        filter.EndTime = moment(filter.EndTime)
          .add('day', 1).subtract('millisecond', 1).format('YYYY-MM-DD HH:mm:ss');
      }
    }
    // console.warn('filterdddd',filter);
    this.props.loadAlarm(filter);
  }
  _onPostingCallback(type) {
    // InteractionManager.runAfterInteractions(() => {
    this._refreshOnFocus = true;
    // });
  }
  _onIndexChanged(index) {
    this.props.alarmChangeTab(index);
    this.setState({ currentIndex: index, dataSource: null }, () => {
      InteractionManager.runAfterInteractions(() => {
        this.props.clearFilterResult();
      });

    });
  }
  _filterClick() {
    DeviceEventEmitter.emit('showDrawer');
  }
  _gotoDetail(alarmId, fromHex) {
    this.props.navigation.push('PageWarpper', {
      id: 'alarm_detail',
      component: AlarmDetail,
      barStyle: 'light-content',
      passProps: {
        alarmId: alarmId,
        onPostingCallback: (type) => { this._onPostingCallback(type) },
        fromHex
      }
    });
  }
  _onRefresh() {
    // this._loadAlarms(this.props.filter);
    if (this.props.filter.get('CurrentPage') === 1) {
      this._loadAlarms(this.props.filter);
    } else {
      this.props.firstPage();
    }
  }
  _checkPushNotification() {
    var alarmId = notificationHelper.getData('alarm');
    if (alarmId) {
      this._gotoDetail(alarmId, true);
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
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.alarm.get('data')) {
        this._loadAlarms(this.props.filter);
      }
      notificationHelper.register('alarm', () => this._checkPushNotification());

    });
    // setInterval(()=>this._onRefresh(),10000);
    this._bindEvent();
    this.resetOperatorListener = DeviceEventEmitter.addListener('resetAlarmOperator', () => {
      this._resetOperator();
    });
    // backHelper.init(this.props.navigator,'alarm');
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.hasFilter) {
      var data = nextProps.alarm.get('allDatas');
      var origData = this.props.alarm.get('allDatas');

      if ((data !== origData) && data) {// && data.size >= 1){
        this.ds = new ListView.DataSource({
          rowHasChanged: (r1, r2) => r1 !== r2,
          sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
        });
        if (data && data.size > 0) {
          var obj = data.map((item) => item.toArray()).toArray();
          // console.warn('componentWillReceiveProps...',obj);
          // InteractionManager.runAfterInteractions(()=>{
          this.setState({ dataSource: this.ds.cloneWithRowsAndSections(obj) });
          // this.setState({dataSource:this.ds.cloneWithRows(obj)});
          // });
        } else {
          this.setState({ dataSource: this.ds.cloneWithRowsAndSections([]) });
          // this.setState({dataSource:this.ds.cloneWithRows([])});
        }
      }
    } else {
      var data = nextProps.alarm.get('data');
      var oldData = this.props.alarm.get('data');
      if (data !== oldData) {
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        // console.warn('setdata');
        // InteractionManager.runAfterInteractions(()=>{
        let tmpDs = data ? this.ds.cloneWithRows(data.toArray()) : this.ds.cloneWithRows([]);
        this.setState({ dataSource: tmpDs });
        // });
      } else if (this.state.dataSource == null) {
        this.setState({ dataSource: this.ds.cloneWithRows([]) })
      }
    }

    if (this.props.filter !== nextProps.filter) {
      //如果刚好是页码增加1，说明是在当前基础上请求下一页,不情况数据
      let ds = { dataSource: null };
      if (nextProps.filter.get('CurrentPage') === this.props.filter.get('CurrentPage') + 1) {
        ds = {};
      }
      this.setState(ds, () => {
        InteractionManager.runAfterInteractions(() => {
          // this.props.clearFilterResult();
          setTimeout(() => {
            this._loadAlarms(nextProps.filter);
          }, 100);

        });

      });
    }
  }

  componentWillUnmount() {
    // backHelper.destroy('alarm');
    notificationHelper.resetData('alarm');
    notificationHelper.unregister('alarm');
    this.resetOperatorListener.remove();
  }



  _resetOperator() {
    this._traceDoOperate = false;
  }

  render() {
    return (
      <AlarmView
        loadAlarm={() => this._loadAlarm()}
        isFetching={this.props.alarm.get('isFetching')}
        listData={this.state.dataSource}
        sectionData={this.props.alarm.get('sectionData')}
        hasFilter={this.props.hasFilter}
        nextPage={() => {
          this.props.nextPage();
        }}
        clearFilter={() => {
          this.props.clearFilterResult();
        }}
        currentPage={this.props.filter.get('CurrentPage')}
        onRefresh={() => {
          this._onRefresh();
        }}
        currentIndex={this.state.currentIndex}
        onIndexChanged={(index) => {
          this._onIndexChanged(index);
        }}
        totalPage={this.props.alarm.get('pageCount')}
        onFilterClick={() => {
          this._filterClick();
        }}
        onRowClick={(rowData) => {
          this._gotoDetail(String(rowData.get('Id')), false);
        }} />
    );
  }
}

Alarm.propTypes = {
  navigator: PropTypes.object,
  alarm: PropTypes.object,
  filter: PropTypes.object,
  hasFilter: PropTypes.bool,
  loadAlarm: PropTypes.func,
  firstPage: PropTypes.func,
  nextPage: PropTypes.func,
  clearFilterResult: PropTypes.func,
  filterDidChanged: PropTypes.func,
}


function mapStateToProps(state) {
  var alarmFilter = state.alarm.alarmFilter;
  return {
    alarm: state.alarm.alarmList,
    hasFilter: alarmFilter.get('hasFilter'),
    filter: alarmFilter.get('stable'),
    trace: alarmFilter.get('trace'),
    isFetching: state.alarm.alarmList.get('isFetching')
  };
}

export default connect(mapStateToProps, { loadAlarm, alarmChangeTab, filterDidChanged, firstPage, nextPage, clearFilterResult })(Alarm);
