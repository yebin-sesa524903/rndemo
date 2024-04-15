
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Alert,
  View,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import NetInfo from "@react-native-community/netinfo";
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import TicketDetailView from '../../components/ticket/TicketDetail';
import TicketMessageLog from './TicketMessageLog.js';
import TicketLog from './TicketLog.js';

import {
  execute, submitTicket, finish, loadTicketById, resetTicket, setSummary, changeSummary,
  saveLog, saveMessage, patrolTicketItemChanged, patrolTicketStatusChanged, ticketReject,
  updateUserSelectInfo, deleteTicket, createTicket, submitPatrolTicketItems,
  loadCacheTicketById, acceptTicket, rejectTicket, updateTicketInspectionContentItems
  , signatureImage, clearPatrolUpdateIndex
} from '../../actions/ticketAction.js';

import CreateTicket from '../ticket/CreateTicket.js';
import TicketLogEdit from './TicketLogEdit';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import privilegeHelper from '../../utils/privilegeHelper.js';

import TicketMsgEdit from './TicketMsgEdit';
import Orientation from 'react-native-orientation';
import trackApi from '../../utils/trackApi.js';
import TicketMesgs from './TicketMesgs.js';
import PatrolTicketDetail from '../../components/ticket/PatrolTicketDetail';
import PatrolItemRemark from "./PatrolItemRemark";
import moment from 'moment';
import TicketCheckView from '../../components/ticket/TicketCheckView'
import UsersSelect from './UsersSelect';
import TicketSelectTime from '../../components/ticket/TicketSelectTime';
import { isTicketInCache, isTicketUpdatedInCache, getTicketFromCache, cacheTicketModify } from '../../utils/sqliteHelper';
import { getAddress, getAddressByLocation } from '../../utils/locationHelper';
import PhotoShow from "../assets/PhotoShow";
// import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import TicketSign from './TicketSign';
import { Keyboard } from 'react-native';
import { Navigator } from 'react-native-deprecated-custom-components';
import ImagePicker from 'react-native-image-crop-picker';

class TicketDetail extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  constructor(props) {
    super(props);
    this.state = { ready: false, tab: 0 };
    this.props.resetTicket();
    this._initMsgCount = 0;
    this._cacheData = [null, null];
    // const init = Orientation.getInitialOrientation();
    // console.warn(init);
    // Orientation.lockToLandscapeRight();
  }
  _checkAssetsIsNull() {
    let arrAssets = this.props.rowData.get('Assets');
    if (!arrAssets || arrAssets.size === 0) {
      Toast.show('资产范围为空，请联系工单创建人添加资产', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM - 80,
      });
      return true;
    }
    return false;
  }
  //判断是否能进行执行/提交/关闭/修改巡检项等操作，如果当前工单在待处理同步工单中，则不需继续提交了
  _checkNotCanEdit() {
    let ticketType = this.props.rowData.get('TicketType');
    let id = this.props.rowData.get('Id');
    if (isConnected() && ticketType === 6) {//目前只处理巡检工单
      let unSyncTicket = this.props.sync.get('waitingSyncTickets');
      if (unSyncTicket.size > 0) {
        let index = unSyncTicket.findIndex(item => item.get('id') === id);
        if (index >= 0) {
          Toast.show('工单同步未完成，请完成后再进行此操作', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
          return true;
        }
      }
    }
  }

  async _execute(id) {
    //如果是巡检工单，并且有本地缓存数据，并且离线
    let urgenceTicket = this.props.rowData.get('TicketType') === 7;
    if (!isConnected()) {
      let hasCache = await isTicketInCache(id);
      if (hasCache) {//有缓存，保存缓存
        //离线情况，获取gps定位信息
        //获取位置信息
        this.context.showSpinner();
        // BackgroundGeolocation.getCurrentLocation((location)=>{
        //   this.context.hideHud();
        //   InteractionManager.runAfterInteractions(async ()=>{
        //     this.props.onPostingCallback();
        //     //处理更新后的状态
        //     let data={
        //       status:2,
        //       urgenceTicket,
        //       gps:{
        //         latitude:location.latitude,
        //         longitude:location.longitude
        //       }
        //     }
        //     //如果是抢修工单，那么还需要修改工单状态和UserTicketStatus 这两个字段
        //     await cacheTicketModify(id,3,data);
        //     this._loadTicket(id);
        //   });
        //   return true;
        // },error=> {
        //   console.warn('离线获取定位失败:', String(error));
        //   this.context.hideHud();
        //   InteractionManager.runAfterInteractions(() => {
        //     Toast.show('获取定位失败', {
        //       duration: Toast.durations.LONG,
        //       position: Toast.positions.BOTTOM,
        //     });
        //   });
        //   //处理更新后的状态
        //   let data = {
        //     status: 2,
        //     urgenceTicket,
        //     gps: null
        //   }

        //   let next = async ()=> {
        //     this.props.onPostingCallback();
        //     await cacheTicketModify(id,3,data);
        //     this._loadTicket(id);
        //   }
        //   next();
        //   return;
        // },{
        //   timeout:5000
        // });
        return;
      }
    }
    if (this._checkAssetsIsNull()) return;
    if (this._checkNotCanEdit()) return;
    // if (Platform.OS === 'ios') {
    //   let data={
    //     Location:"",
    //     Lng:0.0,
    //     Lat:0.0,
    //     TicketId:id
    //   };
    //   this.props.execute(data);
    //   this.props.onPostingCallback();
    //   return;
    // }
    //取定位地址信息，然后再处理
    this.props.execute({ TicketId: id }, urgenceTicket);
    this.traceApp_DispachScreen('到达现场');
    this.props.onPostingCallback();
    // getAddress(
    //   res=>{
    //     let data={
    //       Location:res.address,
    //       Lng:res.lon,
    //       Lat:res.lat,
    //       TicketId:id
    //     };
    //     this.props.execute(data,urgenceTicket);
    //     this.traceApp_DispachScreen('到达现场');
    //     this.props.onPostingCallback();
    //   },
    //   err=>{
    //     //给出错误提示
    //     Toast.show(String(err), {
    //       duration: Toast.durations.LONG,
    //       position: Toast.positions.BOTTOM,
    //     });
    //   }
    // );

  }
  async _submit(id) {
    if (this._checkAssetsIsNull()) return;
    if (this._checkNotCanEdit()) return;

    let isPatrol = this.props.rowData.get('TicketType') === 6;
    if (!isConnected()) {
      let hasCache = await isTicketInCache(id);
      if (hasCache) {//有缓存，保存缓存
        if ((!this.props.logCount || this.props.logCount === 0) && !isPatrol) {
          Toast.show('无法提交，请添加工单日志后重试', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM - 40,
          });
          return;
        }
        if (isPatrol && (!this.props.summary || this.props.summary.trim().length === 0)) {
          Toast.show('无法提交，请填写设备运行总结', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM - 40,
          });
          return;
        }
        //如果有修改，提交时先保存修改再提交

        if (isPatrol && (this.props.contentChanged || this.props.isSummaryChanged)) {//巡检工单，才需要保存巡检工单修改项
          let full = this.props.rowData.get('InspectionContent').toJS();
          let updateData = [];
          let indexs = this.props.updateIndex;
          if (indexs) {
            for (let item of indexs) {
              updateData.push(full[0].MainItems[item]);
            }
          }
          let data = {
            // summary:this.props.summary,
            ticket: JSON.stringify(this.props.rowData),
            content: full,
            update: updateData
          };
          if (this.props.isSummaryChanged) {
            data.summary = this.props.summary;
          }
          await cacheTicketModify(id, 2, data);
          this.props.clearPatrolUpdateIndex();
        }

        this.props.onPostingCallback();
        //处理更新后的状态
        await cacheTicketModify(id, 1, 4);
        this._loadTicket(id);
        Toast.show('工单提交成功', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM - 40,
        });
        return true;
      }
    }

    if ((!this.props.logCount || this.props.logCount === 0) && !isPatrol) {
      Toast.show('无法提交，请添加工单日志后重试', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM - 40,
      });
    } else {
      //如果summary字段为空，给出提示
      if (isPatrol && (!this.props.summary || this.props.summary.trim().length === 0)) {
        Toast.show('无法提交，请填写设备运行总结', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM - 40,
        });
        return;
      }
      //如果是巡检工单，并且巡检项有修改，则需要先修改，然后才能提交
      if (isPatrol && (this.props.contentChanged || this.props.isSummaryChanged)) {
        this._waitSubmit = true;
        if (this.props.contentChanged) {
          this._updateInspectionContent(true);
        } else {
          this.props.setSummary(id, this.props.summary)
        }
        return;
      }
      Toast.show('工单提交成功', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM - 40,
      });
      this.props.submitTicket(id);
      this.traceApp_DispachScreen('提交工单');
    }
  }
  _finish(id) {
    if (this._checkAssetsIsNull()) return;
    if (this._checkNotCanEdit()) return;
    let text = '工单关闭后将无法编辑或添加日志和留言，是否关闭';
    if (this.props.rowData.get('TicketType') === 6) {
      text = '工单关闭后将无法修改巡检结果，是否关闭';
    }
    let isPatrol = this.props.rowData.get('TicketType') === 6;
    Alert.alert(
      '',
      text,
      [
        { text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: '关闭工单', onPress: async () => {
            if (!isConnected()) {
              let hasCache = await isTicketInCache(id);
              if (hasCache) {//有缓存，保存缓存

                if (isPatrol && (!this.props.summary || this.props.summary.trim().length === 0)) {
                  Toast.show('无法提交，请填写设备运行总结', {
                    duration: Toast.durations.LONG,
                    position: Toast.positions.BOTTOM - 40,
                  });
                  return;
                }
                if (isPatrol && (this.props.contentChanged || this.props.isSummaryChanged)) {
                  let full = this.props.rowData.get('InspectionContent').toJS();
                  let updateData = [];
                  let indexs = this.props.updateIndex;
                  if (indexs) {
                    for (let item of indexs) {
                      updateData.push(full[0].MainItems[item]);
                    }
                  }
                  let data = {
                    // summary:this.props.summary,
                    ticket: JSON.stringify(this.props.rowData),
                    content: full,
                    update: updateData
                  };
                  if (this.props.isSummaryChanged) {
                    data.summary = this.props.summary;
                  }
                  await cacheTicketModify(id, 2, data);
                  this.props.clearPatrolUpdateIndex();
                }
                this.props.onPostingCallback();
                //处理更新后的状态
                await cacheTicketModify(id, 1, { status: 3, content: this.props.conclusionResult });
                this._loadTicket(id);
                Toast.show('工单已关闭', {
                  duration: Toast.durations.LONG,
                  position: Toast.positions.BOTTOM - 40,
                });
                return true;
              }
            }
            //如果summary字段为空，给出提示
            if (isPatrol && (!this.props.summary || this.props.summary.trim().length === 0)) {
              Toast.show('无法关闭，请填写设备运行总结', {
                duration: Toast.durations.LONG,
                position: Toast.positions.BOTTOM - 40,
              });
              return;
            }
            if (isPatrol && this.props.contentChanged || this.props.isSummaryChanged) {
              this._waitClose = true;
              if (this.props.contentChanged) {
                this._updateInspectionContent(true);
              } else {
                this.props.setSummary(id, this.props.summary)
              }
              return;
            }

            // this.context.showSpinner();
            Toast.show('工单已关闭', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM - 40,
            });
            this.props.finish(id, this.props.conclusionResult);
            this.traceApp_DispachScreen('关闭工单')
          }
        }
      ]
    )
  }
  _didSignatureClick(id, type) {
    console.log('_didSignatureClick', id, type)
    Orientation.lockToLandscape();//ios is here
    var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
    sceneConfig.gestures = {};
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_sign',
      sceneConfig,
      component: TicketSign,
      passProps: {
        ticketId: id,
        type,
        offlineMode: this.state.isCache && !isConnected(),
      }
    });
    // ImagePicker.openPicker({
    //   width: 300,
    //   height: 100,
    //   cropping: true,
    //   includeBase64:true,
    //   cropperChooseText:'完成',
    //   cropperCancelText:'取消'
    // }).then(async image=>{
    //   // this.context.showSpinner('detecting');
    //   // this.props.loadTextFromImage(image.data);
    //   console.warn('img',image.data);
    //   // this.props.signatureImage({
    //   //   'ticketId':this.props.rowData.get('Id'),
    //   //   'content':image.data
    //   // })
    // });
  }
  _gotoCreateLog() {
    trackApi.onTrackEvent('App_ClickAddTicketLog', this._traceAddLogData('工单详情'));
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_log_edit',
      component: TicketLogEdit,
      passProps: {
        log: null,
        saveLog: (a, b) => {
          let traceData = this._traceAddLogData(undefined);
          traceData.logfile_count += 1;
          trackApi.onTrackEvent('App_SubmitTicketLog', {
            ...traceData,
            // logfile_content:a.Content,
            // logfile_attachment_count:a.Pictures?a.Pictures.length:0
          });
          if (this._offline) {
            return;
          }
          this.props.saveLog(a, b);
        },
        offline: this._offline,
        ticketId: this.props.rowData.get('Id'),
        canEdit: this.props.rowData.get('Status') === 2 || this.props.rowData.get('Status') === 9,
        hasAuth: privilegeHelper.hasAuth('TicketExecutePrivilegeCode'),
      }
    });
  }

  _traceCommonData() {
    // let content=this.props.rowData.get('Content');
    // let desc=content;
    // if(content&&content.length>0){
    //   content=content.split('\n');
    //   if(content.length===7) {
    //     let tmp = {};
    //     content.forEach(item => {
    //       let keyValue=item.split(':');
    //       tmp[keyValue[0]]=keyValue[1];
    //     });
    //     content=tmp;
    //   }else{
    //     content={};
    //   }
    // }
    // let strAssets=this.props.rowData.get('AssetNames').join(',');
    return {
      workorder_id: this.props.rowData.get('TicketNum'),
      workorder_status: [null, '未开始', '执行中', '已完成', '已提交', '待派工'][this.props.rowData.get('Status')],
      workorder_type: [null, '计划工单', '报警工单', '随工工单', '现场工单', '方案工单', '巡检工单', '抢修工单'][this.props.rowData.get('TicketType')],
      start_time: moment(this.props.rowData.get('StartTime')).format('YYYY-MM-DD'),
      // asset_range:strAssets,
      // grade:content['级别'],
      // point:content['类别'],
      // issue:content['点位'],
      // actual_value:content['实际值'],
      // set_value:content['设定值'],
      position: this.props.rowData.get('BuildingNames').join(','),
      // description:desc,
      // file_count:this.props.rowData.get('Documents').size,
      logfile_count: this.props.logCount || 0,
      customer_id: String(this.props.rowData.get('CustomerId') || ''),
      customer_name: this.props.rowData.get('CustomerName')
    }
  }

  _traceAddLogData(from) {
    return {
      ...this._traceCommonData(),
      from
    }
  }

  _gotoMsgsList() {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_msg',
      component: TicketMessageLog,
      passProps: {
        ticketId: this.props.rowData.get('Id'),
        canEdit: true,
        isFagdType: this.props.rowData.get('TicketType') === 5,
        isReadMessage: this.props.rowData.get('IsRead'),
      }
    });
  }
  _showAuth() {
    if (this.props.hasAuth === null) { //do nothing wait api
      return false;
    }
    if (this.props.hasAuth === false) {
      //您没有这一项的操作权限，请联系系统管理员
      Alert.alert('', '您没有这一项的操作权限，请联系系统管理员');
      return false;
    }
    // if(this.props.rowData.get('Status')!==2&&this.props.rowData.get('Status')!==4){
    //   Alert.alert('','仅执行中或者已提交的工单可以编辑这一留言');
    //   return false;
    // }
    return true;
  }
  _gotoCreateMsg(log) {
    if (!log) { //create one
      if (!this._showAuth()) {
        return;
      }
    }
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_log_edit',
      component: TicketMsgEdit,
      passProps: {
        log,
        saveLog: (a, b) => {
          trackApi.onTrackEvent('App_SubmitTicketMessage', {
            ...this._traceCommonData(),
            // message_content:a.Content
          });
          this.props.saveMessage(a, b)
        },
        ticketId: this.props.rowData.get('Id'),//this.props.ticketId,
        canEdit: true,
        hasAuth: this.props.hasAuth,
        isEdit: !!log,
      }
    });
  }
  _gotoLog() {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_log',
      component: TicketLog,
      passProps: {
        traceAddLogData: this._traceAddLogData(undefined),
        ticketId: this.props.rowData.get('Id'),
        canEdit: this.props.rowData.get('Status') === 2 || this.props.rowData.get('Status') === 9,
        isFagdType: this.props.rowData.get('TicketType') === 5,
        isReadMessage: this.props.rowData.get('IsRead'),
      }
    });
  }
  async _loadTicket(ticketId, isHex) {
    let ticketId2 = ticketId;//这里表示采用的是10进制
    if (isHex) {
      ticketId2 = parseInt('0x' + ticketId);
    }
    //第一步，判断是否缓存过
    let isCache = await isTicketInCache(ticketId2);//true,false err
    if (isCache === true) {
      this.setState({ isCache: true })
      let loadCacheTicket = async () => {
        let ticket = await getTicketFromCache(ticketId2);
        this.props.loadCacheTicketById(ticket);
      };

      //第二部，判断是否本地修改过
      let isUpdated = await isTicketUpdatedInCache(ticketId2);
      if (isUpdated === true) {
        //直接读取本地的数据
        loadCacheTicket();
        this._offline = true;
      } else {
        if (isConnected()) {
          this.props.loadTicketById(ticketId, null, isHex);
        } else {//读取离线
          loadCacheTicket();
          this._offline = true;
        }
      }
    } else {
      this.props.loadTicketById(ticketId, null, isHex);
    }
    //第二部，判断是否本地修改过
    // this.props.loadTicketById(ticketId,null,isHex);
  }
  _onPostingCallback(type) {
    InteractionManager.runAfterInteractions(() => {
      if (type === 'delete') {
        this.props.onPostingCallback(type);
        if (this.props.fromFilterResult) {
          this.props.navigation.popToRoute(this.props.lastRoute);
        } else {
          this.props.navigation.popToTop();
        }
      }
      else {
        var arrRoutes = this.props.navigator.getCurrentRoutes();
        // console.warn('TicketDetail...._loadticket',this.props.ticketId,this.props.fromHex,arrRoutes,this.props.rowData);
        this._loadTicket(String(this.props.rowData.get('Id')));
        // this._loadticket(this.props.ticketId,this.props.fromHex);

        // this.props.loadTicketById(this.props.ticketId,null,this.props.fromHex);

        this.props.onPostingCallback(type);

        this.props.navigation.pop();
      }
    });
  }
  _editTicket() {
    if (!isConnected()) {
      Toast.show('当前网络已断开，无法编辑工单', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_create',
      component: CreateTicket,
      passProps: {
        customer: Immutable.fromJS({
          CustomerId: this.props.rowData.get('CustomerId'),
          CustomerName: this.props.rowData.get('CustomerName'),
        }),
        alarm: null,
        hasScreenLocation: this.props.hasScreenLocation,
        ticketInfo: this.props.rowData,
        isCurrCreater: this.props.isCurrCreater,
        onPostingCallback: (type) => { this._onPostingCallback(type) },
      }
    });

  }
  componentDidMount() {
    this._init = true;
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    // Orientation.lockToLandscape();
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.rowData) {
        // console.warn('componentDidMount...',this.props.ticketId,this.props.fromHex);
        this._loadTicket(this.props.ticketId, this.props.fromHex);
      }
    });
    this._netInfoEvent = NetInfo.addEventListener(
      (isConnected) => {
        //如果由在线切换成离线模式，那么重新加载一次本地离线数据
        if (!isConnected.isConnected) {
          this._loadTicket(this.props.ticketId, this.props.fromHex);
        }
      }
    );
  }
  componentWillReceiveProps(nextProps) {
    if (!this._init) return;
    // if(nextProps.isFetching === false){
    // console.warn('hideHud',new Date().getTime());
    // this.context.hideHud();
    // }
    // if(nextProps.isFetching === true){
    //   // console.warn('showSpinner',new Date().getTime());
    //   this.context.showSpinner();
    // }
    var status = 1;
    if (this.props.rowData) {
      status = this.props.rowData.get('Status');
      //如果有状态变化，就需要工单列表收到通知
      if (status && nextProps.rowData && status !== nextProps.rowData.get('Status')) {
        this.props.onPostingCallback();
      }
    }
    if (nextProps.isFinish && status === 2) {
      this.props.onPostingCallback('finish');
    }

    if (this.props.rowData && nextProps.rowData && this.props.rowData.get('Status') === 1
      && nextProps.rowData.get('Status') === 2) {
      let toastText = '开始执行，请添加工单日志';
      if (this.props.rowData.get('TicketType') === 6) {
        toastText = '开始执行，请填写作业程序';
      }
      Toast.show(toastText, {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM - 40,
      });
    }
    if (nextProps.isPosting !== this.props.isPosting) {
      this.context.hideHud();
    }
    if (nextProps.isPosting === 2 && nextProps.isPosting !== this.props.isPosting) {
      //说明有修改成功，重新获取数据
      if (this.props.rowData)
        this._loadTicket(this.props.rowData.get('Id'));
    }
    //如果拒绝成功，直接返回上级
    if (nextProps.rejectPosting !== this.props.rejectPosting && nextProps.rejectPosting === 1) {
      this.props.navigation.pop();
      return;
    }
    //如果抢单成功，则重新请求工单详情
    if (nextProps.acceptPosting !== this.props.acceptPosting && nextProps.acceptPosting === 1) {
      if (this.props.rowData) {
        this._loadTicket(this.props.rowData.get('Id'));
        this.props.onPostingCallback();
        return;
      }

    }
    if (!nextProps.contentChanged && nextProps.contentChanged !== this.props.contentChanged) {
      if (nextProps.rowData) {
        //如果 summary不为空，并且没修改，说明修改巡检项时，已经设置过了summary
        let summary = nextProps.summary;
        let isSummaryChanged = nextProps.isSummaryChanged;
        if (!isSummaryChanged && summary) {
          if (nextProps.rowData.get('TicketType') === 6 && this._waitSubmit) {
            this._waitSubmit = false;
            this.setState({}, () => this._submit(nextProps.rowData.get('Id')));
          }
          if (nextProps.rowData.get('TicketType') === 6 && this._waitClose) {
            this._waitClose = false;
            Toast.show('工单已关闭', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM - 40,
            });
            this.props.finish(nextProps.rowData.get('Id'), nextProps.conclusionResult);
            this.traceApp_DispachScreen('关闭工单')
          }
          this._waitSubmit = false;
          this._waitClose = false;
        }
        //如果内容变化了，清除记录的index
        this.props.clearPatrolUpdateIndex();
      }
    }
    if (!nextProps.isSummaryChanged && true === this.props.isSummaryChanged) {
      if (nextProps.rowData) {
        //如果 summary不为空，并且没修改，说明修改巡检项时，已经设置过了summary
        let summary = nextProps.summary;
        let isSummaryChanged = nextProps.isSummaryChanged;
        if (!isSummaryChanged && summary) {
          if (nextProps.rowData.get('TicketType') === 6 && this._waitSubmit) {
            this._waitSubmit = false;
            this.setState({}, () => this._submit(nextProps.rowData.get('Id')));
          }
          if (nextProps.rowData.get('TicketType') === 6 && this._waitClose) {
            this._waitClose = false;
            Toast.show('工单已关闭', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM - 40,
            });
            this.props.finish(nextProps.rowData.get('Id'), nextProps.conclusionResult);
            this.traceApp_DispachScreen('关闭工单')
          }
          this._waitSubmit = false;
          this._waitClose = false;
        }
      }
    }
  }

  _traceViewTicketLogs() {
    //数据获取成功后才记录，且只记录一次
    if (this._tracedViewLog) return;
    if (this.props.rowData && !this.props.isFetching) {
      this._tracedViewLog = true;
      trackApi.onTrackEvent('App_ViewTicketLogs', this._traceCommonData());
    }
  }

  componentWillUnmount() {
    this._init = false;
    trackApi.onPageEnd(this.props.route.id);
    // Orientation.lockToPortrait();
    backHelper.destroy(this.props.route.id);
    this.props.resetTicket();
    if (this._netInfoEvent) { this._netInfoEvent() }
  }
  _getCurrentContentView() {
    // console.warn('3333',this.props.msgCount);
    if (!this.props.rowData) {
      return;
    }
    //只留下日志
    return (
      <TicketLog navigator={this.props.navigator} route={this.props.route}
        traceAddLogData={this._traceAddLogData(undefined)}
        ticketId={this.props.rowData.get('Id')}
        fromTicketDetail={true}
        offline={this._offline}
        canEdit={this.props.rowData.get('Status') === 2 || this.props.rowData.get('Status') === 9}
        isFagdType={this.props.rowData.get('TicketType') === 5}
        isReadMessage={this.props.rowData.get('IsRead')}
        cacheData={this._cacheData[1]}
        saveCache={data => { this._cacheData[1] = { hasCache: true, data: data } }}
      />
    )

    let ticketView = (
      <TicketMesgs navigator={this.props.navigator} route={this.props.route}
        canEdit={true}
        isFromTicketDetail={true}
        saveCache={data => { this._cacheData[0] = { hasCache: true, data: data } }}
        cacheData={this._cacheData[0]}
        ticketId={
          this.props.rowData.get('Id')
        } />
    );

    if (this.props.rowData.get('Status') < 2) {
      return ticketView;
    }
    if (this.state.tab === 0) {
      return (
        <TicketLog navigator={this.props.navigator} route={this.props.route}
          traceAddLogData={this._traceAddLogData(undefined)}
          ticketId={this.props.rowData.get('Id')}
          fromTicketDetail={true}
          canEdit={this.props.rowData.get('Status') === 2 || this.props.rowData.get('Status') === 9}
          isFagdType={this.props.rowData.get('TicketType') === 5}
          isReadMessage={this.props.rowData.get('IsRead')}
          cacheData={this._cacheData[1]}
          saveCache={data => { this._cacheData[1] = { hasCache: true, data: data } }}
        />
      )
    }
    return ticketView;
  }

  _gotoEditExecutor() {
    if (this._checkAssetsIsNull()) {
      return;
    }
    if (!isConnected()) {
      Toast.show('当前网络已断开，不能派工', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    this.props.updateUserSelectInfo({
      type: 'init', value: this.props.rowData.get('Executors')
        .map(item => item.set('Id', item.get('UserId')))
    });
    let content = this.props.rowData.get('Content');
    if (this.props.rowData.get('TicketType') === 6) {
      content = JSON.stringify(this.props.rowData.get('InspectionContent').toJS());
    }
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_users',
      component: UsersSelect,
      passProps: {
        customerId: this.props.rowData.get('CustomerId'),
        startTime: this.props.rowData.get('StartTime'),
        endTime: this.props.rowData.get('EndTime'),
        selectAssets: this.props.rowData.get('Assets').map(item => item.set('Id', item.get('HierarchyId'))),
        title: '执行人',
        saveCallback: (data) => {
          let executor = data.map(item => { return { UserId: item.get('UserId') || item.get('Id') } });
          let body = {
            Id: this.props.rowData.get('Id'),
            Executors: executor,
            StartTime: this.props.rowData.get('StartTime'),
            EndTime: this.props.rowData.get('EndTime'),
            Content: content,//JSON.stringify(this.props.rowData.get('InspectionContent').toJS()),
            TicketType: this.props.rowData.get('TicketType'),
            CustomerId: this.props.rowData.get('CustomerId'),
            Assets: this.props.rowData.get('Assets').map(item => {
              return { HierarchyId: item.get('HierarchyId') }
            }),
            Title: this.props.rowData.get('Title'),
            SysClass: this.props.rowData.get('SysClass')
          };
          // console.warn('data',data,executor);
          this.props.createTicket(body, false, null, null);
          this.props.onPostingCallback();
        }
      }
    });
  }

  _gotoEditDateTime() {
    if (this._checkAssetsIsNull()) {
      return;
    }
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_select_datetime',
      component: TicketSelectTime,
      passProps: {
        status: this.props.rowData.get('Status'),
        startTime: this.props.rowData.get('StartTime'),
        endTime: this.props.rowData.get('EndTime'),
        onBack: () => { this.props.navigation.pop() },
        onChangeDate: (start, end) => {
          // console.warn(`start=${start} end=${end}`);
          let executor = this.props.rowData.get('Executors').map(item => { return { UserId: item.get('UserId') } });
          let body = {
            Id: this.props.rowData.get('Id'),
            Executors: executor,
            StartTime: start,
            EndTime: end,
            Content: JSON.stringify(this.props.rowData.get('InspectionContent').toJS()),
            TicketType: this.props.rowData.get('TicketType'),
            CustomerId: this.props.rowData.get('CustomerId'),
            Assets: this.props.rowData.get('Assets').map(item => {
              return { HierarchyId: item.get('HierarchyId') }
            }),
            Title: this.props.rowData.get('Title'),
            SysClass: this.props.rowData.get('SysClass')
          };
          // console.warn('data',data,executor);
          this.props.createTicket(body, false, null, null);
          this.props.onPostingCallback();
        },
        title: '修改执行时间',
      }
    });
  }

  _editInspectionRemark(mainIndex, subIndex) {
    this.props.navigation.push('PageWarpper', {
      id: 'patrol_item_remark',
      component: PatrolItemRemark,
      passProps: {
        offlineMode: this.state.isCache && !isConnected(),
        ticketId: this.props.rowData.get('Id'),
        resetValue: this.props.rowData.getIn(['InspectionContent', 0, 'MainItems', mainIndex, 'SubItems', subIndex]),
        mainIndex, subIndex
      },
    });
  }

  _imageClick(data) {
    let { index, items, thumbImageInfo } = data;
    this.props.navigation.push('PageWarpper', {
      id: 'photo_show',
      component: PhotoShow,
      passProps: {
        index: index,
        arrPhotos: items,
        thumbImageInfo: thumbImageInfo,
        type: 'ticketInspectionRemarkPhoto',
        canEdit: false,
      }
    });
  }

  _gotoCheckTicket(index, status, roleType) {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_check',
      component: TicketCheckView,
      passProps: {
        canEdit: (status === 9 || status === 2) && roleType !== 1,
        status,
        roleType,
        data: this.props.rowData.getIn(['InspectionContent', 0, 'MainItems', index]),
        onBack: () => {
          this.props.navigation.pop()
        },
        index,
      },
    });
  }

  _updateInspectionContent(noAlert) {
    if (this._checkAssetsIsNull()) return;
    Keyboard.dismiss();
    //如果是输入类的，需要判断选择是的输入框里面有没有输入内容
    let items = this.props.rowData.getIn(['InspectionContent', 0, 'MainItems']);
    let showDialog = false;
    for (let n = 0; n < items.size; n++) {
      let item = items.get(n);
      let type = item.get('ValueType');
      if (type === 2) {//抄表类，输入非法字符，提示不能保存
        let count = item.get('SubItems').size;
        for (let i = 0; i < count; i++) {
          let value = item.getIn(['SubItems', i, 'Result']);
          if (value && value.trim().length > 1 && value.trim()[0] === '.') {
            if (this._toast) Toast.hide(this._toast);
            this._waitSubmit = false;
            this._toast = Toast.show('仅支持数字', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
            return;
          }
          if (isNaN(value)) {
            if (this._toast) Toast.hide(this._toast);
            this._waitSubmit = false;
            this._toast = Toast.show('仅支持数字', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
            return;
          }
        }
      }

      let count = item.get('SubItems').size;
      for (let i = 0; i < count; i++) {
        let value = item.getIn(['SubItems', i, 'Result']);
        if (value === undefined || value === null || String(value).trim() === '') {
          showDialog = true;
          break;
        }
      }
    }

    let doAction = async () => {
      let newContent = this.props.rowData.getIn(['InspectionContent']);
      let full = newContent.toJS();
      let updateData = [];
      let indexs = this.props.updateIndex
      if (indexs) {
        for (let item of indexs) {
          updateData.push(full[0].MainItems[item]);
        }
      }
      if (!isConnected()) {
        let id = this.props.rowData.get('Id');
        let hasCache = await isTicketInCache(id);
        if (hasCache) {//有缓存，保存缓存
          //处理更新后的状态  如果此时也修改了 设备运行总结，则也需要保存进去
          let data = {
            content: full,
            ticket: JSON.stringify(this.props.rowData),
            // summary:this.props.summary,
            update: updateData
          };
          if (this.props.isSummaryChanged) {
            data.summary = this.props.summary;
          }
          await cacheTicketModify(id, 2, data);
          this.props.clearPatrolUpdateIndex();
          this.props.loadCacheTicketById(this.props.rowData.toJS());
          // this.context.hideHud();
          return true;
        }
      }
      this.context.showSpinner();
      //只保存上传完成的图片，并且去掉多余的字段
      //同样，这里只传递修改的项
      let content = newContent.toJS();
      this.props.submitPatrolTicketItems(this.props.rowData.get('Id'), updateData);
      if (this.props.isSummaryChanged) {
        //调用setSummary接口
        this.props.setSummary(this.props.rowData.get('Id'), this.props.summary);
      }
    };

    if (showDialog && !noAlert) {
      Alert.alert(
        '',
        `您有巡检内容未填写，确认完成`,
        [
          { text: '继续填写', onPress: () => { this._waitSubmit = false; } },
          {
            text: '完成', onPress: () => {
              InteractionManager.runAfterInteractions(() => {
                doAction();
              });
            }
          },
        ],
        { cancelable: false }
      )
    } else {
      doAction();
    }
  }

  _acceptTicket() {
    if (!isConnected()) {
      Toast.show('当前网络已断开，不能接单', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    console.warn('点击接单' + this.props.rowData.get('Id'));
    this.props.acceptTicket(this.props.rowData.get('Id'));
    this.traceApp_DispachScreen('接单');
  }

  traceApp_DispachScreen(type) {
    //判断是否是抢修工单
    if (this.props.rowData.get('TicketType') !== 7) return;
    trackApi.onTrackEvent('App_DispachScreen', {
      location: this.props.hasScreenLocation ? '是' : '否',
      urgent_ticket: type || ''
    });
  }

  _rejectTicket() {
    if (!isConnected()) {
      Toast.show('当前网络已断开，不能拒单', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
      return;
    }
    Alert.alert('', '确认拒单？', [
      { text: '取消', onPress: () => { } },
      {
        text: '拒单', onPress: () => {
          console.warn('点击拒单' + this.props.rowData.get('Id'));
          this.props.rejectTicket(this.props.rowData.get('Id'));
          this.traceApp_DispachScreen('拒单');
        }
      },
      { cancelable: false }
    ]);
  }

  render() {
    this._traceViewTicketLogs();
    // console.warn("msgcount",this.props.msgCount);
    let Detail = TicketDetailView;
    if (this.props.rowData && this.props.rowData.get('TicketType') === 6) Detail = PatrolTicketDetail;
    return (
      <Detail
        navigator={this.props.navigator}
        isFetching={this.props.isFetching}
        rowData={this.props.rowData}
        isCache={this.state.isCache}
        offline={this._offline}
        summary={this.props.summary}
        conclusionResult={this.props.conclusionResult}
        isSummaryChanged={this.props.isSummaryChanged}
        changeSummary={this.props.changeSummary}
        updateInspectionContent={(noAlert) => this._updateInspectionContent(noAlert)}
        onRowClick={(index, status, roleType) => this._gotoCheckTicket(index, status, roleType)}
        changeTicketStatus={status => this.props.patrolTicketStatusChanged(status)}
        editDateTime={() => this._gotoEditDateTime()}
        changeExecutor={() => this._gotoEditExecutor()}
        imageClick={(data) => this._imageClick(data)}
        editInspectionRemark={(mainIndex, subIndex) => this._editInspectionRemark(mainIndex, subIndex)}
        updateInspectionContentItems={this.props.updateTicketInspectionContentItems}
        contentChanged={this.props.contentChanged}
        hasScreenLocation={this.props.hasScreenLocation}
        isTeamGroup={this.props.isTeamGroup}
        logCount={this.props.logCount}
        msgCount={this.props.msgCount}
        accept={() => this._acceptTicket()}
        reject={() => this._rejectTicket()}
        ticketReject={(tid) => {
          this.props.ticketReject(tid, '测试驳回:' + Date.now())
        }}
        onCreateLog={() => this._gotoCreateLog()}
        onCreateMesg={() => this._gotoCreateMsg()}
        onGotoAllMesg={() => this._gotoMsgsList()}
        onExecute={(id) => this._execute(id)}
        onSubmitTicket={(id) => this._submit(id)}
        onCloseTicket={(id) => this._finish(id)}
        onSignatureClick={(id, type) => this._didSignatureClick(id, type)}
        onDeleteTicket={() => {
          if (!isConnected()) {
            Toast.show('当前网络已断开，无法删除工单', {
              duration: Toast.durations.LONG,
              position: Toast.positions.BOTTOM,
            });
            return;
          }
          this.props.deleteTicket(this.props.rowData.get('Id'));
          this.traceApp_DispachScreen('删除')
          this._onPostingCallback('delete');
        }}
        ticketLog={() => this._gotoLog()}
        errorMessage={this.props.errorMessage}
        contentView={this._getCurrentContentView()}
        isCurrCreater={this.props.isCurrCreater}
        tab={this.state.tab}
        changeTab={index => this.setState({ tab: index })}
        fromAlarm={this.props.fromAlarm}
        onBack={() => {
          var arrRoutes = this.props.navigator.getCurrentRoutes();
          var currCount = 0;
          arrRoutes.forEach((item) => {
            if (item.id === 'ticket_detail') {
              currCount++;
            }
          });
          if (currCount > 1) {
            this.props.navigation.popToTop();
          } else {
            this.props.navigation.pop();
          }
          // if (this.props.fromFilterResult) {
          //   this.props.navigation.popToRoute('ticket_filter_result');
          // }else if (this.props.fromAlarm) {
          //   this.props.navigation.popToRoute('alarm_detail');
          // }else if (this.props.fromHex) {
          //   this.props.navigation.popToRoute('ticket');
          // }else {
          // this.props.navigation.pop();
          // }
        }}
        onEditTicket={(id) => this._editTicket(id)} />
    );
  }
}

TicketDetail.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  lastRoute: PropTypes.object,
  user: PropTypes.object,
  logCount: PropTypes.number,
  msgCount: PropTypes.number,
  loadTicketById: PropTypes.func.isRequired,
  resetTicket: PropTypes.func.isRequired,
  saveLog: PropTypes.func.isRequired,
  ticketId: PropTypes.string.isRequired,
  isFetching: PropTypes.bool,
  isFinish: PropTypes.bool,
  isCurrCreater: PropTypes.bool,
  saveMessage: PropTypes.func,
  execute: PropTypes.func.isRequired,
  submitTicket: PropTypes.func.isRequired,
  finish: PropTypes.func.isRequired,
  rowData: PropTypes.object,//immutable
  onPostingCallback: PropTypes.func,
  signatureImage: PropTypes.func,
  fromHex: PropTypes.bool,
  fromFilterResult: PropTypes.bool,
  fromAlarm: PropTypes.bool,
  errorMessage: PropTypes.string,
  hasAuth: PropTypes.bool,
}

function mapStateToProps(state, ownProps) {
  // var id = ownProps.ticketId;
  var rowData = null;
  var ticket = state.ticket.ticket;
  var data = ticket.get('data');
  var ticketFirstId = ticket.get('ticketFirstId');
  var isFinish = false;
  var fromHex = ownProps.fromHex;
  var errorMessage = ticket.get('errorMessage');
  // if (data) {
  //   console.warn('data.getId',data.get('Id'));
  // }
  var msgList = state.ticket.msgList;
  if (msgList) {
    if (String(msgList.get('ticketId')) === String(ticketFirstId)) {
      // count=msgList.get('msgCount');
    }
  }

  var isCurrCreater = false;
  if (data) {
    rowData = data;
    if ((String(ticketFirstId) === ownProps.ticketId || ticketFirstId === String(data.get('Id')))) {
      isFinish = !!data.get('isFinishing');

      fromHex = false;
    }
    // else {
    //   rowData=null;
    //   isFinish = !!data.get('isFinishing');
    //   fromHex = false;
    // }
    // console.warn('rowdata',rowData);
    isCurrCreater = rowData.get('CreateUser') === state.user.get('user').get('Id');
  }
  //这里判断有没有定位大屏权限
  let hasScreenLocation = false;
  let hasPrivilege = false;
  let userTypeName = state.user.getIn(['user', 'UserTypeName']);
  let codes = state.user.get('customerPrivilegeCodes');
  if (codes) {
    hasPrivilege = codes.findIndex(item => item === '2207') >= 0;
  }
  let isTeamGroup = false;//班组
  if (userTypeName === '巡检班长') isTeamGroup = true;
  if ((userTypeName === '驻场工程师' || userTypeName === '巡检班长') && hasPrivilege) {
    hasScreenLocation = true;
  }
  return {
    user: state.user.get('user'),
    isFetching: ticket.get('isFetching'),
    logCount: ticket.get('logCount'),
    isFinish,
    isCurrCreater,
    rowData,
    fromHex,
    msgCount: ticket.get('msgCount') || 0,
    errorMessage,
    hasAuth: privilegeHelper.hasAuth('TicketExecutePrivilegeCode'),
    isPosting: ticket.get('isPosting'),
    contentChanged: ticket.get('contentChanged'),
    sync: state.sync,
    acceptPosting: ticket.get('acceptPosting'),
    rejectPosting: ticket.get('rejectPosting'),
    hasScreenLocation, isTeamGroup,
    summary: ticket.getIn(['data', 'Summary']),//ChiefOperatorConductResult
    conclusionResult: ticket.getIn(['data', 'ChiefOperatorConductResult']),//ChiefOperatorConductResult
    isSummaryChanged: ticket.get('summaryChanged'),
    updateIndex: ticket.get('recordIndex')

  };
}
export default connect(mapStateToProps, {
  execute, submitTicket, finish, loadTicketById,
  resetTicket, saveLog, saveMessage, patrolTicketItemChanged, patrolTicketStatusChanged, ticketReject,
  updateUserSelectInfo, deleteTicket, createTicket, submitPatrolTicketItems, setSummary, changeSummary,
  clearPatrolUpdateIndex, loadCacheTicketById, acceptTicket, rejectTicket,
  updateTicketInspectionContentItems, signatureImage
})(TicketDetail);
