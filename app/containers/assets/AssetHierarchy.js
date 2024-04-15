
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
  loadHierarchyByBuildingId, changeAssetExpand, addAsset, addLogbookRoom, addFloor,
  addLogbookPanel, clearHierarchyCache, loadContacts, changeHierarchySearch, addLogbookSwitchBox,
  loadBuilding, loadIndustry, changeImage, changeImageComplete, addLogbookCircle,
  manualAddDevice
} from '../../actions/assetsAction';
import AssetHierarchyView from '../../components/assets/AssetHierarchy';
import Scan from './Scan.js';

import Room from './Room';
import Panel from './Panel';
import Device from './Device';
import Circuit from './Circuit';
import AssetBindHierarchy from './AssetBindHierarchy';
import privilegeHelper from '../../utils/privilegeHelper.js';
import trackApi from '../../utils/trackApi.js';
import BuildingHealthy from './BuildingHealthy.js';
import { Navigator } from 'react-native-deprecated-custom-components';
import AssetNameEdit from "./AssetNameEdit";
import Immutable from 'immutable';
import ImagePicker from "../ImagePicker";
import Toast from 'react-native-root-toast';
import Floor from "./Floor";
import SwitchBox from "./SwitchBox";
import SwitchBoxEdit from "./SwitchBoxEdit";

class AssetHierarchy extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { dataSource: null, currentIndex: 0 };
    this.props.clearHierarchyCache(this.props.isFromScan);
  }

  _loadHierarchyByBuildingId(building) {
    // console.warn('building',building.get('Id'),this.props.isFromScan);
    this.props.loadHierarchyByBuildingId(building.get('Id'), this.props.isFromScan, building.get('CustomerName'));
  }

  _getAssetRoom(index) {
    for (let i = index - 1; i >= 0; i--) {
      let row = this.props.listHierarchys[i];
      if (row && row.Type === 3) {
        return { RoomId: row.Id, RoomName: row.Name };
      }
    }
  }

  _gotoDetail(rowData, rowIndex) {
    rowData = Immutable.fromJS(rowData);
    var type = rowData.get('Type');
    var subType = rowData.get('SubType');
    // if (subType===70) {
    //   Toast.show('暂不支持查看此类资产详情',{
    //     duration:1500
    //   });
    //   return;
    // }
    var container = Room;
    var asset_type = '';
    let path = ['', '', ''];
    let findRoomInfo = {};
    if (type === 3) {
      container = Room;
      asset_type = '配电室';
      path[0] = rowData.get('Name');
      if (subType === 8) {
        container = Floor;
        asset_type = '楼层';
      }
    } else if (type === 4) {
      container = Panel;
      asset_type = '配电柜';
      path[1] = rowData.get('Name');
      if (subType === 70) {
        container = SwitchBox;
        asset_type = '配电箱';
      }
    } else if (type === 5) {
      container = Device;
      asset_type = '设备';
      path[2] = rowData.get('Name');
      //读取配电室信息
      findRoomInfo = this._getAssetRoom(rowIndex);
    } else if (type === 200) {
      container = Circuit;
      asset_type = '回路';
      path[0] = rowData.get('Name');
    }

    trackApi.onTrackEvent('App_ViewAssetDetail', {
      from: '资产列表',
      asset_type: asset_type,
      //company_name:this.props.ownAsset.get('CustomerName'),
      building_name: this.props.ownAsset.get('Name'),
      building_id: String(this.props.ownAsset.get('Id') || ''),
      customer_id: String(this.props.ownAsset.get('CustomerId') || ''),
      customer_name: this.props.ownAsset.get('CustomerName'),
      // switching_room_name:path[0],
      // distribution_box_name:path[1],
      // equipment_name:path[2]
    });

    this.props.navigation.push('PageWarpper', {
      id: 'asset_detail',
      component: container,
      passProps: {
        ownData: rowData,
        CustomerId: this.props.ownAsset.get('CustomerId'),
        CustomerName: this.props.ownAsset.get('CustomerName'),
        BuildingName: this.props.ownAsset.get('Name'),
        BuildingId: this.props.ownAsset.get('Id'),
        ...findRoomInfo
      }
    });
  }

  _onRefresh() {
    this._loadHierarchyByBuildingId(this.props.ownAsset);
  }

  _onBackClick() {
    // this.props.exitHierarchyView();
    this.props.navigation.pop();
  }

  _onScanClick() {
    trackApi.onTrackEvent('App_Scan', {
      from: '楼宇页'
    });
    this.props.navigation.push('PageWarpper', {
      id: 'scan_from_hierarchy',
      component: Scan,
      passProps: {

      }
    });
  }
  _onBindClick() {
    this.props.navigation.push('PageWarpper', {
      id: 'assets_bind_hierarchy',
      component: AssetBindHierarchy,
      passProps: {
        ownAsset: this.props.ownAsset
      }
    });
  }

  _changeAssetExpand(index, type) {
    let fromScan = false;
    if (this.props.isFromScan) {
      fromScan = true;
    }
    this.props.changeAssetExpand({
      index, type, fromScan
    })
  }

  _addAsset(data) {
    this.props.addAsset(data);
  }

  _addRoom(roomName) {
    this.props.addLogbookRoom({
      CustomerId: this.props.ownAsset.get('CustomerId'),
      ParentId: this.props.ownAsset.get('Id'),
      Name: roomName
    })
  }

  _addPanel(body, parentId, panelType) {
    this.props.addLogbookPanel({
      CustomerId: this.props.ownAsset.get('CustomerId'),
      ParentId: parentId,
      // Name:panelName,
      ...body
      // PanelType:panelType
    })
  }

  _addCircle(circleName, parentId) {
    this.props.addLogbookCircle({
      CustomerId: this.props.ownAsset.get('CustomerId'),
      ParentId: parentId,
      Name: circleName,
    })
  }

  _addFloor(floorName) {
    this.props.addFloor({
      CustomerId: this.props.ownAsset.get('CustomerId'),
      ParentId: this.props.ownAsset.get('Id'),
      Name: floorName,
      Type: 3
    })
  }

  _checkExistName(text, type, pid) {
    let rows = this.props.listHierarchys ? this.props.listHierarchys.toArray() : [];
    if (rows.length == 0) return false;
    let ret = null;
    switch (type) {
      case 'Floor':
      case 'Room':
        ret = rows.find(item => item.Name === text && item.Type === 3);
        if (ret) return '配电室或楼层名称重复';
        break;
      case 'Panel':
      case 'SwitchBox':
        let index = rows.findIndex(item => item.Id === pid && item.Type === 3);
        if (index >= 0) {
          for (let i = index + 1; i < rows.length; i++) {
            if (rows[i].Type === 3) {
              break;
            }
            if (rows[i].Name === text && rows[i].Type === 4) {
              ret = rows[i];
              return '配电柜名称重复';
            }
          }
        }
        break;
    }
    return ret ? true : false;
  }

  _createSwitchBox(type, pid) {
    this.props.navigation.push('PageWarpper', {
      id: 'switch_box_edit',
      component: SwitchBoxEdit,
      passProps: {
        isCreate: true,
        customerId: this.props.ownAsset.get('CustomerId'),
        customerName: this.props.ownAsset.get('CustomerName'),
        checkName: name => this._checkExistName(name, type, pid),
        submit: (data) => {
          data.ParentId = pid;
          data.CustomerId = this.props.ownAsset.get('CustomerId')
          this.props.addLogbookSwitchBox(data);
        }
      }
    });
  }
  _createLogbookAsset(type, pid) {
    let title = type == 'Room' ? '新建配电室' : '新建配电柜';
    if (type === 'Circle') title = '新建回路';
    if (type === 'Floor') title = '新建楼层';
    if (type === 'Device') title = '新建设备';
    if (type === 'SwitchBox') {
      this._createSwitchBox(type, pid);
      return;
    }
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: type,
        customerId: this.props.ownAsset.get('CustomerId'),
        customerName: this.props.ownAsset.get('CustomerName'),
        arrPhotos: this.props.arrPhotos,
        onBack: () => this._onBackClick(),
        title: title,
        hint: '请输入',
        checkName: name => this._checkExistName(name, type, pid),
        submit: (text, panelType) => {
          if (type == 'Room') {
            this._addRoom(text);
          }
          if (type === 'Floor') {
            this._addFloor(text);
          }
          if (type == 'Panel') {
            this._addPanel(text, pid, panelType);
          }
          if (type == 'Circle') {
            // this._addPanel(text,pid,panelType);
            console.warn('创建回路', pid, text);
            this._addCircle(text, pid);
          }
          if (type === 'Device') {
            console.warn('创建设备111', text);
            let body = {
              ...text,
              CustomerId: this.props.ownAsset.get('CustomerId'),
              ParentId: pid,
            }
            this.props.manualAddDevice(body);
          }
        }
      }
    });
  }

  _addDevice(rowData) {
    // console.warn('addDevice',rowData.get('Name'));
    trackApi.onTrackEvent('App_Scan', {
      from: '添加Logbook设备'
    });
    this.props.navigation.push('PageWarpper', {
      id: 'scan_from_logbook_device',
      component: Scan,
      // sceneConfig:'FloatFromBottomAndroid',
      passProps: {
        isFromPanelAdd: true,
        scanTitle: rowData.Name,
        panelIdLogbook: rowData.Id,
        customerId: this.props.ownAsset.get('CustomerId'),
        customerName: this.props.ownAsset.get('CustomerName'),
      }
    });
  }

  _onChangeImage() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        dataChanged: (chosenImages) => this.props.changeImage('building', chosenImages)
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

  _refreshBuildingData() {
    InteractionManager.runAfterInteractions(() => {
      this.props.loadBuilding(this.props.ownAsset.get('Id'));
      if (!this.props.buildingData.get('industry'))
        this.props.loadIndustry();
      // if(!this.props.isFromScan)//如果是通过二维码扫描来的，不请求建筑负责人
      //   this.props.loadContacts(this.props.ownAsset.get('Id'));
    });
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._loadHierarchyByBuildingId(this.props.ownAsset);
      this.props.loadBuilding(this.props.ownAsset.get('Id'));
      if (!this.props.buildingData.get('industry'))
        this.props.loadIndustry();
      // if(!this.props.isFromScan)//如果是通过二维码扫描来的，不请求建筑负责人
      //   this.props.loadContacts(this.props.ownAsset.get('Id'));
    });
    backHelper.init(this.props.navigator, this.props.route.id);
    this._traceAppViewAssetDetailTab('全部设备');
  }

  _traceAppViewAssetDetailTab(tagName) {
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '建筑',
      building_name: this.props.ownAsset.get('Name'),
      // company_name:this.props.ownAsset.get('CustomerName'),
      building_id: String(this.props.ownAsset.get('Id') || ''),
      customer_id: String(this.props.ownAsset.get('CustomerId') || ''),
      customer_name: this.props.ownAsset.get('CustomerName'),
      asset_tab_name: tagName
    })
  }

  componentWillReceiveProps(nextProps) {
    // console.warn('componentWillReceiveProps',this.props.isFetching,nextProps.listHierarchys);
    var data = nextProps.listHierarchys;
    if (data) {
      // console.log('data',data.toJS());
      InteractionManager.runAfterInteractions(() => {
        this.setState({ dataSource: this.ds.cloneWithRows(data.toArray()) });
      });
    }
  }

  componentWillUnmount() {
    this.props.clearHierarchyCache(this.props.isFromScan);
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _getTabArray() {
    let tabs = ['全部设备'];
    let hasRiskAuth = privilegeHelper.hasAuth('ViewRiskFactor') || privilegeHelper.hasAuth('FullRiskFactor');
    if (this.props.ownAsset && (this.props.ownAsset.get('RiskFactor') !== null) && (hasRiskAuth)) {
      tabs.push('健康状况');
    }
    tabs.push('建筑信息');
    return tabs;
  }

  _indexChanged(index) {

    this._traceAppViewAssetDetailTab(this._getTabArray()[index]);
    if (this._getTabArray().length === 3 && index === 1) {
      trackApi.onTrackEvent('App_ViewHealthStatus', {
        building_id: String(this.props.ownAsset.get('Id') || ''),
        building_name: this.props.ownAsset.get('Name'),
        customer_id: String(this.props.ownAsset.get('CustomerId') || ''),
        customer_name: this.props.ownAsset.get('CustomerName'),
      });
      var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
      sceneConfig.gestures = {};
      this.props.navigation.push('PageWarpper', {
        id: 'building_hearthy',
        component: BuildingHealthy,
        sceneConfig: sceneConfig,
        passProps: {
          hierarchyId: this.props.ownAsset.get('Id'),
          building_id: String(this.props.ownAsset.get('Id') || ''),
          building_name: this.props.ownAsset.get('Name'),
          customer_id: String(this.props.ownAsset.get('CustomerId') || ''),
          customer_name: this.props.ownAsset.get('CustomerName'),
        }
      });
    } else {
      this.setState({ currentIndex: index });
    }
  }

  render() {
    return (
      <AssetHierarchyView
        tabs={this._getTabArray()}
        contact={this.props.contact}
        logbookPermission={this.props.hasLogbookPermission}
        addRoomPosting={this.props.isAddRoomPosting}
        addPanelPosting={this.props.isAddPanelPosting}
        panelCount={this.props.panelCount}
        deviceCount={this.props.deviceCount}
        isAddDevicePosting={this.props.isAddDevicePosting}
        addCirclePosting={this.props.isAddCirclePosting}
        addFloorPosting={this.props.isAddFloorPosting}
        isAddSwitchBoxPosting={this.props.isAddSwitchBoxPosting}
        circleCount={this.props.circleCount}
        createLogbookAsset={(type, pid) => this._createLogbookAsset(type, pid)}
        addRoom={(name) => this._addRoom(name)}
        addPanel={(name, parentId) => this._addPanel(name, parentId)}
        addDevice={(rowData) => this._addDevice(rowData)}
        data={this.props.filterData}
        buildData={this.props.ownAsset}
        onBack={() => this._onBackClick()}
        currentRouteId={this.props.route.id}
        isFromScan={this.props.isFromScan}
        onScanClick={() => this._onScanClick()}
        hasBindAuth={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        onBindClick={() => this._onBindClick()}
        isFetching={this.props.isFetching}
        listData={this.state.dataSource}
        currentPanel={this.props.currentPanel}
        hasFilter={this.props.hasFilter}
        nextPage={() => this.props.nextPage()}
        currentPage={1}
        contacts={null}
        onRefresh={() => this._onRefresh()}
        totalPage={1}
        refreshBuilding={() => this._refreshBuildingData()}
        changeImage={() => this._onChangeImage()}
        changeImageComplete={(data) => this._onChangeImageComplete(data)}
        changeAssetExpand={(index, type) => this._changeAssetExpand(index, type)}
        doFilter={(text, fromScan) => this.props.changeHierarchySearch(text, fromScan)}
        addAsset={(data) => this._addAsset(data)}
        indexChanged={(index) => {
          this._indexChanged(index);
        }
        }
        navigator={this.props.navigator}
        currentIndex={this.state.currentIndex}
        buildingData={this.props.buildingData}
        ownData={this.props.ownAsset}
        onRowClick={(rowData, rowId) => this._gotoDetail(rowData, rowId)} />
    );
  }
}

AssetHierarchy.propTypes = {
  navigator: PropTypes.object,
  ownAsset: PropTypes.object,//is Building or Panel
  route: PropTypes.object,
  hasFilter: PropTypes.bool,
  currentPanel: PropTypes.number,
  isFromScan: PropTypes.bool,
  clearHierarchyCache: PropTypes.func,
  loadHierarchyByBuildingId: PropTypes.func,
  nextPage: PropTypes.func,
  isFetching: PropTypes.bool.isRequired,
  listHierarchys: PropTypes.object,
  buildId: PropTypes.number,
}

function mapStateToProps(state, ownProps) {
  var buildHierarData = state.asset.buildHierarchyData;
  var listHierarchys = buildHierarData.get('data');
  var bId = buildHierarData.get('buildId');
  if (ownProps.isFromScan) {
    listHierarchys = buildHierarData.get('scanData');
    // console.warn('scan data count',listHierarchys);
    bId = buildHierarData.get('scanHierarchyId');
  }
  if (ownProps.ownAsset.get('Id') !== bId) {
    listHierarchys = null;
  }

  // let codes=state.user.getIn(['user','PrivilegeCodes']);
  //2176 logbook完整权限
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');//codes.includes('2176');
  // console.warn('mapStateToProps',buildHierarData.get('isFetching'),ownProps.ownAsset.get('Id'),bId,listHierarchys);
  let filterData = [];
  if (listHierarchys) {
    let start = new Date().getTime();
    listHierarchys.forEach(item => {
      if (!item.searchHide && (item.showType === 3 || !item.isFolder)) {
        filterData.push(item);
      }
    });
    // console.warn('filter size',filterData.length,'user time:',new Date().getTime()-start);
  }

  return {
    op: buildHierarData.get('op'),
    hasFilter: false,
    isFetching: buildHierarData.get('isFetching'),
    listHierarchys: listHierarchys,
    filterData: filterData,
    buildId: bId,
    hasLogbookPermission,
    isAddRoomPosting: state.asset.buildHierarchyData.get('isAddRoomPosting'),
    isAddPanelPosting: state.asset.buildHierarchyData.get('isAddPanelPosting'),
    isAddDevicePosting: state.asset.buildHierarchyData.get('isAddDevicePosting'),
    isAddCirclePosting: buildHierarData.get('isAddCirclePosting'),
    isAddFloorPosting: buildHierarData.get('isAddFloorPosting'),
    isAddSwitchBoxPosting: buildHierarData.get('isAddSwitchBoxPosting'),
    panelCount: buildHierarData.get('panelCount'),
    deviceCount: buildHierarData.get('deviceCount'),
    circleCount: buildHierarData.get('circleCount'),
    contact: state.asset.contacts.getIn(['data', bId]),
    buildingData: state.asset.buildingData
  };
}

export default connect(mapStateToProps, {
  loadHierarchyByBuildingId, changeAssetExpand, addFloor,
  changeHierarchySearch, addAsset, addLogbookRoom, addLogbookPanel, clearHierarchyCache, addLogbookSwitchBox,
  loadContacts, loadBuilding, loadIndustry, changeImage, changeImageComplete, addLogbookCircle, manualAddDevice
})(AssetHierarchy);
