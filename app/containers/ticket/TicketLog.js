
'use strict';
import React, { Component } from 'react';
import {
  Alert,

  View, Text,
  InteractionManager,
  DeviceEventEmitter
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
// import TicketLogView from '../../components/ticket/TicketLogView';
import TicketLogEdit from './TicketLogEdit';
import TicketLogsView from '../../components/ticket/TicketLogsView.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import { deleteLog, saveLog, loadTicketLogs, loadTicketLogsFromCache } from '../../actions/ticketAction.js';
import trackApi from '../../utils/trackApi.js';
import { Navigator } from 'react-native-deprecated-custom-components';
import moment from 'moment';
import { cacheTicketLogOperate, getTicketLogsFromCache, TICKET_LOG_DELETE } from '../../utils/sqliteHelper';
import PhotoShow from '../assets/PhotoShow';

class TicketLog extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: this.props.cacheData ? this.props.cacheData.data : null,
      isEmpty: this.props.cacheData && this.props.cacheData.hasCache
        && (!this.props.cacheData.data || this.props.cacheData.data.getRowCount() === 0)
    };
  }
  _showAuthWidthNoAlert() {
    if (this.props.hasAuth === null) { //do nothing wait api
      return false;
    }
    if (this.props.hasAuth === false) {
      //您没有这一项的操作权限，请联系系统管理员
      // Alert.alert('','您没有这一项的操作权限，请联系系统管理员');
      return false;
    }
    if (!this.props.canEdit) {
      // Alert.alert('','仅执行中的工单可以编辑这一日志');
      return false;
    }
    return true;
  }
  _showAuth() {
    if (this.props.hasAuth === null) { //do nothing wait api
      return false;
    }
    if (this.props.hasAuth === false) {
      //您没有这一项的操作权限，请联系系统管理员
      Alert.alert('', '您没有这一项的操作权限，请联系系统管理员');
      return false;
    }
    if (!this.props.canEdit) {
      Alert.alert('', '仅执行中的工单可以编辑这一日志');
      return false;
    }
    return true;
  }
  _gotoEdit(log) {
    if (!log) { //create one
      if (!this._showAuth()) {
        return;
      }
      trackApi.onTrackEvent('App_ClickAddTicketLog', this.props.traceAddLogData);
    } else {
      trackApi.onTrackEvent('App_ViewTicketLogDetail', {
        ...this.props.traceAddLogData,
        // logfile_content:log.get('Content'),
        // logfile_attachment_count:log.get('Pictures').size,
        // submitted_at: moment(log.get('CreateTime')).format('YYYY-MM-DD'),
      });
    }


    this.props.navigation.push('PageWarpper', {
      id: 'ticket_log_edit',
      component: TicketLogEdit,
      passProps: {
        log,
        saveLog: (a, b) => {
          let traceData = this.props.traceAddLogData;
          traceData.logfile_count += 1;
          trackApi.onTrackEvent('App_SubmitTicketLog', {
            ...traceData,
            // logfile_content:a.Content,
            // logfile_attachment_count:a.Pictures?a.Pictures.length:0
          });
          if (this.props.offline) {
            this._loadLogs();
          } else
            this.props.saveLog(a, b);
        },
        ticketId: this.props.ticketId,
        canEdit: this.props.canEdit,
        hasAuth: this.props.hasAuth,
        offline: this.props.offline
      }
    });
  }

  _goToDetail(items, index, thumbImageInfo) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: thumbImageInfo,
        type: 'ticketDetailPhoto',
        canEdit: false,
      }
    });
  }

  _onRowDeleteAuth(log) {
    // console.warn('user',log.get('CreateUserName'),this.props.user.get('RealName'));
    if (log.get('CreateUserName') !== this.props.user.get('RealName')) {
      // Alert.alert('','仅创建者可以删除这一日志');
      return false;
    }
    if (!this._showAuthWidthNoAlert()) {
      return false;
    }
    return true;
  }
  _delete(log) {
    // console.warn('user',log.get('CreateUserName'),this.props.user.get('RealName'));
    if (log.get('CreateUserName') !== this.props.user.get('RealName')) {
      Alert.alert('', '仅创建者可以删除这一日志');
      return;
    }
    if (!this._showAuth()) {
      return;
    }
    Alert.alert(
      '',
      '删除这条日志吗？',
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '删除', onPress: async () => {
            if (this.props.offline) {
              //离线操作
              await cacheTicketLogOperate(TICKET_LOG_DELETE, log.toJSON());
              //更新显示
              this._loadLogs();
            } else
              this.props.deleteLog(this.props.ticketId, log.get('Id'));
          }
        }
      ]
    )
  }
  async _loadLogs() {
    console.warn('_loadLogs', this.props.offline);
    if (this.props.offline) {
      //从本地缓存读取日志信息
      let logs = await getTicketLogsFromCache(this.props.ticketId);
      this.props.loadTicketLogsFromCache(this.props.ticketId, logs);
    } else {
      if (isConnected())
        this.props.loadTicketLogs(this.props.ticketId);
    }
  }
  _canShowAdd() {
    return this.props.canEdit;
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    // backHelper.init(this.props.navigator,this.props.route.id);
    // console.warn('didmount');
    InteractionManager.runAfterInteractions(() => {
      // console.warn('loadTicketLogs');
      //根据条件判断是否加载
      if (!(this.props.cacheData && this.props.cacheData.hasCache && this.props.fromTicketDetail))
        this._loadLogs();
    });

  }
  componentWillReceiveProps(nextProps) {
    // console.warn('componentWillReceiveProps',this.props.logs,nextProps.logs);
    if (this.props.logs && !nextProps.logs) {
      //this is a hack for following senario
      //when back from edit page
      //sometimes list is empty
      //but when _loadLogs included in runAfterInteractions it is fixed
      InteractionManager.runAfterInteractions(() => {
        this._loadLogs();
      });
      return;
    }
    if ((nextProps.logs && nextProps.logs !== this.props.logs) ||
      (this.props.logs && nextProps.logs === this.props.logs && this.props.logs.size === 0)) {
      InteractionManager.runAfterInteractions(() => {
        let isEmpty = true;
        if (nextProps.logs && nextProps.logs.size > 0) {
          isEmpty = false;
        }
        this.setState({ isEmpty, dataSource: this.ds.cloneWithRows(nextProps.logs.toArray()) }, () => {
          // if(this.props.saveCache){
          //   this.props.saveCache(this.state.dataSource);
          // }
        });
      });
    }
    if (!nextProps.isFetching && (nextProps.isFetching !== this.props.isFetching)) {
      if (!nextProps.logs || (nextProps.logs && nextProps.logs.size === 0)) {
        this.setState({ isEmpty: true })
      } else {
        this.setState({ isEmpty: false })
      }
    }

    //如果有离线切换，重新加载数据
    if (this.props.offline !== nextProps.offline) {
      InteractionManager.runAfterInteractions(() => {
        this._loadLogs();
      })
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    // backHelper.destroy(this.props.route.id);
  }

  _logLongPress(log) {
    if (this.props.fromTicketDetail) {
      //如果日志类型为2，系统产生，不显示删除编辑
      if (log.get('LogType') === 2 || !this.props.canEdit) return;
      DeviceEventEmitter.emit('logLongPress', [
        {
          title: '编辑日志', click: () => {
            if (log.get('CreateUserName') !== this.props.user.get('RealName')) {
              Alert.alert('', '仅创建者可以编辑这一日志');
              return;
            }
            this._gotoEdit(log)
          }
        },
        { title: '删除日志', click: () => this._delete(log) }
      ]);
    } else {
      this._delete(log);
    }
  }

  render() {
    // TicketEditPrivilegeCode====>TicketExecutePrivilegeCode
    if ((this.props.fromTicketDetail && this.state.isEmpty) || (this.props.cacheLogCount === 0)) {
      return (
        <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: '#888' }}>暂无日志</Text>
        </View>
      );
    }
    return (
      <TicketLogsView
        fromTicketDetail={this.props.fromTicketDetail}
        title={'全部日志'}
        gotoDetail={(items, index, thumbImageInfo) => this._goToDetail(items, index, thumbImageInfo)}
        logs={this.state.dataSource}
        privilegeCode='TicketExecutePrivilegeCode'
        showAdd={this._canShowAdd()}
        isFetching={this.props.isFetching}
        onRefresh={() => this._loadLogs()}
        emptyText=''
        createLog={() => this._gotoEdit()}
        onRowDeleteAuth={(log) => this._onRowDeleteAuth(log)}
        onRowClick={(log) => { if (!this.props.fromTicketDetail) this._gotoEdit(log) }}
        onRowLongPress={(log) => this._logLongPress(log)}
        onBack={() => this.props.navigation.pop()} />
    );
  }
}

TicketLog.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  deleteLog: PropTypes.func,
  saveLog: PropTypes.func,
  loadTicketLogs: PropTypes.func,
  ticketId: PropTypes.number,
  hasAuth: PropTypes.bool,
  logs: PropTypes.object,//immutable
  canEdit: PropTypes.bool,
}

function mapStateToProps(state, ownProps) {
  var id = ownProps.ticketId;
  var logList = state.ticket.logList;
  var logs = null;
  // console.warn('ticketId',logList.get('ticketId'),id,privilegeHelper.hasAuth('TicketEditPrivilegeCode'),logList);
  if (logList.get('ticketId') === id) {
    logs = logList.get('data');
  }
  return {
    user: state.user.get('user'),
    logs,
    cacheLogCount: logList.get('cacheLogCount'),
    isFetching: logList.get('isFetching'),
    hasAuth: privilegeHelper.hasAuth('TicketExecutePrivilegeCode'),
  };
}

export default connect(mapStateToProps, { deleteLog, saveLog, loadTicketLogs, loadTicketLogsFromCache })(TicketLog);
