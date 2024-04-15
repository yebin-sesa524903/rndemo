
'use strict';
import React,{Component} from 'react';
import {
  View,

  StyleSheet,
  Text,
  Platform,
  DatePickerAndroid,
  DatePickerIOS,PanResponder,TextInput,
  ScrollView,findNodeHandle,UIManager
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import StatableSelectorGroup from '../alarm/StatableSelectorGroup';
import DateInputGroup from '../ticket/DateInputGroup';
import {GREEN,LIST_BG,GRAY, LINE} from '../../styles/color.js';
import Loading from '../Loading';
import Button from '../Button.js';
import Icon from '../Icon';
import TouchFeedback from '../TouchFeedback';
import moment from 'moment';
import {isPhoneX} from '../../utils'
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import {DatePickerView,DatePicker} from '@ant-design/react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import LettersIndexView from "../LettersIndexView";
import immutable from 'immutable';
import pinyin from 'pinyin';
let MarginTop=isPhoneX()?24+12:16;
if(Platform.OS==='android'){
  MarginTop=24;
}

let statusBarHeight=28;
if(Platform.OS==='ios'){
  statusBarHeight=20;
  if(isPhoneX()){
    statusBarHeight=40;
  }
}

let onLayout=undefined;
if(Platform.OS==='android') onLayout=(e)=>{};

export default class TicketFilter extends Component{
  constructor(props){
    super(props);
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {dataSource: ds.cloneWithRows([0,1,2,3,4]),date:new Date()};
  }
  _renderSeparator(sectionId,rowId){
    return (
      <View key={rowId} style={styles.sepView}></View>
    )
  }

  //安卓日期选择
  async _showPicker(type) {
    if(Platform.OS === 'android'){
      try {
        var value = undefined;
        if (type==='StartTime') {
          value = this.props.filter.get('StartTime') || undefined;
        }else if (type==='EndTime') {
          value = this.props.filter.get('EndTime') || undefined;
        }
        var date = moment(value);
        var options = {date:date.toDate(),maxDate:new Date()};
        var {action, year, month, day} = await DatePickerAndroid.open(options);
        if (action !== DatePickerAndroid.dismissedAction) {
          var date = moment({year,month,day,hour:8});//from timezone
          this.props.filterChanged(type,date.toDate());
        }

      } catch ({code, message}) {
      }
    }
  }

  _renderPickerView(){
    return (
      <DateTimePicker
        is24Hour={true}
        titleIOS={'选择日期'}
        headerTextIOS={'选择日期'}
        titleStyle={{fontSize:17,color:'#333'}}
        cancelTextIOS={'取消'}
        confirmTextIOS={'确定'}
        mode={'date'}
        datePickerModeAndroid={'spinner'}
        date={this.state.date}
        onDateChange={(date)=>{
          this._selectDate=date;
          this.setState({date})
        }}
        isVisible={this.state.modalVisible}
        onConfirm={(date)=>{
          this.setState({modalVisible:false});
          this.props.filterChanged(this.state.type,date);
        }}
        onCancel={()=>{
          this.setState({modalVisible:false})
        }}
      />
    )
  }

  _clickBeginTime(time){
    let beginTime=this.props.selectDatas.get('ticketStartTime');
    if(beginTime){
      beginTime=new Date(beginTime);
    }else{
      beginTime=new Date();
    }
    if(Platform.OS === 'android'){
      this.setState({modalVisible:true,type:'StartTime',date:beginTime});
      this._fixBug();
    }else {
      this.setState({modalVisible:true,type:'StartTime',date:beginTime});
    }
  }

  _fixBug() {
    setTimeout(()=>{this.setState({})},10);
  }

  _clickEndTime(time){
    let endTime=this.props.selectDatas.get('ticketEndTime');
    if(endTime){
      endTime=new Date(endTime);
    }else{
      endTime=new Date();
    }
    if(Platform.OS === 'android'){
      // this._showPicker('EndTime');
      this.setState({modalVisible:true,type:'EndTime',date:endTime});
      this._fixBug();
    }else {
      this.setState({modalVisible:true,type:'EndTime',date:endTime});
    }
  }

  _renderDate(rid){
    let beginTime='开始时间';
    let beginColor='#d0d0d0';
    let filter=this.props.selectDatas;
    if(filter.get('ticketStartTime')){
      beginColor='#333';
      beginTime=moment(filter.get('ticketStartTime')).format("YYYY-MM-DD")
    }
    let endTime='结束时间';
    let endColor='#d0d0d0';
    if(filter.get('ticketEndTime')){
      endColor='#333';
      endTime=moment(filter.get('ticketEndTime')).format("YYYY-MM-DD");
    }
    return (
      <View key={rid}>
        <Text numberOfLines={1} style={{fontSize:13,color:'#888'}}>
          时间
        </Text>
        <View style={{flex:1,flexDirection:'row',height:30,alignItems:'center',marginTop:10}}>
          <TouchFeedback style={{flex:1}} onPress={()=>this._clickBeginTime()}>
            <View style={{flex:1,borderColor:'#e6e6e6',height:30,borderWidth:1,borderRadius:2,
              justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:13,color:beginColor}}>{beginTime}</Text>
            </View>
          </TouchFeedback>
          <View style={{width:8,height:1,backgroundColor:'#d0d0d0',marginHorizontal:10}}/>
          <TouchFeedback style={{flex:1}} onPress={()=>this._clickEndTime()}>
            <View style={{flex:1,borderColor:'#e6e6e6',borderWidth:1,height:30,borderRadius:2,
              justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:13,color:endColor}}>{endTime}</Text>
            </View>
          </TouchFeedback>
        </View>
      </View>
    )
  }

  _renderTicketName(){
    return (
      <View key={'ticketName'}>
        <Text numberOfLines={1} style={{fontSize:13,color:'#888'}}>
          工单名称
        </Text>
        <View style={{flex:1,borderColor:'#e6e6e6',height:28,borderWidth:1,borderRadius:2,
          justifyContent:'center',alignItems:'center',marginVertical:10,marginBottom:20,flexDirection:'row'}}>
          <TextInput style={{fontSize:13,color:'#333',height:23,padding:0,flex:1,paddingHorizontal:12}}
             placeholderTextColor={'#d0d0d0'}
             underlineColorAndroid={'transparent'}
             // textAlignVertical={'top'}
             onChangeText={text=>{
               this.props.filterChanged('ticketStrId',text)
             }}
             value={this.props.selectDatas.get('ticketStrId')} placeholder={'请输入'} onFocus={e=>{}}
          />
        </View>
      </View>
    )
  }

  _renderRow(rowData,sid,rid){
    if(rowData === 0){
      return this._renderDate(rid);
    }else if(rowData === 1){
      return null;
    }
    else if(rowData === 2){
      return (
        <StatableSelectorGroup
          title='级别'
          key={rid}
          titleColor={'#888'}
          titleFontSize={13}
          fontSize={13}
          checkedBg={'#284e9822'}
          borderWidth={-1}
          unCheckedBg={'#f2f2f2'}
          checkedFontColor={GREEN}
          borderRadius={2}
          unCheckedFontColor={'#333'}
          data={['高级','中级','低级']}
          selectedIndexes={this.props.filter.get('level')}
          onChanged={(index)=>this.props.filterChanged('level',index)} />
      );
    }
    else if(rowData === 3){
      return (
        <StatableSelectorGroup
          title='类别'
          key={rid}
          data={this.props.codes}
          titleColor={'#888'}
          titleFontSize={13}
          fontSize={13}
          checkedBg={'#284e9822'}
          borderWidth={-1}
          unCheckedBg={'#f2f2f2'}
          checkedFontColor={GREEN}
          borderRadius={2}
          unCheckedFontColor={'#333'}
          selectedIndexes={this.props.filter.get('code')}
          onChanged={(index)=>this.props.filterChanged('code',index)} />
      );
    }
    else if(rowData === 4){
      if (!this.props.buildings || this.props.buildings.length===0) {
        return null;
      }
      return this._showBuildingList(this.props.buildings,rid);
    }
    return null;

  }

  _buildBuilding(title,items,index){
    let children=[];
    let key_id = this.props.isService ? 'CustomerId' : 'Id';
    let key_name = this.props.isService ? 'CustomerName' : 'Name';
    items.forEach((item,i)=>{
      let icon=(
        <View style={{width:20,height:20,alignItems:'center',justifyContent:'center'}}>
          <View style={{width:18,height:18,borderColor:'#d9d9d9',borderWidth:1,borderRadius:9}}>

          </View>
        </View>
      );
      if(this.props.selectDatas.get('selectBuilds').includes(item.get(key_id))){
        icon=<Icon type='icon_select' size={20} color={GREEN} />
      }
      children.push(
        <View key={i} style={{flex:1,backgroundColor:'white'}}>
          <TouchFeedback style={{flex:1}} onPress={()=>this.props.filterChanged('building',item.get(key_id))}>
            <View style={{flex:1,flexDirection:'row',alignItems:'center',marginLeft:14,height:44,marginRight:32,
              borderColor:LINE,borderBottomWidth:0}}>
              {icon}
              <Text numberOfLines={1} style={{color:'#333',fontSize:13,flex:1,marginLeft:12}}>{item.get(key_name)}</Text>
            </View>
          </TouchFeedback>
        </View>
      )
    });
    this._layoutIndex.push(title);
    return (
      <View key={index}>
        <View onLayou={onLayout} ref={title} style={{height:30,backgroundColor:'#f2f2f2',justifyContent:'center',paddingLeft:16}}>
          <Text style={{color:'#888',fontSize:13,}}>{title}</Text>
        </View>
        {children}
      </View>
    )
  }

  _showBuildingList(buildings){
    if(this.props.isService){
      if(this.props.customerFetching) {
        return (
          <View style={{marginTop:100}}>
            <Loading/>
          </View>
        )
      }
      let items = this.props.customers.get('data');
      if(items && items.size > 0) {
        items = items.get(0);
      } else {
        items = immutable.fromJS([]);
      }
      return this._buildBuilding('选择客户',items,0);
    }

    let content=null;
    if(this.props.isFetching){
      content = (
        <View style={{marginTop:100}}>
          <Loading/>
        </View>
      );
    }else{
      if ((!this.props.buildings || this.props.buildings.length===0)) {
        content = null;
      }else{
        content=buildings.map((item,index)=>{
          return this._buildBuilding(item.get('Name'),item.get('Children'),index);
        })
      }
    }
    return (
      <View>
        {content}
      </View>
    );
  }

  componentWillReceiveProps(nextProps) {

    if(nextProps.filter !== this.props.filter){
      var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.setState({
        dataSource: ds.cloneWithRows([0,1,2,3,4])
      });
    }
  }

  _getBottom(){
    let toBottom=isPhoneX()?34:0;
    return (
      <View style={{flexDirection:'row',height:57,borderTopColor:LINE,borderTopWidth:1,marginBottom:toBottom}}>
        <TouchFeedback style={{flex:1}} onPress={()=>{this.props.doReset()}}>
          <View style={{backgroundColor:'white',flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:'#666',fontSize:16}}>重置</Text>
          </View>
        </TouchFeedback>
        <TouchFeedback style={{flex:1}} onPress={()=>{this.props.doFilter()}}>
          <View style={{backgroundColor:GREEN,flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{color:'white',fontSize:16}}>确定</Text>
          </View>
        </TouchFeedback>
      </View>
    );
  }

  layout(ref) {
    const handle = findNodeHandle(ref);
    return new Promise((resolve) => {
      UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
        resolve({
          x,
          y,
          width,
          height,
          pageX,
          pageY
        });
      });
    });
  }

  async jumpToLetter(letter){
    let ref=this.refs[letter];
    if(ref){
      let size = await this.layout(ref);
      if (size.y !== 0) {
        this.refs.sv.scrollTo({x: 0, y: size.y,animated:false});
      } else {
        let dy = this._y || 0;
        this.refs.sv.scrollTo({x: 0, y: dy + size.pageY-statusBarHeight,animated:false});
      }
    }
  }

  render() {
    var list = null
    this._layoutIndex=['time1','level1','type1'];
    let status = this.props.isService ? ['未开始','执行中','已提交','已驳回','已关闭']
      : ['待接单','未开始','执行中','已提交','已驳回','已关闭'];
    list = (
      <View style={{flex:1}}>
        <ScrollView ref="sv" style={{flex:1}} onScroll={(event)=>{
          this._y=event.nativeEvent.contentOffset.y;
        }}>
          <View style={{padding:16,paddingRight:40,}}>
            <View ref="名称" onLayout={onLayout}>
              {this._renderTicketName()}
            </View>
            <View ref="时间" onLayout={onLayout}>
              {this._renderDate(0)}
            </View>
            {this.props.isService ? null :
              <View>
                <View style={{height: 20}}/>
                <View ref={'类型'} onLayout={onLayout}>
                  <StatableSelectorGroup
                    title='工单类型'
                    key={1}
                    titleColor={'#888'}
                    titleFontSize={13}
                    fontSize={13}
                    checkedBg={'#284e9822'}
                    borderWidth={-1}
                    unCheckedBg={'#f2f2f2'}
                    checkedFontColor={GREEN}
                    borderRadius={2}
                    unCheckedFontColor={'#333'}
                    data={['巡检', '计划', '现场']}
                    selectedIndexes={this.props.ticketTypes}
                    onChanged={(index) => {
                      this.props.filterChanged('types', index.index);
                    }}/>
                </View>
              </View>
            }

            <View style={{height:20}}/>
            <View ref="状态" onLayout={onLayout}>
              <StatableSelectorGroup
                title='工单状态'
                key={2}
                data={status}
                titleColor={'#888'}
                titleFontSize={13}
                fontSize={13}
                checkedBg={'#284e9822'}
                borderWidth={-1}
                unCheckedBg={'#f2f2f2'}
                checkedFontColor={GREEN}
                borderRadius={2}
                unCheckedFontColor={'#333'}
                selectedIndexes={this.props.ticketStatus}
                onChanged={(index)=>{
                  this.props.filterChanged('status',index.index);
                }} />
            </View>

          </View>
          {this._showBuildingList(this.props.buildings,3)}
        </ScrollView>
        {this.props.isService ? null :
          <View style={{
            position: 'absolute', top: 0, bototm: 0, right: 4,
            justifyContent: 'center', height: '100%'
          }}>
            <LettersIndexView clickLetter={this.jumpToLetter.bind(this)}/>
          </View>
        }
        {this._getBottom()}
      </View>
    )
    return (
      <View style={{flex:1,backgroundColor:'white',paddingTop:MarginTop}}>
        {list}
        {this._renderPickerView()}
      </View>
    );
  }
}

TicketFilter.propTypes = {
  filter:PropTypes.object,
  codes:PropTypes.array,
  rawCodes:PropTypes.object,
  buildings:PropTypes.any,
  doFilter:PropTypes.func.isRequired,
  doReset:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  onClose:PropTypes.func.isRequired,
  filterChanged:PropTypes.func.isRequired,
}

var bottomHeight = 72;

var styles = StyleSheet.create({
  sepView:{
    height:16,
    backgroundColor:'transparent'
  },
  bottom:{
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    flex:1,
    height:bottomHeight,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'white'
  },
  button:{
    // marginTop:20,
    height:43,
    flex:1,
    marginHorizontal:16,
    borderRadius:6,

  }
});
