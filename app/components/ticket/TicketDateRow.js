'use strict'

import React,{Component} from 'react';

import {
  View,
  Platform,
  StyleSheet,
  DatePickerAndroid,
  DatePickerIOS
} from 'react-native';
import PropTypes from 'prop-types';

import {LINE} from '../../styles/color.js';
import SimpleRow from '../assets/SimpleRow.js';
import moment from 'moment';

export default class TicketDateRow extends Component{
  constructor(props){
    super(props);
  }
  _getDatePicker(){
    if(Platform.OS === 'ios' && this.props.openDatePicker){

      // var row = this.props.data[this.state.currentRow];
      // var type = row.get('type');
      var value = this.props.rowData.get('value') || undefined;
      var date = moment(value);

      return (
        <DatePickerIOS style={{borderTopWidth:1,borderColor:LINE}} date={date.toDate()} mode="date"
          onDateChange={(date1)=>{
              this.props.onDateChanged(date1);
            }} />
      );
    }
    return null;
  }
  async _showPicker() {
    if(Platform.OS === 'android'){
      try {
        var value = this.props.rowData.get('value') || undefined;
        var date = moment(value);
        var options = {date:date.toDate()}
        var {action, year, month, day} = await DatePickerAndroid.open(options);
        // console.warn('date',year,month,day);
        if (action !== DatePickerAndroid.dismissedAction) {
          var date = moment({year,month,day,hour:8});//from timezone
          // console.warn('moment',date);
          this.props.onDateChanged(date.toDate());
        }

      } catch ({code, message}) {
        // console.warn(`Error in example '${stateKey}': `, message);
      }
    }

  }
  componentWillReceiveProps(nextProps) {
    // if(nextProps.openDatePicker){
    //   this._showPicker({date:nextProps.date});
    // }

  }
  render(){
    var {rowData} = this.props;
    return (
      //<View style={{flex:1,backgroundColor:'white'}}>
      //for fix bug 14370
      <View style={{backgroundColor:'white'}}>
        <SimpleRow rowData={rowData} onRowClick={(rowData)=>{
            this._showPicker();
            this.props.onRowClick(rowData)
          }}/>
        {this._getDatePicker()}
      </View>
    );
  }
}


TicketDateRow.propTypes = {
  onDateChanged:PropTypes.func.isRequired,
  onRowClick:PropTypes.func.isRequired,
  openDatePicker:PropTypes.bool.isRequired,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({

});
