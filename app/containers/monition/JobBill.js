import React, { Component } from "react";
import { connect } from "react-redux";
import { DeviceEventEmitter, Alert, Platform, InteractionManager } from 'react-native'
import {
  getJobBillById, createJobBill, signJobBill, editJobBill, finishJobBillTask, initJob, loadSubstationAsset,
  recycleJobBill, bindJobBillToCommandBill, updateJobBillOrder, updateJobBillOrderDuty, getSubstationList, loadPersonData,
  listJobBillTplList, getJobBillTplInfo, changeJobBillSubstation, loadUnbindBill, loadUnbindAssets
} from '../../actions/monitionAction'
import PropTypes from "prop-types";
import backHelper from "../../utils/backHelper";
import trackApi from "../../utils/trackApi";
import JobBillView from '../../components/monition/JobBill'
import moment from "moment";
import CommandBill from "./CommandBill";
import ListView from 'deprecated-react-native-listview';
import Orientation from "react-native-orientation";
import { backToCommandBill, BILL_COMMAND_ID, BILL_OPERATE_ID } from "./billRoute";
import OperateBill from "./OperateBill";

class JobBill extends Component {

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    let data = props.unbound.get('data') || []
    this.state = {
      unboundList: this.ds.cloneWithRows(data)
    }
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };


  _orientationDidChange(orientation) {
    if (Platform.OS === 'android' || this._unmount) return;
    if (orientation === 'LANDSCAPE') {
    } else {
      Orientation.lockToLandscape();
    }
  }

  _bindEvent() {
    let navigator = this.props.navigator;
    if (navigator) {
      let callback = (event) => {
        if (event && event.data && event.data.route && event.data.route.id === this.props.route.id) {
          Orientation.lockToLandscape();
          if (this._refreshOnFocus) {
            if (this.props.billId || (this.props.data && this.props.data.get('id'))) {
              this._loadBill(this.props.billId || this.props.data.get('id'));
            }
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
    this._bindEvent();
    this._billChangedFlag = false;
    Orientation.lockToLandscape();//ios is here
    Orientation.addOrientationListener(this._orientationDidChange.bind(this));
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
    //如果是新建，还需要调用init用传递是命令票申请表，停送电操作
    if (this.props.initData) {
      this.props.initJob(this.props.initData);
      //加载配电所
      this.props.getSubstationList();
    }
    if (this.props.billId) {
      this._loadBill(this.props.billId);
    }
    this.props.listJobBillTplList(this.props.customerId);

  }

  componentWillUnmount() {
    Orientation.removeOrientationListener(this._orientationDidChange);
    Orientation.lockToPortrait();
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
    this._listener && this._listener.remove()
    this._billChanged && this._billChanged.remove()
  }

  _emitChange() {
    if (this._billChangedFlag) {
      this._billChangedFlag = false;
      DeviceEventEmitter.emit('billChanged')
    }
  }

  componentWillReceiveProps(nextProps) {
    if ((this.props.isPosting && !nextProps.isPosting) ||
      (this.props.dutyPosting === 1 && nextProps.dutyPosting !== 1)) {
      this.context.hideHud();
    }

    if (nextProps.data !== this.props.data) {
      //如果是没id到有id,则需要获取对应的资产信息
      if (!this.props.data.get('id') && nextProps.data.get('id')) {
        if (!nextProps.data.getIn(['safetyMeasure', 'safetyDutyUserSign'])) {
          //需要请求变电所信息
          this.props.getSubstationList();
        }
      }
      //资产，人员和模板和配电所相关，如果配电所变了，则需要变动
      if (nextProps.data.get('acceptSubstationHierarchyId') &&
        nextProps.data.get('acceptSubstationHierarchyId') !== this.props.data.get('acceptSubstationHierarchyId')) {
        //请求配电所下资产信息
        this._loadAssets({ hierarchyId: nextProps.data.get('acceptSubstationHierarchyId') });
        this.props.loadPersonData({ hierarchyId: nextProps.data.get('acceptSubstationHierarchyId') })
      }
      if (nextProps.data.get('completeWorkUserSign') !== this.props.data.get('completeWorkUserSign') ||
        nextProps.data.get('executionResult') !== this.props.data.get('executionResult') ||
        nextProps.data.get('commandTicketId') !== this.props.data.get('commandTicketId') ||
        nextProps.data.get('id') !== this.props.data.get('id')) {
        this._emitChange();
      }
    }
    if (nextProps.unbound !== this.props.unbound) {
      if (nextProps.unbound.get('data') !== this.props.unbound.get('data')) {
        this.setState({
          unboundList: this.ds.cloneWithRows(nextProps.unbound.get('data'))
        })
      }
    }
    if (this.props.isFetching && !nextProps.isFetching ||
      (!this.props.data.getIn(['safetyMeasure', 'safetyDutyUserSign']) &&
        nextProps.data.getIn(['safetyMeasure', 'safetyDutyUserSign'])
      )) {
      setTimeout(() => {
        this._loadUnboundAssets()
      }, 10)
    }
    if (nextProps.data.get('executionResult') !== this.props.data.get('executionResult')) {
      if (this._doOrderFlag) {
        let actions = [
          { text: '取消', onPress: () => { } },
          { text: '前往', onPress: this._openCommandBill }
        ]
        let result = nextProps.data.get('executionResult');
        let cid = nextProps.data.get('commandTicketId');
        let processComplete = nextProps.data.get('processComplete');
        let commandType = nextProps.data.get('commandTicketType');
        let msg = `请前往${commandType === 1 ? '命令' : '申请'}票填写结果`
        this._doOrderFlag = false;
        //如果是作废
        if (result === 1) {
          DeviceEventEmitter.emit('billRejected')
          if (cid) {
            Alert.alert("已作废", msg, actions)
          }
        } else {
          if (processComplete && cid) {
            Alert.alert("已完成", msg, actions)
          }
        }
      }
    }
  }

  _loadBill(bid) {
    this.props.getJobBillById(bid)
  }

  _recordChange() {
    this._billChangedFlag = true;
  }

  _createJobBill = data => {
    this._recordChange();
    this.context.showSpinner()
    let body = { ...data }
    body.planStartTime = moment(data.planStartTime).format('YYYY-MM-DD HH:mm:ss')
    body.planEndTime = moment(data.planEndTime).format('YYYY-MM-DD HH:mm:ss')
    this.props.createJobBill(body)
  }

  _signBill = data => {
    this.context.showSpinner()
    this.props.signJobBill(data);
  }

  _finishSafeTask = data => {
    this.context.showSpinner()
    this.props.finishJobBillTask(data);
  }

  _onBack = () => { this.props.navigation.pop() }

  _loadAssets = (data) => {
    this.props.loadSubstationAsset(data, true)
  }

  _updateJobBillOrder = data => {
    this._recordChange();
    this._doOrderFlag = true;
    this.context.showSpinner()
    let body = JSON.parse(JSON.stringify(data))
    let items = body.workTicketOrderItems//.filter(item=>item.orderNumber !== 8);
    items.forEach(item => {
      //处理工作班人员:多选的情况
      if (item.orderNumber === 2 && Array.isArray(item.contentJson.key1)) {
        item.contentJson.key2 = `${item.contentJson.key1.length}`
        item.contentJson.key1 = item.contentJson.key1.join('、')
      }
      item.contentJson = JSON.stringify(item.contentJson);
    })
    body.workTicketOrderItems = items;
    this.props.updateJobBillOrder(body, data);
  }

  _updateJobBillOrderDuty = (data, whetherSign = false) => {
    this.context.showSpinner()
    let body = JSON.parse(JSON.stringify(data))
    let duty = body.workTicketOrderItems.filter(item => item.orderNumber === 8);
    duty.forEach(item => {
      item.contentJson = JSON.stringify(item.contentJson);
    })
    body = {
      id: body.id,
      workTicketOrderItems: duty,
      whetherSign
    }
    this.props.updateJobBillOrderDuty(body, data);
  }

  _recycleJobBill = data => {
    this._recordChange();
    this.context.showSpinner()
    this.props.recycleJobBill(data);
  }



  _loadUnboundAssets = () => {
    //只有值班负责人签字并且第7点位填写时，才有需要更新
    let data = this.props.data;
    if (data && data.getIn(['safetyMeasure', 'safetyDutyUserSign']) && !data.getIn(['safetyMeasure', 'safetyPermitDutyUserSign'])) {
      //TODO 还有一种情况就是被操作票连带作废的
      if (data.get('executionResult')) return;
      //这里开始请求未绑定的回路接口
      this.props.loadUnbindAssets(this.props.data.get('id'))
    }
  }

  _saveBill = data => {
    this.context.showSpinner()
    let body = JSON.parse(JSON.stringify(data))//{...data}
    body.planStartTime = moment(data.planStartTime).format('YYYY-MM-DD HH:mm:ss')
    body.planEndTime = moment(data.planEndTime).format('YYYY-MM-DD HH:mm:ss')
    this.props.editJobBill(body, data)
  }

  _loadUnbindBill = filter => {
    this.props.loadUnbindBill(filter)
  }

  _changeSubstation = data => this.props.changeJobBillSubstation(data)

  _loadTplInfo = id => {
    this.context.showSpinner();
    this.props.getJobBillTplInfo(id)
  }

  _bindJobBillToCommandBill = data => {
    this.context.showSpinner();
    this.props.bindJobBillToCommandBill(data)
  }

  _openCommandBill = () => {
    if (!backToCommandBill(this.props.navigator)) {
      this.props.navigation.push('PageWarpper', {
        id: BILL_COMMAND_ID,
        component: CommandBill,
        passProps: {
          billId: this.props.data.get('commandTicketId')
        }
      })
    }
  }

  _createOperateBill = (data) => {
    ////这里将命令票里面的 发令人/受令人 关联到操作票
    let initData = {
      commandTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      organization: this.props.data.get('acceptSubstationHierarchyName'),
      organizationHierarchyId: this.props.data.get('acceptSubstationHierarchyId'),
      customerId: this.props.data.get('customerId'),
      operationType: data.type,
      workTicketId: this.props.data.get('id'),
      ticketType: 2,
    };

    if (this.props.initData !== undefined &&
      this.props.initData.commander !== undefined &&
      this.props.initData.commandReceiver !== undefined) {
      Object.assign(initData, {
        commander: this.props.initData.commander,
        commandReceiver: this.props.initData.commandReceiver,
      });
    }

    this.props.navigation.push('PageWarpper', {
      id: BILL_OPERATE_ID,
      component: OperateBill,
      passProps: {
        onNotify: this._loadUnboundAssets,
        initData: initData,
      }
    })
  }

  render() {
    return (
      <JobBillView onBack={this._onBack} assets={this.props.assets} data={this.props.data} recycleJobBill={this._recycleJobBill}
        substationList={this.props.substationList} loadAsset={this._loadAssets} updateJobBillOrder={this._updateJobBillOrder}
        createBill={this._createJobBill} isFetching={this.props.isFetching} person={this.props.person}
        billPermission={this.props.billPermission} updateJobBillOrderDuty={this._updateJobBillOrderDuty}
        bindJobBillToCommandBill={this._bindJobBillToCommandBill} openCommandBill={this._openCommandBill}
        signBill={this._signBill} navigator={this.props.navigator} finishSafeTask={this._finishSafeTask}
        changeSubstation={this._changeSubstation} saveBill={this._saveBill} tpl={this.props.tpl} tplInfo={this.props.tplInfo}
        loadTplInfo={this._loadTplInfo} loadUnbindBill={this._loadUnbindBill} unbound={this.props.unbound}
        unboundList={this.state.unboundList} createOperateBill={this._createOperateBill} unboundAssets={this.props.unboundAssets}
      />
    );
  }
}

const EMPTY_ARRAY = []

function mapToState(state, ownProps) {
  let bill = state.monition.job;
  let substation = state.monition.substation
  return {
    unboundAssets: bill.get('unboundAssets'),
    data: bill.get('data'),
    isFetching: bill.get('isFetching'),
    isPosting: bill.get('isPosting'),
    dutyPosting: bill.get('dutyPosting'),
    tpl: bill.get('tpl') || [],
    tplInfo: bill.get('tplInfo') || EMPTY_ARRAY,
    assets: bill.get('assets') || [],
    person: bill.get('person') || [],
    substationList: substation.get('data'),
    customerId: state.user.getIn(['user', 'CustomerId']),
    unbound: bill.get('unbound'),
    billPermission: state.user.get('billPermission')
  }
}

export default connect(mapToState, {
  getJobBillById, createJobBill, signJobBill, editJobBill, finishJobBillTask,
  recycleJobBill, bindJobBillToCommandBill, updateJobBillOrder, updateJobBillOrderDuty, initJob, getSubstationList, loadSubstationAsset,
  loadPersonData, listJobBillTplList, getJobBillTplInfo, changeJobBillSubstation, loadUnbindBill, loadUnbindAssets
})(JobBill)
