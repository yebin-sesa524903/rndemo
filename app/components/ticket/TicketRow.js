'use strict'

import React,{Component} from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
// import TouchFeedback from '../TouchFeedback';
import ClickableRow from '../ClickableRow.js';
import Icon from '../Icon.js';
import {GRAY,BLACK,ALARM_RED} from '../../styles/color';
import moment from 'moment';
import TouchFeedback from "../TouchFeedback";

import {Icon as Icon2} from '@ant-design/react-native';
import {Urgency} from "./service/widget";
const TICKET_TYPE=['','计划工单','报警工单','随工工单','现场工单','方案工单','巡检工单'];

export default class TicketRow extends Component{
  constructor(props){
    super(props);
  }
  _getTime(){
    var {rowData} = this.props;
    return moment(rowData.get('StartTime')).format('MM-DD')+'至'+moment(rowData.get('EndTime')).format('MM-DD');
  }

  _getDateDisplay(){
    let mStart=moment(this.props.rowData.get('StartTime'));
    let mEnd=moment(this.props.rowData.get('EndTime'));
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
    if(mStart.format('YYYY-MM-DD') === mEnd.format('YYYY-MM-DD')){
      isSameDay=true;
    }
    if(isSameDay&&showHour){//同一天，显示小时
      return `${mStart.format('MM-DD HH:mm')}至${mEnd.format('HH:mm')}`;
    }else if(showHour){//不是同一天，要显示小时
      return `${mStart.format('MM-DD HH:mm')}至${mEnd.format('MM-DD HH:mm')}`;
    }else{//不显示小时
      return `${mStart.format('MM-DD')} 至 ${mEnd.format('MM-DD')}`;
    }
  }

  _getContent(){
    var {rowData} = this.props;
    let status=rowData.get('TicketType');
    if(status===6){
      return '详见作业程序';
    }
    var content = rowData.get('Content')||'';
    var strContent = '';
    content.split('\n').forEach((item)=>{
      strContent+=item;
      strContent+=' ';
    });
    return strContent;
  }
  _newText(){
    var {rowData} = this.props;
    var startTime = moment(rowData.get('StartTime')).format('YYYY-MM-DD');
    var endTime = moment(rowData.get('EndTime')).format('YYYY-MM-DD');
    var nowTime = moment().format('YYYY-MM-DD');
    var status = rowData.get('Status')|rowData.get('TicketStatus');
    var isExpire = false;
    if (status===1) {
      isExpire=startTime<nowTime;
    }else if (status===2) {
      isExpire=endTime<nowTime;
    }
    if (isExpire) {
      return(
        <View style={styles.expireView}>
          <Icon type='icon_over_due' size={18} color={ALARM_RED} />
          <Text style={styles.expireText}>{'逾期'}</Text>
        </View>
      );
    }
    return null;
  }

  _showRedDot(){
    if(this.props.isService) return false;
    if(this.props.rowData.get('TicketType')===6&&this.props.rowData.getIn(['InspectionContent',0,'MainItems'])){
      //InspectionContent	Null	null
      let items=this.props.rowData.getIn(['InspectionContent',0,'MainItems']);
      for(let i=0;i<items.size;i++){
        let valueType=items.getIn([i,'ValueType']);
        let count=items.getIn([i,'SubItems']).size;
        for(let n=0;n<count;n++){
          let result=items.getIn([i,'SubItems',n,'Result']);
          if(valueType===3){
            if(result){//输入类，true表示有异常
              return true;
            }
          }else if(valueType===1){
            //判断类
            if(result===false) return true;//表示有异常
          }else if(valueType===2){
            //抄表类
            let maxValue=items.getIn([i,'SubItems',n,'MaxValue']);
            let minValue=items.getIn([i,'SubItems',n,'MinValue']);
            if(result===null||maxValue===null||minValue===null) continue;
            result=Number(result);minValue=Number(minValue);maxValue=Number(maxValue);
            if(result>maxValue || result< minValue) return true;
          }

        }
      }
    }
    return false;
  }


  render(){
    var {rowData} = this.props;
    var startTime = moment(rowData.get('StartTime')).format('YYYY-MM-DD');
    var endTime = moment(rowData.get('EndTime')).format('YYYY-MM-DD');
    var nowTime = moment().format('YYYY-MM-DD');
    var status = rowData.get('Status')|rowData.get('TicketStatus');
    var isExpire = false;
    if (status===1||status===5) {
      isExpire=startTime<nowTime;
    }else if (status===2) {
      isExpire=endTime<nowTime;
    }

    let redDot=null;
    let _showRedDot = this._showRedDot()
    if(_showRedDot &&!(isExpire&&status===3)){
     redDot=<View style={{width:6,height:6,borderRadius:3,marginRight:3,
       backgroundColor:'#f00',alignSelf:'center'}}/>;
    }

    let title = this.props.isService ? rowData.get('Name'): rowData.get('Title');
    let locationPath = this.props.isService ?
      rowData.get('CustomerLocation') :
      rowData.get('BuildingNames').filter((item)=>item).join('、');
    let urgency = null;
    if(this.props.isService && rowData.get('IsUrgent')){
      urgency = <Urgency isUrgency={rowData.get('IsUrgent')}/>
    }
    let titleColor = '#333';
    if(rowData.get('HasError') || _showRedDot) titleColor = '#ff4d4d';
    return (
      <TouchFeedback  onPress={()=>this.props.onRowClick(rowData)}>
        <View style={{padding:16,backgroundColor:'#fff',marginBottom:10,borderRadius:2,
        }}>
          <View style={{flexDirection:'row',paddingHorizontal:16,paddingVertical:12,marginHorizontal:-16,marginBottom:-12,marginVertical:-16,alignItems:'center',justifyContent:'space-between',
            borderTopLeftRadius:2,borderTopRightRadius:2}}>
            <View style={{flexDirection:'row',alignItems:'center',flex:1,marginRight:12}}>
              {redDot}
              <Text style={{color:titleColor,fontSize:16,fontWeight:'600',flexShrink:1,marginRight:3}} numberOfLines={1}>{title}</Text>
              {urgency}
            </View>
            <Text style={{fontSize:12,color:(isExpire?'#ff4d4d':'#888'),marginLeft:8,}}>{this._getDateDisplay()}</Text>
          </View>
          {
            this.props.isService ? null :
            <View style={{flex: 1, marginTop: 12}}>
              <Text style={{fontSize: 15, lineHeight: 23, color: '#888'}} numberOfLines={2}>{this._getContent()}</Text>
            </View>
          }
          <View style={{height:1,backgroundColor:'#f2f2f2',marginVertical:12}}/>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Icon type="arrow_location" color="#b2b2b2" size={12}/>
            <Text style={{marginLeft:5,color:'#b2b2b2',fontSize:13}} numberOfLines={1} lineBreakModel='charWrapping'>{locationPath}</Text>
          </View>
        </View>
      </TouchFeedback>
    );
  }



  render1(){
    var {rowData} = this.props;
    return (
      <ClickableRow currentRouteId={this.props.currentRouteId} onRowClick={()=>this.props.onRowClick(rowData)}>
        <View style={[styles.row,styles.rowHeight]}>
          <View style={styles.titleRow}>
            <View style={{flex:1}}>
              <Text style={styles.titleText} numberOfLines={1} lineBreakModel='charWrapping'>{
                  rowData.get('BuildingNames').filter((item)=>item).join('、')}</Text>
            </View>
            <Text style={styles.timeText}>{this._getTime()}</Text>
          </View>
          <View style={styles.contentRow}>
            <View style={{flex:1}}>
              <Text style={styles.contentText} numberOfLines={1} >{this._getContent()}</Text>
            </View>
            {this._newText()}
          </View>
        </View>
      </ClickableRow>
    );
  }
}

TicketRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
  currentRouteId:PropTypes.string,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:78
  },
  row:{
    backgroundColor:'transparent',
    padding:16,
    // justifyContent:'space-between'
  },
  titleRow:{
    flexDirection:'row',
    // backgroundColor:'red',
    flex:1,
    alignItems:'flex-start',
    justifyContent:'space-between',
  },
  titleText:{
    color:BLACK,
    fontSize:17
  },
  timeText:{
    color:GRAY,
    fontSize:12,
    marginLeft:6,
    marginTop:3,
  },
  expireText:{
    color:ALARM_RED,
    fontSize:12,
    marginLeft:6,
    marginTop:3,
  },
  expireView:{
    borderRadius:1,
    flexDirection:'row',
    // backgroundColor:'gray',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  contentRow:{
    flex:1,
    marginTop:8,
    alignItems:'flex-start',
    flexDirection:'row',
  },
  contentText:{
    color:GRAY,
    fontSize:12
  },


});
