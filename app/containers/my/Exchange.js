
'use strict';

import React, { Component } from 'react';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import ExchangeView from '../../components/my/Exchange.js';
import PropTypes from 'prop-types';
import trackApi from '../../utils/trackApi.js';

class Exchange extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    backHelper.init(this.props.navigator, 'exchange');
    trackApi.onPageBegin('exchange');
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    backHelper.destroy('exchange');
    trackApi.onPageEnd('exchange');
  }
  render() {
    return (
      <ExchangeView user={this.props.user} onBack={() => this.props.navigation.pop()} />
    );
  }
}

Exchange.propTypes = {
  navigator: PropTypes.object,
  user: PropTypes.object,
}


function mapStateToProps(state) {
  var user = state.user.get('user');
  return {
    user,
  };
}

export default connect(mapStateToProps, {})(Exchange);
