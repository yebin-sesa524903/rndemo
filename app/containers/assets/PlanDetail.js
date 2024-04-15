
'use strict';
import React, { Component } from 'react';
import { InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import { loadPlanningDetail } from '../../actions/assetsAction';
import PlanDetailView from '../../components/assets/PlanDetailView';

import trackApi from '../../utils/trackApi';
import backHelper from '../../utils/backHelper';
import Immutable from 'immutable';
import CreateTicket from '../ticket/CreateTicket';
import TicketDetail from '../ticket/TicketDetail';

export class PlanDetail extends Component {
  constructor(props) {
    super(props);
    this.state = { toolbarOpacity: 0, showToolbar: false, forceStoped: false };
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    //加入详情
    this.props.loadPlanningDetail(this.props.pid);
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _createPlanTicekt(task) {
    console.warn('task', task);
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_create',
      component: CreateTicket,
      passProps: {
        customer: Immutable.fromJS({
          'CustomerId': this.props.rowData.get('CustomerId'),
          'CustomerName': this.props.rowData.get('CustomerName'),//this.props.customerName,
        }),
        startTime: task.get('PlanDateTime'),
        MaintainTaskId: task.get('Id'),
        plan: this.props.rowData,
        ticketInfo: null,
        onPostingCallback: (type) => {
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.pop();
          });
          this.props.loadPlanningDetail(this.props.pid);
        },
      }
    });
  }

  _gotoTicket(ticketId) {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_detail',
      component: TicketDetail,
      passProps: {
        ticketId: String(ticketId),
        onPostingCallback: (type) => { },
      }
    });
  }

  render() {
    return (
      <PlanDetailView
        isFetching={this.props.isFetching}
        rowData={this.props.rowData}
        createTicket={(taskId) => this._createPlanTicekt(taskId)}
        gotoTicket={(ticketId) => this._gotoTicket(ticketId)}
        onBack={() => this.props.navigation.pop()}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  let plan = state.asset.plans;
  return {
    isFetching: plan.get('isFetchingDetail'),
    rowData: plan.get('planDetail')
  }
}

export default connect(mapStateToProps, { loadPlanningDetail })(PlanDetail);
