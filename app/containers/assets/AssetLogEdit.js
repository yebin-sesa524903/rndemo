
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Alert
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import LogEditView from '../../components/LogEditView';
import { logInfoChanged, cleanAssetLog } from '../../actions/assetsAction';
import { deleteImages } from '../../actions/imageAction';
import privilegeHelper from '../../utils/privilegeHelper.js';
import PhotoShow from './PhotoShow';
import ImagePicker from '../ImagePicker.js';
import trackApi from '../../utils/trackApi.js';

const MAX = 100;

class AssetLogEdit extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  _save() {
    // console.warn('edit',this.props.ticketLog.get('Pictures'));

    // this.props.navigation.pop();
    if (!this.props.assetLog.get('Content') && this.props.assetLog.get('Pictures').size === 0) {
      Alert.alert('', '请填写日志内容或上传照片');
      return;
    }
    this.context.showSpinner();
    var obj = this.props.assetLog.toJSON();
    obj.ScenePictures = obj.Pictures;
    if (obj.ScenePictures) {
      obj.ScenePictures.forEach((item) => {
        item.ScenePictureId = item.PictureId;
        item.HierarchyId = obj.HierarchyId;
        item.SceneLogId = obj.Id;
        // delete item.uri;
        // delete item.loaded;
        // delete item.PictureId;
      })
    }
    // delete obj.Pictures;
    this.props.saveLog(obj, this.props.log ? false : true);
  }
  _deleteImage(imageId) {
    // console.warn('_deleteImage...',imageId);
    this.props.deleteImages(imageId);
  }
  _dataChanged(type, action, value) {
    this.props.logInfoChanged({
      log: this.props.log,
      hierarchyId: this.props.hierarchyId,
      userId: this.props.user.get('Id'),
      type, action, value
    });
  }
  _checkAuth() {
    if (!this.props.hasAuth) {
      // Alert.alert('','您没有这一项的操作权限，请联系系统管理员');
      return false;
    }
    if (!this.props.isSameUser) {
      Alert.alert('', '仅创建者可以编辑这一日志');
      return false;
    }

    return true;
  }
  _photoViewDeleteImage(item) {
    // console.warn('AssetLogEdit...',item);
    if (this._checkAuth() && item) {
      this._dataChanged('image', 'delete', item);
      this._deleteImage([item.get('PictureId')]);
    }
  }
  _openImagePicker() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: MAX - this.props.assetLog.get('Pictures').size,
        dataChanged: (chosenImages) => this._dataChanged('image', 'add', chosenImages)
      }
    });
  }
  _goToDetail(items, index, thumbImageInfo) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: thumbImageInfo,
        type: 'assetLogPhoto',
        onRemove: (item) => this._photoViewDeleteImage(item),
        checkAuth: () => this._checkAuth(),
        canEdit: this.props.isSameUser,
      }
    });
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    // console.warn('init',this.props.log);
    this.props.logInfoChanged({
      old: this.props.log,
      hierarchyId: this.props.hierarchyId,
      type: 'init'
    })
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.logs && this.props.logs) {
      this.context.hideHud();
      InteractionManager.runAfterInteractions(() => {
        this.props.navigation.pop();
      });
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    this.props.cleanAssetLog();
  }
  render() {
    return (
      <LogEditView
        log={this.props.assetLog}
        user={this.props.user}
        openImagePicker={() => this._openImagePicker()}
        privilegeCode='AssetEditPrivilegeCode'
        save={(data) => this._save(data)}
        checkAuth={() => this._checkAuth()}
        canEdit={this.props.isSameUser && this.props.hasAuth}
        inputPlaceholder="输入现场日志"
        gotoDetail={(items, index, thumbImageInfo) => this._goToDetail(items, String(index), thumbImageInfo)}
        deleteImage={(imageId) => this._deleteImage(imageId)}
        dataChanged={(type, action, value) => this._dataChanged(type, action, value)}
        onBack={() => this.props.navigation.pop()} />
    );
  }
}

AssetLogEdit.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  log: PropTypes.object,
  logs: PropTypes.object,
  assetLog: PropTypes.object,
  saveLog: PropTypes.func,
  cleanAssetLog: PropTypes.func,
  logInfoChanged: PropTypes.func,
  deleteImages: PropTypes.func,
  isSameUser: PropTypes.bool,
  hasAuth: PropTypes.bool,
  hierarchyId: PropTypes.number.isRequired,
}


function mapStateToProps(state, ownProps) {
  // console.warn('user',state.user);
  var logs = state.asset.logs.get('data');
  var assetLog = state.asset.assetLog;
  // var hasAuth = state.asset.assetData.get('hasAuth');

  var user = state.user.get('user');
  var isSameUser = true;
  if (ownProps.log && ownProps.log.get('CreateUserName') !== user.get('RealName')) {
    isSameUser = false;
  }
  return {
    user,
    isSameUser,
    hasAuth: privilegeHelper.hasAuth('AssetEditPrivilegeCode'),
    logs,
    assetLog
    // rowData
  };
}

export default connect(mapStateToProps, { logInfoChanged, deleteImages, cleanAssetLog })(AssetLogEdit);
