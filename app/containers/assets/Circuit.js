
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import {
  loadCircuitDetail, updateLogbookCircle, deleteLogbookCircle,
  loadCircuitAllParameters, loadCircuitRiskHistoryData, changeCircuitRiskDate,
  loadCircuitSensorData, resetCircuit, loadCircuitRuntimeSettingData, expandCircuitParam,
  loadCircuitMonitorData, loadCircuitRedDotData
} from '../../actions/assetsAction';
import DetailView from '../../components/assets/DetailView';
import PanelEnvEdit from './PanelEnvEdit.js';
import AssetLogs from './AssetLogs.js';
import TendingHistory from './TendingHistory.js';
import SinglePhotos from './SinglePhotos.js';
import ImagePicker from '../ImagePicker.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import trackApi from '../../utils/trackApi.js';
import CircuitView from '../../components/assets/CircuitView';
import Planning from "./PlanningView";
import Room from './Room';
import Panel from './Panel';
import permissionCode from "../../utils/permissionCode";
import AssetNameEdit from "./AssetNameEdit";
import Toast from "react-native-root-toast";
import Floor from "./Floor";
import SwitchBox from "./SwitchBox";
import CircuitOverview from "../../components/assets/CircuitOverview";
import moment from "moment";

class Circuit extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = { dataSource: [null, null], sections: [null, null], index: 0, name: this.props.ownData.get('Name') };
  }
  _gotoDetail(data) {
    var type = data.get('type');
    if (type === 'temperature' ||
      type === 'busTemperature' ||
      type === 'humidity' ||
      type === 'dust') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_env',
        component: PanelEnvEdit,
        passProps: {
          data,
          asset: this.props.ownData
        }
      });
    }
    if (type === 'log') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_log',
        component: AssetLogs,
        passProps: {
          hierarchyId: this.props.ownData.get('Id'),
          onRefresh: () => this._onRefresh()
        }
      });
    } else if (type === 'tending') {
      this.props.navigation.push('PageWarpper', {
        id: 'tending',
        component: TendingHistory,
        passProps: {
          hierarchyId: this.props.ownData.get('Id'),
          title: '已完成工单',
          emptyText: '暂无已完成工单',
          onRefresh: () => this._onRefresh()
        }
      });
    } else if (type === 'ticketing') {
      this.props.navigation.push('PageWarpper', {
        id: 'ticketing',
        component: TendingHistory,
        passProps: {
          hierarchyId: this.props.ownData.get('Id'),
          CustomerId: this.props.CustomerId,
          title: '未完成工单',
          showTicketing: true,
          emptyText: '暂无未完成工单',
          onRefresh: () => this._onRefresh()
        }
      });
    } else if (type === 'singleLine') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_singlePhotos',
        component: SinglePhotos,
        passProps: {
          hierarchyId: this.props.ownData.get('Id'),
          arrPhotos: this.props.arrPhotos,
        }
      });
    } else if (type === 'planning') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_planning',
        component: Planning,
        passProps: {
          assetId: this.props.ownData.get('Id'),
          CustomerId: this.props.CustomerId
        }
      });
    } else if (data.get('gotoParent')) {
      let cmp = null;
      var subType = this.props.parent.get('parentSubType');
      // if (subType===8||subType===70) {
      //   Toast.show('暂不支持查看此类资产详情',{
      //     duration:1500
      //   });
      //   return;
      // }
      switch (this.props.parent.get('parentType')) {
        case 3:
          cmp = Room;
          if (subType === 8) cmp = Floor;
          break;
        case 4:
          cmp = Panel;
          if (subType === 70) cmp = SwitchBox;
          break;
      }
      if (!cmp) return;
      this.props.navigation.push('PageWarpper', {
        id: 'asset_detail',
        component: cmp,
        passProps: {
          ownData: this.props.parent,
        }
      });
    }

  }
  _loadDetailById(objAsset) {
    this.props.loadCircuitDetail(objAsset.get('Id'));
    this.props.loadCircuitAllParameters(objAsset.get('Id'))
  }
  _onRefresh() {
    this._loadDetailById(this.props.ownData);
  }

  _loadRiskData(riskDate) {
    if (!riskDate) {
      //为空，则取当前天
      riskDate = moment(moment().format('YYYY-MM-DD')).add(1, 'd').toDate();
    } else {
      riskDate = moment(moment(riskDate).format('YYYY-MM-DD')).add(1, 'd').toDate();
    }
    riskDate = riskDate - riskDate.getTimezoneOffset() * 60000;
    riskDate = Number.parseInt(riskDate / 1000);
    let data = {
      "HierarchyId": this.props.ownData.get('Id'),
      "StartTime": 0, "EndTime": riskDate, "Interval": 1
    }
    // this.props.loadCircuitRiskHistoryData(data);
  }

  _changeRiskDate(date) {
    this.props.changeCircuitRiskDate(date);
  }

  _refreshCircuit() {
    this.props.loadCircuitAllParameters(this.props.ownData.get('Id'))
    this._loadRiskData(this.props.riskDate);
    this._loadRedDotData();
    //加载温度数据
    if (this.sensors && this.sensors.size > 0) {
      this._loadSensorData(this.sensors.get(0));
    }
    this._loadMonitorData();
    this._loadRuntimeSettingData();
  }

  _loadSensorData(device) {
    let time = Number.parseInt((Date.now() / 1000));
    let MonitorParameters = device.get('MonitorParameters').toJS().map((m, index) => {
      return {
        UniqueId: m.UniqueId,
        TagId: m.TagId
      }
    });
    let data = {
      AccountId: this.props.CustomerId,
      DeviceId: device.get('DeviceId'),
      EndTime: time,
      MonitorParameters
    }
    this.props.loadCircuitSensorData(data);
  }

  _loadMonitorData() {
    let data = {
      "UniqueIds": this.props.monitorDot,
      "DeviceIds": this.props.monitorDeviceIds,
      "GatewayUniqueId": this.props.gid
    }
    this.props.loadCircuitMonitorData(data);
  }

  _loadRuntimeSettingData() {
    let data = { "BreakerDeviceId": this.props.bid, "UniqueIds": this.props.runtimeDot }
    this.props.loadCircuitRuntimeSettingData(data);
  }

  _onBackClick() {
    this.props.navigation.pop();
  }
  _onChangeImage() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        dataChanged: (chosenImages) => this.props.changeImage('panel', chosenImages)
      }
    });
  }
  _onChangeImageComplete(data) {
    try {
      // console.warn('before parse json');
      let obj = JSON.parse(data);
      let { Result: { ImageKey } } = obj;
      // console.warn('ImageKey',ImageKey);
      this.props.changeImageComplete(ImageKey);

    } catch (e) {

    } finally {

    }
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._loadDetailById(this.props.ownData);
    });
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '配电柜',
      // distribution_box_name:this.state.name,
      asset_tab_name: '配电柜信息',
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });
    if (this.props.hasOverview) {
      this._startTimerTask();
    }
  }

  _updateListViewData(nextProps) {
    if (nextProps.data && nextProps.data != this.props.data) {
      let ds = [], sections = [];
      let onePage = nextProps.data.map((item) => item.toArray()).toArray();
      let towPage = nextProps.logPageData.map((item) => item.toArray()).toArray();
      ds.push(this.ds.cloneWithRowsAndSections(onePage));
      ds.push(this.ds.cloneWithRowsAndSections(towPage));
      sections.push(nextProps.sectionData);
      sections.push(nextProps.logPageSectionData);
      InteractionManager.runAfterInteractions(() => {
        this.setState({ dataSource: ds, sections: sections });
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this._updateListViewData(nextProps);
    if (nextProps.isPosting !== this.props.isPosting) {
      if (nextProps.isPosting !== 1) this.context.hideHud();
      //说明删除设备成功，需要返回上一级
      if (nextProps.isPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }

    if (nextProps.isUpdatePosting !== this.props.isUpdatePosting) {
      if (nextProps.isUpdatePosting !== 1) this.context.hideHud();
      if (nextProps.isUpdatePosting === 0) {
        //更新UI
        if (this._name) {
          this.setState({ name: this._name })
        }
      }
    }

    if ((this.props.isFetching !== nextProps.isFetching && !nextProps.isFetching && nextProps.hasOverview) || nextProps.hasOverview && nextProps.hasOverview !== this.props.hasOverview) {
      this._loadRiskData(nextProps.riskDate);
      //加载温度数据
      if (nextProps.sensors && nextProps.sensors.size > 0) {
        this._loadSensorData(nextProps.sensors.get(0));
      }
      this.setState({}, () => {
        this._loadMonitorData();
        this._loadRuntimeSettingData();
        this._startTimerTask();
      })
      return;
    }
    if (nextProps.riskDate !== this.props.riskDate) {
      this._loadRiskData(nextProps.riskDate)
    }
  }

  _stopTimerTask() {
    if (this._timerTask) {
      clearInterval(this._timerTask);
    }
  }

  _loadRedDotData() {
    this.props.loadCircuitRedDotData(this.props.ownData.get('Id'))
  }

  _startTimerTask() {
    this._stopTimerTask();
    this._timerTask = setInterval(() => {
      this._loadMonitorData();
      this._loadRuntimeSettingData();
      this._loadRedDotData();
    }, 1000 * 5);
  }

  componentWillUnmount() {
    this._stopTimerTask();
    this.props.resetCircuit();
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  getTabs() {
    if (this.props.hasOverview) {
      return ['回路概览', '回路信息', '维护日志'];
    }
    return ['回路信息', '维护日志'];
  }

  isLastTab() {
    return this.state.index === this.getTabs().length - 1;
  }

  _getContentView() {
    if (this.props.hasOverview && this.state.index === 0) {
      return (
        <CircuitOverview sensors={this.props.sensors} parameters={this.props.parameters}
          networkType={this.props.networkType} power={this.props.power}
          changeRiskDate={this._changeRiskDate.bind(this)} isFetching={this.props.isFetching}
          onRefresh={() => this._refreshCircuit()} redDot={this.props.redDot}
          riskDate={this.props.riskDate} riskData={this.props.riskData} riskErr={this.props.riskErr}
          changeSensorTab={this._loadSensorData.bind(this)} riskFetching={this.props.riskFetching}
          paramGroup={this.props.paramGroup} expandCircuitParam={this.props.expandCircuitParam}
          agingData={this.props.agingData} sensorData={this.props.sensorData}
        />
      )
    }
    let index = this.state.index;
    if (this.props.hasOverview && index > 0) {
      index -= 1;
    }
    return (
      <DetailView
        noPermission={!this.props.showTicket && this.isLastTab()}
        ownData={this.props.ownData}
        name={this.state.name}
        hiddenImage={true}
        emptyHeaderHeight={10}
        isLogTab={this.isLastTab()}
        tabs={this.getTabs()}
        delRoom={id => this._delLogbookRoom(id)}
        updateRoom={(id, name) => this._updateLogbookRoom(id, name)}
        logbookPermission={this.props.hasLogbookPermission}
        onBack={() => this._onBackClick()}
        emptyImageText="添加一张资产照片"
        changeImage={() => this._onChangeImage()}
        canEdit={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        changeImageComplete={(data) => this._onChangeImageComplete(data)}
        isFetching={this.props.isFetching}
        data={this.state.dataSource[index]}
        sectionData={this.state.sections[index]}
        onRefresh={() => this._onRefresh()}
        hasToolbar={false}
        onRowClick={(rowData) => this._gotoDetail(rowData)} />
    );
  }

  _indexChanged(index) {
    this.setState({ index: index });
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '回路',
      // distribution_box_name:this.state.name,
      asset_tab_name: index === 0 ? '回路信息' : '维护日志',
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });
  }

  _editCircleName() {
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: 'Circle',
        customerId: this.props.CustomerId,
        customerName: this.props.CustomerName,
        hierarchyId: this.props.ownData.get('Id'),
        arrPhotos: this.props.arrPhotos,
        onBack: () => this._onBackClick(),
        title: '编辑回路',
        hint: '请输入',
        name: this.state.name,
        submit: (text, panelType) => {
          this._name = text;
          this.props.updateLogbookCircle({ Name: text, Id: this.props.ownData.get('Id') })
        }
      }
    });
  }

  _delCircle(id) {
    this.context.showSpinner('posting');
    this.props.deleteLogbookCircle(id);
  }

  render() {
    return (
      <CircuitView
        ownData={this.props.ownData}
        name={this.state.name}
        showLogTab={this.props.showLogTab}
        assetType={'Circle'}
        tabs={this.getTabs()}
        doEdit={() => this._editCircleName()}
        doDel={() => this._delCircle(this.props.ownData.get('Id'))}
        logbookPermission={this.props.hasLogbookPermission}
        onBack={() => this._onBackClick()}
        emptyImageText="添加一张资产照片"
        changeImage={() => this._onChangeImage()}
        canEdit={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        changeImageComplete={(data) => this._onChangeImageComplete(data)}
        isFetching={this.props.isFetching}
        errorMessage={this.props.errorMessage}
        data={this.state.dataSource}
        sectionData={this.props.sectionData}
        onRefresh={() => this._onRefresh()}
        contentView={this._getContentView()}
        title={this.state.name}
        currentIndex={this.state.index}
        indexChanged={index => this._indexChanged(index)}
        onRowClick={(rowData) => this._gotoDetail(rowData)} />
    );
  }
}

Circuit.propTypes = {
  navigator: PropTypes.object,
  ownData: PropTypes.object,
  route: PropTypes.object,
  loadPanelDetail: PropTypes.func,
  changeImage: PropTypes.func,
  changeImageComplete: PropTypes.func,
  isFetching: PropTypes.bool,
  data: PropTypes.object,
  sectionData: PropTypes.object,
  arrPhotos: PropTypes.object,
  errorMessage: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  var circuitDetailData = state.asset.circuitDetailData,
    data = circuitDetailData.get('data'),
    logPageData = circuitDetailData.get('logPageData'),
    logPageSectionData = circuitDetailData.get('logPageSectionData'),
    sectionData = circuitDetailData.get('sectionData'),
    isFetching = circuitDetailData.get('isFetching');
  var errorMessage = circuitDetailData.get('errorMessage');
  if (ownProps.ownData.get('Id') !== circuitDetailData.get('circuitId')) {
    data = null;
  }

  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  if (!circuitDetailData.get('isLookbook')) {
    hasLogbookPermission = false;
  }
  var arrPhotos = circuitDetailData.get('arrSinglePhotos');
  let showLogTab = true;
  let showTicket =
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
  let showOverview = !ownProps.ownData.get('IsAsset') &&
    privilegeHelper.checkModulePermission(PermissionCode.ASSET_BASIC_INFO);

  console.log('circuitDetailData', circuitDetailData.get('showOverview'))
  return {
    isFetching,
    data,
    logPageData,
    logPageSectionData,
    sectionData,
    arrPhotos,
    errorMessage,
    showLogTab,
    hasOverview: showOverview,
    power: circuitDetailData.get('power'),
    parameters: circuitDetailData.get('parameters'),
    sensors: circuitDetailData.get('sensors'),
    sensorData: circuitDetailData.get('sensorData'),
    riskDate: circuitDetailData.get('riskDate'),
    riskData: circuitDetailData.get('riskData'),
    riskFetching: circuitDetailData.get('riskFetching'),
    riskErr: circuitDetailData.get('riskErr'),
    agingData: circuitDetailData.get('agingData'),
    bid: circuitDetailData.get('bid'),
    gid: circuitDetailData.get('gid'),
    redDot: circuitDetailData.get('redDot'),
    monitorDot: circuitDetailData.get('monitorDot'),
    runtimeDot: circuitDetailData.get('runtimeDot'),
    networkType: circuitDetailData.get('networkType'),
    monitorDeviceIds: circuitDetailData.get('monitorDeviceIds'),
    isPosting: state.asset.buildHierarchyData.get('isDelCirclePosting'),
    isUpdatePosting: state.asset.buildHierarchyData.get('isUpdateCirclePosting'),
    parent: circuitDetailData.get('parent'),
    paramGroup: circuitDetailData.get('paramGroup'),
    hasLogbookPermission,
    showTicket
  };
}

export default connect(mapStateToProps, {
  loadCircuitDetail, updateLogbookCircle, deleteLogbookCircle,
  loadCircuitAllParameters, loadCircuitRiskHistoryData, changeCircuitRiskDate, loadCircuitSensorData, expandCircuitParam,
  resetCircuit, loadCircuitRuntimeSettingData, loadCircuitMonitorData, loadCircuitRedDotData
})(Circuit);
