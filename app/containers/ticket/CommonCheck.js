
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import CommonCheckView from '../../components/ticket/CommonCheckView';
import trackApi from '../../utils/trackApi.js';

class CommonCheck extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  render() {
    return (
      <CommonCheckView
        data={this.props.data.toArray()}
        onBack={() => { this.props.navigation.pop() }}
        title={this.props.title}
        onRowClick={this.props.onRowClick}
      />
    );
  }
}
CommonCheck.propTypes = {
  navigator: PropTypes.object,
  data: PropTypes.object,
  route: PropTypes.object,
  title: PropTypes.string.isRequired,
  onRowClick: PropTypes.func.isRequired,
}

function mapStateToProps(state, ownProps) {
  var ticketCreate = state.ticket.ticketCreate,
    rowsData = ticketCreate.get('data');
  var data = rowsData.getIn([0, 1, 'arrDatas']);
  return {
    data
  };
}

export default connect(mapStateToProps, {})(CommonCheck);
