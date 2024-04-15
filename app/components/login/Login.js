'use strict';
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import Form from './Form';
import KeyboardSpacer from '../KeyboardSpacer';
import {BLACK, GREEN} from '../../styles/color.js';
import Text from '../Text.js';
import TouchFeedback from '../TouchFeedback';
import {Keyboard} from 'react-native';
import Toast from 'react-native-root-toast';
import Colors from "../../utils/const/Colors";
export default class Login extends Component{
  constructor(props){
    super(props);
    var {width,height} = Dimensions.get('window');
    // console.warn('width,height',width,height);
    this.state = {width,height,checked:true}
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   if(this.props.data === nextProps.data&&
  //     this.props.type===nextProps.type&&
  //     this.props.errCode===nextProps.errCode &&
  //     nextState.checked === this.state.checked){
  //     return false;
  //   }
  //   return true;
  // }

_renderRegButton(){
    let type=this.props.type;
    if(type!=='mobile'){
      return (
        <View style={{zIndex:3,alignItems:'center',justifyContent:'center',marginBottom:30}}>
          { true ? null :
            <TouchFeedback onPress={() => {
              this.props.onSwitch('phoneReg');
              Keyboard.dismiss()
              }}>
              <View style={{
                marginTop: 10, width: 30, height: 18, alignItems: 'center',
                borderBottomWidth: 1, borderColor: 'white', justifyContent: 'center'
              }}>
                <Text style={styles.switcherText}>{'注册'}</Text>
              </View>
            </TouchFeedback>
          }
          {/* <TouchFeedback onPress={()=>{
            this.props.doHostConfig()
            Keyboard.dismiss()
          }}>
            <View style={{marginTop:10,height:18,alignItems:'center',
              borderBottomWidth:1,borderColor:'white',justifyContent:'center'}}>
              <Text style={styles.switcherText}>{'服务器地址配置>'}</Text>
            </View>
          </TouchFeedback> */}
        </View>
      );
    }
    return null;
  }

  render(){
    var {width,height} = this.state;
    var {type} = this.props,text;
    if(type === 'mobile'){
      text = '用户名密码登录';
    }
    else {
      text = '手机验证码登录';
    }
    var hBottomHeight=69;
    var bkgYPosi=height-hBottomHeight;
    // console.warn('ddd',width,hBottomHeight);
    return (
      <TouchableOpacity style={{flex:1}} activeOpacity={1.0} onPress={() => Keyboard.dismiss()}>
        <ImageBackground
          // source={require('../../images/app_bkg/app_bkg.jpg')}
          resizeMode="cover"
          style={{flex: 1, backgroundColor:Colors.seBgLayout}}>
          <Form
              errCode={this.props.errCode}
              isCanSaveUserName={this.props.isCanSaveUserName}
              onClickSaveUserName={this.props.onClickSaveUserName}
              type={this.props.type}
              data={this.props.data}
              onSend={this.props.onSend}
              onSwitch={this.props.onSwitch}
              onGetVerifyCode={this.props.onGetVerifyCode}
              doHostConfig={this.props.doHostConfig}
              onSubmit={()=>{
                if(!this.state.checked) {
                  Keyboard.dismiss()
                  Toast.show('请您先阅读并同意协议', {
                    duration: Toast.durations.SHORT,
                    position: Toast.positions.BOTTOM,
                  });
                  return;
                }
                this.props.onSubmit()
              }}
              onNeedResetItem={this.props.onNeedResetItem}
              onInputChanged={this.props.onInputChanged}  />
        </ImageBackground>
      </TouchableOpacity>
    )
  }
}




Login.propTypes = {
  isCanSaveUserName:PropTypes.bool.isRequired,
  errCode:PropTypes.string.isRequired,
  type:PropTypes.string.isRequired,
  onSwitch:PropTypes.func.isRequired,
  onBack:PropTypes.func.isRequired,
  onSubmit:PropTypes.func.isRequired,
  onInputChanged:PropTypes.func.isRequired,
  onNeedResetItem:PropTypes.func,
  onSend:PropTypes.func,
  onGetVerifyCode:PropTypes.func,
  data:PropTypes.object.isRequired,
  onClickSaveUserName:PropTypes.func,
}

var styles = StyleSheet.create({
  imageBackground:{
    // flex:1,
    justifyContent:'center',
  },
  switcherText:{
    fontSize:12,
    color:'white',
    // textDecorationLine:'underline',
  },
  switcher:{
    marginTop:24,
    height:50,
    // flex:1,
    position:'absolute',
    top:0,
    left:10,
    right:0,
    // backgroundColor:'red',
    justifyContent:'center',
  },
  form:{
    flex:1,
    marginTop:0,
    // paddingHorizontal:16,
    // backgroundColor:'red',
    // justifyContent:'center',
    // alignItems:'center'
  }
});
