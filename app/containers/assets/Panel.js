
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
  loadPanelDetail, changeImage, changeImageComplete, delLogbookPanel,
  updateLogbookPanel, getPanelSensorTemp, getPanelSensorHistory
} from '../../actions/assetsAction';
import DetailView from '../../components/assets/DetailView';
import PanelEnvEdit from './PanelEnvEdit.js';
import AssetLogs from './AssetLogs.js';
import TendingHistory from './TendingHistory.js';
import SinglePhotos from './SinglePhotos.js';
import ImagePicker from '../ImagePicker.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import trackApi from '../../utils/trackApi.js';
import RoomPanelPager from '../../components/assets/RoomPanelPager';
import AssetNameEdit from "./AssetNameEdit";
import Planning from "./PlanningView";
import Room from './Room';
import permissionCode from "../../utils/permissionCode";
import Toast from "react-native-root-toast";
import Floor from "./Floor";
import { Navigator } from "react-native-deprecated-custom-components";
import History from "./History";
import SingleSelect from "../../components/assets/AssetInfoSingleSelect";

class Panel extends Component {
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
    } else if (type === 'PanelComponentSettings') {
      let list = data.get('data').map(item => `${item.get('Name')}(${item.get('Type')})`).toArray();
      this.props.navigation.push('PageWarpper', {
        id: 'PanelComponentSettings',
        component: SingleSelect,
        passProps: {
          navigator: this.props.navigator,
          route: { ...this.props.route, id: 'PanelComponentSettings' },
          title: '关键配置信息',
          dataList: list,
          onSelect: () => { },
          disableSelect: true,
          onBack: () => this.props.navigation.pop()
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
    this.props.loadPanelDetail(objAsset.get('Id'));
  }
  _onRefresh() {
    this._loadDetailById(this.props.ownData);
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

  getPanelSensorTemp(busTemp) {
    let count = 1;
    let uids = busTemp.map(item => item.get('uid')).toJS();
    let body = {
      "ParamUniqueIds": uids, "Count": count++, "DeviceId": 0
    }
    this.props.getPanelSensorTemp(body);
    this._stopTimer();
    this._timerTask = setInterval(() => {
      body = {
        "ParamUniqueIds": uids, "Count": count++, "DeviceId": 0
      }
      this.props.getPanelSensorTemp(body);
    }, 5000);
  }

  _stopTimer() {
    if (this._timerTask) {
      clearInterval(this._timerTask);
    }
  }

  componentWillReceiveProps(nextProps) {
    // var data = nextProps.data;
    // if(this.props.data !== data && data && data.size >= 1){
    //   var obj = data.map((item)=>item.toArray()).toArray();
    //   InteractionManager.runAfterInteractions(()=>{
    //     this.setState({
    //       dataSource:this.ds.cloneWithRowsAndSections(obj)});
    //   });
    // }
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

    if (nextProps.busTemp !== this.props.busTemp && nextProps.busTemp.size > 0) {
      this.getPanelSensorTemp(nextProps.busTemp);
    }
  }

  _editPanelName() {
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: 'Panel',
        customerId: this.props.CustomerId,
        customerName: this.props.CustomerName,
        hierarchyId: this.props.ownData.get('Id'),
        arrPhotos: this.props.arrPhotos,
        data: this.props.detail,
        onBack: () => this._onBackClick(),
        title: '编辑配电柜',
        panelType: this.props.panelType,
        hint: '请输入',
        name: this.state.name,
        submit: (body, panelType) => this._updateLogbookPanel(this.props.ownData.get('Id'), body, panelType)
      }
    });
  }

  _delLogbookPanel(id) {
    this.context.showSpinner('posting');
    this.props.delLogbookPanel(id);
  }
  _updateLogbookPanel(id, body, type) {
    this.context.showSpinner('posting');
    this.props.updateLogbookPanel(id, body, type);
    this._name = body.Name;
  }

  componentWillUnmount() {
    this._stopTimer();
    this.setState = (state, callback) => {
      return
    }
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _getContentView() {
    return (
      <DetailView
        noPermission={!this.props.showTicket && this.state.index === 1}
        ownData={this.props.ownData}
        name={this.state.name}
        hiddenImage={this.state.index == 1}
        isLogTab={this.state.index == 1}
        delRoom={id => this._delLogbookRoom(id)}
        updateRoom={(id, name) => this._updateLogbookRoom(id, name)}
        logbookPermission={this.props.hasLogbookPermission}
        onBack={() => this._onBackClick()}
        emptyImageText="添加一张资产照片"
        changeImage={() => this._onChangeImage()}
        canEdit={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        changeImageComplete={(data) => this._onChangeImageComplete(data)}
        isFetching={this.props.isFetching}
        data={this.state.dataSource[this.state.index]}
        sectionData={this.state.sections[this.state.index]}
        onRefresh={() => this._onRefresh()}
        hasToolbar={false} clickHistory={() => this._clickHistory()}
        onRowClick={(rowData) => this._gotoDetail(rowData)} />
    );
  }

  _clickHistory() {
    let sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
    sceneConfig.gestures = {};
    let busTemp = this.props.busTemp;
    let parameters = busTemp.map(p => {
      return { Id: p.get('uid'), Unit: p.get('unit') }
    }).toJS();
    this.props.navigation.push('PageWarpper', {
      id: 'history_view',
      component: History,
      sceneConfig,
      passProps: {
        titleSuffix: null,
        parameters,
        unit: '℃',
        name: '母排温度',
        type: 'PANEL_BUS',
        busTemp: busTemp.toJS(),
        hierarchyId: this.props.ownData.get('Id'),
      }
    });
  }

  _indexChanged(index) {
    this.setState({ index: index });
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '配电柜',
      // distribution_box_name:this.state.name,
      asset_tab_name: index === 0 ? '配电柜信息' : '维护日志',
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });
  }

  render() {
    return (
      <RoomPanelPager
        ownData={this.props.ownData}
        name={this.state.name}
        showLogTab={this.props.showLogTab}
        assetType={'Panel'}
        delRoom={id => this._delLogbookRoom(id)}
        doEdit={() => this._editPanelName()}
        doDel={() => this._delLogbookPanel(this.props.ownData.get('Id'))}
        updateRoom={(id, name) => this._editRoomName()}
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

Panel.propTypes = {
  navigator: PropTypes.object,
  ownData: PropTypes.object,
  route: PropTypes.object,
  loadPanelDetail: PropTypes.func,
  changeImage: PropTypes.func,
  changeImageComplete: PropTypes.func,
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.object,
  sectionData: PropTypes.object,
  arrPhotos: PropTypes.object,
  errorMessage: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  var panelDetailData = state.asset.panelDetailData,
    data = panelDetailData.get('data'),
    logPageData = panelDetailData.get('logPageData'),
    logPageSectionData = panelDetailData.get('logPageSectionData'),
    sectionData = panelDetailData.get('sectionData'),
    isFetching = panelDetailData.get('isFetching');
  var errorMessage = panelDetailData.get('errorMessage');
  if (ownProps.ownData.get('Id') !== panelDetailData.get('panelId')) {
    data = null;
  }
  // console.warn('sectionData',sectionData);
  var arrPhotos = panelDetailData.get('arrSinglePhotos');
  let codes = state.user.getIn(['user', 'PrivilegeCodes']);
  //2176 logbook完整权限
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  if (!panelDetailData.get('isLookbook')) {
    hasLogbookPermission = false;
  }
  let showLogTab = privilegeHelper.hasAuth('LogLookPrivilegeCode') || privilegeHelper.hasAuth('LogFullPrivilegeCode');
  let showTicket =
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
  return {
    isFetching,
    data,
    detail: panelDetailData.get('detail'),
    logPageData,
    logPageSectionData,
    sectionData,
    arrPhotos,
    errorMessage,
    panelType: panelDetailData.get('panelType'),
    hasLogbookPermission,
    isPosting: state.asset.buildHierarchyData.get('isDelPanelPosting'),
    isUpdatePosting: state.asset.buildHierarchyData.get('isUpdatePanelPosting'),
    parent: panelDetailData.get('parent'),
    busTemp: panelDetailData.get('busTemp'),
    showLogTab,
    showTicket
  };
}

export default connect(mapStateToProps, {
  loadPanelDetail, changeImage, changeImageComplete,
  delLogbookPanel, updateLogbookPanel, getPanelSensorTemp, getPanelSensorHistory
})(Panel);
