'use strict'

import React,{Component} from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';
// import Text from '../Text';
import TouchFeedback from '../TouchFeedback';

export default class DatePicker extends Component{
  constructor(props){
    super(props);
  }
  render(){
    var {rowData} = this.props;
    return (
      <TouchFeedback onPress={()=>this.props.onRowClick(rowData)}>
        <View style={[styles.row,styles.rowHeight]}>
          <View style={styles.rowLeft}>
            {this._getCustomer(rowData)}
          </View>
        </View>
      </TouchFeedback>
    );
  }
}

DatePicker.propTypes = {
  onDateChoice:PropTypes.func.isRequired,
  rowData:PropTypes.any
}
