
'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import DeviceParameterView from '../../components/assets/DeviceParameterView';
import trackApi from '../../utils/trackApi.js';

class DeviceParameter extends Component {
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
      <DeviceParameterView
        data={this.props.data.toArray()}
        onBack={() => { this.props.navigation.pop() }}
        title={this.props.title}
        onRowClick={this.props.onRowClick}
      />
    );
  }
}
DeviceParameter.propTypes = {
  navigator: PropTypes.object,
  data: PropTypes.object,
  route: PropTypes.object,
  title: PropTypes.string.isRequired,
  onRowClick: PropTypes.func.isRequired,
}

function mapStateToProps(state, ownProps) {
  return {

  };
}

export default connect(mapStateToProps, {})(DeviceParameter);
