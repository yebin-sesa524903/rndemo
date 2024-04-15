
'use strict';
import React, { Component } from 'react';
import {
  Alert,

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import TendingView from '../../components/assets/TendingView.js';
import TicketDetail from '../ticket/TicketDetail.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import { loadTendingHistory, loadTicketingList } from '../../actions/assetsAction.js';
import trackApi from '../../utils/trackApi.js';

class TendingHistory extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { dataSource: null, currentPage: 1 };
  }
  _loadTendHistory(currentPage) {
    // if(this.props.showTicketing){

    let status = [];
    let sort = [];
    if (this.props.showTicketing) {
      status = [1, 2, 4, 6, 7, 9];
      sort = {
        // "TicketStatus/5": "ASC",
        "StartTime": "ASC",
        "EndTime": "ASC"
      }
    } else {
      status = [3];
      sort = {
        "ActualEndTime": "DESC",
        "ActualStartTime": "DESC"
      }
    }
    //显示进行中的工单
    this.props.loadTicketingList({
      CustomerId: this.props.CustomerId,
      TicketStatus: status,
      CurrentPage: currentPage,
      ItemsPerPage: 20,
      AssetId: this.props.hierarchyId,
      hierarchyId: this.props.hierarchyId,
      Sort: sort
    })
    // }else {
    //   this.props.loadTendingHistory(this.props.hierarchyId);
    // }
  }

  _nextPage() {
    this.setState({
      currentPage: this.state.currentPage + 1
    }, () => {
      this._loadTendHistory(this.state.currentPage);
    })
  }

  _gotoDetail(data) {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_detail',
      component: TicketDetail,
      passProps: {
        onPostingCallback: (type) => {
          this._loadTendHistory();
          if (this.props.onRefresh) {
            this.props.onRefresh();
          }
        },
        ticketId: String(data.get('Id')),
        fromHex: false,
        fromFilterResult: false,
        isFutureTask: false,
      },
    });
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._loadTendHistory(1);
    });

  }
  componentWillReceiveProps(nextProps) {
    if (this.props.tickets && !nextProps.tickets) {
      InteractionManager.runAfterInteractions(() => {
        this._loadTendHistory(1);
      });
      return;
    }
    if (nextProps.tickets && nextProps.tickets !== this.props.tickets ||
      (this.props.tickets && nextProps.tickets === this.props.tickets && this.props.tickets.size === 0)) {
      InteractionManager.runAfterInteractions(() => {
        this.setState({ dataSource: this.ds.cloneWithRows(nextProps.tickets.toArray()) });
      });
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <TendingView
        unDone={this.props.showTicketing}
        title={this.props.title}
        tickets={this.state.dataSource}
        isFetching={this.props.isFetching}
        emptyText={this.props.emptyText}
        onRefresh={() => this._loadTendHistory(1)}
        nextPage={() => this._nextPage()}
        totalPage={this.props.pageCount}
        currentPage={this.state.currentPage}
        onRowClick={(rowData) => this._gotoDetail(rowData)}
        onBack={() => this.props.navigation.pop()} />
    );
  }
}

TendingHistory.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  loadTendingHistory: PropTypes.func,
  hierarchyId: PropTypes.number,
  tickets: PropTypes.object,//immutable
}


function mapStateToProps(state, ownProps) {
  var id = ownProps.hierarchyId;
  var assetTickets = state.asset.assetTickets;
  var tickets = null;
  // console.warn('ticketId',id);
  if (assetTickets.get('hierarchyId') === id) {
    tickets = assetTickets.get('data');
  }
  // console.warn('tickets',tickets);
  return {
    user: state.user.get('user'),
    tickets,
    pageCount: assetTickets.get('pageCount'),
    isFetching: assetTickets.get('isFetching')
  };
}

export default connect(mapStateToProps, { loadTendingHistory, loadTicketingList })(TendingHistory);
