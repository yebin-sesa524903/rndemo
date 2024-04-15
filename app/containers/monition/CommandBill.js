import React, { Component } from "react";
import { DeviceEventEmitter, View } from 'react-native'
import { connect } from "react-redux";
import CommandBillView from '../../components/monition/CommandBill'
import PropTypes from "prop-types";
import backHelper from "../../utils/backHelper";
import trackApi from "../../utils/trackApi";
import moment from 'moment'
import OperateBill from './OperateBill'
import {
  saveCommandBill, getCommandBillById, generateJobBill, generateOperateBill,
  fillCommandBill, loadSubstationAsset, loadPersonData, initCommand
} from '../../actions/monitionAction'
import JobBill from "./JobBill";
import { backToJobBill, backToOperateBill, BILL_JOB_ID, BILL_OPERATE_ID } from "./billRoute";
import Orientation from "react-native-orientation";

class CommandBill extends Component {

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
          if (this._refreshOnFocus) {
            this.props.getCommandBillById(this.props.data.get('id'))
            this._refreshOnFocus = false;
          }
        }
      };
      this._listener = navigator.navigationContext.addListener('didfocus', callback);
      this._billChanged = DeviceEventEmitter.addListener('billChanged', () => {
        this._refreshOnFocus = true;
      });
    }
  }

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
    this._bindEvent();
    //如果是新建，还需要调用init用传递是命令票申请表，停送电操作
    if (this.props.initData) {
      let data = {
        organizationHierarchyId: this.props.substation.id,
        organization: this.props.substation.name,
        customerId: this.props.customerId,
        createTime: moment().format('YYYY-MM-DD HH:mm'),
        status: 1
      }
      Object.assign(data, this.props.initData)
      this.props.initCommand(data)
    }
    this._loadCommandBill()
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
    this._billChanged && this._billChanged.remove();
    this._listener && this._listener.remove()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPosting && !nextProps.isPosting) {
      this.context.hideHud();
    }
    //如果是创建成功，发送事件
    if (this.props.data.get('id') !== nextProps.data.get('id') ||
      this.props.data.get('status') !== nextProps.data.get('status')) {
      this._emitChange()
    }
  }

  _recordChange() {
    this._changeFlag = true;
  }

  _emitChange() {
    if (this._changeFlag) {
      this._changeFlag = false;
      DeviceEventEmitter.emit('billChanged')
    }
  }

  _saveCommandBill = (data) => {
    this._recordChange()
    let propsData = this.props.data.toJS()
    Object.assign(propsData, data)
    this.context.showSpinner();
    this.props.saveCommandBill(propsData)
  }

  _generateOperateBill = () => {
    //发送通知要打开指定的操作票，如果已开的操作票id不一致，则需要重新加载
    DeviceEventEmitter.emit('openOperateBillFromCommand', this.props.data.get('operationTicketId'), OperateBill)
    if (backToOperateBill(this.props.navigator)) return;
    //判断有没有操作票Id
    let props = {}
    if (this.props.data.get('operationTicketId')) {
      props.billId = this.props.data.get('operationTicketId')
    } else {
      let task = `${this.props.data.get('operationType') === 1 ? '送' : '停'}${this.props.data.get('circuitName')}(${this.props.data.get('circuitSerialNumber')})高压电源`
      props.initData = {
        commander: this.props.data.get('commander'),
        commandReceiver: this.props.data.get('commandReceiver'),
        commandTime: this.props.data.get('commandTime'),
        organization: this.props.data.get('organization'),
        organizationHierarchyId: this.props.data.get('organizationHierarchyId'),
        circuitSerialNumber: this.props.data.get('circuitSerialNumber'),
        circuitName: this.props.data.get('circuitName') || '',
        customerId: this.props.data.get('customerId'),
        operationTask: task,
        operationType: this.props.data.get('operationType'),
        commandTicketId: this.props.data.get('id'),
        circuitHierarchyId: this.props.data.get('circuitHierarchyId'),
        ticketType: 1,
      }
    }
    this.props.navigation.push('PageWarpper', {
      id: BILL_OPERATE_ID,
      component: OperateBill,
      passProps: props
    })
  }

  _generateJobBill = () => {
    if (backToJobBill(this.props.navigator)) return;
    let props = {}
    if (this.props.data.get('workTicketId')) {
      props.billId = this.props.data.get('workTicketId')
    } else {
      props.initData = {
        createSubstationHierarchyId: this.props.data.get('organizationHierarchyId'),
        createSubstationHierarchyName: this.props.data.get('organization'),
        customerId: this.props.customerId,
        customerName: this.props.customerName,
        commandTicketId: this.props.data.get('id'),
      }
    }
    if (props.initData !== undefined) {
      Object.assign(props.initData, {
        commander: this.props.data.get('commander'),
        commandReceiver: this.props.data.get('commandReceiver'),
      })
    }
    this.props.navigation.push('PageWarpper', {
      id: BILL_JOB_ID,
      component: JobBill,
      passProps: props
    })
  }

  _fillCommandBill = (data) => {
    this._recordChange()
    let body = {}
    Object.assign(body, data)
    this.context.showSpinner();
    this.props.fillCommandBill(body)
  }

  _loadCommandBill(onlyRefresh) {
    if (!onlyRefresh) {
      //加载可选的人员信息
      this.props.loadPersonData({ hierarchyId: this.props.substation.id })
      //加载配电室下的资产信息
      this.props.loadSubstationAsset({ hierarchyId: this.props.substation.id })
    }
    //如果不是新建，还需要加载对应的命令票信息
    if (this.props.billId) {
      this.props.getCommandBillById(this.props.billId)
    }
  }

  _onBack = () => { this.props.navigation.pop() }

  render() {
    return (
      <CommandBillView data={this.props.data}
        generateJobBill={this._generateJobBill}
        generateOperateBill={this._generateOperateBill}
        fillCommandBill={this._fillCommandBill}
        saveCommandBill={this._saveCommandBill}
        billPermission={this.props.billPermission}
        assets={this.props.assets} persons={this.props.persons}
        onBack={this._onBack}
        isFetching={this.props.isFetching} />
    )
  }
}

function mapToState(state, oweProps) {
  let bill = state.monition.command;
  let user = state.user.get('user')
  return {
    substation: state.user.get('substation'),
    isFetching: bill.get('isFetching'),
    isPosting: bill.get('isPosting'),
    data: bill.get('data'),
    persons: bill.get('persons') || [],
    assets: bill.get('assets') || [],
    customerId: user.get('CustomerId'),
    customerName: user.get('CustomerName'),
    billPermission: state.user.get('billPermission')
  }
}

export default connect(mapToState, {
  saveCommandBill, getCommandBillById,
  generateJobBill, generateOperateBill, fillCommandBill, loadSubstationAsset, loadPersonData,
  initCommand
})(CommandBill)
