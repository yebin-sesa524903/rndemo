
'use strict';
import React, { Component } from 'react';
import {
  Alert,

  InteractionManager,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import TicketMessageLogView from '../../components/ticket/TicketMessageLog.js';
import TicketLog from './TicketLog.js';
import TicketMesgs from './TicketMesgs.js';
import TicketMsgEdit from './TicketMsgEdit';
import privilegeHelper from '../../utils/privilegeHelper.js';
import trackApi from '../../utils/trackApi.js';
import { saveMessage, } from '../../actions/ticketAction.js';
import { Navigator } from 'react-native-deprecated-custom-components';

class TicketMessageLog extends Component {
  constructor(props) {
    super(props);
  }
  // _loadLogs(){
  //   this.props.loadTicketLogs(this.props.ticketId);
  // }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    // console.warn('didmount');
    // InteractionManager.runAfterInteractions(() => {
    //   // console.warn('loadTicketLogs');
    //   this._loadLogs();
    // });

  }
  componentWillReceiveProps(nextProps) {
    // console.warn('componentWillReceiveProps',this.props.logs,nextProps.logs);
    // if(this.props.logs && !nextProps.logs){
    //   //this is a hack for following senario
    //   //when back from edit page
    //   //sometimes list is empty
    //   //but when _loadLogs included in runAfterInteractions it is fixed
    //   InteractionManager.runAfterInteractions(() => {
    //     this._loadLogs();
    //   });
    //   return ;
    // }
    // if((nextProps.logs && nextProps.logs !== this.props.logs) ||
    // (this.props.logs&&nextProps.logs===this.props.logs && this.props.logs.size===0)){
    //   InteractionManager.runAfterInteractions(() => {
    //     this.setState({dataSource:this.ds.cloneWithRows(nextProps.logs.toArray())});
    //   });
    // }
  }
  _onRefresh() {
    var type = this._getCurrentType();
    // console.warn('onRefresh...',type);
    if (type === 'infoData') {
    }
    else if (type === 'realtimeData') {
    }
    else if (type === 'runtimeData') {
    } else if (type === 'dashboardData') {
    } else if (type === 'allHierarchys') {
    }
  }
  _onBackClick() {
    this.props.navigation.pop();
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  _getCurrentContentView() {
    var component = <TicketMesgs navigator={this.props.navigator} route={this.props.route}
      canEdit={this.props.canEdit}
      ticketId={
        this.props.ticketId
        // Immutable.fromJS({'Id':321269,'Name':'层级树状图'})
      } />;
    return component;
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
    // if(!this.props.canEdit){
    //   Alert.alert('','仅执行中的工单可以编辑这一留言');
    //   return false;
    // }
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
  _canShowAdd() {
    if (!privilegeHelper.hasAuth('TicketEditPrivilegeCode') || !privilegeHelper.hasAuth('TicketExecutePrivilegeCode')) {
      return false;
    }
    return this.props.canEdit;
  }
  render() {
    // TicketEditPrivilegeCode====>TicketExecutePrivilegeCode
    return (
      <TicketMessageLogView
        title={'全部留言'}
        onBack={() => this._onBackClick()}
        ticketId={this.props.ticketId}
        isFagdType={this.props.isFagdType}
        isReadMessage={this.props.isReadMessage}
        privilegeCode={'TicketExecutePrivilegeCode'}
        createLog={() => this._gotoEdit()}
        showAdd={this._canShowAdd()}
        contentView={this._getCurrentContentView()}
      >
      </TicketMessageLogView>
    );
  }
}

TicketMessageLog.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  ticketId: PropTypes.number,
  canEdit: PropTypes.bool,
  isFagdType: PropTypes.bool,
  isReadMessage: PropTypes.bool,
  saveMessage: PropTypes.func,
  // isFetching:PropTypes.bool,
  // deleteLog:PropTypes.func,
  // saveLog:PropTypes.func,
  // loadTicketLogs:PropTypes.func,
  hasAuth: PropTypes.bool,
  // logs:PropTypes.object,//immutable
}

function mapStateToProps(state, ownProps) {
  var id = ownProps.ticketId;
  // var logList = state.ticket.logList;
  // var logs = null;
  // // console.warn('ticketId',logList.get('ticketId'),id,privilegeHelper.hasAuth('TicketEditPrivilegeCode'),logList);
  // if(logList.get('ticketId') === id){
  //   logs = logList.get('data');
  // }
  return {
    user: state.user.get('user'),
    // logs,
    // isFetching:logList.get('isFetching'),
    hasAuth: privilegeHelper.hasAuth('TicketExecutePrivilegeCode'),
  };
}

export default connect(mapStateToProps, { saveMessage, })(TicketMessageLog);
