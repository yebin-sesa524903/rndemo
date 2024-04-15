
'use strict';
import React, { Component } from 'react';
import {
  Alert,

  View, Text,
  InteractionManager,
  DeviceEventEmitter,
  Dimensions
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
// import TicketLogView from '../../components/ticket/TicketLogView';
import TicketMsgEdit from './TicketMsgEdit';
import TicketMesgsView from '../../components/ticket/TicketMesgsView.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import { deleteMessage, saveMessage, loadTicketMsgs, setMessageToRead, setTicketMsgsCount } from '../../actions/ticketAction.js';
import trackApi from '../../utils/trackApi.js';
import { Navigator } from 'react-native-deprecated-custom-components';
import SchActionSheet from '../../components/actionsheet/SchActionSheet';

const EMPTY_HEIGHT = 320;//Dimensions.get('window').height*0.6;

class TicketMesgs extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: this.props.cacheData ? this.props.cacheData.data : null,
      isEmpty: this.props.cacheData && this.props.cacheData.hasCache
        && (!this.props.cacheData.data || this.props.cacheData.data.getRowCount() === 0)
    };
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
      Alert.alert('', '仅执行中的工单可以编辑这一留言');
      return false;
    }
    return true;
  }
  _gotoEdit(log) {
    if (!log) { //create one
      if (!this._showAuth()) {
        return;
      }
    }
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_log_edit',
      component: TicketMsgEdit,
      passProps: {
        log,
        saveLog: (a, b) => { this.props.saveMessage(a, b) },
        ticketId: this.props.ticketId,
        canEdit: this.props.canEdit,
        hasAuth: this.props.hasAuth,
        isEdit: !!log,
      }
    });
  }
  _onRowDeleteAuth(log) {
    // console.warn('user',log.get('UserName'),this.props.user.get('RealName'));
    if (log.get('UserName') !== this.props.user.get('RealName')) {
      // Alert.alert('','仅创建者可以删除这一日志');
      return false;
    }
    return true;
  }
  _delete(log) {
    // console.warn('user',log.get('UserName'),this.props.user.get('RealName'));
    if (log.get('UserName') !== this.props.user.get('RealName')) {
      Alert.alert('', '仅创建者可以删除这一留言');
      return;
    }
    if (!this._showAuth()) {
      return;
    }
    Alert.alert(
      '',
      '删除这条留言吗？',
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '删除', onPress: () => {
            this.props.deleteMessage(this.props.ticketId, log.get('Id'));
          }
        }
      ]
    )
  }
  _loadLogs() {
    this.props.loadTicketMsgs(this.props.ticketId);
  }
  _canShowAdd() {
    return this.props.canEdit;
  }
  componentDidMount() {
    this._init = true;
    trackApi.onPageBegin(this.props.route.id);
    // backHelper.init(this.props.navigator,this.props.route.id);
    // console.warn('didmount');
    InteractionManager.runAfterInteractions(() => {
      // console.warn('loadTicketMsgs');
      if (!(this.props.cacheData && this.props.cacheData.hasCache && this.props.isFromTicketDetail))
        this._loadLogs();
      this.props.setMessageToRead(this.props.ticketId);
    });

  }
  componentWillReceiveProps(nextProps) {
    if (!this._init) return;
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
      var logs = nextProps.logs;
      // if (logs.size>3&&this.props.isFromTicketDetail) {
      //   logs=logs.splice(3);
      // }
      InteractionManager.runAfterInteractions(() => {
        this.setState({ dataSource: this.ds.cloneWithRows(logs.toArray()) }, () => {
          if (this.props.saveCache) {
            this.props.saveCache(this.state.dataSource);
          }
        });
        this.props.setTicketMsgsCount(logs.size || 0);
      });
    }

    if (!nextProps.isFetching && (nextProps.isFetching !== this.props.isFetching)) {
      if (!nextProps.logs || (nextProps.logs && nextProps.logs.size === 0)) {
        this.setState({ isEmpty: true })
      } else {
        this.setState({ isEmpty: false })
      }
    }
  }
  componentWillUnmount() {
    this._init = false;
    trackApi.onPageEnd(this.props.route.id);
    // backHelper.destroy(this.props.route.id);
  }

  render() {
    // TicketEditPrivilegeCode====>TicketExecutePrivilegeCode
    if (this.state.isEmpty && this.props.isFromTicketDetail) {
      return (
        <View style={{ height: 160, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 15, color: '#888' }}>暂无留言</Text>
        </View>
      )
    }
    return (
      <View>
        <TicketMesgsView
          title={'留言'}
          logs={this.state.dataSource}
          privilegeCode='TicketExecutePrivilegeCode'
          showAdd={this._canShowAdd()}
          isFetching={this.props.isFetching}
          onRefresh={() => this._loadLogs()}
          emptyText=''
          swipable={this.props.isFromTicketDetail ? false : true}
          isEdit={this.props.isEdit}
          createLog={() => this._gotoEdit()}
          onRowClick={(log) => { if (!this.props.isFromTicketDetail) this._gotoEdit(log) }}
          onRowLongPress={(log) => this._delete(log)}
          onRowDeleteAuth={(log) => this._onRowDeleteAuth(log)}
          onBack={() => this.props.navigation.pop()} />
      </View>
    );
  }
}

TicketMesgs.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  deleteMessage: PropTypes.func,
  saveMessage: PropTypes.func,
  loadTicketMsgs: PropTypes.func,
  setMessageToRead: PropTypes.func,
  ticketId: PropTypes.number,
  hasAuth: PropTypes.bool,
  logs: PropTypes.object,//immutable
  canEdit: PropTypes.bool,
  isFromTicketDetail: PropTypes.number,
}

function mapStateToProps(state, ownProps) {
  var id = ownProps.ticketId;
  var logList = state.ticket.msgList;
  var logs = null;
  // console.warn('ticketId',logList.get('ticketId'),id,privilegeHelper.hasAuth('TicketEditPrivilegeCode'),logList);
  if (logList.get('ticketId') === id) {
    logs = logList.get('data');
  }
  return {
    user: state.user.get('user'),
    logs,
    isFetching: logList.get('isFetching'),
    hasAuth: privilegeHelper.hasAuth('TicketExecutePrivilegeCode'),
  };
}

export default connect(mapStateToProps, { deleteMessage, saveMessage, loadTicketMsgs, setMessageToRead, setTicketMsgsCount })(TicketMesgs);
