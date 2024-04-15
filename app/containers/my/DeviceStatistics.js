
'use strict';
import React, { Component } from 'react';

import {
  InteractionManager,
  // Alert,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import DeviceStatisticsView from '../../components/my/DeviceStatistics';
import Immutable from 'immutable';
import { loadStatistics, resetStatistics } from '../../actions/myAction.js';

import trackApi from '../../utils/trackApi.js';
import Exchange from './Exchange.js';

class DeviceStatistics extends Component {
  constructor(props) {
    super(props);
    // console.warn('props',this.props.rowData);
  }
  _gotoExchange() {
    this.props.navigation.push('PageWarpper', {
      id: 'exchange',
      component: Exchange,
      passProps: {
        userId: this.props.user.get('id'),
      }
    });
  }
  _loadStatistics() {
    this.props.loadStatistics();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.rowData) {
        this._loadStatistics();
      }
    });
  }
  componentWillReceiveProps(nextProps) {
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    this.props.resetStatistics();

  }
  render() {
    return (
      <DeviceStatisticsView
        isFetching={this.props.isFetching}
        rowData={this.props.rowData}
        gotoExchange={() => this._gotoExchange()}
        onBack={() => {
          this.props.navigation.pop();
        }}
      />
    );
  }
}

DeviceStatistics.propTypes = {
  navigator: PropTypes.object,
  isFetching: PropTypes.bool,
  route: PropTypes.object,
  loadStatistics: PropTypes.func,
  resetStatistics: PropTypes.func,
  user: PropTypes.object,
  rowData: PropTypes.object,//immutable
}


function mapStateToProps(state, ownProps) {
  var rowData = null;
  var customerId = 0;
  var customerName = '';
  var objData = state.statistics.get('data');
  var isFetching = state.statistics.get('isFetching');
  if (objData) {
    rowData = objData;
  }
  return {
    user: state.user.get('user'),
    rowData,
    isFetching,
    customerId,
    customerName
  };
}

export default connect(mapStateToProps, { loadStatistics, resetStatistics })(DeviceStatistics);
