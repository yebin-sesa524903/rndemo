'use strict'
import React,{Component} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
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

export default class RegWithUserView extends Component{
  constructor(props){
    super(props);
    this.state={};
  }

  _getToolbar() {
    var navColor=GREEN;
    var navIcon='back';
    let disable=true;
    if(this.props.viewProps.name.trim().length>0 && this.props.viewProps.email.trim().length>0 &&
      this.props.viewProps.pwd.trim().length>0 && this.props.viewProps.pwd2.trim().length>0){
      disable=false;
    }
    // disable=false;
    return (
      <Toolbar
        title={'注册'}
        navIcon={navIcon}
        actions={[{title:'完成',show:'always',disable:disable}]}
        onIconClicked={this.props.onBack}
        onActionSelected={[()=>{
          Keyboard.dismiss();
          this.props.submit();
        }]} />
    );
  }

  _textChanged(type,value){
    // let obj={};
    // obj[type]=value;
    // this.setState(obj);
    this.props.onInputChange(type,value);
  }

  _getClearView(type,value) {
    if (value) {
      return (
        <TouchFeedback style={{}} onPress={()=>{
          // let obj={};
          // obj[type]='';
          // this.setState(obj)
          this._textChanged(type,'');
        }}>
          <View style={{width:30,height:30,alignItems:'center',justifyContent:'center'}}>
            <Icon type={'icon_unselect'} size={14} color={'#d0d0d0'} />
          </View>
        </TouchFeedback>
      )
    }
  }

  _renderRow(title,hint,type){
    let keyboardType=Platform.OS==='ios'?"email-address":'default';
    let secure=false;
    if(type==='pwd' || type==='pwd2'){
      secure=true;
    }
    let showHint=true;
    if(this.props.viewProps[type] && this.props.viewProps[type].length>0){
      showHint=false;
    }
    return (
      <View style={styles.inputLineContainer}>
        <Text style={{width:70,color:'#333',fontSize:17,marginRight:16}}>{title}</Text>
        <View style={{flexDirection:'row',alignItems:'center',flex:1,height:56}}>
          <View style={{flex:1}}>
            <View style={{position:'absolute',height:56,flex:1,justifyContent:'center'}}>
              <Text style={{color:'#d0d0d0',fontSize:17,}}>{showHint?hint:''}</Text>
            </View>
          <TextInput
            style={styles.input}
            autoFocus={type==='name'}
            autoCorrect={false}
            multiline={false}
            numberOfLines={2}
            maxLength={32}
            keyboardType={keyboardType}
            underlineColorAndroid={'transparent'}
            placeholderTextColor={'#d0d0d0'}
            // clearButtonMode={'always'}
            secureTextEntry={secure}
            onChangeText={(text)=>this._textChanged(type,text)}
            value={this.props.viewProps[type]}/>
          </View>

            {this._getClearView(type,this.props.viewProps[type])}
        </View>

      </View>
    )
  }

  render(){
    return (
      <View style={styles.container}>
        {this._getToolbar()}
        <View style={{marginTop:12}}>
          <ListSeperator />
        </View>
        <View style={styles.inputContainer}>
          {this._renderRow('用户名','请输入用户名','name')}
          <ListSeperator marginWithLeft={16}/>
          {this._renderRow('邮箱','请输入邮箱','email')}
          <ListSeperator marginWithLeft={16}/>
          {this._renderRow('密码','8位以上，含大小写字母、数字及特殊字符','pwd')}
          <ListSeperator marginWithLeft={16}/>
          {this._renderRow('确认密码','请再次输入密码','pwd2')}
          <ListSeperator marginWithLeft={0}/>
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
    // paddingBottom:7,
  },
  inputLineContainer:{
    paddingHorizontal:16,
    height:56,
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center'
  },
  input:{
    fontSize:17,
    color:'#888',
    backgroundColor:'#00000000',
    flex:1,
    padding:0,
    textAlignVertical:'center',
    margin:0,
    // paddingBottom:10
  },
  passTip: {
    marginHorizontal:20,
    // marginTop: 12,
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
