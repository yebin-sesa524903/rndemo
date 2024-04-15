
'use strict';
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  // PixelRatio,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import {GRAY,ALARM_HIGH,ALARM_MIDDLE,ALARM_LOW,BLACK,GREEN, LINE} from '../../styles/color';
import moment from 'moment';
import ListSeperator from '../ListSeperator';
import Bottom from '../Bottom'
import Loading from '../Loading';
import Button from '../Button.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import permissionCode from "../../utils/permissionCode";
import Icon from '../Icon.js';
import TouchFeedback from '../TouchFeedback';
import unit from '../../utils/unit.js';
import CommonActionSheet from '../../components/actionsheet/CommonActionSheet';
import {isPhoneX} from "../../utils/index";
let toBottom=isPhoneX()?34:0;
// import num
moment.locale('zh-cn');

export default class NotifyDetail extends Component{
  constructor(props){
    super(props);
    this.state={};
  }
  _hasResolved(){
    var hasTime = false;
    if (this.props.rowData) {
      hasTime = !!this.props.rowData.get('SecureTime');
    }
    return !!hasTime;
  }
  _hasProcessed(){
    var status = this.props.rowData.get('Status');
    if(!status) return false;
    return status.size === 0?false:true;
  }
  _getAlarmLevel(){
    var level = this.props.rowData.get('Level');
    if(level === 1){
      return '低';
    }
    else if(level === 2){
      return '中';
    }
    else{
      return '高';
    }
  }
  _getAlarmCode(){
    return this.props.rowData.get('Code');
  }
  _getAlarmTime(){
    // console.warn("AlarmTime",this.props.rowData.get('AlarmTime'));
    // console.log('AlarmTime');
    // console.log(this.props.data.getIn(['data','AlarmTime']));
    var obj = moment(this.props.rowData.get('AlarmTime'));
    return obj.format("HH:mm:ss");
  }
  _getAlarmDate(){
    var obj = moment(this.props.rowData.get('AlarmTime'));
    return obj.format("YYYY年M月D日")
  }
  _getAlarmParameter(){
    return this.props.rowData.get('Parameter');
  }
  _getAlarmActualValue(){
    return this.props.rowData.get('ActualValue');
  }
  _getAlarmThresholdValue(){
    return this.props.rowData.get('ThresholdValue');
  }

  _getBackgroundColor(){
    var hasResolved = this._hasResolved();
    var color = ALARM_HIGH;
    if (!this.props.rowData) {
      color = '#c0c0c0';//GRAY;
    }else {
      if(hasResolved){
        color = '#c0c0c0';//GRAY;
      }else {
        var level = this.props.rowData.get('Level');
        if(level === 1){
          color = ALARM_LOW;
        }
        else if(level === 2){
          color = ALARM_MIDDLE;
        }
        else{
          color = ALARM_HIGH;
        }
      }
    }
    return color;
  }

  _renderTripButton(rowData){
    if(rowData.get('TripDetails')&&rowData.get('TripDetails').size>0&& this._isCode303(rowData)) {
      return (
        <TouchFeedback onPress={()=>this.setState({modalVisible:true})}>
          <View style={{
            backgroundColor: 'white', height: 28, borderRadius: 14, marginRight: -30,
            paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{color: GREEN, fontSize: 14}}>跳闸详情</Text>
          </View>
        </TouchFeedback>
      )
    }
    return null;
  }

  _renderTripDetailSheet(){
    let rowData=this.props.rowData;
    if(this.state.modalVisible){
      let arr=rowData.get('TripDetails').map((item,index)=>{
        return (
          <View style={{height:44,justifyContent:'center'}}>
            <Text style={{fontSize:15,color:'#333'}}>{item.get('Key')}：{item.get('Value')}</Text>
          </View>
        )
      });
      return (
        <CommonActionSheet modalVisible={this.state.modalVisible}
         onCancel={()=>this.setState({modalVisible:false})}>
        <View style={{backgroundColor:'white',paddingHorizontal:16,paddingVertical:12}}>
          <View style={{flexDirection:'row',alignItems:'center',marginRight:-16}}>
            <Text style={{fontSize:17,fontWeight:'500',color:'#333',flex:1}}>跳闸详情</Text>
            <TouchFeedback onPress={()=>this.setState({modalVisible:false})}>
              <View style={{padding:8,marginRight:8}}>
                <Icon  type='icon_close' size={17} color={'#888'} />
              </View>
            </TouchFeedback>
          </View>
          <View style={{height:1,backgroundColor:LINE,marginTop:6,marginRight:-16}}/>
          {arr}
        </View>
      </CommonActionSheet>
      );
    }
  }

  _getHeaderView(rowData){
    var {width} = Dimensions.get('window');
    var height = parseInt(width*2/3)-80;
    // console.warn('width:%s height%s',width,height);
    return (
      <View style={{backgroundColor:this._getBackgroundColor()}}>
        <View style={[styles.header, {}]}>
          <View style={styles.level}>
              <Text style={styles.levelText}>{this._getAlarmLevel()}</Text>
          </View>

          <View style={{marginLeft:16,flex:1}}>
            <View style={{flexDirection:'row',height:28,alignItems:'center'}}>
              <Text style={[styles.codeText,{flex:1,fontWeight:'500'}]} numberOfLines={2}>{this._getAlarmCode()}</Text>
              {this._renderTripButton(rowData)}
            </View>
            <TouchFeedback onPress={()=>{
              this.props.onAssetClick(rowData);
            }}>
              <View style={{flexDirection:'row',marginTop:7}}>
                <View style={{marginTop:(Platform.OS==='ios')?2:4}}>
                <Icon style={{lineHeight:15}} type='icon_device_box' size={15} color={'white'} />
                </View>
                <Text style={{fontSize:15,color:'#ffffffdd',marginHorizontal:6}}>
                  {rowData.get('DeviceName')+' '}
                  {this._getNavIcon({isNav:true})}
                </Text>
              </View>
            </TouchFeedback>
          </View>

        </View>
        <View style={{borderRadius:8,backgroundColor:'#ffffff22',marginTop:24,marginBottom:16,marginHorizontal:16,padding:16}}>
          {this._getDetailView(rowData)}
        </View>
      </View>
    );
  }
  _getNavIcon(item){
    if(item.isNav){
      return (
        <Icon style={{paddingLeft:6}} type='arrow_right' size={15} color={'white'} />
      )
    }
  }
  _getPathRows(content){
    if (!content) {
      return(<Text key={0} style={[styles.detailText]} numberOfLines={1}>{''}</Text>);
    }
    return content.split('\n').map((item,index)=>{
      var marginTop = 0;
      if(index !== 0){
        marginTop = 10;
      }
      return(<Text key={index} style={[styles.detailText,{marginTop}]} numberOfLines={10}>{item}</Text>);
    });
  }
  _formatNumber(v,digit){
    if(v.indexOf('.') >= 0){
      return unit.toFixed(Number(v),digit);
    }
    else {
      return v;
    }
  }
  _format(v,type){
    if(isNaN(v)){
      return v;
    }
    if (!v) {
      return '-';
    }
    if(!type){ // could be null
      return '-';
    }
    if(type.indexOf('功率因数') >= 0){
      return this._formatNumber(v.toString(),2);
    }
    else {
      return this._formatNumber(v.toString(),1);
    }
  }
  _isCode303(rowData)
  {
    return rowData.get('Code')==='故障跳闸';
  }
    // {this._getPathRows(item.content)}
  _getDeviceNameView(rowData){
    var path = rowData.get('DeviceName');
    var list = [
      {title:'资产',content:path,isNav:true},
    ];
    return list.map((item,index)=>{
      return (
        <TouchFeedback style={[{flex:1,backgroundColor:'white'}]} onPress={()=>{
          this.props.onAssetClick(rowData);
        }}>
        <View key={index} style={[styles.detailRow]}>
          <Text style={[styles.detailTitleText]}>{item.title}</Text>
          <View style={{flex:1,justifyContent:'flex-start'}}>
            <Text key={index} style={[styles.detailText]} numberOfLines={1}>{item.content}</Text>
          </View>
          <View style={{justifyContent:'flex-end'}}>
            {this._getNavIcon(item)}
          </View>
        </View>
      </TouchFeedback>
      )
    });
  }
  _formatValue(value)
  {
    if (!value) {
      value='--';
    }else if (value==='无效值') {
      value='--';
    }

    return value;
  }
  _getDetailView(rowData){
    var actualValue = this._format(rowData.get('ActualValue'),rowData.get('Parameter'));
    var uom = rowData.get('Uom') || '-';
    var threshValue = rowData.get('ThresholdValue') || '-';
    var dataText = `${actualValue}${uom}（设定值:${threshValue}${uom}）`;
    // var path = rowData.get('DeviceName') + '\n';
    var path = rowData.get('Paths').reverse().join('\n');
    // path += '\n' + this.props.customerName;
    let time=moment(rowData.get('AlarmTime')).format('YYYY年M月D日 HH:mm:ss');
    var list = [
      {title:'点位',content:rowData.get('Parameter')},
      {title:'数据',content:dataText},//数据
      {title:'时间',content:time},
      {title:'位置',content:path},
      {title:'客户',content:this.props.customerName},
    ];

    // if (this._isCode303(rowData)) {
    //   var reason='';
    //   var details='';
    //   rowData.get('TripDetails').forEach((item,index)=>{
    //     if (item.get('Key')==='故障原因') {
    //       reason=item.get('Value');
    //       list.splice(0,0,{title:'原因',content:this._formatValue(reason)});
    //     }else {
    //       details+=(item.get('Key')+':'+this._formatValue(item.get('Value')));
    //       if (index!==rowData.get('TripDetails').size-1) {
    //         details+='\n';
    //       }
    //     }
    //   });
    //   if (details) {
    //     list.splice(1,0,{title:'详情',content:details});
    //   }
    // }
    return list.map((item,index)=>{
      var bottom = 8;
      if (index === (list.length - 1)) {
        bottom = 0;
      }
      return (
        <View key={index} style={[styles.detailRow, {paddingBottom:bottom}]}>
          <View style={{}}>
            <Text style={[styles.detailTitleText]}>{item.title}</Text>
          </View>
          <View style={{flex:1,justifyContent:'flex-start',}}>
            {this._getPathRows(item.content)}
          </View>
        </View>
      )
    });
  }
  _getStatusView(rowData){
    var statusList= rowData.get('Status') || [];
    var ticketLink = null;
    let showTicket =
        privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
        privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
    if(rowData.get('TicketId')&&showTicket){
      ticketLink = (
        <Text onPress={this.props.viewTicket} style={styles.viewTicket}>查看工单</Text>
      );
    }
    var list = statusList.reverse();
    var lastOne = null;
    list.forEach((item)=>{
      if(item.get('User') !== 'self'){
        if(lastOne){
          if(lastOne.get('Timestamp') < item.get('Timestamp')){
            lastOne = item;
          }
        }
        else {
          lastOne = item;
        }
      }
    })
    // console.warn('lastOne',statusList);
    return list.map((item,index)=>{
      var time = moment.utc(item.get('Timestamp')).format('YYYY年MM月DD日  HH:mm:ss');
      let hideLine=index==list.size-1;
      return (
        <View key={index} style={styles.statusRow}>
          <View style={{alignItems:'center'}}>
            <Icon type='icon_select' size={18} color={GREEN} />
            <View style={{width:hideLine?0:0.5,backgroundColor:'#e6e6e6',flex:1}}/>
          </View>
          <View style={{flex:1,justifyContent:'flex-start',marginLeft:10}}>
            <View style={styles.statusRowContainer}>
              <Text style={styles.statusText} numberOfLines={1}>{item.get('Content')}</Text>
              {(lastOne === item) ? ticketLink : null}
            </View>
            <Text style={styles.statusTimeText}>{time}{' '}{item.get('RealName')}</Text>
          </View>
        </View>
      )
    });
  }
  _getBottomButton(){
    let showTicket =
        // privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
        privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
    if(this.props.rowData.get('TicketId') || !showTicket){
      return null;
    }
    if (this.props.rowData.get('AlarmType')===1) {
      return null;
    }
    return (
      <Bottom style={{borderTopWidth:1,height:54+toBottom,alignItems:'flex-start', borderTopColor:'#f2f2f2',
        backgroundColor:'#fff',paddingHorizontal:16}}>
        <Button
          style={[styles.button,{
            backgroundColor:GREEN,
            height:40,
            marginVertical:7,
            borderRadius:2
          }]}
          textStyle={{
            fontSize:16,
            color:'#ffffff'
          }}
          text='创建报警工单' onClick={()=>this.props.createOrEditTicket(this.props.rowData)} />
      </Bottom>
    );
  }
  _getContent(){
    if(!this.props.rowData){
      var loading = null;
      if(this.props.isFetching){
        loading = (
          <Loading />
        );
      }
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {
            loading
          }
        </View>
      )
    }else {
      var button = this._getBottomButton();
      var marginBottom = 0;
      if(button){
        marginBottom = 54+toBottom;
      }
      return(
        <View style={{flex:1}}>
          <ScrollView style={[styles.wrapper,{marginBottom}]}>
            <View style={styles.container}>
              {this._getHeaderView(this.props.rowData)}
              <View style={{flex:1,backgroundColor:'white'}}>
                {/* {this._getDeviceNameView(this.props.rowData)}
                <View style={{paddingVertical:10}}>
                  <ListSeperator />
                </View>
                {this._getDetailView(this.props.rowData)}
                <View style={{paddingBottom:16}}>
                  <ListSeperator />
                </View> */}
                <Text style={{fontSize:17,fontWeight:'500',color:'#333',margin:16}}>报警日志</Text>
                <View style={{height:1,backgroundColor:LINE,marginLeft:16}}/>
                <View style={{padding:16,}}>
                  {this._getStatusView(this.props.rowData)}
                </View>
              </View>
            </View>
          </ScrollView>
          {this._getBottomButton()}
        </View>
      );
    }
  }
  render() {
    return (
      <View style={{flex:1,backgroundColor:this._getBackgroundColor()}}>
        <Toolbar
          title='通知详情'
          titleColor='white'
          tintColor='white'
          color='transparent'
          navIcon="back"
          onIconClicked={()=>this.props.onBack()} />
        {this._getContent()}
        {this._renderTripDetailSheet()}
      </View>
    );
  }
}

NotifyDetail.propTypes = {
  onBack:PropTypes.func,
  createOrEditTicket:PropTypes.func,
  viewTicket:PropTypes.func,
  isFetching:PropTypes.bool,
  rowData:PropTypes.object,//immutable
  customerName:PropTypes.string,
  onAssetClick:PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
  },
  header:{
    // flex:1,//make header too height
    paddingTop:24,
    paddingLeft:16,
    paddingRight:16,
    flexDirection:'row'
  },
  title:{
    fontSize:17,
    color:'white'
  },
  headerLeft:{
    flex:1,
    justifyContent:'flex-end',
    paddingBottom:25,
    // backgroundColor:'black'//test
  },
  headerRight:{
    width:80,
    paddingBottom:25,
    alignItems:'flex-end',
    justifyContent:'flex-end',
    // backgroundColor:'#00ff00'//test
  },
  datetime:{
    fontSize: 14,
    marginBottom:18,
    color:'white',
  },
  codeText:{
    fontSize: 18,
    color:'white',
    // backgroundColor:'red',//test
  },
  level:{
    borderColor:'white',
    borderWidth:1,
    borderRadius:25,
    width:50,
    height:50,
    justifyContent:'center',
    alignItems:'center'
  },
  levelText:{
    fontSize: 20,
    color:'white'
  },
  detailRow:{
    flexDirection:'row',
    alignItems:'flex-start',
    justifyContent:'space-between',
  },
  detailTitleText:{
    color:'white',
    fontSize:14,
    lineHeight:18,
    // height:17,
  },
  detailText:{
    color:'white',
    fontSize:14,
    marginLeft:10,
    // height:17,
    lineHeight:18,
    // backgroundColor:'red',
  },
  statusRowContainer:{
    flexDirection:'row',
    alignItems:'center'
  },
  statusRow:{
    flexDirection:'row',
    height:70,
    marginBottom:2
  },
  statusTimeText:{
    color:'#888',//GRAY,
    marginTop:10,
    fontSize:13,
  },
  statusText:{
    color:'#333',
    fontSize:17,
    flex:1
    // marginLeft:21
  },
  viewTicket:{
    color:GREEN,
    fontSize:17,
  },
  wrapper:{
    // paddingBottom: 48,
    flex:1,
    backgroundColor:'white',
  },
  button:{
    height:48+toBottom,
    flex:1,
    // marginHorizontal:16,
    // borderRadius:6,

  }
});
