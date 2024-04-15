'use strict'

import React,{Component} from 'react';
import {
  View,Text,ScrollView
} from 'react-native';
import PropTypes from 'prop-types';
// import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import Toolbar from '../Toolbar';

import Icon from '../Icon';
import {Icon as Icon2} from '@ant-design/react-native';

import moment from 'moment';
import RingRound from '../RingRound.js'

//0为开始，1进行中 2同步失败 3覆盖或者放弃 4工单已关闭
let STATUS_TEXT=['',
  '',
  '同步失败',
  '该工单已被其他用户执行，确认覆盖？若放弃将获取云端最新数据',
  '该工单已被其他用户关闭，将获取云端最新数据。',
  '没有层级权限',
  '工单不存在',
  '工单状态不一致',

];

export default class TicketSyncView extends Component{
  constructor(props){
    super(props);
    let data=[];
    for(let i=0;i<20;i++){
      data.push({
        syncStatus:Number.parseInt(Math.random()*5)
      })
    }
    this.state={data:data};
  }

  _getToolbar(){

    let action=[];
    let actionClick=[()=>{console.warn('点击全部同步')}];
    return (
      <Toolbar title="同步列表"
        actions={action}
        navIcon="back"
        onIconClicked={this.props.onBack}
        onActionSelected={actionClick}
      />
    )
  }

  _getSyncStatusView(status,ticketId,isService){
    if(status>1){

      let actionView=null;
      if(status===2){
        return null;
      }
      if(status===3){
        actionView=(
          <View style={{flexDirection:'row',marginTop:-10,marginRight:-10}}>
            <TouchFeedback onPress={()=>{
              console.warn('覆盖')
              this.props.onCover(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'覆盖'}</Text>
            </TouchFeedback>
            <TouchFeedback onPress={()=>{
              console.warn('放弃')
              this.props.onGiveUp(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'放弃'}</Text>
            </TouchFeedback>
          </View>
        )
      }
      if(status===4){
        actionView=(
          <View style={{marginTop:-10,marginRight:-10}}>
            <TouchFeedback  onPress={()=>{
              console.warn('确定')
              this.props.onGiveUp(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'确定'}</Text>
            </TouchFeedback>
          </View>
        )
      }
      if(status === 5) {
        actionView=(
          <View style={{flexDirection:'row',marginTop:-10,marginRight:-10}}>
            <TouchFeedback onPress={()=>{
              console.warn('无层级权限，重试')
              this.props.onRetry(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'重试'}</Text>
            </TouchFeedback>
            <TouchFeedback onPress={()=>{
              console.warn('无层级权限，放弃')
              this.props.onGiveUp(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'放弃'}</Text>
            </TouchFeedback>
          </View>
        )
      }
      if(status === 6) {
        actionView=(
          <View style={{marginTop:-10,marginRight:-10}}>
            <TouchFeedback  onPress={()=>{
              console.warn('工单不存在，删除')
              this.props.onGiveUp(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'放弃'}</Text>
            </TouchFeedback>
          </View>
        )
      }
      if(status === 7) {
        actionView=(
          <View style={{marginTop:-10,marginRight:-10}}>
            <TouchFeedback  onPress={()=>{
              console.warn('工单状态不一致，删除')
              this.props.onGiveUp(ticketId,isService);
            }}>
              <Text style={{padding:10,fontSize:13,color:'#284e98',lineHeight:18}}>{'放弃'}</Text>
            </TouchFeedback>
          </View>
        )
      }

      return (
        <View style={{flexDirection:'row',marginBottom:20}}>
          <View style={{flexDirection:'row',flex:1,marginRight:20}}>
            <Icon style={{marginTop:2}} type="icon_info_down" color="#ff4d4d" size={14}/>
            <Text style={{marginLeft:8,fontSize:13,lineHeight:18,color:'#ff4d4d'}}>{STATUS_TEXT[status]}</Text>
          </View>
          {actionView}
        </View>
      )
    }else{
      return null;
    }
  }

  _getDateDisplay(rowData){
    let mStart=moment(rowData.StartTime);
    let mEnd=moment(rowData.EndTime);
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

  _renderRow(row,index){
    let date=this._getDateDisplay(row);
    let ticketStatus=['','未开始','执行中','已关闭','已提交'][row.Status];
    //如果是服务报告，
    if(row.ReportId) {
      ticketStatus=['','未开始','执行中','已提交','已驳回'][row.Status];
    }
    let statusView=null;
    switch(row.syncStatus){
      case -1:
        return null;
      case 0:
        statusView=(
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Icon2 name="pause-circle" size='13' color="#fbb325" />
            <Text style={{fontSize:13,color:'#888',marginLeft:3}}>{`等待中`}</Text>
          </View>
        );
        break;
      case 1://进行中
        statusView=(
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <RingRound>
              <Icon2 name="sync" size='13' color="#284e98" />
            </RingRound>
            <Text style={{fontSize:13,color:'#888',marginLeft:3}}>{`正在同步`}</Text>
          </View>
        );
        break;
      case 2://同步失败
        statusView=(
          <View style={{flexDirection:'row'}}>
            <Icon2 style={{alignSelf:'center',justifyContent:'center',alignItems:'center',textAlign:'center'}} name="close-circle" size='13' color="#ff4d4d" />
            <Text style={{fontSize:13,color:'#888',marginLeft:3}}>{`同步失败`}</Text>
            <View style={{marginTop:-10,marginRight:-10}}>
              <TouchFeedback  onPress={()=>{
                console.warn('重试');
                this.props.onRetry(row.Id,row.isService)
              }}>
                <Text style={{paddingHorizontal:10,paddingTop:10,fontSize:13,color:'#284e98'}}>{'重试'}</Text>
              </TouchFeedback>
            </View>
          </View>
        );
        break;
      case 3://覆盖放弃
        statusView=(
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Icon2 name="pause-circle" size="13" color="#fbb325" />
            <Text style={{fontSize:13,color:'#888',marginLeft:3}}>{`等待中`}</Text>
          </View>
        );
        break;
      case 4://工单已关闭
        statusView=(
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <Icon2 name="close-circle" size="13" color="#ff4d4d" />
            <Text style={{fontSize:13,color:'#888',marginLeft:3}}>{`同步失败`}</Text>
          </View>
        );
        break;
    }
    return (
      <View key={index}>
        <View style={{marginBottom:10,backgroundColor:'#fff',padding:10,paddingHorizontal:16,borderRadius:2}}>
          <View style={{flexDirection:'row',backgroundColor:'#fafafa',margin:-16,marginTop:-10,
            padding:10,paddingVertical:12,borderTopLeftRadius:2,borderTopRightRadius:2}}>
            <Text numberOfLines={1} style={{fontSize:13,flex:1,color:'#888',marginRight:8}}>{`${date} | ${ticketStatus}`}</Text>
            {statusView}
          </View>

          <View style={{marginTop:32}}>
            <Text numberOfLines={1} style={{fontSize:17,fontWeight:'500',color:'#333'}}>
              {row.AssetName ? row.AssetName : row.AssetNames.join('、')}
            </Text>
          </View>
          <View style={{marginTop:12}}>
            <Text numberOfLines={2} style={{fontSize:15,lineHeight:23,color:'#888'}}>
              {row.AssetName ? '详见服务工单' :`详见作业程序`}
            </Text>
          </View>
          <View style={{flex:1,height:1,backgroundColor:'#f2f2f2',marginVertical:10}}></View>
          <View style={{flexDirection:'row',alignItems:'center',flex:1}}>
            <Icon type="arrow_location" color="#b2b2b2" size={12}/>
            <Text numberOfLines={1} style={{fontSize:13,color:"#b2b2b2",marginLeft:4}}>
              {row.AssetName ? row.AssetName : row.BuildingNames.join('、')}
            </Text>
          </View>
        </View>
        {this._getSyncStatusView(row.syncStatus,row.Id,row.isService)}
      </View>
    )
  }

  render(){
    let rows=this.props.data.map((item,index)=>{
      return this._renderRow(item,index);
    });
      return (
        <View style={{flex:1,backgroundColor:'#f2f2f2'}}>
          {this._getToolbar()}
          <ScrollView style={{flex:1,paddingHorizontal:16,paddingVertical:10}}>
            {rows}
          </ScrollView>
        </View>
      )
  }
}
