
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
import { logInfoChanged, deleteLogImage, cleanTicketLog, loadTicketLogsFromCache } from '../../actions/ticketAction';
import LogEditView from '../../components/LogEditView';

import ImagePicker from '../ImagePicker.js';
import PhotoShow from '../assets/PhotoShow';
import trackApi from '../../utils/trackApi.js';
import { getAddress } from '../../utils/locationHelper';
import Toast from 'react-native-root-toast';
import { compressImages } from "../../utils/imageCompress";
import {
  cacheTicketLogOperate,
  cacheTicketModify,
  getTicketLogsFromCache,
  TICKET_LOG_ADD,
  TICKET_LOG_UPDATE
} from '../../utils/sqliteHelper';
import moment from 'moment';
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation'
const MAX = 100;

class TicketLogEdit extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  _offlineAddLog() {
    this.context.showSpinner();
    let log = this.props.ticketLog.toJSON();
    log.Id = Date.now();//用当前时间复制给日志ID
    log.UpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
    log.localCreate = true;//表示是本地创建，同步时，如果本地添加日志，则日志ID需要剔除
    log.CreateUserName = this.props.user.get('Name');
    log.CreateUser = this.props.user.get('Id');
    // BackgroundGeolocation.getCurrentLocation((location)=>{
    //   this.context.hideHud();
    //   InteractionManager.runAfterInteractions(async ()=>{
    //     log.gps={
    //       latitude:location.latitude,
    //       longitude:location.longitude
    //     }
    //     await cacheTicketLogOperate(TICKET_LOG_ADD,log);
    //     //本地刷新通知
    //     let logs=await getTicketLogsFromCache(this.props.ticketId);
    //     this.props.loadTicketLogsFromCache(log.TicketId,logs);
    //     this.props.saveLog();
    //     this._exit();
    //   });
    //   return true;
    // },error=> {
    //   console.warn('离线获取定位失败:', String(error));
    //   this.context.hideHud();
    //   InteractionManager.runAfterInteractions(async () => {
    //     Toast.show('获取定位失败', {
    //       duration: Toast.durations.LONG,
    //       position: Toast.positions.BOTTOM,
    //     });
    //     await cacheTicketLogOperate(TICKET_LOG_ADD,log);
    //     //本地刷新通知
    //     let logs=await getTicketLogsFromCache(this.props.ticketId);
    //     this.props.loadTicketLogsFromCache(log.TicketId,logs);
    //     this.props.saveLog();
    //     this._exit();
    //   });
    // },{
    //   timeout:5000
    // });
  }

  async _save() {
    if (!this.props.ticketLog.get('Content') && this.props.ticketLog.get('Pictures').size === 0) {
      Alert.alert('', '请填写日志内容或上传照片');
      return;
    }

    this.context.showSpinner();
    let isCreate = this.props.log ? false : true;
    if (isCreate) {
      //如果是创建日志，需要先获取到定位信息，再提交数据
      if (this.props.offline) {
        this._offlineAddLog();
      } else {
        this.props.saveLog(this.props.ticketLog.toJSON(), isCreate);
        // getAddress(
        //   res=>{
        //     let body={
        //       ...this.props.ticketLog.toJSON(),
        //       Location:res.address,
        //       Lng:res.lon,
        //       Lat:res.lat
        //     }
        //     this.props.saveLog(body,isCreate);
        //   },
        //   err=>{
        //     this.context.hideHud();
        //     //给出错误提示
        //     Toast.show(String(err), {
        //       duration: Toast.durations.LONG,
        //       position: Toast.positions.BOTTOM,
        //     });
        //   }
        // );
      }
    } else {
      if (this.props.offline) {
        //离线根据离线逻辑处理
        let log = this.props.ticketLog.toJSON();
        log.UpdateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        await cacheTicketLogOperate(TICKET_LOG_UPDATE, log);
        this.context.hideHud();
        InteractionManager.runAfterInteractions(() => {
          this.props.saveLog();
          this._exit();
        });
      } else {
        this.props.saveLog(this.props.ticketLog.toJSON(), isCreate);
      }
    }

  }
  _goToDetail(items, index, thumbImageInfo) {
    this.props.navigation.push('PageWarpper',{
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
    this.props.navigation.push('PageWarpper',{
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: MAX - this.props.ticketLog.get('Pictures').size,
        dataChanged: (chosenImages) => this._dataChanged('image', 'add', chosenImages)
      }
    });
  }
  _checkAuth() {
    if (!this.props.canEdit) {
      Alert.alert('', '仅执行中的工单可以编辑这一日志');
      return false;
    }
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
    //需要判断是选择图片时，才进行压缩处理，否则走原来流程
    let next = (nextValue) => {
      this.props.logInfoChanged({
        log: this.props.log,
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


    // console.warn('_dataChanged',value);
    // this.props.logInfoChanged({
    //   log:this.props.log,
    //   ticketId:this.props.ticketId,
    //   userId:this.props.user.get('Id'),
    //   type,action,value
    // });
  }
  _exit() {
    this.props.navigation.pop();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    // console.warn('init',this.props.log);
    this.props.logInfoChanged({
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
    this.props.cleanTicketLog();

  }
  render() {
    var placeholder = this.props.canEdit ? '输入工单执行日志' : '';
    return (
      <LogEditView
        title={this.props.isEdit ? '编辑日志' : '添加日志'}
        log={this.props.ticketLog}
        user={this.props.user}
        offline={this.props.offline}
        openImagePicker={() => this._openImagePicker()}
        canEdit={this.props.isSameUser && this.props.canEdit}
        privilegeCode='TicketExecutePrivilegeCode'
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

TicketLogEdit.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  log: PropTypes.object,
  logs: PropTypes.object,
  isPosting: PropTypes.number,
  ticketLog: PropTypes.object,
  saveLog: PropTypes.func,
  logInfoChanged: PropTypes.func,
  deleteLogImage: PropTypes.func,
  cleanTicketLog: PropTypes.func,
  isSameUser: PropTypes.bool,
  hasAuth: PropTypes.bool,
  ticketId: PropTypes.number.isRequired,
  canEdit: PropTypes.bool,
}

function mapStateToProps(state, ownProps) {
  var logs = state.ticket.logList.get('data');
  var ticketLog = state.ticket.ticketLog;
  var user = state.user.get('user');
  var isSameUser = true;
  if (ownProps.log && ownProps.log.get('CreateUserName') !== user.get('RealName')) {
    isSameUser = false;
  }
  var isPosting = 1;
  if (ticketLog) {
    isPosting = ticketLog.get('isPosting');
  }
  return {
    isEdit: ownProps.log ? true : false,
    user,
    logs,
    isSameUser,
    ticketLog,
    isPosting,
  };
}

export default connect(mapStateToProps, {
  logInfoChanged, deleteLogImage, cleanTicketLog,
  loadTicketLogsFromCache
})(TicketLogEdit);
