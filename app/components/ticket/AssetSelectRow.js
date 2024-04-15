'use strict'
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import Icon from '../Icon.js';
import {BLACK,GRAY,GREEN} from '../../styles/color';

export default class AssetSelectRow extends Component{
  constructor(props){
    super(props);
  }
  _getNavIcon(){
    var {rowData} = this.props;
    if(!!rowData.isSelect){
      return (
        <View style={styles.selectView}>
          <Icon type='icon_check' size={10} color='white' />
        </View>
      )
    }else {
      return (
        <View style={styles.unSelectView}>
        </View>
      )
    }
  }
  _getSubHierarchyName(data){
    if(!data) return null;
    var type = data.Type;
    var isAsset = !!data.IsAsset;
    var isOnl = !!data.IsOnline|false;
    var isOnline = false;
    var offLeft = (data.showType - 2) * 22||0;
    var iconType = 'icon_panel';
    if (type===2) {
      iconType='icon_building';//room
      isOnline=true;
    }else if (type===3) {
      iconType='icon_room';//room
      isOnline=true;
    }else if (type===4) {
      iconType=isAsset?'icon_panel':'icon_panel_box';
      isOnline=true;
    }else if (type===5) {
      iconType=isAsset?'icon_device':'icon_device_box';
      isOnline=isOnl;
    }else if(type===200) {
      iconType=isAsset?'icon_asset_loop':'icon_box_loop';
      isOnline=true;
    }
    var onlineColor = isOnline?'#888':'red';
    var textColor = '#888';//BLACK;

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
      <View style={styles.rowContent}>
        {this._getNavIcon()}
        <View style={{flex:1,marginLeft:offLeft+8,flexDirection:'row',alignItems:'center'}}>
          <Icon type={iconType} size={18} color={onlineColor} />
          <View style={{flex:1}}>
            <Text numberOfLines={1} style={[styles.titleText,{color:textColor}]}>{this.props.rowData[this.props.selKey]}</Text>
          </View>
        </View>
      </View>
    )
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   console.warn(nextProps.rowData.isSelect,this.props.rowData.isSelect);
  //   if(!nextProps.rowData || !this.props.rowData) return true;
  //   if(nextProps.rowData[this.props.selKey] === this.props.rowData[this.props.selKey]
  //       && nextProps.rowData.isSelect === this.props.rowData.isSelect){
  //     return false;
  //   }
  //   return true;
  // }
  render(){
    var {rowData,sectionId,rowId} = this.props;
    return (
      <View style={{flex:1,backgroundColor:'white',marginVertical:-1}}>
        <TouchFeedback style={{flex:1}} onPress={()=>{
              this.props.onRowClick(rowData,sectionId,rowId);
            }}>
            {this._getSubHierarchyName(rowData)}
        </TouchFeedback>
      </View>
    );
  }
}

AssetSelectRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
  selKey:PropTypes.string.isRequired,
  sectionId:PropTypes.string,
  rowId:PropTypes.string,
}

var styles = StyleSheet.create({
  rowContent:{
    height:56,
    flexDirection:'row',
    // justifyContent:'space-between',
    alignItems:'center',
    backgroundColor:'white',
    paddingHorizontal:16,
  },
  titleText:{
    marginLeft:4,
    fontSize:17,
    color:'#888'//BLACK
  },
  selectView:{
    width:18,
    height:18,
    borderRadius:10,
    backgroundColor:GREEN,
    justifyContent:'center',
    alignItems:'center'
  },
  unSelectView:{
    width:18,
    height:18,
    borderRadius:10,
    borderColor:GRAY,
    borderWidth:1,
    // marginRight:16,
    justifyContent:'center',
    alignItems:'center'
  },
});
