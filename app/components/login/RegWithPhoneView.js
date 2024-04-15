'use strict'
import React,{Component} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';

import {BLACK, GRAY, ENV_EDIT_LINE, LIST_BG, GREEN, LOGIN_GREEN_DISABLED,} from '../../styles/color';
import Toolbar from '../Toolbar';
import Loading from '../Loading';
import Icon from '../Icon.js';
import TouchFeedback from '../TouchFeedback';
import ListSeperator from '../ListSeperator';
import Text from '../Text.js';
import Toast from 'react-native-root-toast';
import {Keyboard} from 'react-native';
import SingleTextInput from '../SingleTextInput.js';
import Button from '../Button';

export default class RegWithPhoneView extends Component{
  constructor(props){
    super(props);
    this.state = {
      phone:'',
      code:''
    };
  }

  _getToolbar() {
    var navColor=GREEN;
    var navIcon='back';
    //如果输入的手机号11位和验证码大于4位，才可以点击下一步
    var disable=true;
    if(this.state.phone.trim().length===11&&this.props.code.trim().length>=4 &&
      /\d{11}/.test(this.state.phone.trim()) && this.state.checked){
      disable=false;
    }
    return (
      <Toolbar
        title={'注册'}
        navIcon={navIcon}
        actions={[{title:'下一步',show:'always',disable:disable}]}
        onIconClicked={this.props.onBack}
        onActionSelected={[()=>{
          Keyboard.dismiss();
          this.props.onNext(this.state.phone.trim(),this.props.code.trim());
        }]} />
    );
  }

  _textChanged(type,value){
    //替换成只能输入纯数字，不能输入其他
    if (type==='phone') {
      value=value.replace(/[^\d]+/, '');
      this.setState({'phone':value});
    }else if (type==='code') {
      // this.setState({'code':value});
      this.props.onChangeInputCode(value);
    }
  }

  render(){
    //判断手机号是否11位数字
    let enable=false;
    if(/\d{11}/.test(this.state.phone.trim())) {
      enable = (this.props.countDown === 0) && (this.state.phone.trim().length === 11);
    }
    return (
      <View style={styles.container}>
        {this._getToolbar()}
        <View style={{marginTop:12}}>
          <ListSeperator />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputLineContainer}>
            <Text style={{width:70,color:'#333',fontSize:17,marginRight:16}}>手机号码</Text>
            <SingleTextInput
              cusRef={(input)=>this._srcPassInput=input}
              style={styles.input}
              autoFocus={true}
              autoCorrect={false}
              keyboardType={"numeric"}
              underlineColorAndroid={'transparent'}
              textAlign={'left'}
              maxLength={11}
              placeholderTextColor={'#d0d0d0'}
              textAlignVertical={'bottom'}
              placeholder={"请输入11位手机号码"}
              clearButtonMode={'always'}
              clearColor={'#d0d0d0'}
              secureTextEntry={false}
              onChangeText={(text)=>this._textChanged('phone',text)}
              value={this.state.phone}
            />
          </View>

          <ListSeperator marginWithLeft={16}/>
          <View style={styles.inputLineContainer}>
            <Text style={{width:70,color:'#333',fontSize:17,marginRight:16}}>验证码</Text>
            <SingleTextInput
              cusRef={(input)=>this._newPassInput=input}
              style={styles.input}
              autoFocus={false}
              autoCorrect={false}
              maxLength={6}
              clearColor={'#d0d0d0'}
              keyboardType={"numeric"}
              underlineColorAndroid={'transparent'}
              textAlign={'left'}
              placeholderTextColor={'#d0d0d0'}
              textAlignVertical={'bottom'}
              placeholder={"请输入验证码"}
              clearButtonMode={'always'}
              secureTextEntry={false}
              onChangeText={(text)=>this._textChanged('code',text)}
              value={this.props.code}
            />
            <Button
              text={this.props.countDown===0?'获取':`${this.props.countDown}s`}
              textStyle={styles.sendButtonText}
              disabledTextStyle={[styles.sendButtonText,styles.sendButtonDisableText]}
              disabledStyle={[styles.sendButton,styles.sendButtonDisable]}
              style={styles.sendButton}
              onClick={()=>this.props.onSend(this.state.phone.trim())}
              disabled={!enable} />
          </View>
          <ListSeperator/>
        </View>
        <Text style={styles.passTip}>
          <Text>继续即代表您同意 </Text>
          <Text style={{color:GREEN}} onPress={(()=>this.props.openLink('agreement'))}>施耐德电气数字化服务平台用户协议</Text>
          <Text> 和 </Text>
          <Text style={{color:GREEN}} onPress={(()=>this.props.openLink('privacy'))}>施耐德电气数字化服务平台数据隐私申明</Text>
        </Text>
        <View style={{flexDirection:'row',justifyContent:'center',flex:1,alignItems:'flex-start'}}>
          <TouchFeedback onPress={()=>{
            this.setState({checked:!this.state.checked})
          }}>
            <View style={{padding:10,paddingRight:0,flexDirection:'row', alignItems:'center'}}>
              <View style={{width:16,height:16,borderWidth:1,borderRadius:2,marginRight:8,
                alignItems:'center',justifyContent:'center',borderColor:this.state.checked ? GREEN:'#888',
                backgroundColor:this.state.checked ? GREEN : 'rgba(255, 255, 255, 0.3)'}}>
                {
                  this.state.checked ?
                    <Icon type={'icon_check'} color={'#fff'} size={14}/>
                    : null
                }
              </View>
              <Text style={{fontSize:13,color:'#888'}}>已阅读并同意</Text>
            </View>
          </TouchFeedback>
          <TouchFeedback onPress={()=>this.props.openLink('privacy')}>
            <View style={{padding:10,paddingLeft:0}}>
              <Text style={{fontSize:13,color:GREEN}}>《隐私声明》</Text>
            </View>
          </TouchFeedback>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:LIST_BG,
  },
  inputContainer:{
    backgroundColor:'white',
    justifyContent:'center',
  },
  inputLineContainer:{
    paddingHorizontal:16,
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  inputLabel:{
    marginLeft:16,
    color:BLACK,
    fontSize:17,
    width:100,
    textAlign:'left'
  },
  input:{
    fontSize:17,
    color:BLACK,
    backgroundColor:'white',
    flex:1,
    // padding:0,
    marginTop:0,marginBottom:0,
    marginRight:0,
    marginLeft:10,
    height:48,
  },
  passTip: {
    marginHorizontal:20,
    marginTop: 12,
    fontSize: 15,
    color: '#888'
  },

  sendButton:{
    backgroundColor:GREEN,
    width:62,
    height:28,
    borderRadius:2,
    marginRight:12,
  },
  sendButtonDisable:{
    backgroundColor:'#9ee6ab'//'#bdbdbd'
  },
  sendButtonText:{
    fontSize:15,
    color:'#fff'
  },
  sendButtonDisableText:{
    color:'#fff'
  },
  button:{
    marginTop:30,
    backgroundColor:GREEN,
    // flex:1,
    borderRadius:2,
    height:44,
  },
  buttonDisabled:{
    backgroundColor:LOGIN_GREEN_DISABLED
  },
  buttonText:{
    color:'white',
    fontSize:18
  },
  buttonDisabledText:{
    color:'#fff',
  }
});
