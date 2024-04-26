
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
  Platform, Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import {
  loadDeviceDetail, loadDeviceRealtimeData, loadDeviceRuntimeSetting, loadDashboardData, dashsSearchCondiChange,
  updateMaintenExpandInfo, exitDeviceInfo, changeImage, changeImageComplete, updateLogbookDevice,
  delLogbookDevice, getLogbookDevice, loadPanelDetail, manualUpdateDevice
} from '../../actions/assetsAction';
import DeviceDetailView from '../../components/assets/DeviceDetailView.js';
import DeviceParameter from './DeviceParameter';
import DeviceInfoView from '../../components/assets/DetailView.js';
import DeviceRuntimeSettingView from '../../components/assets/DeviceRuntimeSettingView.js';
import DeviceRealtimeDataView from '../../components/assets/DeviceRealtimeDataView.js';
import DeviceDashboardView from '../../components/assets/DeviceDashboardView.js';
import reactMixin from 'react-mixin';
import timerMixin from 'react-timer-mixin';
import AssetLogs from './AssetLogs.js';
import TendingHistory from './TendingHistory.js';
import ImagePicker from '../ImagePicker.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import History from './History.js';
var Orientation = require('react-native-orientation');
import trackApi from '../../utils/trackApi.js';
import DeviceEnvEdit from './DeviceEnvEdit.js';
import AssetNameEdit from "./AssetNameEdit";
import Planning from "./PlanningView";
import Room from './Room';
import Panel from './Panel';
import Circuit from './Circuit';
import permissionCode from "../../utils/permissionCode";
import { Navigator } from 'react-native-deprecated-custom-components';
import Toast from "react-native-root-toast";
import SwitchBox from "./SwitchBox";
import Floor from "./Floor";

class Device extends Component {

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
    this.state = { dataSource: null, currentIndex: 0 };
    this._viewCache = {};
    this._dataSourceCache = {};
  }

  _loadDetailById(objAsset) {
    // console.warn('building',objAsset.get('Id'));
    this.props.loadDeviceDetail(objAsset.get('Id'));
  }
  _loadRealtimeData(objAsset) {
    var monitorGroupIds = this.props.realtimeData.get('monitorGroupIds').toArray();
    // console.warn('monitorGroupIds',monitorGroupIds.length);
    this.props.loadDeviceRealtimeData({ 'ParamUniqueIds': monitorGroupIds, 'DeviceId': objAsset.get('Id') });
  }
  _loadRuntimeSetting(objAsset) {
    var isCommonDevice = this.props.classType !== '变频与驱动';
    var isCombox510Device = this.props.joinType === 2;
    var isSmartHVX = this.props.isSmartHVX;
    this.props.loadDeviceRuntimeSetting(objAsset.get('Id'),
      { strTkdy: this.props.strTkdyly, isCommonDevice: isCommonDevice, isCombox510Device, isSmartHVX });
  }
  _loadDashboardData(objAsset) {
    // moment(filter.get('EndTime')).add(8,'h').unix();
    this.props.arrCanCalcuDash.forEach((item) => {
      this.props.loadDashboardData({
        DeviceId: objAsset.get('Id'),
        CalcType: item.get('CalcType'),
        BeginDate: this.props.dashboardDatas.get('filter').get('StartTime'),
        EndDate: this.props.dashboardDatas.get('filter').get('EndTime')
      });
    });
  }
  _onRefresh() {
    var type = this._getCurrentType();
    //
    // console.warn('onRefresh...',type);
    if (type === 'infoData') {
      this._loadDetailById(this.props.ownData);
    }
    else if (type === 'realtimeData') {
      this._loadRealtimeData(this.props.ownData);
      trackApi.onPageBegin('data_monitor', this.props.CustomerId, this.props.CustomerName);
    }
    else if (type === 'runtimeData') {
      this._loadRuntimeSetting(this.props.ownData);
      trackApi.onPageBegin('O&M_parameters', this.props.CustomerId, this.props.CustomerName);
    } else if (type === 'dashboardData') {
      this._loadDashboardData(this.props.ownData);
    } else if (type == 'logData') {
      this._loadDetailById(this.props.ownData);
      trackApi.onPageBegin('maintance_log', this.props.CustomerId, this.props.CustomerName);
    }
  }
  _onBackClick() {
    this.props.navigation.pop();
    this.props.exitDeviceInfo();
  }
  _indexChanged(index, tabName) {
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '设备',
      // equipment_name:this.props.ownData.get('Name'),
      asset_tab_name: tabName,
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });

    this.setState({ currentIndex: index, dataSource: this._getDataSource(index) }, () => {
      // if(index !== 0){
      this._onRefresh();
      // }
    });

  }
  _gotoDetail(data) {
    var type = data.get('type');
    // console.warn('_gotoDetail...',data);
    var type = data.get('type');
    if (type === 'temperature1' ||
      type === 'temperature2' ||
      type === 'temperature3') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_env',
        component: DeviceEnvEdit,
        passProps: {
          data,
          asset: this.props.ownData
        }
      });
    } else if (type === 'parameter') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_parameter',
        component: DeviceParameter,
        passProps: {
          data: data.get('data'),
          title: data.get('title'),
        }
      });
    } else if (type === 'log') {
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
    } else if (type === 'historydata') {
      trackApi.onTrackEvent('App_HistoryData', {
        // data_type:data.get('title'),
        // equipment_name:this.state.title?this.state.title:this.props.ownData.get('Name'),
        // equipment_id:this.props.ownData.get('Id'),
        customer_id: String(this.props.CustomerId || ''),
        customer_name: this.props.CustomerName || '',
        building_id: String(this.props.BuildingId || ''),
        building_name: this.props.BuildingName || '',
        // switching_room_id:this.props.RoomId||'',
        // switching_room_name:this.props.RoomName||''
      });
      var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
      sceneConfig.gestures = {};
      this.props.navigation.push('PageWarpper', {
        id: 'history_view',
        component: History,
        sceneConfig,
        passProps: {
          titleSuffix: data.get('formula'),
          uniqueId: data.get('uniqueId'),
          unit: data.get('unit'),
          name: data.get('title'),
          hierarchyId: this.props.ownData.get('Id'),
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
      })
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
        case 200:
          cmp = Circuit;
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
  _getCurrentData(props) {
    var type = this._getCurrentType();
    return props[type];
  }
  _getCurrentType(index = this.state.currentIndex) {
    var ret = '';
    /*****
    if(index === 0){
      ret = 'infoData';
    }
    else{
      if(this.props.hasRealtime){
        if(index === 1){
          ret = 'realtimeData';
        }
        else if(index === 2){
          ret = 'runtimeData';
        }else if(index === 3){
          ret = 'dashboardData';
        }
      }
      else {
        if(index === 1){
          ret = 'runtimeData';
        }else if(index === 2){
          ret = 'dashboardData';
        }
      }
    }
    // console.warn('currentType',ret);
    if(ret=='' && this.props.showLogTab){
      ret='logData';
    }
    *****/

    var array = [];//['infoData'];
    if (this.props.hasRealtime) {
      array.push('realtimeData');
    }
    if (this.props.hasRuntime) {
      array.push('runtimeData');
    }
    if (this._hasDashboard()) {
      array.push('dashboardData');
    }
    array.push('infoData');
    if (this.props.showLogTab) {
      array.push('logData');
    }
    if (index < array.length) {
      ret = array[index];
    }
    return ret;
  }

  _getTabArray(props = this.props) {
    if (!props.data) return [];
    var array = [];
    if (props.hasRealtime) {
      array.push('数据监视');
    }
    if (props.hasRuntime) {
      array.push('运维参数');
    }
    if (this._hasDashboard()) {
      array.push('运行指标');
    }
    array.push('设备信息');
    if (props.showLogTab) {
      array.push('维护日志');
    }
    return array;
  }

  _hasDashboard() {
    return this.props.arrCanCalcuDash.size > 0 && this.props.infoData.get('classType') === '变频与驱动';
  }

  _getDataSource(index) {
    var type = this._getCurrentType(index);
    if (this._dataSourceCache[type]) {
      return this._dataSourceCache[type];
    }
    return null;
  }
  _setDataSourceCache(dataSource) {
    var type = this._getCurrentType();
    if (dataSource) {
      this._dataSourceCache[type] = dataSource;
    }
    this.setState({ dataSource });
  }
  _getCurrentContentView() {
    var type = this._getCurrentType();
    var component = null;
    if (type === 'dashboardData') {
      component = (
        <DeviceDashboardView
          dashboardDatas={this.props.dashboardDatas}
          onSearch={() => this._loadDashboardData(this.props.ownData)}
          onDateChanged={(type, value) => {
            // console.warn('dashsSearchCondiChange',type,value);
            this.props.dashsSearchCondiChange({
              type, value
            });
          }}
        />
      );
      return component;
    }
    var stateData = this._getCurrentData(this.props)
    if (stateData === 'undefined' || !stateData) {
      console.warn('stateData is undefined...', type);
      return component;
    }
    var obj = {
      isSmartHVX: this.props.isSmartHVX,
      isFetching: stateData.get('isFetching'),
      data: this._getDataSource(),
      sectionData: stateData.get('sectionData'),
      onRefresh: () => this._onRefresh(),
      stateData,
      hasToolbar: false,
      emptyImageText: "添加一张资产照片",
      changeImage: () => this._onChangeImage(),
      canEdit: privilegeHelper.hasAuth('AssetEditPrivilegeCode'),
      ownData: this.props.ownData,
      changeImageComplete: (data) => this._onChangeImageComplete(data),
      onRowClick: (rowData) => this._gotoDetail(rowData),
      flowType: this.props.flowType,
      emptyText: '无数据可显示，请在网页端进行配置'
    }
    // if(this._viewCache[type]){
    //   return this._viewCache[type];
    // }
    if (type === 'infoData') {
      component = (
        <DeviceInfoView {...obj} />
      );
    }
    else if (type === 'realtimeData') {
      component = (
        <DeviceRealtimeDataView {...obj} />
      );
    }
    else if (type === 'runtimeData') {
      component = (
        <DeviceRuntimeSettingView {...obj} smartData={stateData.get('smartData')}
          panelData={this.props.panelData}
          onSectionClick={(rowData) => {
            this.props.updateMaintenExpandInfo({ value: rowData });
          }}
          imageId={this._getCurrentData(this.props).get('imageId')} />
      );
    } else if (type == 'logData') {
      if (!this._getDataSource()) {
        let data = stateData.get('data');
        data = this._clearEmptySection(data, stateData.get('sectionData'));
        data = data.map((item) => item.toArray()).toArray();
        let ds = this.ds.cloneWithRowsAndSections(data);
        obj.data = ds;
        InteractionManager.runAfterInteractions(() => {
          this._setDataSourceCache(ds);
        });
      }
      component = (
        <DeviceInfoView noPermission={!this.props.showTicket} {...obj} errorMessage={stateData.get('errorMessage')} />
      );
    }
    // if(component && this.state.dataSource){
    //   this._viewCache[type] = component;
    // }
    return component;
  }
  _onChangeImage() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        dataChanged: (chosenImages) => this.props.changeImage('device', chosenImages)
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
    var navigator = this.props.navigator;
    // if (navigator) {
    //   var callback = (event) => {
    //     // console.warn('event route:',event.data.route.id);
    //     // console.warn('current route:',event.data.route.id,this.props.route.id);
    //     if(event.data.route && event.data.route.id && event.data.route.id === this.props.route.id){
    //       // Orientation.lockToPortrait();
    //     }
    //   };
    //   // Observe focus change events from the owner.
    //   this._listener= navigator.navigationContext.addListener('willfocus', callback);
    // }

    InteractionManager.runAfterInteractions(() => {
      this._loadDetailById(this.props.ownData);
    });
    backHelper.init(this.props.navigator, this.props.route.id);
    this._firstShow = true;
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '设备',
      // equipment_name:this.props.ownData.get('Name'),
      asset_tab_name: '设备信息',
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });
  }

  _clearEmptySection(section, sectionData) {
    if (section && section.size > 0) {
      for (let i = 0; i < section.size; i++) {
        if (!section.get(i) || section.get(i).size == 0) {
          var secTitle = null;
          if (sectionData) {
            secTitle = sectionData.get(i);
          }
          var isCanExpandedSection = false;
          if (secTitle) {
            if (secTitle.get('isExpanded') === false) {
              isCanExpandedSection = true;
            }
          }
          if (!isCanExpandedSection) {
            // console.warn('_clearEmptySection',section);
            section = section.delete(i);
            i = i - 1;
          }
        }
      }
    }
    return section;
  }

  componentWillReceiveProps(nextProps) {
    var type = this._getCurrentType();
    if (type === 'dashboardData') {
      return;
    }
    if (!this._getCurrentData(nextProps)) return;
    var data = this._getCurrentData(nextProps).get('data');
    // var origData = this._getCurrentData(this.props).get('data');

    // console.warn('componentWillReceiveProps',data);
    if (data) {
      var sectionData = this._getCurrentData(nextProps).get('sectionData');
      // if(data !== origData && data && data.size >= 1){
      data = this._clearEmptySection(data, sectionData);
      var obj = data.map((item) => item.toArray()).toArray();
      //如果type不是infoData,先不显示
      if (this._firstShow && this.state.currentIndex === 0 &&
        this._getTabArray(nextProps)[this.state.currentIndex] !== '设备信息') {
        //防止首次显示的tab不是设备信息，但是依赖设备信息接口数据
      } else {
        InteractionManager.runAfterInteractions(() => {
          this._setDataSourceCache(this.ds.cloneWithRowsAndSections(obj));
        });
      }

      var type = this._getCurrentType();
      if (type !== 'infoData' && type !== 'logData') {
        if (this.handerTimeout) {
          clearTimeout(this.handerTimeout);
        }
        this.handerTimeout = this.setTimeout(() => { this._onRefresh() }, 5000);
      } else {
        if (this.handerTimeout) {
          clearTimeout(this.handerTimeout);
        }
      }
    }

    if (nextProps.data && this.state.currentIndex === 0 && this._firstShow) {
      //第一次加载完设备数据，获取数据监控
      this._firstShow = false;
      // this._onRefresh();
      setTimeout(() => {
        this._onRefresh();
      }, 1);
    }

    if (nextProps.isUpdatePosting !== this.props.isUpdatePosting) {
      if (nextProps.isUpdatePosting !== 1) this.context.hideHud();
      if (nextProps.isUpdatePosting === 0) {
        //说明修改成功
        if (this._name) {
          this.setState({ title: this._name })
          //重新请求数据
          this._loadDetailById(this.props.ownData);
        }
      }
    }

    if (nextProps.isPosting !== this.props.isPosting) {
      if (nextProps.isPosting !== 1) this.context.hideHud();
      //说明删除设备成功，需要返回上一级
      if (nextProps.isPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        });
      }
    }

    if (nextProps.isSmartHVX && nextProps.isSmartHVX !== this.props.isSmartHVX) {
      //请求配电柜详情
      this.props.loadPanelDetail(nextProps.infoData.get('parentId'));
    }
  }

  _editDeviceName() {
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        customerId: this.props.CustomerId,
        customerName: this.props.CustomerName,
        onBack: () => this.props.navigation.pop(),
        title: '编辑设备',
        type: 'Device',
        hint: '请输入',
        name: this.state.title ? this.state.title : this.props.ownData.get('Name'),
        data: this.props.detail,
        submit: (text) => {
          //根据jointype判断
          if (this.props.detail.get('JoinType') === 9) {
            //手动创建的设备，调用手动修改接口
            let body = {
              ...text,
              Id: this.props.detail.get('Id'),
              ParentId: this.props.detail.get('ParentId'),
              CustomerId: this.props.detail.get('CustomerId')
            }
            this._name = body.Name;
            this.context.showSpinner('posting');
            this.props.manualUpdateDevice(body);
          } else {
            this._updateDeviceName(text)
          }
        }
      }
    });
  }

  _updateDeviceName(name) {
    this._name = name;
    this.context.showSpinner('posting');
    this.props.updateLogbookDevice(this.props.ownData.get('Id'), name);
  }

  _delDevice() {
    this.context.showSpinner('posting');
    this.props.delLogbookDevice(this.props.ownData.get('Id'));
  }

  componentWillUnmount() {
    this.setState = () => { }
    trackApi.onPageEnd(this.props.route.id);
    if (this.handerTimeout) {
      clearTimeout(this.handerTimeout);
    }
    backHelper.destroy(this.props.route.id);
    // this._listener && this._listener.remove();
  }
  render() {
    return (
      <DeviceDetailView
        editName={() => this._editDeviceName()}
        logbookPermission={this.props.hasLogbookPermission && this.props.isLogbookDevice}
        showLogTab={this.props.showLogTab}
        delDevice={() => this._delDevice()}
        updateDevice={(name) => this._updateDeviceName(name)}
        deviceData={this.props.data}
        title={this.state.title ? this.state.title : this.props.ownData.get('Name')}
        hasRuntime={this.props.hasRuntime}
        hasRealtime={this.props.hasRealtime}
        has6Dashboard={this.props.arrCanCalcuDash.size > 0 && this.props.infoData.get('classType') === '变频与驱动'}
        onBack={() => this._onBackClick()}
        currentIndex={this.state.currentIndex}
        indexChanged={(index, tabName) => { this._indexChanged(index, tabName) }}
        contentView={this._getCurrentContentView()}
        errorMessage={this.props.errorMessage}
        tabArray={this._getTabArray()}
      />
    );
  }
}
Device.propTypes = {
  navigator: PropTypes.object,
  ownData: PropTypes.object,
  route: PropTypes.object,
  realtimeData: PropTypes.object,
  runtimeData: PropTypes.object,
  infoData: PropTypes.object,
  dashboardDatas: PropTypes.object,
  arrCanCalcuDash: PropTypes.object,
  changeImage: PropTypes.func,
  changeImageComplete: PropTypes.func,
  loadDeviceDetail: PropTypes.func,
  loadDeviceRealtimeData: PropTypes.func,
  loadDeviceRuntimeSetting: PropTypes.func,
  loadDashboardData: PropTypes.func,
  dashsSearchCondiChange: PropTypes.func,
  updateMaintenExpandInfo: PropTypes.func,
  data: PropTypes.object,
  hasRuntime: PropTypes.bool,
  hasRealtime: PropTypes.bool,
  strTkdyly: PropTypes.string,
  classType: PropTypes.string,
  joinType: PropTypes.number,
  errorMessage: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  var deviceDetailData = state.asset.deviceDetailData, data;
  var errorMessage = deviceDetailData.get('errorMessage');
  if (ownProps.ownData.get('Id') !== deviceDetailData.get('deviceId')) {
    data = null;
  }
  else {
    data = state.asset.deviceDetailData.get('data');
  }
  var arrCanDash = deviceDetailData.get('arrCanCalcuDash');

  // let codes=state.user.getIn(['user','PrivilegeCodes']);
  //2176 logbook完整权限
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  //2177，2178维护日志权限（只要满足一个，就显示维护日志tab)
  let showLogTab = false;
  showLogTab = privilegeHelper.hasAuth('LogLookPrivilegeCode');
  if (!showLogTab) {
    showLogTab = privilegeHelper.hasAuth('LogFullPrivilegeCode');
  }
  let showTicket =
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
  return {
    data, detail: deviceDetailData.get('detail'),
    isSmartHVX: deviceDetailData.get('isSmartHVX'),
    panelData: state.asset.panelDetailData,
    infoData: deviceDetailData,
    runtimeData: state.asset.deviceRuntimSetting,
    realtimeData: state.asset.deviceRealtime,
    dashboardDatas: state.asset.dashboardDatas,
    arrCanCalcuDash: arrCanDash,
    //hasRuntime:privilegeHelper.checkModulePermission(permissionCode.ASSET_RUNNING_CONFIG)&&deviceDetailData.get('hasRuntime'),
    //hasRealtime:privilegeHelper.checkModulePermission(permissionCode.DEVICE_DATA_MONITOR)&&deviceDetailData.get('hasRealtime'),
    strTkdyly: deviceDetailData.get('strTkdyly'),
    classType: deviceDetailData.get('classType'),
    joinType: deviceDetailData.get('joinType'),
    isLogbookDevice: deviceDetailData.get('isLogbookDevice'),
    errorMessage,
    hasLogbookPermission, showLogTab,
    isUpdatePosting: state.asset.buildHierarchyData.get('isUpdateDevicePosting'),
    isPosting: state.asset.buildHierarchyData.get('isDelDevicePosting'),
    logData: deviceDetailData.get('logbook'),
    parent: deviceDetailData.get('parent'),
    flowType: deviceDetailData.get('flowType'),
    showTicket
  };
}

reactMixin(Device.prototype, timerMixin);


export default connect(mapStateToProps, {
  loadDeviceDetail, loadDeviceRealtimeData, loadDeviceRuntimeSetting,
  loadDashboardData, dashsSearchCondiChange, updateMaintenExpandInfo, exitDeviceInfo, changeImage,
  changeImageComplete, updateLogbookDevice, delLogbookDevice, getLogbookDevice, loadPanelDetail, manualUpdateDevice
})(Device);
