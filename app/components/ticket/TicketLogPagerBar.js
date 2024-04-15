'use strict'

import React,{Component} from 'react';
import PropTypes from 'prop-types';

import {View,StyleSheet,Dimensions,Platform} from 'react-native';
import TouchFeedback from '../TouchFeedback';
import Text from '../Text';
import {GREEN,GRAY,TAB_BORDER} from '../../styles/color.js';


export default class PagerBar extends Component {
  constructor(props){
    super(props);
  }
  _getUnreadIcons(index)
  {
    var isContainUnread=false;//debug
    if (!this.props.arrUnreadStatus) {
      return;
    }
    isContainUnread=this.props.arrUnreadStatus[index];
    var color='red';
    if (!isContainUnread) {
      // color='transparent';
      return ;
    }
    return (
      <View style={{
          marginLeft:0,
          marginTop:0,
          borderColor:color,
          backgroundColor:color,
          borderWidth:1,borderRadius:3,
          width:6,height:6,}}>
      </View>
    )
  }
  render () {
    var {array,currentIndex,barStyle,selectTextColor,lineColor} = this.props;
    var {width} = Dimensions.get('window');
    width=width/3.0-10;
    return (
      <View style={[styles.bar,barStyle]}>
        {
          array.map((item,index)=>{
            var lColor = 'transparent';
            var tColor=this.props.defaultTextColor;
            if(index === currentIndex){
              lColor = lineColor;
              tColor=selectTextColor;
            }
            return (
              <View key={index} style={styles.barItem}>
                <View style={{
                    flex:1,width:width,justifyContent:'flex-end',alignItems:'center'
                    // ,backgroundColor:'gray'
                  }}>
                  <TouchFeedback onPress={()=>{this.props.onClick(index)}}>
                    <View style={{
                          // minWidth:75,
                        }}>
                      <View style={{marginBottom:Platform.OS==='ios'?9:11,
                          flexDirection:'row',
                          // alignItems:'center',
                          justifyContent:'center',
                          // paddingHorizontal:10,
                        }}>
                        <Text style={[styles.barItemText,{color:tColor}]}>{item}</Text>
                        {this._getUnreadIcons(index)}
                      </View>
                      <View style={[styles.barItemLine,{backgroundColor:lColor}]}>
                      </View>
                    </View>
                  </TouchFeedback>
                </View>
              </View>
            )
          })
        }
      </View>
    )
  }
}

PagerBar.propTypes = {
  array:PropTypes.array.isRequired,
  currentIndex:PropTypes.number.isRequired,
  onClick:PropTypes.func.isRequired,
  barStyle:PropTypes.style,
  arrUnreadStatus:PropTypes.array,
  defaultTextColor:PropTypes.string,
  selectTextColor:PropTypes.string,
  lineColor:PropTypes.string,
};

PagerBar.defaultProps = {
  selectTextColor:'black',
  lineColor:'green',
  defaultTextColor:'black',
}

var styles = StyleSheet.create({
  bar:{
    flexDirection:'row',
    height:36,
    alignItems:'flex-end',
    justifyContent:'center',
    paddingHorizontal:25,
  },
  barItem:{
    flex:1,
    // paddingHorizontal:10,
    alignItems:'center',
    // justifyContent:'flex-end',
    marginTop:0,
  },
  barItemText:{
    // flex:1,
    textAlign:'center',
    fontSize:17,
    // lineHeight:16,
    color:'black'
  },
  barItemLine:{
    height:3,
    borderRadius:2,
    // marginTop:9,
    // marginBottom:0,
    // marginHorizontal:8
  },
})
