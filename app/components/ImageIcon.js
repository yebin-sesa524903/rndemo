'use strict'
import React, { Component, } from 'react';


import { Text, Image } from 'react-native';
import PropTypes from 'prop-types';



export default class ImageIcon extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    var { style, size, type, color } = this.props;

    var styles = [style, { backgroundColor: 'transparent', fontFamily: 'fontcustom', fontSize: size, color }];
    let source = '';
    switch (type) {
      case 'icon_state':
        source = require('../images/aaxiot/board/zjzt.png');
        break;
      case 'ticket_processing':
        source = require('../images/aaxiot/board/zjzt.png');
        break;
    }
    return <Image
      source={source} width={size} height={size} />;
  }
}

ImageIcon.propTypes = {
  type: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  style: PropTypes.any
};
