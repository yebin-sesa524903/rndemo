'use strict'
import React,{Component} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';

import {BLACK,GRAY,ENV_EDIT_LINE,LIST_BG,PLACEHOLDER_GRAY,GREEN,TIP_GRAY} from '../../styles/color';
import Toolbar from '../Toolbar';
import Loading from '../Loading';
import Icon from '../Icon.js';
import TouchFeedback from '../TouchFeedback';
import ListSeperator from '../ListSeperator';
import Text from '../Text.js';
import Toast from 'react-native-root-toast';
import {Keyboard} from 'react-native';
import SingleTextInput from '../SingleTextInput.js';

var _timeoutId = null;
function resetTimeoutAlert(action) {
  if( _timeoutId ) {
    clearTimeout(_timeoutId);
  }
  _timeoutId = setTimeout(() => {
    action();
  }, 5 * 60 * 1000);
}
function _clearTimeout() {
  if( _timeoutId ) {
    clearTimeout(_timeoutId);
  }
}

export default class PassEditView extends Component{
  constructor(props){
    super(props);
    this.state = {
      srcPass:'',
      newPass:'',
      confirmPass:'',
      isShowSrcPass:true,
      isShowNewPass:true,
    };
  }
  _clearTimeout() {
    _clearTimeout();
  }
  _textChanged(type,value){
    if (type==='srcPass') {
      this.setState({'srcPass':value});
    }else if (type==='newPass') {
      this.setState({'newPass':value});
    }else if (type==='confirmPass') {
      this.setState({'confirmPass':value});
    }
    this.props.cleanChangePassError();
  }
  _clearSrcPass()
  {
    this.setState({'srcPass':''});
  }
  _focusSrcPassEdit()
  {
    if (this._srcPassInput) {
      this._srcPassInput.focus();
    }
  }
  _clearNewPass()
  {
    this.setState({'newPass':''});
  }
  _focusNewPassEdit()
  {
    if (this._newPassInput) {
      this._newPassInput.focus();
    }
  }
  _clearConfirmPass()
  {
    this.setState({'confirmPass':''});
  }
  _focusConfirmPassEdit()
  {
    if (this._confrimPassInput) {
      this._confrimPassInput.focus();
    }
  }
  _getToolbar()
  {
    var navColor=GREEN;
    var navIcon='back';

    var enabled=true;//this.state.srcPass&&this.state.newPass&&this.state.newConfirmPass;
    return (
      <Toolbar
        title={'修改密码'}
        navIcon={navIcon}
        actions={[{title:'完成',show:'always'}]}
        onIconClicked={this.props.onBack}
        onActionSelected={[()=>{
          Keyboard.dismiss();
          if (!this.state.srcPass) {
            Toast.show('请输入旧密码', {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            });
            return;
          }
          else if (!this.state.newPass) {
            Toast.show('请输入新密码', {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM,
            });
            return;
          }else {
            this.props.save({'OldPassword':this.state.srcPass,'NewPassword':this.state.newPass, "ConfirmPass": this.state.confirmPass});
          }
        }]} />
    );
  }
  render(){
    // keyboardType={"name-phone-pad"}
    if( !this.props.timeout ) {
      resetTimeoutAlert(this.props.timeoutAlert);
    }
    return (
      <View style={styles.container}>
        {this._getToolbar()}
        <View style={{marginTop:12}}>
          <ListSeperator />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputLineContainer}>
            <Icon type="icon_login_pass" color={GREEN} size={20}/>
            <SingleTextInput
                cusRef={(input)=>this._srcPassInput=input}
                style={styles.input}
                autoFocus={true}
                autoCorrect={false}
                keyboardType={'ascii-capable'}
                underlineColorAndroid={'transparent'}
                textAlign={'left'}
                placeholderTextColor={PLACEHOLDER_GRAY}
                textAlignVertical={'bottom'}
                placeholder={"请输入旧密码"}
                clearButtonMode={'always'}
                secureTextEntry={this.state.isShowSrcPass}
                onChangeText={(text)=>this._textChanged('srcPass',text)}
                value={this.state.srcPass}
              />
          </View>

          <ListSeperator marginWithLeft={16}/>
          <View style={styles.inputLineContainer}>
            <Icon type="icon_login_pass" color={GREEN} size={20}/>
            <SingleTextInput
                cusRef={(input)=>this._newPassInput=input}
                style={styles.input}
                autoFocus={false}
                autoCorrect={false}
                keyboardType={'ascii-capable'}
                underlineColorAndroid={'transparent'}
                textAlign={'left'}
                placeholderTextColor={PLACEHOLDER_GRAY}
                textAlignVertical={'bottom'}
                placeholder={"请输入新密码"}
                clearButtonMode={'always'}
                secureTextEntry={this.state.isShowNewPass}
                onChangeText={(text)=>this._textChanged('newPass',text)}
                value={this.state.newPass}
              />
          </View>
          <ListSeperator marginWithLeft={16}/>
          <View style={styles.inputLineContainer}>
            <Icon type="icon_login_pass" color={GREEN} size={20}/>
            <SingleTextInput
                cusRef={(input)=>this._confrimPassInput=input}
                style={styles.input}
                autoFocus={false}
                autoCorrect={false}
                keyboardType={'ascii-capable'}
                underlineColorAndroid={'transparent'}
                textAlign={'left'}
                placeholderTextColor={PLACEHOLDER_GRAY}
                textAlignVertical={'bottom'}
                placeholder={"请再次输入新密码"}
                clearButtonMode={'always'}
                secureTextEntry={this.state.isShowNewPass}
                onChangeText={(text)=>this._textChanged('confirmPass',text)}
                value={this.state.confirmPass}
              />
          </View>
          <ListSeperator/>
        </View>
        <Text style={styles.passTip}>最少8位，需包含大小写字母、数字及特殊字符</Text>
      </View>
    );
  }
}

PassEditView.propTypes = {
  user:PropTypes.object.isRequired,
  onBack:PropTypes.func.isRequired,
  isFromClevel:PropTypes.bool,
  save:PropTypes.func.isRequired,
  postState:PropTypes.string,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:LIST_BG,
  },
  inputContainer:{
    // flex:1,
    // marginTop:16,
    // paddingHorizontal:15,
    // alignItems:'center',
    backgroundColor:'white',
    justifyContent:'center',
    // paddingBottom:7,
  },
  inputLineContainer:{
    // flex:1,
    // width:200,
    // paddingHorizontal:16,
    // paddingLeft:16,
    paddingHorizontal:16,
    // height:46,
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
    marginTop: 12,
    marginLeft: 16,
    fontSize: 12,
    color: TIP_GRAY
  }
});
