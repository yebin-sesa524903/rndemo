import React,{Component} from "react";
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import {View, Text, ScrollView,FlatList} from 'react-native';
import s from "../../styles/commonStyle";
import {Table} from "../Table";
import TouchFeedback from "../TouchFeedback";
import {testAsset as Assets} from './billTaskTpl'
import {GREEN} from "../../styles/color";

export default class BillMenuModal extends Component{
  constructor(props) {
    super(props)
  }

  _renderType(label) {
    return (
      <Text style={[s.f14,{color:'#666',width:80}]}>{label}</Text>
    )
  }

  _renderItem(label,data) {
    return (
      <TouchFeedback onPress={()=>this.props.onMenu(data)}>
        <View style={[s.ph16,s.center,{paddingVertical:8,paddingHorizontal:50,width:'100%'}]}>
          <Text style={[s.f16,{color:'#333'}]}>{label}</Text>
        </View>
      </TouchFeedback>
    )
  }

  render() {
    if(this.props.show) {
      return (
        <CommonActionSheet modalVisible={this.props.show} onCancel={this.props.onCancel}>
          <View style={[s.center,{backgroundColor:'#fff'}]}>
            <View style={[s.center,s.m16,{backgroundColor:'#fff',borderRadius:8,width:'100%'}]}>
              <View style={[s.center,s.p16,{marginBottom:16,paddingTop:0,borderBottomWidth:1,borderBottomColor:'#e6e6e6',width:'100%'}]}>
                <Text style={[s.f14,{color:'#666'}]}>{'请选择命令票类型'}</Text>
              </View>
              {this._renderType('停电')}
              {this._renderItem('命令票',{commandTicketType:1,operationType:2})}
              {this._renderItem('申请票',{commandTicketType:2,operationType:2})}
              {this._renderType('送电')}
              {this._renderItem('命令票',{commandTicketType:1,operationType:1})}
              {this._renderItem('申请票',{commandTicketType:2,operationType:1})}
            </View>
          </View>
        </CommonActionSheet>
      )
    }
    return null;
  }
}
