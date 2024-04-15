
'use strict';
import React,{Component} from 'react';

import {
  View,Text,TouchableOpacity,
  Platform,
  //ViewPagerAndroid,
  SegmentedControlIOS,
    SafeAreaView,
} from 'react-native';
import PropTypes from 'prop-types';
import ViewPager from '@react-native-community/viewpager';
const ViewPagerAndroid=ViewPager;
import NetInfo from "@react-native-community/netinfo";
import Toolbar from '../Toolbar';
// import Loading from '../Loading';
import PagerBar from '../PagerBar.js';
import {GREEN,TAB_BORDER} from '../../styles/color.js';
import {LINE} from "../../styles/color";
import moment from 'moment';

import CalendarStrip from '../SlideableCalendar/CalendarStrip';
import privilegeHelper from "../../utils/privilegeHelper";
import Icon2 from "../Icon";

import {Icon} from '@ant-design/react-native';
import TouchFeedback from "../TouchFeedback";

import RingRound from '../RingRound.js'

const MP=Platform.OS==='ios'?0:36;
export default class Ticket extends Component{
  constructor(props){
    super(props);
    console.warn('this.props.searchDate',this.props.searchDate);
    this.state={
        selectedDate:moment(this.props.searchDate).toDate()
    };
  }
  _gotoShowListWithDate(date){
    this.setState({ selectedDate: date });
    this._changeSearch(date);
  }
  _tabChanged(event){
    // console.warn('_tabChanged',event.nativeEvent.selectedSegmentIndex);
    this.props.indexChanged(event.nativeEvent.selectedSegmentIndex);
  }
  _onPageSelected(e){
    // console.warn('_onPageSelected...',e.nativeEvent.position);
    if(e.nativeEvent.position !== this.props.currentIndex){
      this.props.indexChanged(e.nativeEvent.position);
    }
  }
  _pagerBarClicked(index){
    if(this.props.currentIndex !== index){
      this.props.indexChanged(index);
    }
  }
  _getTabArray(){
    var array = ['Logbook服务工单','其他工单'];
    return array;
  }
  _getTabControl(){
    let array = this.props.tabs;//this._getTabArray();
    if(array.length === 2) {
      array = [...array];
      array[0] = `${array[0]}(${this.props.serviceCount || 0})`;
      array[1] = `${array[1]}(${this.props.ticketCount || 0})`;
    }

    if(array.length > 1){
      if(true || Platform.OS === 'android'){
        return (
          <PagerBar
          barStyle={{
            marginTop:-1,
            backgroundColor:'#fff',
            borderBottomWidth:1,
            borderColor:'#e6e6e6',
            alignItems:'flex-end',
            height:38,
          }}
          styleBarItem={{
            paddingHorizontal:0,
            marginTop:0,
            // marginBottom:10,
          }}
          styleBarLineItem={{
            marginHorizontal:12,
            height:3,
          }}
          styleBarItemText={{
            marginBottom:4,
            color:'#333',
            fontSize:15
          }}
          array={array}
          currentIndex={this.props.currentIndex}
          onClick={(index)=>this._pagerBarClicked(index)} />
        );
      }
      else {
        // console.warn('SegmentedControlIOS',this.props.currentIndex);
        return (
          <View style={{
            marginTop:-1,
            backgroundColor:'white',//'transparent',
            paddingVertical:16,
            borderBottomWidth:1,
            borderColor:LINE,//TAB_BORDER,
            paddingHorizontal:32}}>
            <SegmentedControlIOS
              momentary={false}
              selectedIndex={this.props.currentIndex}
              onChange={(event)=>this._tabChanged(event)}
              tintColor={GREEN}
              values={array}
               />
          </View>
        )
      }
    }
    return null;
  }
  _getView(){
      return this.props.contentView;
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.searchDate !== this.props.searchDate){
      this.setState({ selectedDate: moment(nextProps.searchDate).toDate() });
    }
    // console.warn('componentWillReceiveProps...',this.props.currentIndex,nextProps.currentIndex);
    // if(nextProps.currentIndex !== this.props.currentIndex){
    //   if(this._viewPager){
    //     this._viewPager.setPage(nextProps.currentIndex);
    //   }
    // }
  }

  // connectionHandler(conn){
  //   console.warn('ticketlist connectionHandler',conn);
  //   this.setState({});
  // }
	//
  // componentDidMount(){
  //   this._netInfoEvent=NetInfo.addEventListener('connectionChange', this.connectionHandler.bind(this))
  // }
	//
  // componentWillUnmount(){
  //   NetInfo.removeEventListener('connectionChange', this.connectionHandler)
  // }

  _changeSearch(date){
    if(moment(date).format('YYYY-MM-DD')!==this.props.searchDate){
      this.props.changeSearchDate(date);
    }
  }

  _offlineView(){
    if(isConnected()) return null;
    return (
      <View style={{paddingVertical:7,paddingHorizontal:16,alignItems:'center',
        flexDirection:'row',backgroundColor:'#fffbe6'}}>
        <Icon2 type="icon_info" color="#ff9500" size={12}/>
        <Text numberOfLines={1} style={{fontSize:12,color:'#ff9500',marginLeft:5}}>
          {'无法连接网络，自动为您开启离线模式，仅显示已下载工单'}
        </Text>
      </View>
    )
  }

  _autoSyncView(){
    if(isConnected()&&this.props.sync.get('waitingSyncTickets').size>0){
      //表示正在同步中...
      if(this.props.sync.get('syncFailCount')>0) {
        return (
          <TouchFeedback onPress={this.props.onSync}>
            <View style={{
              paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center',
              flexDirection: 'row', backgroundColor: '#ffe9e9'
            }}>
              <Icon2 type="icon_info_down" color="#ff4d4d" size={12}/>
              <View style={{flex: 1}}>
                <Text numberOfLines={1} style={{fontSize: 12, color: '#ff4d4d', marginLeft: 5}}>
                  {`${this.props.sync.get('syncFailCount')}个工单同步失败，请查看处理`}
                </Text>
              </View>
              <Icon2 type="icon_asset_folder" color="#ff4d4d" size={16}/>
            </View>
          </TouchFeedback>
        );
      }
      return (
        <TouchFeedback onPress={this.props.onSync}>
          <View style={{paddingVertical:7,paddingHorizontal:16,alignItems:'center',
            flexDirection:'row',backgroundColor:'#fffbe6'}}>
            <RingRound>
              <Icon name="sync" size='13' color="#ff9500" />
            </RingRound>
            <View style={{flex:1}}>
              <Text numberOfLines={1} style={{fontSize:12,color:'#ff9500',marginLeft:5}}>
                {'离线工单自动同步中…'}
              </Text>
            </View>
            <Icon2 type="icon_asset_folder" color="#ff9500" size={16}/>
          </View>
        </TouchFeedback>
      );
    }
  }

  _renderRightButton(showCreate,enableDownload){
    return (
      <View style={{position:'absolute',marginTop:-6,right:14,padding:6,flexDirection:'row',alignItems:'center'}}>
        <View style={{flexDirection:'row',marginRight:-6}}>
          {
            <TouchableOpacity style={{padding:6}} onPress={()=>{
              if(this.props.onFilter) this.props.onFilter();
            }}>
              <Icon name="filter" size="sm" color={'#333'} />
            </TouchableOpacity>
          }
          {false &&
          <TouchableOpacity disabled={!enableDownload} style={{padding:6}} onPress={()=>{
            if(this.props.onDownload) this.props.onDownload();
          }}>
            <Icon name="download" size="sm" color={enableDownload?"#333":'#888'} />
          </TouchableOpacity>
          }
          {showCreate &&
          <TouchableOpacity style={{padding:6}} onPress={()=>{
            if(this.props.onCreateTicket) this.props.onCreateTicket();
          }}>
            <Icon name="plus" size='sm' color="#333" />
          </TouchableOpacity>
          }
        </View>
      </View>
    );
  }

  render(){
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={{ flex: 1 }}>
          <View style={{marginTop:MP}}>
            <CalendarStrip
              isChinese
              // showWeekNumber
              // showChineseLunar
              // showCreate={privilegeHelper.hasAuth('TicketEditPrivilegeCode')}
              // showSync
              // onSync={this.props.onSync}
              // showDownload
              // enableDownload={this.props.enableDownload}
              // onDownload={this.props.onDownload}
              // onCreate={this.props.onCreateTicket}
              selectedDate={this.state.selectedDate}
              onPressDate={(date) => {
                this.setState({ selectedDate: date });
                this._changeSearch(date);
              }}
              onPressGoToday={(today) => {
                this.setState({ selectedDate: today });
                this._changeSearch(today);
              }}
              markedDate={this.props.ticketsCount}
              loadTicketCount={this.props.loadTicketCount}
              weekStartsOn={1} // 0,1,2,3,4,5,6 for S M T W T F S, defaults to 0
            />
            {this._renderRightButton(privilegeHelper.hasAuth('TicketEditPrivilegeCode'),this.props.enableDownload)}
          </View>
          {this._getTabControl()}
          {/*{this._offlineView()}*/}
          {/*{this._autoSyncView()}*/}
          {this._getView()}
        </View>
      </SafeAreaView>
    );
  }

  render1() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar title='我的工单'
          actions={[{
          title:'筛选工单',
          iconType:'filter',
          show: 'always', showWithText: false},
          {title:'创建工单',
          iconType:'add',
          code:'TicketEditPrivilegeCode',
          show: 'always', showWithText: false}
        ]}
        onActionSelected={[this.props.onFilterTicket,this.props.onCreateTicket]}
         />
        {this._getTabControl()}
        {this._getView()}
      </View>

    );
  }
}

Ticket.propTypes = {
  navigator:PropTypes.object,
  contentView:PropTypes.object,
  indexChanged:PropTypes.func.isRequired,
  currentIndex:PropTypes.number.isRequired,
  onCreateTicket:PropTypes.func.isRequired,
  onFilterTicket:PropTypes.func.isRequired,
}
