'use strict'

import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  DatePickerAndroid,
  DatePickerIOS
} from 'react-native';
import PropTypes from 'prop-types';
// import Icon from '../Icon.js';
import {BLACK,GRAY,GREEN,LIST_BG,CHART_RED,LINE_HISTORY,LINE,LOGIN_GREEN_DISABLED} from '../../styles/color';
import List from '../List.js';
import SimpleRow from './SimpleRow.js';
import Section from '../Section.js';
import Button from '../Button';
import Text from '../Text';
import DashCardView from './DashCardView.js';
import Toast from 'react-native-root-toast';
import moment from 'moment';

export default class DeviceDashboardView extends Component{
  constructor(props){
    super(props);
    this.state = {currSelect:null,openDatePicker:false};
  }
  _getDatePicker(){
    if(Platform.OS === 'ios' && this.state.openDatePicker){
      var value = this.props.dashboardDatas.get('filter').get('StartTime');
      if (this.state.currSelect==='EndTime') {
        value = this.props.dashboardDatas.get('filter').get('EndTime');
      }
      var date = moment(value);
      return (
        <DatePickerIOS style={{borderTopWidth:1,borderColor:LINE,backgroundColor:'white'}} date={date.toDate()} mode="date"
          onDateChange={(date1)=>{
              // console.warn('DatePickerIOS...',date1);
              this.props.onDateChanged(this.state.currSelect,date1);
            }} />
      );
    }
    return null;
  }
  async _showPicker(type) {
    if(Platform.OS === 'android'){
      try {
        var value = this.props.dashboardDatas.get('filter').get('StartTime');
        if (type==='EndTime') {
          value = this.props.dashboardDatas.get('filter').get('EndTime');
        }
        var date = moment(value);
        var options = {date:date.toDate()}
        var {action, year, month, day} = await DatePickerAndroid.open(options);
        // console.warn('date',year,month,day);

        if (action !== DatePickerAndroid.dismissedAction) {
          var date = moment({year,month,day,hour:8});//from timezone
          // console.warn('moment',date);
          this.props.onDateChanged(this.state.currSelect,date.toDate());
        }

        this.setState({openDatePicker:!this.state.openDatePicker});

      } catch ({code, message}) {
        // console.warn(`Error in example '${stateKey}': `, message);
      }
    }
  }
  _getTopbar()
  {
    var normalColor=LINE_HISTORY;
    var errColor=CHART_RED;
    var startBorderColor=errColor;
    var startTextColor=errColor;
    var endBorderColor=errColor;
    var endTextColor=errColor;

    var startTime=this.props.dashboardDatas.get('filter').get('StartTime');
    var endTime=this.props.dashboardDatas.get('filter').get('EndTime');
    var mST=moment(startTime);
    var mNextYearStartTime=moment(startTime).add(1,'years');
    var mET=moment(endTime);
    var btnSearchEnable=false;
    // console.warn('_getTopbar',this.state.openDatePicker,this.state.currSelect,endTime);
    if (this.state.openDatePicker) {
      if (this.state.currSelect==='StartTime') {
        startBorderColor=GREEN;
        startTextColor=normalColor;
        endBorderColor='transparent';
        endTextColor=normalColor;
      }else if (this.state.currSelect==='EndTime') {
        startBorderColor='transparent';
        startTextColor=normalColor;
        endBorderColor=GREEN;
        endTextColor=normalColor;
      }
    }else {
      if (this.state.currSelect==='StartTime') {
        startBorderColor=errColor;
        startTextColor=errColor;
        endBorderColor='transparent';
        endTextColor=normalColor;
      }else if (this.state.currSelect==='EndTime') {
        startBorderColor='transparent';
        startTextColor=normalColor;
        endBorderColor=errColor;
        endTextColor=errColor;
      }
      if (!this.state.openDatePicker) {
        var toastText=null;
        if(startTime > endTime){
          toastText='结束时间不能小于开始的时间';
        }else if(mNextYearStartTime<mET){
          toastText='时间选择范围不能超过一年';
        }else if(mST>moment()||mET>moment()){
          toastText='不能选择未来日期';
        }else {
          btnSearchEnable=true;
          startBorderColor='transparent';
          startTextColor=normalColor;
          endBorderColor='transparent';
          endTextColor=normalColor;
        }
        if (toastText) {
          Toast.show(toastText, {
              duration: 2000,
              position: Toast.positions.BOTTOM,
          });
        }
      }
    }
    return (
      <View style={{height:70,flexDirection:'row',alignItems:'center'}}>
        <Button
          style={[styles.buttonSelect,styles.buttonSelectStart,{borderColor:startBorderColor}]}
          textStyle={{
            fontSize:13,
            color:startTextColor
          }}
          text={startTime} onClick={() =>{
            this.setState({currSelect:'StartTime',openDatePicker:!this.state.openDatePicker});
            this._showPicker('StartTime');
          }} />
        <View style={{alignItems:'center',width:12}}>
          <Text style={{}}>
            {'-'}
          </Text>
        </View>
        <Button
          style={[styles.buttonSelect,{borderColor:endBorderColor}]}
          textStyle={{
            fontSize:13,
            color:endTextColor
          }}
          text={endTime} onClick={() => {
            this.setState({currSelect:'EndTime',openDatePicker:!this.state.openDatePicker});
            this._showPicker('EndTime');
          }} />
        <View style={{flex:1,margin:8,alignItems:'flex-end',}}>
          <Button
            style={[styles.buttonSearch,{backgroundColor:GREEN,}]}
            textStyle={{
              fontSize:15,
              color:'white'
            }}
            disabled={!btnSearchEnable}
            disabledStyle={[styles.buttonSearch,{backgroundColor:GRAY}]}

            text='查看' onClick={() => {
              if (!btnSearchEnable) {
                return;
              }
              this.props.onSearch();
              this.setState({openDatePicker:false});
            }} />
        </View>

      </View>
    );
  }
  render(){
    var navHeight=64,segBkgHeight=60,toolbarHeight=70;
    var {width,height} = Dimensions.get('window');
    var boxWidth=(width-8*3)/2.0;
    var boxHeight=(height-navHeight-segBkgHeight-toolbarHeight-8*3)/3.0;
    var boxBkgColor='white';
    var boxDash={
      height:boxHeight,width:boxWidth,backgroundColor:boxBkgColor,marginBottom:8,borderWidth:1,borderRadius:5,borderColor:boxBkgColor,
    };

    var arrLeftDash=[];
    var arrRightDash=[];
    var arrDashDatas=this.props.dashboardDatas.get('arrDashDatas');
    // console.warn('arrDashDatas',arrDashDatas);
    arrDashDatas.forEach((item,index)=>{
      var name=item.get('Name');
      var isFetching=item.get('isFetching');
      if (isFetching==='undefined') {
        isFetching=true;
      }
      var value=String(item.get('Value'));
      var unit=item.get('Unit');
      if (index%2===0) {
        arrLeftDash.push(
          <DashCardView key={'DaCa'+index} style={boxDash} title={name} isFetching={isFetching} value={value} unit={unit}>
          </DashCardView>
        )
      }else {
        arrRightDash.push(
          <DashCardView key={'DaCa'+index} style={boxDash} title={name} isFetching={isFetching} value={value} unit={unit}>
          </DashCardView>
        );
      }
    });
    // console.warn('render...',this.state.openDatePicker,this.state.currSelect);
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}}>
        {this._getTopbar()}
        <View style={{flex:1,flexDirection:'row'}}>
          <View style={[styles.wrapper,{paddingLeft:8}]}>
            {arrLeftDash}
          </View>
          <View style={[styles.wrapper,]}>
            {arrRightDash}
          </View>
        </View>
        {this._getDatePicker()}
      </View>
    )
  }
}

DeviceDashboardView.propTypes = {
  dashboardDatas:PropTypes.object.isRequired,
  onSearch:PropTypes.func,
  onDateChanged:PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
  },
  wrapper:{
    flex:1,
    // backgroundColor:'green',
  },
  buttonSelect:{
    backgroundColor:'#e5e5e5',
    height:38,
    width:100,
    // marginRight:16,
    borderRadius:6,
    borderWidth:1,
  },
  buttonSelectStart:{
    marginLeft:8,
  },
  buttonSearch:{
    // backgroundColor:GREEN,
    height:38,
    width:83,
    // marginLeft:11,

    borderRadius:6,
  },
});
