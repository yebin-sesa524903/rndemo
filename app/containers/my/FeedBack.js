
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import { logInfoChanged, deleteLogImage, cleanFeedbackLog, saveFeedback } from '../../actions/myAction.js';
import FeedBackView from '../../components/my/FeedBackView';

import ImagePicker from '../ImagePicker.js';
import PhotoShow from '../assets/PhotoShow';
import NetworkImage from '../../components/NetworkImage.js';
import { Keyboard } from 'react-native';
import trackApi from '../../utils/trackApi.js';

const MAX = 100;

class FeedBack extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  _save() {
    Keyboard.dismiss();
    if (!this.props.feedBackLog.get('Content') && this.props.feedBackLog.get('Pictures').size === 0) {
      Alert.alert('', '请填写日志内容或上传照片');
      return;
    }
    var images = [];
    this.props.feedBackLog.get('Pictures').forEach((item) => {
      var url = NetworkImage.getUri(item.get('PictureId'), 1024, 768);
      images.push(url);
    });
    var param = {
      'ContactInfo': this.props.feedBackLog.get('ContactInfo'),
      'Content': this.props.feedBackLog.get('Content'),
      'PictureURLs': images
    };
    this.context.showSpinner('posting');
    this.props.saveFeedback(param);
  }
  _goToDetail(items, index, thumbImageInfo) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: thumbImageInfo,
        type: 'feedbackLogPhoto',
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
    // this.props.deleteLogImage(imageId);
  }
  _openImagePicker() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: MAX - this.props.feedBackLog.get('Pictures').size,
        dataChanged: (chosenImages) => this._dataChanged('image', 'add', chosenImages)
      }
    });
  }
  _checkAuth() {
    // if(!this.props.canEdit){
    //   Alert.alert('','仅执行中的工单可以编辑这一日志');
    //   return false;
    // }
    // if(!this.props.isSameUser){
    //   Alert.alert('','仅创建者可以编辑这一日志');
    //   return false;
    // }
    // if(!this.props.hasAuth){
    //   // Alert.alert('','您没有这一项的操作权限，请联系系统管理员');
    //   return false;
    // }
    return true;
  }
  _dataChanged(type, action, value) {
    // console.warn('_dataChanged',value);
    this.props.logInfoChanged({
      log: this.props.log,
      feedId: this.props.feedId,
      userId: this.props.user.get('Id'),
      type, action, value
    });
  }
  _exit() {
    this.props.navigation.pop();
  }
  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
    // console.warn('init',this.props.log);
    this.props.logInfoChanged({
      old: null,
      feedId: this.props.feedId,
      type: 'init'
    })
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.isPostSuccess && nextProps.isPostSuccess) {
      // this.context.hideHud();
      this.context.showSpinner('success');
      InteractionManager.runAfterInteractions(() => {
        this._exit();
      });
    }
  }
  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
    this.props.cleanFeedbackLog();

  }
  render() {
    var placeholder = this.props.canEdit ? '请输入您的问题或建议...' : '';
    return (
      <FeedBackView
        log={this.props.feedBackLog}
        user={this.props.user}
        openImagePicker={() => this._openImagePicker()}
        canEdit={this.props.isSameUser && this.props.canEdit}
        checkAuth={() => this._checkAuth()}
        inputPlaceholder={placeholder}
        gotoDetail={(items, index, thumbImageInfo) => this._goToDetail(items, String(index), thumbImageInfo)}
        save={(data) => this._save(data)}
        deleteImage={(imageId) => this._deleteImage(imageId)}
        dataChanged={(type, action, value) => this._dataChanged(type, action, value)}
        onBack={() => this._exit()} />
    );
  }
}

FeedBack.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  log: PropTypes.object,
  feedBackLog: PropTypes.object,
  logInfoChanged: PropTypes.func,
  deleteLogImage: PropTypes.func,
  cleanFeedbackLog: PropTypes.func,
  saveFeedback: PropTypes.func,
  feedId: PropTypes.number,
  isSameUser: PropTypes.bool,
  hasAuth: PropTypes.bool,
  canEdit: PropTypes.bool,
  isPostSuccess: PropTypes.bool,
}

function mapStateToProps(state, ownProps) {
  var feedBackLog = state.feedBack;
  var user = state.user.get('user');
  var isSameUser = true, canEdit = true, hasAuth = true;

  return {
    user,
    log: null,
    feedBackLog,
    isSameUser,
    canEdit,
    hasAuth,
    feedId: feedBackLog.get('FeedId'),
    isPostSuccess: feedBackLog.get('isPostSuccess'),
  };
}

export default connect(mapStateToProps, { logInfoChanged, deleteLogImage, cleanFeedbackLog, saveFeedback })(FeedBack);
