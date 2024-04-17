
'use strict';
import React, { Component } from 'react';
import {
  Alert,
  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import {
  loadCreateTicketData, loadTicketById, ticketCreateConditionChange, getAssetChildren,
  createTicket, resetCreateTicket, updateUserSelectInfo, updateAssetsSelectInfo, deleteTicket, loadExecutors
} from '../../actions/ticketAction';
import CreateTicketView from '../../components/ticket/CreateTicketView';
import UsersSelect from './UsersSelect';
import Toast from 'react-native-root-toast';
import SingleSelectList from '../../components/SingleSelectList';
import { localStr } from "../../utils/Localizations/localization";
import privilegeHelper from "../../utils/privilegeHelper";
import AssetRangeSelect from '../assetManager/container/AssetRangeSelect';
import Immutable from 'immutable';
import moment from 'moment';
class CreateTicket extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  constructor(props) {
    super(props);
    let site = props.site;
    if (props.ticketInfo) {
      site = props.hierarchyListData.find(item => String(item.id) === props.ticketInfo.get('objectId'));
      if (!site) {
        this.props.getAssetChildren(props.ticketInfo.get('objectId'));
      }
    }
    this.state = { site };
  }

  _loadContentById(customer) {
    if (!this.props.ticketInfo) {
      //报警工单初始化
      if (this.props.alarm) {
        this.props.loadCreateTicketData({ 'type': 'createAlarmTicket', 'value': { customer, alarm: this.props.alarm } });
        return;
      }
      //计划工单初始化
      if (this.props.plan) {
        console.warn('plan....');
        this.props.loadCreateTicketData({
          'type': 'createPlanTicket',
          'value': { customer, plan: this.props.plan, startTime: this.props.startTime }
        });
        return;
      }
      //现场随工工单初始化
      this.props.loadCreateTicketData({ 'type': 'createNormalTicket', 'value': { customer, alarm: this.props.alarm } });

      // if (!this.props.alarm) {
      //   this.props.loadCreateTicketData({'type':'createNormalTicket','value':{customer,alarm:this.props.alarm}});
      // }else {
      //   this.props.loadCreateTicketData({'type':'createAlarmTicket','value':{customer,alarm:this.props.alarm}});
      // }
    } else {

      this.props.loadCreateTicketData({ 'type': 'editNormalTicket', 'value': { customer: Immutable.fromJS({ CustomerId: this.props.user.get('CustomerId') }), ticket: this.props.ticketInfo } });
    }
  }
  _onChangeTicketType(type, value) {
    this.props.ticketCreateConditionChange({
      type,
      value
    });
  }
  _gotoDetail(type) {
    console.log('type', type)
    if (type === 'Executors') {
      //需要先选资产范围
      if (!this.props.selectAssets || this.props.selectAssets.size === 0) {
        Alert.alert(
          '',
          localStr('lang_ticket_valid_select_assets'),
          [
            { text: localStr('lang_profile_alert_done'), onPress: () => { } }
          ]
        )
        return;
      }
      this.props.updateUserSelectInfo({ type: 'init', value: this.props.selectUsers });
      this.props.navigation.push('PageWarpper', {
        id: 'ticket_users',
        component: UsersSelect,
        passProps: {
          ticketExecutors: this.props.ticketExecutors,
          selectAssets: this.props.selectAssets,
          selectUsers: this.props.selectUsers,
          title: localStr('lang_create_alarm_ticket_executor'),
        }
      });
      // console.warn('this.props.selectUsers',this.props.selectUsers);
    } else if (type === 'Assets') {
      let checkList = [];
      // this.props.selectAssets.toJS().forEach(s => {
      //   let find = this.props.hierarchyListData.find(item => item.id === s.assetId);
      //   if (find) checkList.push(find);
      // });
      checkList = this.props.selectAssets.toJS().map(s => s.assetId);
      this.props.navigation.push('PageWarpper', {
        id: 'ticket_assets',
        component: AssetRangeSelect,
        passProps: {
          site: this.state.site || this.props.assetChildren,
          checkList,
          onSubmit: (data) => {
            //修改了资产，让用户重新选择执行人
            this.props.updateUserSelectInfo({ type: 'save', value: Immutable.fromJS([]) });
            let ids = [];
            let selAssets = data.map(asset => {
              ids.push(asset.id);
              return {
                'assetName': asset.name,
                'assetId': asset.id,
                'assetType': asset.templateId,
                'locationType': this.state.site.templateId,
                'locationId': this.state.site.id,
                'locationName': this.state.site.name,
              }
            })
            this.props.updateAssetsSelectInfo({ type: 'save', value: Immutable.fromJS(selAssets) });
            this.props.loadExecutors(ids, { hierarchyId: this.state.site.id, privilegeCode: privilegeHelper.CodeMap.OMTicketExecute });
          }
        }
      });
      //如果是新增，不执行这条
      if (this.props.ticketInfo)
        this.props.updateAssetsSelectInfo({ type: 'assetInit', value: this.props.selectAssets });
    } else if (type === 'SysClass') {
      let data = this.props.allClass.toJS();
      //SingleSelectList
      this.props.navigation.push('PageWarpper', {
        id: 'ticket_system_class',
        component: SingleSelectList,
        passProps: {
          data: data,
          onBack: () => { this.props.navigation.pop(); },
          onItemClick: (key, value) => {
            console.warn(key, value);
            this._onDateChanged('SysClass', key);
          },
          title: localStr('lang_create_alarm_ticket_system_category_title'),
        }
      });
    }
  }
  _onDateChanged(type, value) {
    this.props.ticketCreateConditionChange({
      type, value, isCreate: !this.props.ticketInfo
    });
  }
  _onRefresh() {
  }

  _onBackClick() {
    this.props.navigation.pop();
  }
  _checkTimeIsTrue() {
    var StartTime = this.props.data.get('StartTime');
    var EndTime = this.props.data.get('EndTime');
    if (StartTime > EndTime) {
      Alert.alert(
        '',
        localStr('lang_ticket_valid_select_time'),
        [
          { text: localStr('lang_profile_alert_done'), onPress: () => console.log('Cancel Pressed') }
        ]
      )
      return false;
    }
    return true;
  }

  _isJobTicket() {
    if (!this.props.ticketInfo) return false;
    return [6, 15].includes(this.props.ticketInfo.get('ticketType'));
  }

  _onCreateTicket(duration) {
    if (!this._checkTimeIsTrue()) {
      return;
    }
    var selectAssets = this.props.data.get('selectAssets');
    if (!selectAssets || selectAssets.size === 0) {
      //提示资产范围不能为空
      Alert.alert(
        '',
        localStr('lang_ticket_valid_select_assets'),
        [
          { text: localStr("lang_profile_alert_done"), onPress: () => { } }
        ]
      )
      return;
    }
    this.context.showSpinner();
    let ticketData = this.props.data.toJSON();
    let startTime = moment(ticketData.StartTime).format('YYYY-MM-DD HH:mm:ss');
    let endTime = moment(ticketData.EndTime).format('YYYY-MM-DD HH:mm:ss');
    let extensionProperties = {};
    if (this.props.ticketInfo && this.props.ticketInfo.get('extensionProperties')) {
      extensionProperties = this.props.ticketInfo.get('extensionProperties').toJSON();
    }
    extensionProperties['duration'] = duration;
    let params = {
      ticketType: ticketData.TicketType,
      assets: ticketData.Assets,
      startTime: startTime,//ticketData.StartTime,// + ' 00:00:00',
      endTime: endTime,//ticketData.EndTime,// + ' 23:59:59',
      executors: ticketData.selectUsers,
      content: ticketData.Content,
      sysClass: String(this.props.sysClass),
      objectId: ticketData.alarm ? ticketData.alarm.locationId : (this.state.site ? this.state.site.id : this.props.ticketInfo.get('objectId')),
      objectType: ticketData.alarm ? ticketData.alarm.locationType : (this.state.site ? this.state.site.templateId : this.props.ticketInfo.get('objectType')),//this.state.site.templateId,//objectType
      title: ticketData.Title,
      ownerId: ticketData.alarm ? ticketData.alarm.businessKey : '',
      ownerType: ticketData.TicketType,
      customerId: this.props.user.get('CustomerId'),
      extensionProperties,
    };
    if (this.props.ticketInfo) {
      //说明是编辑，有些项不需要调整,只有未开始，才能修改开始时间
      params = {
        endTime: endTime,//ticketData.EndTime,
        executors: ticketData.selectUsers,
        content: ticketData.Content,
        title: ticketData.Title,
        id: this.props.ticketInfo.get('id'),
        extensionProperties
      };
      if (this._isJobTicket()) {
        params = {
          endTime: endTime,//ticketData.EndTime,
          executors: ticketData.selectUsers,
          id: this.props.ticketInfo.get('id'),
          extensionProperties
        }
      }
      let sta = this.props.ticketInfo.get('ticketState');
      if (sta === 10) {
        params.startTime = startTime;//ticketData.StartTime;
      }
      if (ticketData.TicketType === 4) {
        params.assets = ticketData.Assets;
      }
    }
    this.props.createTicket(params, this.props.ticketInfo);
  }
  _onDeleteTicket() {
    var { ticketInfo } = this.props;
    var alertText = localStr('lang_ticket_delete_tip');//'工单' + '"' + ticketInfo.get('TicketNum') + '"' + '将被删除?';
    Alert.alert(
      '',
      alertText,
      [
        { text: localStr('lang_alarm_time_picker_cancel'), onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: localStr('lang_alarm_time_picker_ok'), onPress: () => {

            this.props.deleteTicket(ticketInfo.get('id'));
            this.props.onPostingCallback('delete');
          }
        }
      ]
    )

  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this._loadContentById(this.props.customer);
    });
    backHelper.init(this.props.navigation, this.props.route.id);
    let tid = [];
    if (this.props.alarm) {
      tid = [this.props.alarm.hierarchyId];
    }
    if (this.props.ticketInfo) {
      tid = this.props.ticketInfo.get('assets').map(a => a.get('assetId')).toJS();//this.props.ticketInfo.get('objectId');
    }
    ///获取联系人
    if (tid)
      this.props.loadExecutors(tid, { hierarchyId: tid, privilegeCode: privilegeHelper.CodeMap.OMTicketExecute });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isPosting !== this.props.isPosting) {
      // console.warn('hideHud 1');
      this.context.hideHud();

      if (nextProps.isPosting === 2 && this.props.isPosting === 1) {
        var startTime = null;
        var ticketCreate = nextProps.data;
        if (ticketCreate) {
          startTime = ticketCreate.get('StartTime');
        }
        this.props.onPostingCallback && this.props.onPostingCallback('create', startTime);
        if (!this.props.ticketInfo) {
          this._onBackClick();
          Toast.show(localStr('lang_ticket_create_success_tip'), {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
          });
        }
      }
      return;
    }
    if (nextProps.assetChildren !== this.props.assetChildren) {
      if (nextProps.assetChildren && !this.state.site && this.props.ticketInfo) {
        let oneAsset = this.props.ticketInfo.getIn(['assets', 0]);
        this.setState({
          site: {
            name: oneAsset.get('locationName'),
            id: oneAsset.get('locationId'),
            templateId: oneAsset.get('locationType'),
            children: nextProps.assetChildren
          }
        });
      }
    }
  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    this.props.resetCreateTicket();
  }

  _getTitle() {
    if (this.props.ticketInfo) return localStr('lang_ticket_title_edit');
    return localStr('lang_ticket_title_create');
  }

  render() {
    return (
      <CreateTicketView
        title={this._getTitle()}
        customer={this.props.customer}
        ticketInfo={this.props.ticketInfo}
        onBack={() => this._onBackClick()}
        isEnableCreate={this.props.isEnableCreate}
        isExecuterNotCreate={this.props.isExecuterNotCreate}
        isAlarm={true} fullPermission={this.props.fullPermission}
        isPosting={this.props.isPosting}
        data={this.props.data}
        status={this.props.ticketInfo ? this.props.ticketInfo.get('ticketState') : null}
        ticketTitle={this.props.ticketTitle}
        allClass={this.props.allClass}
        sysClass={this.props.sysClass}
        isJobTicket={this._isJobTicket()}
        sysClassText={this.props.sysClassText}
        onRefresh={() => this._onRefresh()}
        onCreateTicket={(duration) => this._onCreateTicket(duration)}
        onDeleteTicket={() => this._onDeleteTicket()}
        onRowClick={(rowData) => this._gotoDetail(rowData)}
        onDateChanged={(type, value) => this._onDateChanged(type, value)}
        onTicketTypeSelect={(type, value) => this._onChangeTicketType(type, value)} />
    );
  }
}

CreateTicket.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  customer: PropTypes.object,
  alarm: PropTypes.object,
  data: PropTypes.object,
  ticketInfo: PropTypes.object,
  onPostingCallback: PropTypes.func,
  loadCreateTicketData: PropTypes.func,
  loadTicketById: PropTypes.func,
  ticketCreateConditionChange: PropTypes.func,
  updateUserSelectInfo: PropTypes.func,
  deleteTicket: PropTypes.func,
  updateAssetsSelectInfo: PropTypes.func,
  createTicket: PropTypes.func,
  resetCreateTicket: PropTypes.func,
  isFetching: PropTypes.bool,
  isPosting: PropTypes.number,
  isEnableCreate: PropTypes.bool,
  isExecuterNotCreate: PropTypes.bool,
  selectUsers: PropTypes.object,
  selectAssets: PropTypes.object,
  loadExecutors: PropTypes.func,
  // reqBody:PropTypes.any,
}

function mapStateToProps(state, ownProps) {
  var ticketCreate = state.ticket.ticketCreate,
    isFetching = ticketCreate.get('isFetching'),
    isPosting = ticketCreate.get('isPosting'),
    selectUsers = ticketCreate.get('selectUsers'),
    selectAssets = ticketCreate.get('selectAssets'),
    startTime = ticketCreate.get('StartTime'),
    endTime = ticketCreate.get('EndTime'),
    content = ticketCreate.get('Content') || '',
    ticketType = ticketCreate.get('TicketType'),
    sysClass = ticketCreate.get('SysClass'),
    allClass = ticketCreate.get('allClass'),
    title = ticketCreate.get('Title');
  var customer = ownProps.customer;
  var alarm = ownProps.alarm;
  var ticketInfo = ownProps.ticketInfo;
  var data = ticketCreate;
  // console.warn('mapStateToProps...',startTime,endTime);
  // if (ownProps.customer.get('CustomerId') !== data.get('CustomerId')) {
  //   data = null;
  // }
  var isExecuterNotCreate = false;
  var isEnableCreate = customer && ticketType !== 0 && selectAssets.size >= 1 && startTime && endTime && selectUsers.size >= 1 && content.length > 0;
  // console.warn('mapStateToProps',isExecuterNotCreate);
  let hierarchyListData = state.device.deviceList.hierarchyListData || [];
  let fullPermission = privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketFull);
  return {
    user: state.user.get('user'),
    data,
    isFetching,
    isPosting,
    isEnableCreate,
    isExecuterNotCreate,
    selectUsers,
    selectAssets,
    customer,
    alarm,
    ticketInfo,
    sysClass,
    allClass,
    sysClassText: allClass.get(String(sysClass)),
    ticketTitle: title,
    ticketExecutors: ticketCreate.get('TicketExecutors'),
    hierarchyListData,
    fullPermission,
    assetChildren: ticketCreate.get('assetChildren')
  };
}

export default connect(mapStateToProps, {
  loadCreateTicketData, loadTicketById, ticketCreateConditionChange, loadExecutors, getAssetChildren,
  createTicket, resetCreateTicket, updateUserSelectInfo, updateAssetsSelectInfo, deleteTicket
})(CreateTicket);
