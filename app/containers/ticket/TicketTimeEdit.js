
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import TicketDateEditView from '../../components/ticket/TicketDateEditView';
import trackApi from '../../utils/trackApi.js';

class TicketTimeEdit extends Component {
  constructor(props) {
    super(props);
    this.state = { data: this.props.data };
  }


  _dateChanged(type, date) {
    this.props.onSelectDate(type, date);
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
    // var rowsData = nextProps.data;
    // console.warn('TicketTimeEdit componentWillReceiveProps', nextProps.data);
    // if(this.props.data !== rowsData && rowsData && rowsData.size >= 1){
    // InteractionManager.runAfterInteractions(()=>{
    //   this.setState({data:rowsData});
    // });
    // console.warn('TicketTimeEdit componentWillReceiveProps', nextProps.data);
    // }
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <TicketDateEditView
        data={this.props.data.toArray()}
        onBack={() => { this.props.navigation.pop() }}
        onDateChanged={(type, date) => this._dateChanged(type, date)}
      />
    );
  }
}
TicketTimeEdit.propTypes = {
  navigator: PropTypes.object,
  data: PropTypes.object,
  route: PropTypes.object,
  onSelectDate: PropTypes.func.isRequired,
}

function mapStateToProps(state, ownProps) {
  var ticketCreate = state.ticket.ticketCreate,
    rowsData = ticketCreate.get('data');
  var data = rowsData.getIn([0, 3, 'arrDatas']);
  // console.warn('TicketTimeEdit', data);
  return {
    data
  };
}

export default connect(mapStateToProps, {})(TicketTimeEdit);
