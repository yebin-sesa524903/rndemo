import React, { Component } from "react";
import { connect } from "react-redux";
import { DeviceEventEmitter, Alert, InteractionManager } from 'react-native'
import {
  loadOperateBillSteps, loadOperateBillById, loadOperateBillTemplates, saveOperateBill, finishOperateBill,
  rejectOperateBill, signOperateBill, initOperate, loadPersonData, loadUnbindAssets
} from '../../actions/monitionAction'
import PropTypes from "prop-types";
import backHelper from "../../utils/backHelper";
import trackApi from "../../utils/trackApi";
import OperateBillView from '../../components/monition/OperateBill'
import moment from "moment";
import CommandBill from "./CommandBill";
import { backToCommandBill, backToJobBill, BILL_COMMAND_ID, BILL_JOB_ID, BILL_OPERATE_ID } from "./billRoute";
import Orientation from "react-native-orientation";
import JobBill from "./JobBill";

class OperateBill extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  _bindEvent() {
    let navigator = this.props.navigator;
    if (navigator) {
      let callback = (event) => {
        if (event && event.data && event.data.route && event.data.route.id === this.props.route.id) {
          Orientation.lockToPortrait();
        }
      };
      this._listener = navigator.navigationContext.addListener('didfocus', callback);
    }
    this._billChanged = DeviceEventEmitter.addListener('billRejected', () => {
      if (this.props.billId) {
        this._loadBill(this.props.billId);
      }
    });

    this._openBillEvent = DeviceEventEmitter.addListener('openOperateBillFromCommand', (bid, CMP) => {
      if (this.props.billId && this.props.billId !== bid) {
        console.log('openOperateBillFromCommand', bid)
        InteractionManager.runAfterInteractions(() => {
          this.props.navigator.replace({
            id: BILL_OPERATE_ID,
            component: CMP,
            passProps: {
              billId: bid
            }
          })
        })
      }
    });
  }

  componentDidMount() {
    this._billChangedFlag = false;
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
    this._bindEvent();
    //如果是新建，还需要调用init用传递是命令票申请表，停送电操作
    if (this.props.initData) {
      let data = {
        status: 1
      }
      Object.assign(data, this.props.initData)
      this.props.initOperate(data)
      this._loadTpl(data.operationType)
      //如果是工作票创建的操作票，加载一次person
      if (this.props.initData.ticketType === 2) {
        this.props.loadPersonData({ hierarchyId: this.props.initData.organizationHierarchyId })
        this.props.loadUnbindAssets(this.props.initData.workTicketId)
      }
    }

    if (this.props.billId) {
      this._loadBill(this.props.billId);
    }
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
    this._listener && this._listener.remove();
    this._billChanged && this._billChanged.remove();
    this._openBillEvent && this._openBillEvent.remove();
  }

  _recordChange() {
    this._billChangedFlag = true;
  }
  _emitChange() {
    if (this._billChangedFlag) {
      this._billChangedFlag = false;
      DeviceEventEmitter.emit('billChanged')
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPosting && !nextProps.isPosting) {
      this.context.hideHud();
    }
    if (nextProps.data !== this.props.data) {
      if (nextProps.data) this._loadTpl(nextProps.data.get('operationType'))
      if (this.props.data.get('status') === 1 && nextProps.data.get('status') !== 1) {
        console.log('status 改变', nextProps.data.toJS(), this._billChangedFlag)
        if (this._billChangedFlag) {
          let actions = [
            { text: '取消', onPress: () => { } },
            { text: '前往', onPress: this._openCommandBill }
          ]
          let cid = nextProps.data.get('commandTicketId');
          let processComplete = nextProps.data.get('processComplete');
          let commandType = nextProps.data.get('commandTicketType');
          let msg = `请前往${commandType === 1 ? '命令' : '申请'}票填写结果`
          //如果是完成
          if (nextProps.data.get('status') === 2) {
            if (processComplete && cid) {
              Alert.alert("已完成", msg, actions)
            }
          } else {//作废
            if (cid) {
              //给出跳转提示
              Alert.alert("已作废", msg, actions)
            }//否则无提示
          }
        }
      }
      if (nextProps.data.get('status') !== this.props.data.get('status') ||
        nextProps.data.get('id') !== this.props.data.get('id')) {
        this._emitChange();
      }
    }
    if (this.props.isFetching && !nextProps.isFetching) {
      if (nextProps.data.get('organizationHierarchyId') && nextProps.data.get('ticketType') === 2) {
        this.props.loadPersonData({ hierarchyId: nextProps.data.get('organizationHierarchyId') })
        this.props.loadUnbindAssets(nextProps.data.get('workTicketId'))
      }
    }
    if (!this.props.billId) {//表面新建状态，非已创建过
      if (!this.props.data.get('id') && nextProps.data.get('id')) {
        //操作票创建成功了,通知工作票 对应回路创建操作票有变化
        this.props.onNotify && this.props.onNotify()
      }
    }

  }

  _loadTpl(operateType) {
    //防抖
    if (this.__loadTpl) return;
    this.__loadTpl = true;
    this.props.loadOperateBillTemplates(this.props.customerId)//operateType)
  }

  _loadSteps = (sid) => {
    this.context.showSpinner()
    this.props.loadOperateBillSteps(sid)
  }

  _loadBill(billId) {
    this.props.loadOperateBillById(billId)
  }

  _saveBill = (data) => {
    this._recordChange();
    this.context.showSpinner();
    let body = {};
    Object.assign(body, data)
    //设置状态
    body.status = 1;
    this.props.saveOperateBill(body)
  }

  _signBill = (data) => {
    this.context.showSpinner()
    this.props.signOperateBill(data)
  }

  ///作废点击
  _rejectBill = (data) => {
    this._recordChange();
    this.context.showSpinner();
    Object.assign(data, {
      statue: 3,
      actionType: 2,
    })
    this.props.rejectOperateBill(data)
  }

  ///完成点击
  _finishBill = (data) => {
    this._recordChange();
    this.context.showSpinner();
    Object.assign(data, {
      status: 2,    ///修改状态
      actionType: 2, ///设置结束操作
    })
    this.props.finishOperateBill(data)
  }

  ///开始操作
  _beginExecute = () => {
    //使用创建保存接口，主要记录开始执行时间
    this.context.showSpinner();
    let data = {};
    // data.operationBeginTime = moment().format('YYYY-MM-DD HH:mm')
    ///开始操作
    Object.assign(data, this.props.data.toJS(), {
      //设置开始操作
      actionType: 1,
    })

    this.props.saveOperateBill(data)
  }

  _openCommandBill = () => {
    if (backToCommandBill(this.props.navigator)) return;
    this.props.navigation.push('PageWarpper', {
      id: BILL_COMMAND_ID,
      component: CommandBill,
      passProps: {
        billId: this.props.data.get('commandTicketId')
      }
    })
  }

  _openJobBill = () => {
    if (backToJobBill(this.props.navigator)) return;
    this.props.navigation.push('PageWarpper', {
      id: BILL_JOB_ID,
      component: JobBill,
      passProps: {
        billId: this.props.data.get('workTicketId')
      }
    })
  }

  _onBack = () => { this.props.navigation.pop() }

  render() {
    return (
      <OperateBillView saveBill={this._saveBill} signBill={this._signBill} isFetching={this.props.isFetching}
        rejectBill={this._rejectBill} finishBill={this._finishBill} data={this.props.data} beginExecute={this._beginExecute}
        loadSteps={this._loadSteps} tpl={this.props.tpl} steps={this.props.steps} navigator={this.props.navigator}
        OpenCommandBill={this._openCommandBill} onBack={this._onBack} billPermission={this.props.billPermission}
        OpenJobBill={this._openJobBill} persons={this.props.persons} assets={this.props.assets}
      />
    );
  }
}

function mapToState(state, ownProps) {
  let bill = state.monition.operate;
  return {
    substation: state.user.get('substation'),
    data: bill.get('data'),
    assets: bill.get('assets'),
    persons: bill.get('persons') || [],
    isFetching: bill.get('isFetching'),
    isPosting: bill.get('isPosting'),
    tpl: bill.get('tpl'),
    steps: bill.get('steps'),
    customerId: state.user.get('user').get('CustomerId'),
    billPermission: state.user.get('billPermission')
  }
}

export default connect(mapToState, {
  loadOperateBillSteps, loadOperateBillById, loadOperateBillTemplates,
  saveOperateBill, finishOperateBill, rejectOperateBill, signOperateBill, initOperate, loadPersonData, loadUnbindAssets
})(OperateBill)
