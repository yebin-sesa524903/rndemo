
'use strict';

import React, { Component } from 'react';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import { updatePassword, errorChangePassword, cleanChangePassError, timeoutAlert, clearTimeoutAlert } from '../../actions/myAction.js';
import { logout } from '../../actions/loginAction';
import PassEditView from '../../components/my/PassEditView';
import Toast from 'react-native-root-toast';
import trackApi from '../../utils/trackApi.js';
import notificationHelper from '../../utils/notificationHelper.js';
import { verifyPass } from '../../utils';
import {
  Alert,
} from 'react-native';

import {
  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';

import { Keyboard } from 'react-native';

class PassEdit extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  constructor(props) {
    super(props);
  }
  _save(data) {
    Keyboard.dismiss();
    var { NewPassword, OldPassword, ConfirmPass } = data;
    NewPassword = NewPassword.trim();
    OldPassword = OldPassword.trim();
    ConfirmPass = ConfirmPass.trim();
    if (!verifyPass(NewPassword)) {
      this.props.errorChangePassword('PasswordFormatIssure');
    } else if (NewPassword !== ConfirmPass) {
      this.props.errorChangePassword('ConfirmPasswordIssure');
    } else {
      this.context.showSpinner();
      this.props.updatePassword({ NewPassword, OldPassword });
    }
  }

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.timeout) {
      Alert.alert(
        '页面失败',
        '您在此页面停留时间已超过5分钟，页面失效，请您重新进行密码修改！',
        [
          {
            text: '取消', onPress: () => {
              this.props.clearTimeoutAlert();
              this.props.navigation.pop();
              this._editView._clearTimeout();
            }
          },
          {
            text: '重新载入', onPress: () => {
              this._editView._clearSrcPass();
              this._editView._clearNewPass();
              this._editView._clearConfirmPass();
              this.props.clearTimeoutAlert();
              this._editView._clearTimeout();
            }
          }
        ]
      )
    }
    console.warn('nextProps.errCode', nextProps.errCode);
    if (this.props.postState === 'posting') {
      if (nextProps.postState === 'failure') {
        this.context.hideHud();
        if (nextProps.errCode === 'SrcPassIssure') {
          Alert.alert(
            '',
            '旧密码错误',
            [
              {
                text: '好', onPress: () => {
                  if (this._editView) {
                    this._editView._clearSrcPass();
                    this._editView._focusSrcPassEdit();
                  }
                }
              }
            ]
          )
        } else if (nextProps.errCode === 'PasswordFormatIssure') {
          Alert.alert(
            '',
            '密码需至少8位，需包含大小写字母、数字及特殊字符！',
            [
              {
                text: '好', onPress: () => {
                  if (this._editView) {
                    this._editView._clearNewPass();
                    this._editView._clearConfirmPass();
                    this._editView._focusNewPassEdit();
                  }
                }
              }
            ]
          )
        } else if (nextProps.errCode === 'ConfirmPasswordIssure') {
          Alert.alert(
            '',
            '两次密码不一致！',
            [
              {
                text: '好', onPress: () => {
                  if (this._editView) {
                    this._editView._clearConfirmPass();
                    this._editView._focusConfirmPassEdit();
                  }
                }
              }
            ]
          )
        } else if (nextProps.errCode === 'changePasswordDone') {
          Toast.show('修改成功，请重新登录', {
            duration: 3000,
            position: -30,
          });
          notificationHelper.unbind();
          this.props.logout();
          this.context.hideHud();
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.pop();
          });
        }
      }
      if (nextProps.postState === 'success') {
        this.context.showSpinner('savesuccess');
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
  }

  render() {
    return (
      <PassEditView
        ref={(ref) => this._editView = ref}
        save={(text) => this._save(text)}
        user={this.props.user}
        timeout={this.props.timeout}
        timeoutAlert={this.props.timeoutAlert}
        cleanChangePassError={this.props.cleanChangePassError}
        isFromClevel={this.props.user && this.props.user.get('RoleType') === 2}
        postState={this.props.postState}
        onBack={() => { this.props.navigation.pop() }} />
    );
  }
}

PassEdit.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  updatePassword: PropTypes.func.isRequired,
  onPostingCallback: PropTypes.func,
  postState: PropTypes.string,
  errCode: PropTypes.string,
  logout: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
    user: state.user.get('user'),
    postState: state.user.get('postState'),
    errCode: state.user.get('errCode'),
    timeout: state.user.get('timeout'),
  };
}

export default connect(mapStateToProps, { updatePassword, logout, errorChangePassword, cleanChangePassError, timeoutAlert, clearTimeoutAlert })(PassEdit);
