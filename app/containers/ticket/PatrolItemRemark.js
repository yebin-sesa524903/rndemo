
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Alert,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import { inspectionRemarkChanged, deleteLogImage, cleanTicketLog } from '../../actions/ticketAction';
import PatrolItemRemarkView from '../../components/ticket/PatrolItemRemarkView';
import Immutable from 'immutable';
import ImagePicker from '../ImagePicker.js';
import PhotoShow from '../assets/PhotoShow';
import trackApi from '../../utils/trackApi.js';
import { compressImages } from "../../utils/imageCompress";

const MAX = 9;

class PatrolItemRemark extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  _save() {
    let valid = true;//必须添加说明或者照片
    let comment = this.props.remark.get('Comment');
    let pics = this.props.remark.get('Pictures');
    if ((comment && comment.trim().length > 0) || (pics && pics.size > 0)) {
      //主动提交关闭，
      this._submitClose = true;
      this._exit();
    } else {
      //给出提示
      Alert.alert('', '请填写详细说明或者上传照片');
      return;
    }
  }
  _goToDetail(items, index, thumbImageInfo) {
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        remarkPath: this.props.remarkPath,
        index: index,
        arrPhotos: items,
        thumbImageInfo: thumbImageInfo,
        type: 'ticketInspectionPhoto',
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
        max: MAX - this.props.remark.get('Pictures').size,
        dataChanged: (chosenImages) => this._dataChanged('image', 'add', chosenImages)
      }
    });
  }
  _checkAuth() {
    return true;
  }
  _dataChanged(type, action, value) {
    //需要判断是选择图片时，才进行压缩处理，否则走原来流程
    let next = (nextValue) => {
      this.props.inspectionRemarkChanged({
        mainIndex: this.props.mainIndex,
        subIndex: this.props.subIndex,
        ticketId: this.props.ticketId,
        userId: this.props.user.get('Id'),
        type, action, value: nextValue
      });
    }
    if (type === 'image' && action === 'add') {//只有选择添加图片时，才做图片压缩
      //首先调用图片压缩，然后在把压缩后的结果传递过来
      compressImages(value, res => {
        console.warn(value, res);
        next(res);
      });
    } else {
      next(value);
    }
  }
  _exit() {
    this.props.navigation.pop();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    //如果不是提交返回，则需要还原做的修改
    if (this._submitClose) {//提交关闭
      this.props.inspectionRemarkChanged({
        mainIndex: this.props.mainIndex,
        subIndex: this.props.subIndex,
        ticketId: this.props.ticketId,
        userId: this.props.user.get('Id'),
        type: 'submit',
        value: this.props.resetValue
      });
    } else {//不提交返回
      this.props.inspectionRemarkChanged({
        mainIndex: this.props.mainIndex,
        subIndex: this.props.subIndex,
        ticketId: this.props.ticketId,
        userId: this.props.user.get('Id'),
        type: 'reset',
        value: this.props.resetValue
      });
    }
  }
  render() {
    let placeholder = '请输入备注';
    return (
      <PatrolItemRemarkView
        title={'备注'}
        offlineMode={this.props.offlineMode}
        log={this.props.remark}
        user={this.props.user}
        openImagePicker={() => this._openImagePicker()}
        canEdit={true}
        privilegeCode={'TicketExecutePrivilegeCode'}
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

function mapStateToProps(state, ownProps) {
  let user = state.user.get('user');
  let ticket = state.ticket.ticket;
  let data = ticket.get('data');
  let { mainIndex, subIndex } = ownProps;
  let remarkPath = ['data', 'InspectionContent', 0, 'MainItems', mainIndex, 'SubItems', subIndex];
  let remark = ticket.getIn(remarkPath);
  if (!remark.get('Pictures')) {
    remark = remark.set('Pictures', Immutable.fromJS([]));
  }
  return {
    user, remark, remarkPath
  };
}

export default connect(mapStateToProps, { inspectionRemarkChanged, deleteLogImage, cleanTicketLog })(PatrolItemRemark);
