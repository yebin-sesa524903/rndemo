
'use strict';
import React,{Component} from 'react';
import {
  View,Keyboard,Image,BackHandler,InteractionManager,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import List from '../List.js';
import HierarchyBindRow from './HierarchyBindRow';
import SearchBar from '../SearchBar';
import {isPhoneX} from '../../utils';

export default class BindHierarchyView extends Component{
  constructor(props){
    super(props);
    this.state={value:'',keyboardHeight:0}
  }
  _renderRow(rowData,sectionId,rowId){
    var isCurrent = false;
    // if(rowData.get('Id') === this.props.currentPanel){
    //   isCurrent = true;
    // }
    return (
      <HierarchyBindRow currentRouteId={this.props.currentRouteId} isCurrent={isCurrent} rowData={rowData} onRowClick={this.props.onRowClick} />
    );
  }

  _clear(disKeyboard){
    if(disKeyboard) {
      Keyboard.dismiss();
    }
    this.setState({value:''},()=>{
      this.props.doFilter('');
    });
  }

  _searchChanged(text){
    this.setState({value:text},()=>{
      this._doFilter(text);
    });
  }

  _doFilter(text){
    let lastTime=this._lastTime||0;
    let duration=(new Date().getTime()) - lastTime;
    // console.log('duration',duration);
    if(duration<500){
      //记录本次要查询的关键字
      this._lastSearchText=text;
      if(this._filterTimer) clearTimeout(this._filterTimer);
      this._filterTimer=setTimeout(()=>{
        this._doFilter(this._lastSearchText);
      },510-duration);
      return;
    }
    this._lastTime=new Date().getTime();
    this.props.doFilter(text.trim());
  }

  componentDidMount() {
    //注册监听事件
    this._registerEvents();
    //注册监听
    InteractionManager.runAfterInteractions(()=>{
      this._back=BackHandler.addEventListener('hardwareBackPress', () => {
        if(this.state.value.length>0){
          this._clear();
          return true;
        }
        return false;
      });
    });
  }

  _registerEvents(){
    this._keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => this._keyboardDidShow(e));
    this._keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', (e) => this._keyboardDidHide(e));
  }

  _unRegisterEvents() {
    this._keyboardDidShowSubscription && this._keyboardDidShowSubscription.remove();
    this._keyboardDidHideSubscription && this._keyboardDidHideSubscription.remove();
  }

  _keyboardDidShow(e) {
    let offset=70;
    if(Platform.OS==='ios'){
      if(isPhoneX()) offset=90;
      else offset=70;
    }
    this.setState({keyboardHeight:e.endCoordinates.height-offset,showKeyboard:true});
  }

  _keyboardDidHide() {
    this.setState({keyboardHeight:0,showKeyboard:false});
  }

  componentWillUnmount() {
    this._unRegisterEvents();
    if(this._filterTimer) clearTimeout(this._filterTimer);
    Keyboard.dismiss();
    this._back&&this._back.remove();
  }

  render() {
    var actions = null;
    // console.warn('BindHierarchyView..render ',this.props.isFetching,this.props.listData);
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar
          title={'选择设备'}
          navIcon="back"
          actions={actions}
          onActionSelected={[this.props.onScanClick]}
          onIconClicked={()=>this.props.onBack()}/>
        <SearchBar
          style={{marginTop:-1,backgroundColor:'#fff',borderColor:'#f2f2f2',borderBottomWidth:1}}
          value={this.state.value}
          hint={'请搜索资产'}
          showCancel={this.state.showKeyboard||this.state.value.length>0}
          onCancel={()=>this._clear(true)}
          onClear={()=>this._clear(false)}
          onChangeText={this._searchChanged.bind(this)}
        />
        <List
          isFetching={this.props.isFetching}
          listData={this.props.listData}
          hasFilter={false}
          currentPage={1}
          totalPage={1}
          emptyText='此楼宇下没有资产'
          onRefresh={this.props.onRefresh}
          renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
        />
      </View>
    );
  }
}

BindHierarchyView.propTypes = {
  navigator:PropTypes.object,
  onScanClick:PropTypes.func.isRequired,
  user:PropTypes.object,
  currentRouteId:PropTypes.string,
  buildData:PropTypes.object,
  onBack:PropTypes.func.isRequired,
  currentPanel:PropTypes.number,
  isFromScan:PropTypes.bool,
  onRowClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  listData:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
}
