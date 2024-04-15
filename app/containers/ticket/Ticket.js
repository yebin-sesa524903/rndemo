
'use strict';
import React, { Component } from 'react';
import {
  View,

  InteractionManager,
  DeviceEventEmitter,
  Platform,
  Alert
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import NetInfo from "@react-native-community/netinfo";
import { Navigator } from 'react-native-deprecated-custom-components';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import RNFetchBlob from 'react-native-fetch-blob';

import {
  loadTickets, nextPage, ticketCreateConditionChange, setTicketFilterType,
  loadTicketCount, changeSearchDate, downloadTickets, downloadTicketImages,
  loadOfflineTickets, loadCacheTicketCount, foldTickets, serviceTicketLoad
} from '../../actions/ticketAction';
import TicketView from '../../components/ticket/Ticket';
import TicketSubView from '../../components/ticket/TicketSubView';
import TicketDetail from './TicketDetail';
import CustomerSelect from './CustomerSelect';
import notificationHelper from '../../utils/notificationHelper.js';
import TicketFilter from './TicketFilter';
import trackApi from '../../utils/trackApi.js';

import TicketSync from './TicketSync';
import moment from 'moment';
import storage from "../../utils/storage";

import Toast from 'react-native-root-toast';

import {
  getCacheTicketByDate,
  getCacheDays,
  getUnSyncTickets,
  getCacheServiceTicketByDate, getServiceCacheDays
} from '../../utils/sqliteHelper';
import { downloadImages } from "../../utils/patrolImageUtil";
import TicketFilterResult from './TicketFilterResult';
import ServiceTicketDetail from './ServiceTicketDetail';
import privilegeHelper from "../../utils/privilegeHelper";
import permissionCode from "../../utils/permissionCode";

const TAB_SERVICE = 'Logbook服务工单';
const TAB_OTHER = '其他工单';

class Ticket extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  constructor(props) {
    super(props);
    this._viewCache = {};
    this._dataSourceCache = {};
    this._hasTraceListOperator = false;
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });

    this.state = { dataSource: null, currentIndex: 0, };
    let type = this._getCurrentType();
    let data = props[type].get('allDatas');
    if (data) {
      var obj = data.map((item) => item.toArray()).toArray();

      var dataSource = this.ds.cloneWithRowsAndSections(obj);
      if (dataSource) {
        this._dataSourceCache[type] = dataSource;
        this.state = { dataSource: dataSource, currentIndex: 0 };
      }
      // this._setDataSourceCache(this.ds.cloneWithRowsAndSections(obj));
    }
  }

  _loadServiceTickets(filter, type) {
    //如果两次请求接口时间间隔小于100ms，不处理
    let lastRequestByDate = this._lastRequestByDate || 0;
    if (Date.now() - lastRequestByDate > 100) {
      let body = filter.toJSON();
      body.StartTime = null;
      body.EndTime = null;
      body.PageSize = body.ItemsPerPage;
      this.props.serviceTicketLoad(body, type);
      this._lastRequestByDate = Date.now();
    }
  }

  async _loadTickets(filter, allRequest) {
    let type = this._getCurrentType();
    // if(type === 'service') {
    //   this._loadServiceTickets(this.props.todayData.get('filter'),type);
    //   if(allRequest && this._getTabs().length>1) {
    //     this.props.loadTickets(this.props.todayData.get('filter'), 'todayData');
    //   }
    //   return;
    // }
    if (isConnected()) {
      //如果同步完成才能更新哟
      if (this.props.sync.get('waitingSyncTickets').size > 0) {
        //给出提示 工单未同步完成，请完成后再刷新数据
        let showing = this._syncAlertShowing || false;
        //判断同时提示框有没有
        if (!showing) {
          this._syncAlertShowing = true;
          Alert.alert(
            '',
            `工单未同步完成，请完成后再刷新数据`,
            [
              {
                text: '好', onPress: () => {
                  this._syncAlertShowing = false;
                }
              },
            ],
            { cancelable: false }
          );
        }

        return;
      }
      //如果两次请求接口时间间隔小于100ms，不处理
      let lastRequestByDate = this._lastRequestByDate || 0;
      if (Date.now() - lastRequestByDate > 100) {
        if (type === 'service') {
          this._loadServiceTickets(filter, type);
          if (allRequest && this._getTabs().length > 1) {
            this.props.loadTickets(this.props.todayData.get('filter').toJSON(), 'todayData');
          }
        } else {
          this.props.loadTickets(filter.toJSON(), type);
          if (allRequest && this._getTabs().length > 1) {
            this._loadServiceTickets(this.props.service.get('filter'), 'service');
          }
        }
        this._lastRequestByDate = Date.now();
      }
    } else {
      //取本地离线数据
      // let cacheData = null;
      // cacheData=await getCacheServiceTicketByDate(filter.get('SearchDate'));
      // cacheData = cacheData || []
      // let data = {
      //   Result:{
      //     Items:cacheData,
      //     TotalItems:cacheData.length
      //   }
      // }
      // this.props.loadOfflineTickets(data, 'service',filter.get('SearchDate'));
      // cacheData=await getCacheTicketByDate(filter.get('SearchDate'));
      // cacheData = cacheData || []
      // data = {
      //   Result:{
      //     Items:cacheData,
      //     TotalItemsCount:cacheData.length
      //   }
      // }
      // this.props.loadOfflineTickets(data, 'todayData',filter.get('SearchDate'));
      // let counts=await getCacheDays();
      // this.props.loadCacheTicketCount(counts);
      // //载入离线服务工单
      // counts = await getServiceCacheDays();
      // this.props.loadCacheTicketCount(counts);
    }
  }
  _onPostingCallback(type, startTime) {
    // console.warn('_onPostingCallback...');
    // InteractionManager.runAfterInteractions(() => {
    this._refreshOnFocus = true;
    // });
    if (type === 'create' && startTime) {
      if (this._ticketView) {
        // this._refreshOnFocus = false;
        this._ticketView._gotoShowListWithDate(moment(startTime));
      }
    }
  }
  _filterClick() {
    this._traceTicketListOperator('点击筛选');
    var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
    sceneConfig.gestures = {};
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_filter',
      component: TicketFilter,
      sceneConfig: sceneConfig
    });
  }
  _gotoDetail(ticketId, fromHex, isFutureTask) {
    if (this._getCurrentType() === 'service') {
      this.props.navigation.push('PageWarpper', {
        id: 'service_ticket_detail',
        component: ServiceTicketDetail,
        passProps: {
          ticketId: ticketId,
          onRefresh: () => this._onRefresh()
        }
      })
      return;
    }

    this._traceTicketListOperator('点击条目');

    this.props.navigation.push('PageWarpper', {
      id: 'ticket_detail',
      component: TicketDetail,
      passProps: {
        onPostingCallback: (type) => { this._onPostingCallback(type) },
        ticketId: ticketId,
        fromHex: fromHex,
        fromFilterResult: false,
        isFutureTask,
      },
    });
  }
  _createTicket(type) {
    //设置创建工单的类型
    this.props.ticketCreateConditionChange({ type: 'TicketType', value: type });
    this.props.navigation.push('PageWarpper', {
      id: 'customer_select',
      component: CustomerSelect,
      //sceneConfig:Navigator.SceneConfigs.FloatFromBottom,
      passProps: {
        onPostingCallback: (type2, startTime) => { this._onPostingCallback(type2, startTime) },
      }
    });

  }
  _onRefresh() {
    let type = this._getCurrentType();
    // if(type === 'service') {
    //   this.props.nextPage({isFirstPage:true,typeTicketTask:type});
    //   return;
    // }
    if (!isConnected()) {
      //切换到离线数据
      this._loadTickets(this._getCurrentData(this.props).get('filter'));
      return;
    }
    //如果还没有同步完成，不能刷新
    if (this.props.sync.get('waitingSyncTickets').size > 0) {
      //给出提示 工单未同步完成，请完成后再刷新数据
      let showing = this._syncAlertShowing || false;
      //判断同时提示框有没有
      if (!showing) {
        this._syncAlertShowing = true;
        Alert.alert(
          '',
          `工单未同步完成，请完成后再刷新数据`,
          [
            {
              text: '好', onPress: () => {
                this._syncAlertShowing = false;
              }
            },
          ],
          { cancelable: false }
        );
      }

      return;
    }
    this.props.nextPage({ isFirstPage: true, typeTicketTask: type });
  }
  _indexChanged(index) {
    this._traceTicketListOperator('点击分类');
    let dataSource = this._getDataSource(index);
    if (dataSource && dataSource.sectionIdentities.length !== 0) {
      this.setState({ currentIndex: index, dataSource: dataSource });
    } else {
      this.setState({ currentIndex: index }, () => {
        this._onRefresh();
      });
      // this._onRefresh();
    }
  }
  _getCurrentData(props) {
    var type = this._getCurrentType();
    return props[type];
  }
  _getCurrentType(index = this.state.currentIndex) {
    let tabs = this._getTabs();
    if (tabs.length === 1) {
      switch (tabs[0]) {
        case TAB_SERVICE:
          return 'service';
        case TAB_OTHER:
          return 'todayData';
      }
    }

    let ret = '';
    if (index === 0) {
      ret = 'service';
    } else if (index === 1) {
      ret = 'todayData';
    }
    else {
      ret = 'futureData';
    }
    return ret;
  }
  _getDataSource(index) {
    var type = this._getCurrentType(index);
    // console.warn('_getDataSource',type);
    if (this._dataSourceCache[type]) {
      return this._dataSourceCache[type];
    }
    return null;
  }
  _setDataSourceCache(dataSource) {
    var type = this._getCurrentType();
    // if(dataSource){
    this._dataSourceCache[type] = dataSource;
    // }
    this.setState({ dataSource });
  }

  _getCurrentContentView() {
    var type = this._getCurrentType();
    var stateData = this._getCurrentData(this.props)
    // console.warn('_getCurrentContentView...',stateData.get('isFetching'),!!stateData.get('data'));
    // console.warn('_getCurrentContentView ...',stateData.get('isFetching'),stateData.get('allDatas'));
    var obj = {
      isFetching: stateData.get('isFetching'),
      listData: this._getDataSource(),
      errMsg: this.props.errMsg,
      sectionData: stateData.get('sectionData'),
      nextPage: () => {
        this.props.nextPage({ isFirstPage: false, typeTicketTask: type });
        this._traceTicketListOperator('加载更多')
      },
      currentPage: stateData.get('filter').get('CurrentPage'),
      onRefresh: () => this._onRefresh(),
      totalPage: stateData.get('pageCount'),
      // totalPage:isConnected()?stateData.get('pageCount'):stateData.get('filter').get('CurrentPage'),
      keyType: type, isService: type === 'service',
      folderTicket: this.props.foldTickets,
      onRowClick: (rowData) => this._gotoDetail(String(rowData.get('Id')), false, rowData.get('isFutureTask')),
    }
    // return (<TicketSubView {...obj} />);

    var component = null;
    if (type === 'lastData') {
      component = (
        <TicketSubView {...obj} />
      );
    }
    else if (type === 'todayData' || type === 'service') {
      component = (
        <TicketSubView {...obj} />
      );
    }
    else if (type === 'futureData') {
      component = (
        <TicketSubView {...obj} />
      );
    }
    return component;
  }
  _checkPushNotification() {
    var ticketId = notificationHelper.getData('ticket');
    if (ticketId) {
      this._gotoDetail(ticketId, true);
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

    this._netInfoEvent = NetInfo.addEventListener(this.connectionHandler.bind(this))
  }
  componentDidMount() {
    trackApi.onPageBegin('ticket_management');
    InteractionManager.runAfterInteractions(() => {
      var currData = this._getCurrentData(this.props);
      if (!currData.get('allDatas')) {
        // InteractionManager.runAfterInteractions(()=>{
        // console.warn('componentDidMount...',this._getCurrentData(this.props).get('filter'));
        // setTimeout(()=>{
        //   this._loadTickets(this._getCurrentData(this.props).get('filter'),true);
        // },100);
        // this._loadTickets(this._getCurrentData(this.props).get('filter'));
        // });
      } else {
        // var obj = currData.get('allDatas').map((item)=>item.toArray()).toArray();
        // InteractionManager.runAfterInteractions(()=>{
        //   this._setDataSourceCache(this.ds.cloneWithRowsAndSections(obj));
        // });
      }
      notificationHelper.register('ticket', () => this._checkPushNotification());

    });
    this._bindEvent();
    // backHelper.init(this.props.navigator,'tickets');
    this.actionSheetItemClickListener = DeviceEventEmitter.addListener('actionSheetItemClick', (item) => {
      if (item.type === 'Ticket') {
        //选择创建的工单类型
        this._createTicket(item.ticketType);
      }
    });

    this.resetTicketOperatorListener = DeviceEventEmitter.addListener('resetTicketListOperator', () => {
      this._resetTicketListOperator();
    });

    // let dates=this._getInitDateDuration();
    // this._loadTicketCountByDate(dates[0],dates[1]);
  }

  _getInitDateDuration() {
    //以当前日期为中心获取前后四周的数据
    let now = moment().format('YYYY-MM-DD');
    let dayOfWeek = moment(now).day();
    if (dayOfWeek === 0) dayOfWeek = -6;
    else dayOfWeek = 1 - dayOfWeek;

    let beginMonday = moment(now).add(dayOfWeek, 'day');
    let start = moment(beginMonday).add(-7 * 4 * 3, 'day').format('YYYY-MM-DD');
    let end = moment(beginMonday).add(7 * 4 * 3, 'day').format('YYYY-MM-DD');
    return [start, end];
  }

  async _loadTicketCountByDate(begin, end) {
    //如果当前是服务报告，则不查询
    // if(this._getCurrentType() === 'service') return;
    let tabs = this._getTabs();
    //如果没有其他工单tab,不调用统计接口
    if (!tabs.find(tab => tab === TAB_OTHER)) return;
    if (isConnected()) {
      //统计日期下工单数量接口可能很慢，尽量减少此接口的调用
      if (this.props.ticketCountFetching) return;
      let _s = moment(begin).format('YYYY-MM-DD');
      let _e = moment(end).format('YYYY-MM-DD');
      if (this.props.ticketCountBeginDate && this.props.ticketCountEndDate) {
        //如果查询的范围在这里面，就不要重复调用此接口了
        if (moment(_s).isSameOrAfter(moment(this.props.ticketCountBeginDate)) &&
          moment(_e).isSameOrBefore(moment(this.props.ticketCountEndDate))) return;
      }
      let userId = this.props.user.get('Id');
      this.props.loadTicketCount({
        "UserId": userId, "BeginDate": moment(begin).format('YYYY-MM-DD'),
        "EndDate": moment(end).format('YYYY-MM-DD')
      });
    } else {
      // //查询本地缓存的数据记录分别在哪些天
      // let counts=await getCacheDays();
      // this.props.loadCacheTicketCount(counts);
      // //载入离线服务工单
      // counts = await getServiceCacheDays();
      // this.props.loadCacheTicketCount(counts);
    }
  }

  async _dowanloadImages(imgs, docs) {
    await downloadImages(imgs, docs);
    //下载完成之后，需要通知状态修改
    this.props.downloadTicketImages();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.downloadPosting !== this.props.downloadPosting &&
      this.props.downloadPosting) {
      //表示巡检工单下载完成，需要下载里面的图片
      if (nextProps.downloadPosting === 4) {
        this._dowanloadImages(nextProps.needDownloadImages, nextProps.needDownloadDocs);
      } else {
        this.context.hideHud();
        if (nextProps.downloadPosting === 0) {
          trackApi.onTrackEvent('App_Downloadticket', {
            ticket_count: nextProps.nCurrCacheTicketsCount,
            ticket_type: '巡检工单'
          })
          InteractionManager.runAfterInteractions(() => {
            this.context.showSpinner('download_tickets_ok');
          });
        }
      }

    }

    var data = this._getCurrentData(nextProps).get('allDatas');

    if (data !== this._getCurrentData(this.props).get('allDatas')) {
      if (data) {// !== origData){// && data){// && data.size >= 1){
        var obj = data.map((item) => item.toArray()).toArray();
        InteractionManager.runAfterInteractions(() => {
          this._setDataSourceCache(this.ds.cloneWithRowsAndSections(obj));
        });
      } else {
        // InteractionManager.runAfterInteractions(() => {
        this._setDataSourceCache(null)//this.ds.cloneWithRowsAndSections([]));
        // });
      }
    }
    // var currData = this._getCurrentData(nextProps);
    // console.warn('componentWillReceiveProps...');
    if (this._getCurrentData(this.props).get('filter') !== this._getCurrentData(nextProps).get('filter')) {
      // console.warn('_loadTickets...',this._getCurrentData(nextProps).get('filter'));
      //this is a hack for following senario
      //when back from edit page
      //sometimes list is empty
      //but when _loadTickets included in runAfterInteractions it is fixed
      InteractionManager.runAfterInteractions(() => {
        this._loadTickets(this._getCurrentData(nextProps).get('filter'), true);
      });
    }

    //如果所有的待同步工单完成，自动请求一次最新的数据
    if (isConnected() && nextProps.sync.get('waitingSyncTickets') !== this.props.sync.get('waitingSyncTickets')) {
      let nextCount = nextProps.sync.get('waitingSyncTickets').size;
      let count = this.props.sync.get('waitingSyncTickets').size;
      if (count > 0 && nextCount === 0) {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => {
            this._onRefresh();
          }, 100);
        });
      }
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd('ticket_management');
    this.actionSheetItemClickListener.remove();
    this.resetTicketOperatorListener.remove();
    this._listener && this._listener.remove();
    // backHelper.destroy('tickets');
    notificationHelper.resetData('ticket');
    notificationHelper.unregister('ticket');
    // NetInfo.removeEventListener('connectionChange', this.connectionHandler)
    if (this._netInfoEvent) { this._netInfoEvent() }
  }

  async connectionHandler(conn) {
    let _lastChangeTime = this._lastChangeTime || 0;
    let _lastChangeState = this._lastChangeState;
    if (_lastChangeState === conn.isConnected && (Date.now() - _lastChangeTime) < 3) {
      return;
    }
    this._lastChangeTime = Date.now();
    this._lastChangeState = conn.isConnected;
    if (conn.isConnected) {
      //需要判断有没有未同步的工单
      let res = await getUnSyncTickets();
      if (res && res.length > 0) {
        //有未同步的，则读取本地缓存数据
        this._loadTickets(this._getCurrentData(this.props).get('filter'));
        return;
      }
      // this.setState({});
      this._onRefresh();
      let dates = this._getInitDateDuration();
      this._loadTicketCountByDate(dates[0], dates[1]);
    } else {
      //切换到离线数据
      this._loadTickets(this._getCurrentData(this.props).get('filter'));
    }
  }

  _trace() {
    //有数据才记录，并且只有在tab变化时才记录
    if (this._traceIndex !== this.state.currentIndex) {
      let tmpData = this._getCurrentData(this.props);
      if (!tmpData.get('isFetching') && tmpData.get('trace')) {
        this._traceIndex = this.state.currentIndex;
        let tmpTrace = tmpData.get('trace');
        trackApi.onTrackEvent('App_ViewTab', {
          module_name: '工单',
          tab_name: ['以往', '今天', '未来'][this._traceIndex],
          pending_count: tmpTrace.get('pending'),
          doing_count: tmpTrace.get('doing'),
          submitted_count: tmpTrace.get('submitted'),
          finish_count: tmpTrace.get('finish')
        })
      }
    }
  }

  _traceTicketListOperator(operation) {
    if (!this._hasTraceListOperator) {
      this._hasTraceListOperator = true;
      trackApi.onTrackEvent('App_ModuleOperation', {
        operation,
        module_name: '工单'
      });
    }
  }

  _resetTicketListOperator() {
    this._hasTraceListOperator = false;
  }

  _gotoSync() {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_sync',
      component: TicketSync,
      passProps: {
      },
    });
  }
  _didDownloadClick() {
    RNFetchBlob.fs.df().then(response => {
      let nFreeGb = (Platform.OS === 'android' ? response.external_free : response.free) / 1000.0 / 1000.0 / 1000.0;
      console.log('Free space in bytes: ' + nFreeGb);
      if (nFreeGb < 2.0) {
        Alert.alert(
          '',
          `您的手机存储空间小于2GB，无法下载工单`,
          [
            {
              text: '好', onPress: () => {
              }
            },
          ],
          { cancelable: false }
        );
      } else {
        this._downloadTickets();
      }
    });
  }
  _downloadTickets() {
    if (!isConnected()) {
      Toast.show('当前网络已断开，无法下载工单', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    //如果有同步未完成，提示同步完成后再下载
    if (this.props.sync.get('waitingSyncTickets').size > 0) {
      Toast.show('正在同步，请稍后下载', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    //判断当前的列表，如果没有数据，不进行下载，给出提示
    if (!this._getCurrentData(this.props).get('isFetching')
      && (!this._getDataSource() || this._getDataSource().getRowAndSectionCount() === 0)) {
      Toast.show('所选日期没有工单', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }

    let download_date = this._getCurrentData(this.props).getIn(['filter', 'SearchDate']);
    //下载提示
    Alert.alert(
      '',
      `下载${download_date}的工单到本地？`,
      [
        {
          text: '取消', onPress: () => {
          }
        },
        {
          text: '下载', onPress: () => {
            this.context.showSpinner('download_tickets');
            this.props.downloadTickets(
              {
                TicketTaskType: 1, CurrentPage: 1, ItemsPerPage: 20,
                SearchDate: download_date
              }, null, this._getCurrentType() === 'service'
            );
          }
        },
      ],
      { cancelable: false }
    );
    return;
  }

  _hasPatrolTicket() {
    let type = this._getCurrentType();
    // if(type === 'service') return false;
    let stateData = this._getCurrentData(this.props);
    return isConnected() && stateData.get('data') && stateData.get('data').size > 0;//(!stateData.get('isFetching'))&&stateData.get('hasPatrolTicket');
  }

  _getTabs() {
    //根据权限判断
    let tabs = [];
    if (privilegeHelper.showService()) {
      tabs.push(TAB_SERVICE);
    }
    if (privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
      privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT)) {
      tabs.push(TAB_OTHER);
    }
    return tabs;
  }

  render() {
    if (this.props.hasFilter) {
      return <TicketFilterResult route={{ id: 'ticket_filter_result' }} navigator={this.props.navigator} />
    }
    this._trace();
    return (
      <TicketView
        ref={(obj) => { this._ticketView = obj }}
        ticketsCount={this.props.ticketsCount}
        // ticketsCount={isConnected() ? this.props.ticketsCount : this.props.offlineTicketCount}
        changeSearchDate={(date) => {
          //改变了查询日期，那么缓存的列表需要清除
          this._dataSourceCache = {};

          let type = this._getCurrentType();
          this.props.changeSearchDate({ searchDate: moment(date).format('YYYY-MM-DD'), typeTicketTask: type });

          //还需要请求这一天有没有红点数据
          // this._loadTicketCountByDate(date,date);
        }}
        searchDate={this._getCurrentData(this.props).getIn(['filter', 'SearchDate'])}
        loadTicketCount={(start, end) => {
          this._loadTicketCountByDate(start, end);
        }}
        onSync={() => this._gotoSync()}
        onFilter={() => {
          this.props.setTicketFilterType(this._getCurrentType() === 'service')
          DeviceEventEmitter.emit('showDrawer');
        }}
        onDownload={() => {
          this._didDownloadClick();
        }}
        serviceCount={this.props.serviceCount}
        ticketCount={this.props.ticketCount}
        enableDownload={this._hasPatrolTicket()}
        sync={this.props.sync}
        tabs={this._getTabs()}
        onBack={() => this._onBackClick()}
        currentIndex={this.state.currentIndex}
        indexChanged={(index) => { this._indexChanged(index) }}
        contentView={this._getCurrentContentView()}
        onCreateTicket={() => {
          if (!isConnected()) {
            Toast.show('当前网络已断开，无法新建工单', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
            return;
          }
          // DeviceEventEmitter.emit('showActionSheet','Ticket');
          // this._traceTicketListOperator('点击创建')
          // 直接创建现场工单（type=4)
          this._createTicket(4);
        }}
        onFilterTicket={() => this._filterClick()}
      />
    );
  }
}

Ticket.propTypes = {
  navigator: PropTypes.object,
  loadTickets: PropTypes.func,
  nextPage: PropTypes.func,
  nCurrCacheTicketsCount: PropTypes.number,
  lastData: PropTypes.object,
  todayData: PropTypes.object,
  futureData: PropTypes.object,
}

function mapStateToProps(state) {
  var tickets = state.ticket.tickets;
  // var todayData=tickets.get('todayData');
  // console.warn('mapStateToProps...',todayData.get('isFetching'),todayData.get('allDatas'));
  return {
    lastData: tickets.get('lastData'),
    todayData: tickets.get('todayData'),
    futureData: tickets.get('futureData'),
    service: tickets.get('service'),
    serviceCount: tickets.getIn(['service', 'totalCount']),
    ticketCount: tickets.getIn(['todayData', 'totalCount']),
    user: state.user.get('user'),
    ticketsCount: tickets.get('ticketCount') || [],
    offlineTicketCount: tickets.get('offlineTicketCount') || [],
    nCurrCacheTicketsCount: tickets.get('nCurrCacheTicketsCount') || 0,
    downloadPosting: tickets.get('downloadPosting'),
    needDownloadImages: tickets.get('needDownloadImages'),
    needDownloadDocs: tickets.get('needDownloadDocs'),
    sync: state.sync,
    errMsg: tickets.get('errMsg'),
    ticketCountBeginDate: tickets.get('beginDate'),
    ticketCountEndDate: tickets.get('endDate'),
    ticketCountFetching: tickets.get('ticketCountFetching'),
    hasFilter: state.ticket.ticketFilter.get('hasFilter')
  }
}

export default connect(mapStateToProps, {
  loadTickets, nextPage, ticketCreateConditionChange,
  loadTicketCount, changeSearchDate, downloadTickets, loadOfflineTickets, foldTickets, setTicketFilterType,
  loadCacheTicketCount, downloadTicketImages, serviceTicketLoad
})(Ticket);
