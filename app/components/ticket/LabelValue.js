'use strict'
import React,{Component} from 'react';

import {
  View,
  Linking,
  ViewPropTypes,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text.js';
import NetworkText from './NetworkText.js';
import {GRAY,BLACK,GREEN} from '../../styles/color.js';
import Icon from '../Icon.js';

export default class LabelValue extends Component {
  constructor(props){
    super(props);
    this.state={id:null,loaded:false};
  }
  render () {
    var {style,value,label} = this.props;
    var textColor = BLACK;

    var array;
    if(Array.isArray(value)){
      textColor = GREEN;
      array = value;
    }
    else {
      array = [{name:value}];
    }
    return (
      <View style={[{flexDirection:'row',},style]}>
        <View style={{flex:1}}>
          {
            array.map((item,index)=>{
              var marginTop = null;
              if(index !== 0){
                marginTop = {marginTop:10};
              }
              var textComponent=null;
              if (!item.id) {
                textComponent=(
                  <Text
                    style={{fontSize:15,color:textColor,lineHeight:24,marginTop:0}}
                    numberOfLines={1}>{item.name}</Text>
                );
              }else {
                textComponent=(
                  <NetworkText
                    item={item}
                    textStyle={{fontSize:15,color:textColor,lineHeight:24,marginTop:1}}
                    forceStoped={this.props.forceStoped}></NetworkText>
                );
              }
              var top=Platform.OS==='ios'?5:9;
              return (
                <View key={index} style={[{flex:1,flexDirection:'row',},marginTop]}>
                  <View style={{marginTop:top,marginRight:9,}}>
                    <Icon type={'icon_document'} size={15} color={GREEN} />
                  </View>
                  <View style={{flex:1,}}>
                    {textComponent}
                  </View>
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }
}

LabelValue.propTypes = {
  label:PropTypes.string.isRequired,
  value:PropTypes.any.isRequired,
  style:ViewPropTypes.style,
  forceStoped:PropTypes.bool,
}
