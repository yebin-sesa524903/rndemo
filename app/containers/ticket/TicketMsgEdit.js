
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import { messageInfoChanged, deleteLogImage, cleanTicketMessage } from '../../actions/ticketAction';
import MsgEditView from '../../components/MsgEditView';

import ImagePicker from '../ImagePicker.js';
import PhotoShow from '../assets/PhotoShow';
import trackApi from '../../utils/trackApi.js';

const MAX = 100;

class TicketMsgEdit extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  _save() {
    if (!this.props.ticketLog.get('Content') && this.props.ticketLog.get('Pictures').size === 0) {
      Alert.alert('', '留言内容不能为空');
      return;
    }
    this.context.showSpinner();
    this.props.saveLog(this.props.ticketLog.toJSON(), this.props.log ? false : true);
  }
  _goToDetail(items, index, thumbImageInfo) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: thumbImageInfo,
        type: 'ticketLogPhoto',
        onRemove: (item) => { this._photoViewDeleteImage(item) },
        checkAuth: () => this._checkAuth(),
        canEdit: this.props.canEdit,
      }
    });
  }
  _photoViewDeleteImage(item) {
    if (this._checkAuth() && item) {
      this._dataChanged('image', 'delete', item);
      this._deleteImage([item.get('PictureId')]);
    }
  }
  _deleteImage(imageId) {
    this.props.deleteLogImage(imageId);
  }
  _openImagePicker() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: MAX - this.props.ticketLog.get('Pictures').size,
        dataChanged: (chosenImages) => this._dataChanged('image', 'add', chosenImages)
      }
    });
  }
  _checkAuth() {
    // if(!this.props.canEdit){
    //   Alert.alert('','仅执行中的工单可以编辑这一日志');
    //   return false;
    // }
    if (!this.props.isSameUser) {
      Alert.alert('', '仅创建者可以编辑这一日志');
      return false;
    }
    if (!this.props.hasAuth) {
      // Alert.alert('','您没有这一项的操作权限，请联系系统管理员');
      return false;
    }
    return true;
  }
  _dataChanged(type, action, value) {
    // console.warn('_dataChanged',value);
    this.props.messageInfoChanged({
      log: this.props.log,
      ticketId: this.props.ticketId,
      userId: this.props.user.get('Id'),
      type, action, value
    });
  }
  _exit() {
    this.props.navigation.pop();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    // console.warn('init',this.props.log);
    this.props.messageInfoChanged({
      old: this.props.log,
      ticketId: this.props.ticketId,
      type: 'init'
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isPosting !== 1 && this.props.isPosting === 1) {
      // console.warn('hideHud 1');
      this.context.hideHud();
      if (nextProps.isPosting === 2) {
        InteractionManager.runAfterInteractions(() => {
          this._exit();
        });
      }
      return;
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    this.props.cleanTicketMessage();

  }
  render() {
    var placeholder = this.props.canEdit ? '说说您遇到的问题和想法吧' : '';
    return (
      <MsgEditView
        log={this.props.ticketLog}
        user={this.props.user}
        openImagePicker={() => this._openImagePicker()}
        canEdit={this.props.isSameUser && this.props.canEdit}
        privilegeCode='TicketExecutePrivilegeCode'
        checkAuth={() => this._checkAuth()}
        inputPlaceholder={placeholder}
        isEdit={this.props.isEdit}
        gotoDetail={(items, index, thumbImageInfo) => this._goToDetail(items, String(index), thumbImageInfo)}
        save={(data) => this._save(data)}
        deleteImage={(imageId) => this._deleteImage(imageId)}
        dataChanged={(type, action, value) => this._dataChanged(type, action, value)}
        onBack={() => this._exit()} />
    );
  }
}

TicketMsgEdit.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  log: PropTypes.object,
  logs: PropTypes.object,
  ticketLog: PropTypes.object,
  saveLog: PropTypes.func,
  messageInfoChanged: PropTypes.func,
  deleteLogImage: PropTypes.func,
  cleanTicketMessage: PropTypes.func,
  isSameUser: PropTypes.bool,
  hasAuth: PropTypes.bool,
  ticketId: PropTypes.number.isRequired,
  canEdit: PropTypes.bool,
  isEdit: PropTypes.bool,
  isPosting: PropTypes.number,
}

function mapStateToProps(state, ownProps) {
  var logs = state.ticket.msgList.get('data');
  var ticketLog = state.ticket.ticketMsg;
  var user = state.user.get('user');
  var isSameUser = true;
  if (ownProps.log && ownProps.log.get('UserName') !== user.get('RealName')) {
    isSameUser = false;
  }

  var isPosting = 1;
  if (ticketLog) {
    isPosting = ticketLog.get('isPosting');
  }
  return {
    user,
    logs,
    isSameUser,
    ticketLog,
    isPosting,
  };
}

export default connect(mapStateToProps, { messageInfoChanged, deleteLogImage, cleanTicketMessage })(TicketMsgEdit);
