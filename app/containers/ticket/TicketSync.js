
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import trackApi from '../../utils/trackApi.js';

import TicketSyncView from '../../components/ticket/TicketSyncView';
import { syncTicketById, checkTicketById, retrySync, coverSync, giveUpSync } from '../../actions/syncAction';
import { getUnSyncTickets, getTicketFromCache, getServiceTicketFromCache } from '../../utils/sqliteHelper';

class TicketSync extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = { data: [] }
  }

  async _loadUnSyncTicket() {
    if (isConnected()) {
      let wating = this.props.sync.get('waitingSyncTickets');
      let ticketIds = wating.filter(item => item.get('isService') === false).map(item => item.get('id')).join(',');
      let tickets = await getTicketFromCache(ticketIds, true) || [];
      tickets.forEach(item => {
        item.syncStatus = 0;
        //更新状态
        let index = wating.findIndex(item2 => item2.get('id') === item.Id && item2.get('isService') === false);
        if (index >= 0) {
          let status = wating.getIn([index, 'status']);
          if (!status) status = 0;
          if (status === -1) status = 1;
          item.syncStatus = status;
          item.isService = false;
        }
      });
      ticketIds = wating.filter(item => item.get('isService') === true).map(item => item.get('id')).join(',');
      let tickets2 = await getServiceTicketFromCache(ticketIds) || [];
      tickets2.forEach(item => {
        item.syncStatus = 0;
        //更新状态
        let index = wating.findIndex(item2 => item2.get('id') === item.Id && item2.get('isService') === true);
        if (index >= 0) {
          let status = wating.getIn([index, 'status']);
          if (!status) status = 0;
          if (status === -1) status = 1;
          item.syncStatus = status;
          item.isService = true;
        }
      });
      tickets = tickets.concat(tickets2);
      this.setState({ data: tickets });
    } else {
    }
  }

  async _update(nextProps) {
    if (!isConnected()) {
      let tickets = this.state.data;
      tickets.forEach(item => {
        item.syncStatus = 0;
      });
      this.setState({ data: [].concat(tickets) });
    } else {
      let wating = nextProps.sync.get('waitingSyncTickets');
      let tickets = this.state.data;
      tickets.forEach(item => {
        item.syncStatus = 0;
        //更新状态
        let index = wating.findIndex(item2 => item2.get('id') === item.Id && item2.get('isService') === item.isService);
        if (index >= 0) {
          let status = wating.getIn([index, 'status']);
          if (!status) status = 0;
          if (status === -1) status = 1;
          item.syncStatus = status;
        } else {
          item.syncStatus = -1;//表示不显示此条
        }
      });
      this.setState({ data: [].concat(tickets) });
    }
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    this._loadUnSyncTicket();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.sync.get('waitingSyncTickets') !== this.props.sync.get('waitingSyncTickets')) {
      this._update(nextProps);
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  //重试
  _onRetry(id, isService) {
    this.props.retrySync(id, isService);
  }
  //覆盖提交
  _onCover(id, isService) {
    this.props.coverSync(id, isService);
  }

  //更新修改
  _onGiveUp(id, isService) {
    this.props.giveUpSync(id, isService);
  }

  render() {
    return (
      <TicketSyncView
        onRetry={(id, isService) => this._onRetry(id, isService)}
        onCover={(id, isService) => this._onCover(id, isService)}
        onGiveUp={(id, isService) => this._onGiveUp(id, isService)}
        data={this.state.data}
        onBack={() => this.props.navigation.pop()}
      />
    );
  }
}

TicketSync.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  title: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  return {
    sync: state.sync
  };
}

export default connect(mapStateToProps, {
  syncTicketById, checkTicketById,
  giveUpSync, retrySync, coverSync
})(TicketSync);
