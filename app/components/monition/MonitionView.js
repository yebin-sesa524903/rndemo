
'use strict';
import React,{Component} from 'react';
import {
  View, Text,Dimensions,
  Image, Platform, ScrollView, RefreshControl, SafeAreaView, StatusBar
} from 'react-native';


import Toolbar from '../Toolbar';
import List from '../List.js';
import Section from '../Section.js';
import PagerBar from '../PagerBar.js';
import TouchFeedback from "../TouchFeedback";
import {GREEN, LINE, LIST_BG} from "../../styles/color";
import Icon from '../Icon';
import s from "../../styles/commonStyle";
import BillMenuModal from "./billMenuModal";
import CommandBillRow from "./CommandBillRow";
import JobBillRow from "./JobBillRow";
import OperateBillRow from "./OperateBillRow";
let statusHeight = 0;
if(Platform.OS==='android'){
  statusHeight=StatusBar.currentHeight;
}

console.warn('size:',Dimensions.get('window'));

export default class Monition extends Component{
  constructor(props){
    super(props);
    this.state={
      mainTab:['命令票','操作票','工作票'],
      subTab:['未完成','已完成'],
      mainIndex:0,subIndex:0
    }
  }
  _renderRow(rowData,sectionId,rowId){
    let CMP = null;
    switch (this.props.tabIndex) {
      case 0:
        CMP = CommandBillRow;
        break;
      case 1:
        CMP = OperateBillRow;
        break;
      case 2:
        CMP = JobBillRow;
        break;
    }
    return (
      <CMP rowId={rowId} onRowClick={this.props.onRowClick} rowData={rowData} finish={this.props.subIndex===1}/>
    );
  }

  _renderSection(sectionData,sectionId,rowId){
    return (
      <Text>这是分组标题</Text>
    )
  }

  _renderTabControl(array,index,isMain){
    if(array.length > 1){
      return (
        <PagerBar
          barStyle={{
            height:48,
            flexDirection:'row',
            borderBottomWidth:1,
            borderColor:'#f2f2f2',
            marginTop:-1,
          }}
          selectItemTextStyle={{fontSize:19,fontWeight:'600',color:GREEN}}
          unSelectItemTextStyle={{fontSize:19,color:'#333'}}
          barItemStyle={{flex:1,alignSelf:'flex-end'}}
          itemStyle={{height:44,justifyContent:'center'}}
          styleBarItemText={{color:'#333',fontSize:15}}
          styleBarLineItem={{width:54,height:3,position:'absolute',bottom:2,alignSelf:'center'}}
          array={array}
          currentIndex={index}
          onClick={(index)=>{
            this.props.onIndexChanged(index,isMain)
          }} />
      )
    }
  }

  _renderStatusTab() {
    let array = ['未完成','已完成'];
    let tabs = array.map((item,index) => {
      let checked = this.props.subIndex === index;
      let borderRadius = {};
      switch (index) {
        case 0:
          borderRadius={
            borderTopLeftRadius:2,borderTopRightRadius:0,borderBottomLeftRadius:2,borderBottomRightRadius:0,
            borderRightWidth:0
          }
          break;
        case 1:
          borderRadius={
            borderTopLeftRadius:0,borderTopRightRadius:2,borderBottomLeftRadius:0,borderBottomRightRadius:2,
          }
          break;
      }
      return (
        <TouchFeedback key={index} onPress={()=>{this.props.onIndexChanged(index,false)}}>
          <View  style={{height:32,width:94,alignItems:'center',borderWidth:1,...borderRadius,borderColor:GREEN,
            justifyContent:'center',backgroundColor:checked?GREEN:'#fff'}}>
            <Text style={{fontSize:14,color:checked?'#fff':GREEN}}>{item}</Text>
          </View>
        </TouchFeedback>
      )
    });
    return (
      <View style={{flexDirection:'row',borderRadius:2,alignItems:'center',justifyContent:'center',
        paddingVertical:10}}>
        {tabs}
      </View>
    )
  }

  _onAdd = ()=>{
    if(this.props.substation) {
      //只有命令票才弹出菜单
      if(this.props.tabIndex === 0){
        this._showMenu();
        return;
      }
    }
    this.props.onAddBill();
  }

  _renderAddButton() {
    //操作票不能单独在列表中创建
    if(this.props.tabIndex === 1) return null;
    let showAdd = false;
    //console.log('renderAddButton',this.state,this.props.billPermission)
    if(this._hasPermission()) {
      switch (this.props.tabIndex) {
        case 0:
          showAdd = this.props.billPermission.command.canCreate
          break;
        case 2:
          showAdd = this.props.billPermission.job.canCreate
          break;
      }
    }
    if(!showAdd) return null;
    return (
      <TouchFeedback onPress={this._onAdd}>
        <View style={[s.center,{position:'absolute',bottom:16,right:16,}]}>
          <Image resizeMethod={"scale"} source={require('../../images/bill/bill_add_button.png')} style={{width:70,height:70}}/>
        </View>
      </TouchFeedback>
    )
  }

  _showMenu() {
    this.setState({menuModal:true})
  }

  _dismissMenu = ()=> {
    this.setState({menuModal:false})
  }

  _onMenu = (data) => {
    this._dismissMenu();
    this.props.onAddBill(data);
  }

  _renderMenu() {
    if(this.state.menuModal) {
      return (
        <BillMenuModal show={this.state.menuModal} onCancel={this._dismissMenu}
          onMenu={this._onMenu}
        />
      )
    }
  }

  _getEmptyText() {
    let type = ['命令票','操作票','工作票'][this.props.tabIndex],status = ['未完成','已完成'][this.props.subIndex];
    return `无${status}${type}`
  }

  //判断当前tab有没有权限，如果没有权限，显示无权限提示
  _hasPermission() {
    switch (this.props.tabIndex) {
      case 0:
        return this.props.billPermission.command.canRead;
      case 1:
        return this.props.billPermission.operate.canRead;
      case 2:
        return this.props.billPermission.job.canRead;
    }
    return false;
  }

  render() {
    return (
      <View style={{flex:1,backgroundColor:'#f2f2f2',paddingTop:statusHeight }}>
        <SafeAreaView style={{flex:1}}>
          {this._renderTabControl(this.state.mainTab,this.props.tabIndex,true)}
          {this._renderStatusTab()}
          {
            this._hasPermission() ?
              <List
                needGotoTop={true}
                isFetching={this.props.isFetching}
                listData={this.props.listData}
                hasFilter={this.props.hasFilter}
                currentPage={this.props.currentPage}
                nextPage={this.props.nextPage}
                onRefresh={this.props.onRefresh}
                totalPage={this.props.totalPage}
                clearFilter={this.props.clearFilter}
                onFilterClick={this.props.onFilterClick}
                renderSeperator={(sid,rid)=>{
                  return <View style={{height:8}}/>
                }}
                renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
                renderSectionHeader={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
                emptyText={this._getEmptyText()}
                filterEmptyText=''
              />
              :
              <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <Text style={{fontSize:17,color:'#666'}}>{'无权限'}</Text>
              </View>
          }

        </SafeAreaView>
        {this._renderAddButton()}
        {this._renderMenu()}
      </View>

    );
  }
}

