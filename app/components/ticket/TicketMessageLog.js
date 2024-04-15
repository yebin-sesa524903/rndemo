
'use strict';
import React,{Component} from 'react';

import {
  View,
  Platform,
  //ViewPagerAndroid,
  SegmentedControlIOS
} from 'react-native';
import PropTypes from 'prop-types';
import ViewPager from '@react-native-community/viewpager';
const ViewPagerAndroid=ViewPager;
import Toolbar from '../Toolbar';
// import Loading from '../Loading';
import TicketLogPagerBar from './TicketLogPagerBar.js';
import {GREEN,TAB_BORDER} from '../../styles/color.js';

export default class TicketMessageLog extends Component{
  constructor(props){
    super(props);
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
    // console.warn('index',index);
    if(this.props.currentIndex !== index){
      this.props.indexChanged(index);
    }
  }
  _getTabArray(){
    var array = ['全部留言'];
    return array;
  }
  _getTabControl(){
    var array = this._getTabArray();
    if(array.length > 1){
      return (
        <TicketLogPagerBar
          barStyle={{
          }}
          defaultTextColor={Platform.OS==='ios'?'black':'white'}
          selectTextColor={Platform.OS==='ios'?GREEN:'white'}
          lineColor={Platform.OS==='ios'?GREEN:'white'}
          array={array}
          arrUnreadStatus={[false,!this.props.isReadMessage,]}
          currentIndex={this.props.currentIndex}
          onClick={(index)=>this._pagerBarClicked(index)} />
      )
    }
  }
  _getView(){
      return this.props.contentView;
  }

  componentWillReceiveProps(nextProps) {

  }
  _getToolbar(){
    var actions = [{
      title:'添加',
      iconType:'add',
      code:this.props.privilegeCode,
      show:'always'}];
    if (!this.props.showAdd) {
      actions = null;
    }
    return (
      <Toolbar
        title={this.props.title}
        navIcon="back"
        actions={actions}
        onIconClicked={this.props.onBack}
        onActionSelected={[this.props.createLog]} />
    );
  }
  render() {
    var array = this._getTabArray();
    return (
      <View style={{flex:1,backgroundColor:'white',}}>
        {this._getToolbar()}
        {this._getView()}
      </View>

    );
  }
}

TicketMessageLog.propTypes = {
  navigator:PropTypes.object,
  title:PropTypes.string,
  onBack:PropTypes.func.isRequired,
  contentView:PropTypes.object,
  isFagdType:PropTypes.bool,
  isReadMessage:PropTypes.bool,
  createLog:PropTypes.bool,
  showAdd:PropTypes.bool,
  indexChanged:PropTypes.func.isRequired,
  currentIndex:PropTypes.number.isRequired,
  privilegeCode:PropTypes.string.isRequired,
}
