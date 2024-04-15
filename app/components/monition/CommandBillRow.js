'use strict'

import React,{Component} from 'react';
import {
  View,Text,
  StyleSheet, Image,
} from 'react-native';

import s from "../../styles/commonStyle";
import {GREEN} from "../../styles/color";
import moment from 'moment'
import TouchFeedback from "../TouchFeedback";
const FORMAT = 'YYYY-MM-DD'

export default class CommandBillRow extends Component{
  constructor(props){
    super(props);
  }

  _renderDotValue(isOk) {
    let result = this.props.rowData.get('powerOperationResult');
    if(!result) return null
    let label = result === 1 ? '正常' : '异常';
    let color = result === 2 ? GREEN : '#ff4d4d';
    let img = (
      <Image style={{marginLeft:20}} source={require('../../images/bill/stamp_complete.png')} width={45} height={45}/>
    )
    if(result === 2) {
      img = <Image style={{marginLeft:20}} source={require('../../images/bill/stamp_reject.png')} width={45} height={45}/>
    }

    return (
      <>
        <View style={{height:8,width:8,borderRadius:8,backgroundColor:color}}/>
        <Text style={{fontSize:14,color:'#333',marginLeft:6}}>{label}</Text>
        {img}
      </>
    )
  }

  render(){
    let isGivePower = this.props.rowData.get('operationType')===1
    let powerText = isGivePower ? '送电':'停电'
    let powerColor = isGivePower ? '#284e98':'#fbb325'
    let title = `${this.props.rowData.get('circuitName')||''}(${this.props.rowData.get('circuitSerialNumber')||''})-${this.props.rowData.get('code')}`
    return (
      <TouchFeedback onPress={()=>this.props.onRowClick(this.props.rowData)}>
        <View style={[s.m16,s.p16,s.r,{backgroundColor:'#fff',borderRadius:3,marginBottom:0,marginTop:0}]}>
          <View style={{marginLeft:-16,width:54,height:28,backgroundColor:powerColor,borderTopRightRadius:28,
            borderBottomRightRadius:28,fontSize:14,justifyContent:'center',paddingLeft:8}}>
            <Text style={{color:'#fff'}}>{powerText}</Text>
          </View>
          <View style={[s.f,{marginLeft:12}]}>
            <View style={[s.r,s.ac]}>
              <Text style={{flex:1,fontSize:15,color:'#333'}}>{title}</Text>
              <Text style={{fontSize:13,color:'#888'}}>{moment(this.props.rowData.get('createdTime')).format(FORMAT)}</Text>
            </View>
            <View style={[s.r,s.f,{marginTop:10}]}>
              <View style={[s.f]}>
                <View style={[s.r,s.f]}>
                  <Text style={{width:80,fontSize:15,color:'#888'}}>{`停电原因：`}</Text>
                  <Text style={{fontSize:15,color:'#333',flex:1}}>{`${this.props.rowData.get('powerOffReason')||''}`}</Text>
                </View>
                <View style={[s.r,s.ac,s.f]}>
                  <Text style={{width:80,fontSize:15,color:'#888'}}>{`单       位：`}</Text>
                  <Text style={{fontSize:15,color:'#333'}}>{`${this.props.rowData.get('organization')||''}`}</Text>
                </View>
              </View>
              <View style={{width:120,marginLeft:16}}>
                <View style={[s.r,s.ac,{maxHeight:58,justifyContent:'flex-end'}]}>
                  {this._renderDotValue(true)}
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchFeedback>
    )
  }
}

