'use strict'

import React,{Component} from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import {BLACK,ASSET_IMG_BORDER} from '../../styles/color';
import moment from 'moment';

export default class TendingRow extends Component{
  constructor(props){
    super(props);
  }
  _getTicketType(type)
  {
    var ticketTypes=['','计划工单','报警工单','随工工单','现场工单','方案工单','巡检工单'];
    return ticketTypes[type];
  }

  _getDateDisplay(mStart,mEnd){
    console.warn(mStart,mEnd)
    // let mStart=moment(this.props.rowData.get('StartTime'));
    // let mEnd=moment(this.props.rowData.get('EndTime'));
    let showHour=false;
    let isSameDay=false;
    //判断是否要显示小数
    if(mStart.hours()>0||mStart.minutes()>0||mEnd.hours()>0||mEnd.minutes()>0){
      //需要显示的格式带小数
      showHour=true;
      if(mStart.format('HH:mm')==='00:00' && mEnd.format('HH:mm')==='23:59'){
        showHour=false;
      }
    }
    //判断开始结束日期是否同一天
    // if(mStart.format('YYYY-MM-DD') === mEnd.format('YYYY-MM-DD')){
    //   isSameDay=true;
    // }
    if(isSameDay&&showHour){//同一天，显示小时
      return `${mStart.format('YYYY-MM-DD HH:mm')}至${mEnd.format('HH:mm')}`;
    }else if(showHour){//不是同一天，要显示小时
      return `${mStart.format('YYYY-MM-DD HH:mm')} 至 ${mEnd.format('YYYY-MM-DD HH:mm')}`;
    }else{//不显示小时
      return `${mStart.format('YYYY-MM-DD')} 至 ${mEnd.format('YYYY-MM-DD')}`;
    }
  }

  _getContentImageView(){
    var {rowData} = this.props;
    let unDone=this.props.unDone;//rowData.get('unDone');
    var startTime = moment(rowData.get(unDone?'StartTime':'ActualStartTime'));//.format("YYYY-MM-DD");
    var endTime = moment(rowData.get(unDone?'EndTime':'ActualEndTime'));//.format("YYYY-MM-DD");
    var content = rowData.get('Content') || '';
    content=content.split('\n').join(' ');
    if(rowData.get('TicketType')===6){
      content='详见作业程序';
    }
    return (
      <View style={[styles.row,styles.rowHeight,{flexDirection:'row',justifyContent:'space-between'}]}>
        <View style={{flex:1,marginTop:16}}>
          <Text style={styles.nameText} numberOfLines={1} lineBreakModel='charWrapping'>
            {this._getDateDisplay(startTime,endTime)}
          </Text>
          <Text style={styles.contentText} numberOfLines={1} lineBreakModel='charWrapping'>{`${this._getTicketType(rowData.get('TicketType'))}: ${content}`}
          </Text>
        </View>
      </View>
    )
  }
  render(){
    var {rowData} = this.props;
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <TouchFeedback onPress={()=>this.props.onRowClick(rowData)}>
          {this._getContentImageView()}
        </TouchFeedback>
      </View>
    );
  }
}

TendingRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:74
  },
  row:{
    backgroundColor:'white',
    paddingHorizontal:16,
  },
  titleRow:{
    flexDirection:'row',
    // backgroundColor:'red',
    alignItems:'flex-start',
    justifyContent:'space-between',
  },
  nameText:{
    color:BLACK,
    fontSize:17
  },
  contentText:{
    color:BLACK,
    fontSize:12,
    marginTop:13
  },
});
