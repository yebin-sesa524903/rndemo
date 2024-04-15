
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { loadRoomDetail, changeImage, changeImageComplete, delLogbookRoom, updateLogbookRoom } from '../../actions/assetsAction';
import DetailView from '../../components/assets/DetailView';
import RoomEnvEdit from './RoomEnvEdit.js'
import AdminList from './AdminList.js';
import AssetLogs from './AssetLogs.js';
import TendingHistory from './TendingHistory.js';
import SinglePhotos from './SinglePhotos.js';
import ImagePicker from '../ImagePicker.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import trackApi from '../../utils/trackApi.js';
import RoomPanelPager from '../../components/assets/RoomPanelPager';
import AssetNameEdit from "./AssetNameEdit";
import Planning from './PlanningView';
import permissionCode from "../../utils/permissionCode";

class Room extends Component {
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
    this.state = { dataSource: [null, null], sections: [null, null], name: this.props.ownData.get('Name'), index: 0 };
  }

  _loadDetailById(objAsset) {
    // console.warn('building',building.get('Id'));
    this.props.loadRoomDetail(objAsset.get('Id'));
  }
  _gotoDetail(data) {
    var type = data.get('type');
    if (type === 'temperature' ||
      type === 'humidity' ||
      type === 'dust') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_env',
        component: RoomEnvEdit,
        passProps: {
          data,
          asset: this.props.ownData
        }
      });
    }
    else if (type === 'admin') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_admin',
        component: AdminList,
        passProps: {
          adminId: data.get('id')
        }
      });
    }
    else if (type === 'log') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_log',
        component: AssetLogs,
        passProps: {
          hierarchyId: this.props.ownData.get('Id'),
          onRefresh: () => this._onRefresh()
        }
      });
    }
    else if (type === 'tending') {
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
    }
    else if (type === 'singleLine') {
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
    }
  }
  _onRefresh() {
    this._loadDetailById(this.props.ownData);
  }

  _onBackClick() {
    this.props.navigation.pop({ current: this.props.ownData });
  }
  _onChangeImage() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        dataChanged: (chosenImages) => this.props.changeImage('room', chosenImages)
      }
    });
  }

  _delLogbookRoom(id) {
    this.context.showSpinner('posting');
    this.props.delLogbookRoom(id);
  }
  _updateLogbookRoom(id, name) {
    this.context.showSpinner('posting');
    this.props.updateLogbookRoom(id, name);
    this._name = name;
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
      asset_type: '配电室',
      switching_room_name: this.state.name,
      asset_tab_name: '配电室信息',
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

  componentWillReceiveProps(nextProps) {
    // var data = nextProps.data;
    // if(this.props.data !== data && data && data.size >= 1){
    //   var obj = data.map((item)=>item.toArray()).toArray();
    //   // console.warn('rerender');
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

  }

  _editRoomName() {
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: 'Room',
        customerId: this.props.CustomerId,
        customerName: this.props.CustomerName,
        hierarchyId: this.props.ownData.get('Id'),
        arrPhotos: this.props.arrPhotos,
        onBack: () => this._onBackClick(),
        title: '编辑配电室',
        hint: '请输入',
        name: this.state.name,
        submit: (text) => this._updateLogbookRoom(this.props.ownData.get('Id'), text)
      }
    });
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  _getContentView() {
    return (
      <DetailView
        noPermission={!this.props.showTicket && this.state.index == 1}
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
        hasToolbar={false}
        onRowClick={(rowData) => this._gotoDetail(rowData)} />
    );
  }

  _indexChanged(index) {
    this.setState({ index: index });

    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '配电室',
      switching_room_name: this.state.name,
      asset_tab_name: index === 0 ? '配电室信息' : '维护日志',
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
        assetType={'Room'}
        showLogTab={this.props.showLogTab}
        delRoom={id => this._delLogbookRoom(id)}
        doEdit={() => this._editRoomName()}
        doDel={() => this._delLogbookRoom(this.props.ownData.get('Id'))}
        updateRoom={(id, name) => this._editRoomName()}
        logbookPermission={this.props.hasLogbookPermission}
        onBack={() => this._onBackClick()}
        emptyImageText="添加一张资产照片"
        changeImage={() => this._onChangeImage()}
        canEdit={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        changeImageComplete={(data) => this._onChangeImageComplete(data)}
        isFetching={this.props.isFetching}
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

Room.propTypes = {
  navigator: PropTypes.object,
  ownData: PropTypes.object,
  route: PropTypes.object,
  changeImage: PropTypes.func,
  changeImageComplete: PropTypes.func,
  loadRoomDetail: PropTypes.func,
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.object,
  sectionData: PropTypes.object,
  arrPhotos: PropTypes.object,
}

function mapStateToProps(state, ownProps) {
  var roomDetailData = state.asset.roomDetailData,
    data = roomDetailData.get('data'),
    logPageData = roomDetailData.get('logPageData'),
    logPageSectionData = roomDetailData.get('logPageSectionData'),
    sectionData = roomDetailData.get('sectionData'),
    isFetching = roomDetailData.get('isFetching');
  if (ownProps.ownData.get('Id') !== roomDetailData.get('roomId')) {
    data = null;
  }
  var arrPhotos = roomDetailData.get('arrSinglePhotos');
  let codes = state.user.getIn(['user', 'PrivilegeCodes']);
  //2176 logbook完整权限
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  if (!roomDetailData.get('isLookbook')) {
    hasLogbookPermission = false;
  }
  let showLogTab = privilegeHelper.hasAuth('LogLookPrivilegeCode') || privilegeHelper.hasAuth('LogFullPrivilegeCode');
  let showTicket =
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_VIEW_MANAGEMENT) ||
    privilegeHelper.checkModulePermission(permissionCode.POP_TICKET_EDIT_MANAGEMENT);
  return {
    isFetching,
    data,
    sectionData,
    logPageData,
    logPageSectionData,
    arrPhotos,
    hasLogbookPermission,
    isPosting: state.asset.buildHierarchyData.get('isDelRoomPosting'),
    isUpdatePosting: state.asset.buildHierarchyData.get('isUpdateRoomPosting'),
    showLogTab,
    showTicket
    // pendingImageUri:roomDetailData.get('pendingImageUri')
  };
}

export default connect(mapStateToProps, {
  loadRoomDetail, changeImage, changeImageComplete,
  delLogbookRoom, updateLogbookRoom
})(Room);
