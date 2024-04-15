import React, { Component } from "react";
import { InteractionManager, View } from "react-native";
import { connect } from "react-redux";
import ServiceTicketDetailView from "../../components/ticket/service/ServiceTicketDetail";
import trackApi from "../../utils/trackApi";
import backHelper from "../../utils/backHelper";

import {
  serviceTicketLoadById, changeServiceTaskIgnore, serviceTicketUpdateContentById,
  serviceTicketLoadHierarchy, serviceTicketExecute, serviceTicketSubmit, serviceTicketValidate,
  serviceTicketLoadCacheById,
} from '../../actions/ticketAction';
import serviceModel from '../../utils/service_map';
import IgnoreTask from '../../components/ticket/service/IgnoreTask';
import TaskView from '../../components/ticket/service/TaskView';
import ProtectionValueView from '../../components/ticket/service/ProtectionValueView'
import immutable from 'immutable';
import PropTypes from "prop-types";
import Toast from "react-native-root-toast";
import {
  cacheServiceTicketModify,
  getServiceTicketFromCache,
  getTicketFromCache,
  isServiceTicketInCache, isServiceTicketUpdatedInCache,
  isTicketInCache,
  isTicketUpdatedInCache
} from "../../utils/sqliteHelper";
class ServiceTicketDetail extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    // this.props.serviceTicketLoadById(this.props.ticketId);
    this._loadServiceTicket()
  }

  async _loadServiceTicket() {
    //第一步，判断是否缓存过
    let isCache = await isServiceTicketInCache(this.props.ticketId);//true,false err
    if (isCache === true) {
      this.setState({ isCache: true })
      let loadCacheTicket = async () => {
        let ticket = await getServiceTicketFromCache(this.props.ticketId);
        this.props.serviceTicketLoadCacheById(ticket[0]);
      };

      //第二部，判断是否本地修改过
      let isUpdated = await isServiceTicketUpdatedInCache(this.props.ticketId);
      if (isUpdated === true) {
        //直接读取本地的数据
        this._offline = true;
        await loadCacheTicket();
      } else {
        if (isConnected()) {
          this.props.serviceTicketLoadById(this.props.ticketId);
        } else {//读取离线
          this._offline = true;
          await loadCacheTicket();
        }
      }
    } else {
      this.props.serviceTicketLoadById(this.props.ticketId);
    }
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.isPosting !== this.props.isPosting && !this.props.isPosting) {
      this.context.hideHud();
    }
    if (prevProps.validatePosting !== this.props.validatePosting && this.props.validatePosting !== 1) {
      let close = true;

      if (this.props.validatePosting === 0) {
        //效验接口调用ok,判断有没有错误信息
        if (!this.props.validateResult || this.props.validateResult.length === 0) {
          //没有异常，那么需要调用真实的提交
          this._submitTicket(true);
          close = false;
        }
      }
      if (close)
        this.context.hideHud();
    }
    if (prevProps.status !== null && this.props.status !== null && prevProps.status !== this.props.status) {
      //工单状态发生了变化，通知列表页，刷新列表
      this.props.onRefresh();
    }
  }

  _submitTicket(realSubmit) {
    if (isConnected()) {
      if (this._isDongSyn()) {
        this._showSyncToast();
        return;
      }
      this.context.showSpinner();
      if (realSubmit) {
        Toast.show('提交成功', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
        });
        this.props.serviceTicketSubmit(this.props.ticketId);
      } else {
        //现在需求变了，提交之前需要先效验，只有效验通过了才能提交
        this.props.serviceTicketValidate(this.props.ticketId);
      }
    } else {
      //离线无法提交工单
      Toast.show('离线模式下无法提交审批', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
      });
    }
  }

  async _executeTicket(show = true) {
    if (isConnected()) {
      if (this._isDongSyn()) {
        this._showSyncToast();
        return;
      }
      if (show)
        this.context.showSpinner();
      this.props.serviceTicketExecute(this.props.ticketId);
    } else {
      //离线保存修改记录
      await cacheServiceTicketModify(this.props.ticketId, 1, 2);
      //从新刷新一次
      this._loadServiceTicket().then();
    }

  }

  _editIgnoreItems() {
    if (isConnected()) {
      if (this._isDongSyn()) {
        this._showSyncToast();
        return;
      }
    }
    trackApi.onTrackEvent('App_LogbookTicket', {
      ticket_operation: ['开始执行', '忽略任务项', '添加日志', '筛选', '提交审批', '自定义编辑'][1]
    })
    let content = this.props.data.Content;
    let items = Object.keys(content).map(item => {
      return {
        title: serviceModel[item].title,
        key: item,
        isIgnore: content[item].IsIgnored
      }
    })

    let clearOldValue = (task) => {
      task.HaveComments = false;
      if (task.ItemInfo.MaintenanceInfo) {
        for (let key in task.ItemInfo.MaintenanceInfo) {
          task.ItemInfo.MaintenanceInfo[key] = null;
        }
      }
      if (task.ItemInfo.InspectionInfoList) task.ItemInfo.InspectionInfoList = [];
      if (task.ItemInfo.HighVoltageConstantValueInfo) task.ItemInfo.HighVoltageConstantValueInfo = null;
      if (task.ItemInfo.LowVoltageConstantValueInfo) task.ItemInfo.LowVoltageConstantValueInfo = null;
    }

    this.props.navigation.push('PageWarpper', {
      id: 'ignore_task_view',
      component: IgnoreTask,
      passProps: {
        model: serviceModel,
        data: items,
        submit: (data) => {
          let content = JSON.parse(JSON.stringify(this.props.data.Content));
          let changeObj = {};
          data.forEach(item => {
            //如果是不一样的话，则记录下来，保存的只是变化的
            if (content[item.key].IsIgnored !== item.isIgnore) {
              changeObj[item.key] = content[item.key];
              //TODO 如果忽略需要丢掉之前保存的值，这里需要进行处理
              changeObj[item.key].IsIgnored = item.isIgnore;
              if (item.isIgnore) {
                clearOldValue(changeObj[item.key]);
              }
            }
            // content[item.key].IsIgnored = item.isIgnore
          });
          let body = {
            content: changeObj,
          }
          if (isConnected()) {
            this.props.serviceTicketUpdateContentById(this.props.ticketId, body)
          } else {
            cacheServiceTicketModify(this.props.ticketId, 2, body).then(() => {
              this._loadServiceTicket().then(() => this._onBack())
            })
          }
        },
        onBack: () => this._onBack()
      }
    })
  }

  _onBack() {
    this.props.navigation.pop();
  }

  //判断是否在同步总，如果同步，则不能进行操作
  _isDongSyn() {
    return this.props.sync.get('waitingSyncTickets').size > 0;
  }

  _showSyncToast() {
    Toast.show('工单同步中，请稍后进行此操作', {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
    });
  }

  _clickTask(item) {
    if (isConnected()) {
      if (this._isDongSyn()) {
        this._showSyncToast();
        return;
      }
    }
    let Detail = TaskView;
    let id = 'service_task_view';
    if (item.info.title === '保护定值') {
      Detail = ProtectionValueView;
      id = 'service_task_protection_view';
    }
    this.props.navigation.push('PageWarpper', {
      id,
      component: Detail,
      passProps: {
        model: serviceModel,
        offlineMode: this._offline,
        data: JSON.parse(JSON.stringify(item)),
        assetId: this.props.data.AssetId,
        navigator: this.props.navigator,
        executeTicket: () => this._executeTicket(),
        isCreatorOrExecutor: this.props.isCreatorOrExecutor,
        submit: (data) => {
          // this._onBack();
          let content = JSON.parse(JSON.stringify(this.props.data.Content));
          content[item.key].ItemInfo = data;
          let obj = {};
          obj[item.key] = {
            ...content[item.key]
          }

          let body = {
            content: obj,
          }
          if (isConnected()) {
            this.props.serviceTicketUpdateContentById(this.props.ticketId, body)
          } else {
            cacheServiceTicketModify(this.props.ticketId, 2, body).then(() => {
              this._loadServiceTicket().then(() => { this._onBack() });
            })
          }
        },
        onBack: () => this._onBack()
      }
    })
  }

  render() {
    return (
      <ServiceTicketDetailView
        model={serviceModel}
        data={this.props.data}
        validatePosting={this.props.validatePosting}
        validateResult={this.props.validateResult}
        isCreatorOrExecutor={this.props.isCreatorOrExecutor}
        submitTicket={() => this._submitTicket()}
        executeTicket={() => this._executeTicket()}
        doIgnore={() => this._editIgnoreItems()}
        errMsg={this.props.errMsg}
        isFetching={this.props.isFetching}
        clickTask={(item) => this._clickTask(item)}
        onBack={() => this.props.navigation.pop()}
      />
    )
  }
}

function mapToStateToProps(state, ownProp) {
  let serviceTicket = state.ticket.serviceTicket;
  let userId = state.user.getIn(['user', 'Id']);
  let isCreatorOrExecutor = false;
  if (serviceTicket.get('data')) {
    let createUser = serviceTicket.get('data').CreateUser;
    let executeUsers = serviceTicket.get('data').ExecuteUsers;
    if (userId === createUser) isCreatorOrExecutor = true;
    if (!isCreatorOrExecutor) {
      if (executeUsers.find(user => user.Id === userId)) {
        isCreatorOrExecutor = true;
      }
    }
  }

  return {
    isFetching: serviceTicket.get('isFetching'),
    data: serviceTicket.get('data'),
    status: serviceTicket.get('data') ? serviceTicket.get('data').Status : null,
    errMsg: serviceTicket.get('errorMessage'),
    isPosting: serviceTicket.get('isPosting'),
    validatePosting: serviceTicket.get('validatePosting'),
    validateResult: serviceTicket.get('validateResult'),
    isCreatorOrExecutor,
    sync: state.sync,
  }
}

export default connect(mapToStateToProps, {
  serviceTicketLoadById, changeServiceTaskIgnore, serviceTicketUpdateContentById, serviceTicketLoadHierarchy,
  serviceTicketExecute, serviceTicketSubmit, serviceTicketValidate, serviceTicketLoadCacheById
})(ServiceTicketDetail);
