
'use strict';

import React, { Component } from 'react';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import QRCodeView from '../../components/my/QRCode.js';
import PropTypes from 'prop-types';
import trackApi from '../../utils/trackApi.js';

class QRCode extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    backHelper.init(this.props.navigator, 'qrcode');
    trackApi.onPageBegin('qrcode');
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    backHelper.destroy('qrcode');
    trackApi.onPageEnd('qrcode');
  }
  render() {
    return (
      <QRCodeView onBack={() => this.props.navigation.pop()} />
    );
  }
}

QRCode.propTypes = {
  navigator: PropTypes.object,
}


function mapStateToProps(state) {
  return {

  };
}

export default connect(mapStateToProps, {})(QRCode);
