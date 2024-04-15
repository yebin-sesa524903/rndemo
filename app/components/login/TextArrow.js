'use strict';
import React,{Component} from 'react';
import {
  View,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
// import Icon from '../Icon';
import {LOGIN_SWITCHER} from '../../styles/color.js';


export default class TextArrow extends Component{
  constructor(props){
    super(props);
  }
  render(){
    var {onClick} = this.props;

    var text = '产品试用';
    // if(type === 'mobile'){
    //   text = '密码登录';
    // }
    // else {
    //   text = '验证码登录';
    // }
    return (
      <TouchFeedback onPress={onClick} borderless={true}>
        <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
          <Text style={{fontSize:14,color:LOGIN_SWITCHER}}>{text}</Text>
          <Image
            source={require('../../images/login_arrow/arrow.png')}
            style={{width:16,height:16}}
            tintColor={LOGIN_SWITCHER}
             />
        </View>
      </TouchFeedback>
    )
  }
}

TextArrow.propTypes = {
  style:PropTypes.object,
  onClick:PropTypes.func.isRequired,
}
