'use strict'

import React,{Component} from 'react';
import {
  View,Text,
  StyleSheet, Image,
} from 'react-native';

import s from "../../styles/commonStyle";
import {GREEN} from "../../styles/color";
import TouchFeedback from "../TouchFeedback";
import moment from "moment";
const FORMAT = 'YYYY-MM-DD'
export default class JobBillRow extends Component{
  constructor(props){
    super(props);
  }

  _renderDotValue() {
    let result = this.props.rowData.get('executionResult');
    if(!result) return null
    let label = result === 2 ? '正常' : '异常';
    let color = result === 2 ? GREEN : '#ff4d4d';
    let img = (
      <Image style={{marginLeft:20}} source={require('../../images/bill/stamp_complete.png')} width={45} height={45}/>
    )
    if(result === 1) {
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
    return (
      <TouchFeedback onPress={()=>this.props.onRowClick(this.props.rowData)}>
        <View style={[s.m16,s.p16,s.r,{backgroundColor:'#fff',paddingBottom:6,borderRadius:3,marginBottom:0,marginTop:0}]}>
          <View style={[s.f,{}]}>
            <View style={[s.r,s.ac]}>
              <Text style={{flex:1,fontSize:15,color:'#333'}}>{`${this.props.rowData.get('workContent')}-${this.props.rowData.get('code')}`}</Text>
              <Text style={{fontSize:13,color:'#888'}}>{moment(this.props.rowData.get('createTime')).format(FORMAT)}</Text>
            </View>
            <View style={[s.r,s.f,{marginTop:10}]}>
              <View style={[s.r,s.ac,s.f]}>
                <Text style={{width:80,fontSize:15,color:'#888'}}>{`单       位：`}</Text>
                <Text style={{fontSize:15,color:'#333'}}>{`${this.props.rowData.get('createSubstationHierarchyName')}`}</Text>
              </View>
              <View style={{width:120,marginLeft:16}}>
                <View style={[s.r,s.ac,{maxHeight:58,justifyContent:'flex-end'}]}>
                  {this._renderDotValue()}
                </View>
              </View>
            </View>
          </View>
        </View>
      </TouchFeedback>

    )

  }
}

