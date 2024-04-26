'use strict';
import React, { Component } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  InteractionManager,
  Platform,
  Image,
  Alert,
  Dimensions, Pressable,
} from 'react-native';
import PropTypes from 'prop-types';

import TouchFeedback from '../TouchFeedback';
import Text from '../Text.js';
import Button from '../Button';
import { GRAY, BLACK, GREEN, LOGIN_SEP, LOGIN_GREEN_DISABLED } from '../../styles/color.js';
import { Keyboard } from 'react-native';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import ModalDropdown from 'react-native-modal-dropdown';
import storage from '../../utils/storage';
import Colors from "../../utils/const/Colors";
import Icon from "../Icon";
import { localStr } from "../../utils/Localizations/localization";

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      secureTextEntry: true,
      showDropDown: false,
      showLoginFailedType: null,
      arrayUserName: [],
      isSaveUserName: props.isCanSaveUserName,
    }
    // this.state = {focus:false};
    // this.state = {value1:'',value2:'',submitStatus:'disabled',resendStatus:'disabled'};
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.data && nextProps.data) {
      this.setState({ isSaveUserName: nextProps.isCanSaveUserName })
      if (!this.props.errCode) {
        // console.warn('componentWillReceiveProps...',this.props.errCode,nextProps.errCode);
        if (nextProps.errCode === 'UserNameIssure') {
          this.setState({ 'showLoginFailedType': 'UserNameIssure' })
        } else if (nextProps.errCode === 'UserPasswordIssure') {
          this.setState({ 'showLoginFailedType': 'UserPasswordIssure' })
        } else if (nextProps.errCode === 'UserLoginParamIssure') {
          this.setState({ 'showLoginFailedType': 'UserLoginParamIssure' })
        } else if (nextProps.errCode === 'codeIssure') {
          Alert.alert(
            '',
            '验证码输入有误',
            [
              {
                text: '好', onPress: () => {
                  this.props.onNeedResetItem({ type: 'resetCode' });
                  InteractionManager.runAfterInteractions(() => {
                    if (this._codeInput) {
                      this._codeInput.focus();
                    }
                  });
                }
              }
            ],
            { cancelable: false }
          )
        } else if (nextProps.errCode === 'paddwordVerifiCodeError') {
          Alert.alert(
            '',
            '您输入的验证码有误！',
            [
              {
                text: '重新输入', onPress: () => {
                  this.props.onGetVerifyCode();
                  this.props.onNeedResetItem({ type: 'resetPassCode' });
                  InteractionManager.runAfterInteractions(() => {
                    if (this._passwordCodeInput) {
                      this._passwordCodeInput.focus();
                    }
                  });
                }
              }
            ],
            { cancelable: false }
          )
        } else if (nextProps.errCode === 'mustChangePassword') {
          Alert.alert(
            '密码强度过低',
            '您的密码强度过低，存在一定风险，基于安全要求，请修改密码！',
            [
              {
                text: '取消', onPress: () => {
                  this.props.onNeedResetItem({ type: 'clean' });
                  this.props.onNeedResetItem({ type: 'resetPassCode' });
                  InteractionManager.runAfterInteractions(() => {
                    if (this._passwordCodeInput) {
                      this._passwordCodeInput.focus();
                      this.props.onGetVerifyCode();
                    }
                  });
                }
              },
              {
                text: '修改密码', onPress: () => {
                  this.props.onNeedResetItem({ type: 'resetPassCode' });
                  this.props.onSwitch('changePassword');
                }
              },
            ]
          )
        }

      } else {
        this.setState({ 'showLoginFailedType': null });
      }
    }
  }
  _codeChanged(type, text) {
    // console.warn('inputchange:',type);
    if (type === 'password') {
      // this.props.onInputChanged(type, 'eJCJ/wrddqTHGx7rhxL+hA==1');
      this.props.onInputChanged(type, text);
    } else {
      this.props.onInputChanged(type, text);
    }
  }
  // _staffNumChange(type,text) {
  //   // console.log(type);
  //   // console.log('+++++');
  //   // console.log(text);
  //   this.props.onInputChanged(type, text);
  // }
  // _passwordChange(type,text) {
  //   // console.log(type);
  //   // console.log('====');
  //   // console.log(text);
  //   this.props.onInputChanged(type, text);
  // }
  _getTitle() {
    return (
      <View style={{ marginBottom: 18, marginLeft: 0 }}>
        <Text style={{ color: 'white', fontSize: 32, fontWeight: '600' }}>{'EnergyHub'}</Text>
        <Text style={{ marginTop: 12, color: 'white', fontSize: 20 }}>{'智能配电数字化服务云平台'}</Text>
      </View>
    )
  }

  _renderHostInput() {
    if (true) return null;
    return (
      <>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            textContentType={'URL'}
            autoFocus={false}
            autoCapitalize={'none'}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            placeholderTextColor={'#b2b2b2'}
            textAlignVertical={'bottom'}
            placeholder={'服务器地址'}
            onChangeText={(text) => this._codeChanged('host', text)}
            value={this.props.data.get('host')}
          />
          <TouchFeedback onPress={() => { this.props.doHostConfig() }}>
            <Text>配置</Text>
          </TouchFeedback>
        </View>
        <View style={{ height: 10, backgroundColor: 'transparent' }} />
      </>

    )
  }

  _getMobileValidationForm() {
    var senderEnable = this.props.data.get('senderEnable');
    var counterText = this.props.data.get('counter');
    if (counterText) {
      counterText += 's';
    }
    else {
      counterText = '获取';
    }

    return (
      <View style={styles.form}>
        {this._renderHostInput()}
        <View style={styles.inputContainer}>
          <TextInput
            ref={(input) => this._firstInput = input}
            style={styles.input}
            keyboardType={"numeric"}
            autoFocus={false}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            placeholderTextColor={'#b2b2b2'}
            textAlignVertical={'bottom'}
            placeholder={'手机号'}
            onChangeText={(text) => this._codeChanged('phoneNumber', text)}
            value={this.props.data.get('phoneNumber')}
          />
        </View>
        <View style={{ height: 10, backgroundColor: 'transparent' }} />
        <View style={styles.inputContainer}>
          <TextInput
            ref={(input) => this._codeInput = input}
            style={styles.input}
            keyboardType={"numeric"}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            placeholderTextColor={'#b2b2b2'}
            textAlignVertical={'bottom'}
            placeholder={"验证码"}
            onChangeText={(text) => this._codeChanged('validCode', text)}
            value={this.props.data.get('validCode')}
          />
          <Button
            text={counterText}
            textStyle={styles.sendButtonText}
            disabledTextStyle={[styles.sendButtonText, styles.sendButtonDisableText]}
            disabledStyle={[styles.sendButton, styles.sendButtonDisable]}
            style={styles.sendButton}
            onClick={() => this.props.onSend()}
            disabled={!senderEnable} />
        </View>
      </View>

    );
  }
  _getPasswordValidationForm() {
    var inputStyle = {};
    if (Platform.OS === 'android') {
      // inputStyle={marginTop:18,};
    }
    var base64Icon = '';
    var verifiCode = this.props.data.get('verifiCode');
    if (verifiCode) {
      base64Icon = 'data:image/png;base64,' + verifiCode.get('Content');
    }
    return (
      <View style={styles.form}>
        {this._renderHostInput()}
        <View style={styles.inputContainer}>
          <TextInput
            ref={(input) => this._nameInput = input}
            style={styles.input}
            keyboardType={"email-address"}
            autoFocus={false}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            placeholderTextColor={'#b2b2b2'}
            textAlignVertical={'bottom'}
            placeholder={"用户名"}
            spellCheck={false}
            onChangeText={(text) => this._codeChanged('userName', text)}
            value={this.props.data.get('userName')}
          />
        </View>
        <View style={{ height: 10, backgroundColor: 'transparent' }} />
        <View style={styles.inputContainer}>
          <TextInput
            ref={(input) => this._passInput = input}
            style={styles.input}
            keyboardType={Platform.OS == 'ios' ? "email-address" : 'default'}
            secureTextEntry={true}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            placeholderTextColor={'#b2b2b2'}
            textAlignVertical={'bottom'}
            placeholder={"密码"}
            spellCheck={false}
            onChangeText={(text) => this._codeChanged("password", text)}
            value={this.props.data.get('password')}
          />
        </View>
        <View style={{ height: 10, backgroundColor: 'transparent' }} />
        <View style={styles.inputContainer}>
          <TextInput
            ref={(input) => this._passwordCodeInput = input}
            style={[styles.input, {}]}
            keyboardType={"numeric"}
            secureTextEntry={false}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            placeholderTextColor={'#b2b2b2'}
            textAlignVertical={'center'}
            placeholder={'请输入计算结果'}
            onChangeText={(text) => this._codeChanged("inputVeriCode", text)}
            value={this.props.data.get('inputVeriCode')}
          />
          <View style={{ flex: 1, width: 86, height: 28, alignItems: 'flex-end', paddingRight: 16, }}>
            <TouchFeedback style={{}} onPress={() => {
              this.props.onGetVerifyCode();
            }
            }>
              <View style={{ width: 86, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                {
                  !base64Icon ? <Text>刷新验证码</Text> :
                    <Image
                      style={{ backgroundColor: '#3331' }}
                      source={{ uri: base64Icon, width: 86, height: 28 }}
                      resizeMode='contain'
                    />
                }

              </View>

            </TouchFeedback>
          </View>
        </View>
      </View>

    );
  }
  _getLoginButton() {
    var submitEnable = this.props.data.get('submitEnable');

    var text = '登录';
    if (this.props.data.get('isFetching')) {
      text = '登录中...';
    }
    return (
      <Button
        text={text}
        style={styles.button}
        disabledStyle={[styles.button, styles.buttonDisabled]}
        disabledTextStyle={[styles.buttonText, styles.buttonDisabledText]}
        textStyle={styles.buttonText}
        onClick={this.props.onSubmit}
        disabled={!submitEnable} />
    )

  }
  async componentDidMount() {
    InteractionManager.runAfterInteractions(async () => {
      // console.warn('mounted');
      // this._nameInput.blur();
      // this._nameInput.focus();
      var userName = await storage.getItem('ARRAYUSERNAMESKEY');
      if (!userName) {
        return;
      }
      var arrayNames = JSON.parse(userName);
      if (userName === null || userName === '' || userName.trim().length === 0) {
        this.setState({ arrayUserName: [] })
      } else {
        this.setState({ arrayUserName: arrayNames })
      }
    });
  }
  componentWillUnmount() {
    // this._nameInput.blur();
    // this._passInput.blur();
  }

  _getTips(text) {
    return (
      <Text style={{ color: Colors.seErrorColor, fontSize: 13, marginLeft: 0, marginTop: 2 }}>{text}</Text>
    )
  }
  // 分类选择
  _selectType = (index, value) => {
    this.props.onInputChanged('userName', value);
  }
  // 下拉列表分隔符
  _separator = () => {
    return (
      <Text style={{ height: 0, backgroundColor: Colors.seBorderSplit }}></Text>
    )
  }

  renderLoginError(type) {
    if (this.state.showLoginFailedType === 'UserNameIssure' && type === 'userName') {
      return this._getTips(localStr('lang_login_error_not_exist_account'));
    } else if (this.state.showLoginFailedType === 'UserPasswordIssure' && type === 'passWord') {
      return this._getTips(localStr('lang_login_error_invalid_account'));
    } else if (this.state.showLoginFailedType === 'UserLoginParamIssure' && type === 'passWord') {
      return this._getTips(localStr('lang_login_error_invalid_account'));
    } else {
      return null;
    }
  }

  render() {
    var content = null, { type } = this.props;
    if (type === 'mobile') {
      content = this._getMobileValidationForm();
    }
    else {
      content = this._getPasswordValidationForm();
    }

    let loginBtnEnable = (this.props.data.get('userName').length > 0 && this.props.data.get('password').length > 0);
    // var options = ['F100350', 'F100351', 'F100352'];
    return (
      // <View style={{ paddingHorizontal: 16, }}>
      //   {this._getTitle()}
      //   {content}
      //   {this._getLoginButton()}
      // </View>
      <View style={{ backgroundColor: Colors.seBgLayout, width: Dimensions.get('window').width, height: Dimensions.get('window').height }}>
        <Image source={require('../../images/login/loginbg/loginbg.png')} style={{ height: 404, width: Dimensions.get('window').width }} resizeMode={'cover'}></Image>
        <View style={{ height: 280, backgroundColor: Colors.seBgContainer, position: 'absolute', top: 300, left: 15, right: 15, borderRadius: 8 }}>
          <Text style={{ color: Colors.seBrandNomarl, fontSize: 16, fontWeight: '500', marginLeft: 24, marginTop: 18 }}>{localStr('lang_login_title')}</Text>
          <View style={styles.inputWarp}>
            <Image source={require('../../images/login/user/user.png')} style={{ width: 14, height: 14, marginLeft: 18 }}></Image>
            <TextInput
              style={{ marginLeft: 12, fontSize: 14, flex: 1, color: Colors.seTextPrimary }}
              placeholder={localStr('lang_login_user_hint')}
              spellCheck={false}
              autoCapitalize={'none'}
              placeholderTextColor={Colors.seTextDisabled}
              keyboardType={"email-address"}
              autoFocus={false}
              onChangeText={(text) => this._codeChanged('userName', text)}
              value={this.props.data.get('userName')}>
            </TextInput>
            {
              (this.state.arrayUserName && this.state.arrayUserName.length > 0) &&
              <ModalDropdown
                options={this.state.arrayUserName}
                dropdownListProps={{}}
                dropdownStyle={[{ height: this.state.arrayUserName.length * 44, width: Dimensions.get('window').width - 15 * 2 - 27 * 2, borderColor: Colors.seBorderSplit }]}
                dropdownTextStyle={{ color: Colors.seTextPrimary, fontSize: 14, backgroundColor: Colors.seBgContainer, height: 44, paddingLeft: 12 }}    //下拉框文本样式
                renderSeparator={this._separator}
                adjustFrame={(position) => {
                  return {
                    top: (position.top ?? 0) - 10,
                    left: position.left,
                    right: position.right
                  }
                }}      //下拉框位置
                // dropdownTextHighlightStyle={{ color: '#666666', backgroundColor: '#EDF4FF' }}
                onDropdownWillShow={() => { this.setState({ showDropDown: true }) }}
                onDropdownWillHide={() => { this.setState({ showDropDown: false }) }}
                onSelect={this._selectType}
                defaultValue={''}>
                <Image source={this.state.showDropDown ? require('../../images/login/downarrow/downarrow.png') : require('../../images/login/downarrow/toparrow.png')} style={{ width: 14, height: 14, marginRight: 18 }}></Image>
              </ModalDropdown>
            }
          </View>
          <View style={{ height: 18, backgroundColor: Colors.seBgContainer, marginLeft: 27 }}>
            {this.renderLoginError('userName')}
          </View>
          <View style={[styles.inputWarp, { marginTop: 2 }]}>
            <Image source={require('../../images/login/password/password.png')} style={{ width: 14, height: 14, marginLeft: 18 }}></Image>
            <TextInput
              style={{ marginLeft: 12, fontSize: 14, flex: 1, color: Colors.seTextPrimary }}
              placeholder={localStr('lang_login_password_hint')}
              placeholderTextColor={Colors.seTextDisabled}
              onChangeText={(text) => this._codeChanged("password", text)}
              value={this.props.data.get('password')}
              secureTextEntry={this.state.secureTextEntry}>
            </TextInput>
            <Pressable onPress={() => {
              if (this.state.secureTextEntry) {
                this.setState({
                  secureTextEntry: false
                })
              } else {
                this.setState({
                  secureTextEntry: true
                })
              }
            }}>
              <Image source={this.state.secureTextEntry ? require('../../images/login/shutpassword/shutpassword.png') : require('../../images/login/shutpassword/seepassword.png')} style={{ width: 14, height: 14, marginRight: 18 }}></Image>
            </Pressable>

          </View>
          <View style={{ height: 18, backgroundColor: Colors.seBgContainer, marginLeft: 27 }}>
            {this.renderLoginError('passWord')}
          </View>
          <Button
            onClick={this.props.onSubmit}
            text={localStr('lang_login_button')}
            disabled={!loginBtnEnable}
            textStyle={{ color: Colors.seTextInverse }}
            disabledStyle={{ backgroundColor: Colors.seDisabledColor }}
            style={{ marginTop: 2, marginLeft: 27, marginRight: 27, backgroundColor: Colors.seBrandNomarl, height: 45, borderRadius: 2 }}></Button>
          <Pressable style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', }} onPress={() => {
            this.props.onClickSaveUserName(this.state.isSaveUserName)
          }}>
            <View>
              {this.state.isSaveUserName ?
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginLeft: 27, width: 16, height: 16, backgroundColor: Colors.seBrandNomarl, borderRadius: 2 }}>
                  <Icon type={'icon_check'} color={Colors.seBgContainer} size={14} />
                </View>
                : <Image source={require('../../images/login/repassword/nopassword.png')} style={{ marginTop: 20, marginLeft: 27, width: 16, height: 16 }}></Image>}

            </View>
            {/* */}
            <Text style={{ color: Colors.seTextPrimary, fontSize: 12, marginLeft: 7, marginTop: 20 }}>{localStr('lang_login_remember')}</Text>
          </Pressable>
        </View>
        <View style={{ position: 'absolute', left: 0, bottom: 100, right: 0, alignItems: 'center' }}>
          <Text style={{ color: Colors.seTextPrimary, fontSize: 13 }}>{localStr('lang_login_help')}</Text>
          <Pressable onPress={() => {
            this.props.doHostConfig()
            Keyboard.dismiss()
          }}>
            <Text style={{ color: Colors.seBrandNomarl, fontSize: 12, textDecorationLine: 'underline', marginTop: 4 }}>{localStr('lang_login_server_config')}</Text>

          </Pressable>
        </View>
      </View>
    )
  }
}

Form.propTypes = {
  type: PropTypes.string.isRequired,
  errCode: PropTypes.string,
  isCanSaveUserName: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onSwitch: PropTypes.func.isRequired,
  onSend: PropTypes.func,
  onGetVerifyCode: PropTypes.func,
  data: PropTypes.object.isRequired,
  onInputChanged: PropTypes.func.isRequired,
  onNeedResetItem: PropTypes.func,
  onClickSaveUserName: PropTypes.func,
}


const styles = global.amStyleProxy(() => StyleSheet.create({
  form: {
    backgroundColor: 'transparent',
    // borderRadius:6,
    // paddingHorizontal:10,

  },
  inputContainer: {
    backgroundColor: Colors.seBgContainer,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 2,
  },
  inputLabel: {
    color: 'black',
    fontSize: 14,
    width: 64,
    textAlign: 'center'
  },
  input: {
    flex: 1,
    fontSize: 17,
    marginLeft: 12,
    backgroundColor: 'white',
    marginTop: 0, marginBottom: 0,
    borderRadius: 2,
    // height:48,
  },
  sendButton: {
    backgroundColor: Colors.seBrandNomarl,
    width: 62,
    height: 28,
    borderRadius: 2,
    marginRight: 12,
  },
  sendButtonDisable: {
    backgroundColor: Colors.seTextDisabled//'#bdbdbd'
  },
  sendButtonText: {
    fontSize: 15,
    color: Colors.seTextInverse
  },
  sendButtonDisableText: {
    color: Colors.seTextInverse
  },
  button: {
    marginTop: 30,
    backgroundColor: Colors.seBrandNomarl,
    // flex:1,
    borderRadius: 2,
    height: 44,
  },
  buttonDisabled: {
    backgroundColor: Colors.disable
  },
  buttonText: {
    color: 'white',
    fontSize: 18
  },
  buttonDisabledText: {
    color: Colors.seTextInverse,
  },
  inputWarp: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    backgroundColor: Colors.seBgLayout,
    marginTop: 17,
    borderRadius: 2,
    marginLeft: 27,
    marginRight: 27,
  },
  dropdownText: {
    color: Colors.seTextDisabled,
    backgroundColor: 'white'
  }

}));
