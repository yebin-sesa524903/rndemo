'use strict'
import React,{Component,PureComponent} from 'react';
import {
  View,
  StyleSheet,
  UIManager,findNodeHandle,Dimensions
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import ClickableRow from '../ClickableRow';
import Icon from '../Icon';
import {BLACK,GREEN} from '../../styles/color';
import TouchFeedback from "../TouchFeedback";

const SH=Dimensions.get('window').height;

export default class HierarchyRow extends PureComponent{
  constructor(props){
    super(props);
  }
  _getOfflineState(isGateway,isOnline)
  {
    if (isGateway&&isOnline===false) {
      return (
        <View style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fdece5',borderRadius:3}}>
          <Text numberOfLines={1} style={[styles.offlineText]}>{'网关离线'}</Text>
        </View>
      );
    }else {
      return null;
    }
  }

  _calOffsetToBottom(e,type,data){
    UIManager.measureInWindow(findNodeHandle(e.target),(x,y,w,h)=>{
      let toBottom=SH-(y+h);
      if(type==3){
        this.props.addBox(data,toBottom);
      }else{
        this.props.addDevice(data,toBottom);
      }
    });
  }

  _getSubHierarchyName(data){
    var type = data.Type;
    var showType=data.showType;
    var isAsset = !!data.IsAsset;
    var isOnl = !!data.IsOnline|false;
    var isOnline = false;
    var offLeft = (data.showType - 3) * 26;
    var iconType = 'icon_panel';
    //新增左右icon,左边收起展开，右边添加
    let iconLeft,iconRight;
    if (type===3) {
      iconType='icon_room';//room
      isOnline=data.IsOnline;
      iconRight=this.props.logbookPermission?(
        <View style={{marginRight:16}}>
          <TouchFeedback onPress={(e)=>this._calOffsetToBottom(e,3,data)}>
            <View style={{padding:8}}>
              <Icon type={'icon_asset_add'} color={'#888'} size={17}/>
            </View>
          </TouchFeedback>
        </View>
      ):null;
    }else if (type===4) {
      iconType=isAsset?'icon_panel':'icon_panel_box';
      isOnline=true;
      iconRight=this.props.logbookPermission?(
        <View style={{marginRight:16}}>
          <TouchFeedback  onPress={(e)=>this._calOffsetToBottom(e,4,data)}>
            <View style={{padding:8}}>
              <Icon type={'icon_asset_add'} color={'#888'} size={17}/>
            </View>
          </TouchFeedback>
        </View>
      ):null;
    }else if (type===5) {
      iconType=isAsset?'icon_device':'icon_device_box';
      isOnline=isOnl;
    }else if(type===200) {
      iconType=isAsset?'icon_asset_loop':'icon_box_loop';
      isOnline=true;
      iconRight=(this.props.logbookPermission && false) ?(
        <View style={{marginRight:16}}>
          <TouchFeedback  onPress={(e)=>this._calOffsetToBottom(e,200,data)}>
            <View style={{padding:8}}>
              <Icon type={'icon_asset_add'} color={'#888'} size={17}/>
            </View>
          </TouchFeedback>
        </View>
      ):null;
    }
    // var onlineColor = isOnline?BLACK:'red';
    // if (type===3) {
    //   onlineColor=BLACK;
    // }
    var textColor = '#333';//BLACK;
    if(type != 3) textColor='#888';

    var onlineColor = isOnline?textColor:'red';
    if (type===3) {
      onlineColor=textColor;
    }
    if(this.props.isCurrent){
      textColor = GREEN;
    }
    if(type===3 || type===4 || type===200){
      if(data && data.Children && data.Children.length>0){
        let isFolder=data.isFolder;
        let isSubFolder=data.isSubFolder;
        let folderIcon=isFolder?'icon_asset_folder':'icon_asset_expand';
        let actionType=!isFolder;
        if(type===4||type===200){
          folderIcon=isSubFolder?'icon_asset_folder':'icon_asset_expand';
          actionType=!isSubFolder;
        }
        iconLeft=(
          <TouchFeedback  onPress={()=>{
            this.props.changeAssetExpand && this.props.changeAssetExpand(this.props.rowId,actionType);
          }}>
            <View style={{padding:8,marginLeft:-8}}>
              <Icon type={folderIcon} color={'#b2b2b2'} size={18}/>
            </View>
          </TouchFeedback>
        );
      }
    }
    if(!iconLeft&&(showType==3||showType==4 ||showType===5)){
      iconLeft=(
        <View style={{width:26}}/>
      );
    }

    //****************是为了UI布局的间距调整
    let leftIconWidth=0;
    if(!iconLeft){
      leftIconWidth=26;
    }
    let roomStyle=null;
    let boxStyle=null;
    if(showType==3){
      roomStyle={borderTopWidth:1,marginTop:-1,borderBottomWidth:1,borderColor:'#e6e6e6'}
    }else{
      boxStyle={
        paddingLeft:leftIconWidth,borderBottomWidth:1,borderColor:'#e6e6e6'
      }
      if(showType===6){
        offLeft+=27;
        boxStyle.paddingLeft=0;
      }
    }
    //************end

    //新增了三种图标类型：母线系统，功能单元组，插件箱
    let subType=data.SubType;
    switch (subType){
      case 7:
        iconType='icon_asset_bus_system';
        break;
      case 50:
        iconType='icon_asset_socket_box';
        break;
      case 60:
        iconType='icon_asset_function_unit_group';
        break;
      case 8:
        iconType='icon_floor';
        break;
      case 70:
        iconType='icon_power_dis_box';
        break;
    }


    return (
      <View style={[styles.rowContent,roomStyle]}>
        <View style={[{flex:1,marginLeft:offLeft,flexDirection:'row',alignItems:'center'},boxStyle,styles.rowHeight]}>
          {iconLeft}
          <Icon type={iconType} size={18} color={onlineColor} />
          <View style={{flexDirection:'row',flex:1}}>
            <View style={{justifyContent:'center',flexShrink:1}}>
              <Text numberOfLines={1} style={[styles.titleText,{marginLeft:8,marginRight:16,color:textColor,fontSize:17}]}>{data.Name}</Text>
            </View>
            {this._getOfflineState(type===3,isOnline)}
          </View>
          {iconRight}
        </View>
      </View>
    )
  }
  render(){
    var {rowData} = this.props;
    if(!rowData) return null;
    // if(rowData.get('showType !=3 && rowData.get('isFolder==true) return null;
    return (
      <View style={[styles.row,styles.rowHeight,{backgroundColor:'#fff'}]}>
        <TouchFeedback style={{flex:1}} onPress={()=>this.props.onRowClick(rowData)}>
          {this._getSubHierarchyName(rowData)}
        </TouchFeedback>
      </View>
    );
  }
}

HierarchyRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  isCurrent:PropTypes.bool.isRequired,
  currentRouteId:PropTypes.string,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:56,
  },
  rowContent:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'transparent',
    flex:1,
    paddingLeft:16,
  },
  titleText:{
    fontSize:14,
    marginHorizontal:16,
  },
  offlineText:{
    fontSize:13,
    color:'#f28459',
    marginHorizontal:4,
  },
});
