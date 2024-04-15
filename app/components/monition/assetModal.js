import React,{Component} from "react";
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import {View, Text, ScrollView,FlatList} from 'react-native';
import s from "../../styles/commonStyle";
import {Table} from "../Table";
import TouchFeedback from "../TouchFeedback";
import {testAsset as Assets} from './billTaskTpl'
import {GREEN} from "../../styles/color";
import Icon from "../Icon";

export default class AssetModal extends Component{
  constructor(props) {
    super(props)
    this._init();
  }

  _init() {
    let rooms = this.props.assets || [];
    let index = 0;
    let panels = rooms[0] ? (rooms[0].children||[]) : [];
    this.state = {rooms,panels,index,select:this.props.select||[]}
  }

  _changeRoom = (index) => {
    let rooms = this.state.rooms;
    let panels = rooms[index].children||[];
    this.setState({panels,index})
  }

  _renderTitle() {
    return (
      <View style={[s.center,s.p16]}>
        <Text style={[s.f18]}>{this.props.title}</Text>
      </View>
    )
  }

  _renderVLine() {
    return (
      <View style={{width:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _renderHLine() {
    return (
      <View style={{height:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _renderRoomItem = (item) => {
    let isSel = item.index === this.state.index;
    return (
      <TouchFeedback onPress={()=>this._changeRoom(item.index)}>
        <View style={[s.p8]}>
          <Text style={[s.f14,{color:isSel ? GREEN :'#333'}]}>{item.item.name}</Text>
        </View>
      </TouchFeedback>
    )
  }

  _clickPanel = (item, isCheck) => {
    if(this.props.multi) {
      let select = this.state.select;
      if(isCheck) {
        let index = select.findIndex(s => s.id === item.item.id);
        select.splice(index,1);
      }else {
        select.push(item.item);
      }
      this.setState({select})
      this.props.onMultiSelect && this.props.onMultiSelect(select,isCheck,item.item);
      return;
    }
    if(this.props.onClickAsset) {
      this.props.onClickAsset(this.state.rooms[this.state.index],item.index);
    }
  }

  _renderPanelItem = (item) => {
    let icon = null;
    let isCheck = false;
    if(this.props.multi) {
      let select = this.state.select;
      if(select.find(s => s.id === item.item.id)){
        icon = <Icon type={'icon_check'} color={GREEN} size={16}/>
        isCheck = true;
      }
    }
    return (
      <TouchFeedback onPress={()=>this._clickPanel(item,isCheck)}>
        <View style={[s.p8,s.r,s.ac,{borderBottomColor:'#f2f2f2',borderBottomWidth:1}]}>
          <Text style={[s.f14,s.f,{color:'#333'}]}>{`${item.item.name}(${item.item.serialNumber})`}</Text>
          {icon}
        </View>
      </TouchFeedback>
    )
  }

  _renderRoomList() {
    return (
      <FlatList keyExtractor={this._keyExtractor} showsVerticalScrollIndicator={false} style={{}}
                data={this.state.rooms} renderItem={this._renderRoomItem}/>
    )
  }

  _keyExtractor = (item, index) => index;

  _renderLoopList() {
    return (
      <FlatList keyExtractor={this._keyExtractor} showsVerticalScrollIndicator={false} style={{}}
                data={this.state.panels} renderItem={this._renderPanelItem}/>
    )
  }

  render() {
    if(this.props.show) {
      return (
        <CommonActionSheet modalVisible={this.props.show} onCancel={this.props.onCancel}>
          <View style={[{backgroundColor:'#fff',maxHeight:600}]}>
            {this._renderTitle()}
            {this._renderHLine()}
            <View style={[s.r,s.ph16,{height:400}]}>
              {this.state.rooms.length > 1 ?
                <>
                  <View style={[s.g1]}>
                    {this._renderRoomList()}
                  </View>
                  {this._renderVLine()}
                </> : null
              }
              <View style={[s.g2,s.ph16]}>
                {this._renderLoopList()}
              </View>
            </View>
          </View>

        </CommonActionSheet>
      )
    }
    return null;
  }
}
