import React, { Component } from 'react';
import { InteractionManager } from 'react-native';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import privilegeHelper from "../../utils/privilegeHelper";
import SwitchBoxView from '../../components/assets/SwitchBoxView';
import {
  loadSwitchBoxDetail, getBuildingInfo, updateLogbookSwitchBox,
  delLogbookPanel, changeImage, changeImageComplete
} from '../../actions/assetsAction';
import DetailView from "../../components/assets/DetailView";
import TendingHistory from "./TendingHistory";
import Room from "./Room";
import Floor from "./Floor";
import LocationDetail from "./LocationDetail";
import trackApi from "../../utils/trackApi";
import backHelper from "../../utils/backHelper";
import SwitchBoxEdit from "./SwitchBoxEdit";
import PropTypes from 'prop-types';
import ImagePicker from "../ImagePicker";

class SwitchBox extends Component {

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = { index: 0, dataSource: [null, null], sections: [null, null] };
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    this._onRefresh();
    trackApi.onTrackEvent('App_ViewAssetDetailTab', {
      asset_type: '配电箱',
      switching_room_name: this.state.name,
      asset_tab_name: '配电箱信息',
      building_name: this.props.BuildingName || '',
      building_id: String(this.props.BuildingId || ''),
      customer_id: String(this.props.CustomerId || ''),
      customer_name: this.props.CustomerName || '',
    });
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
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
    if (nextProps.isDelPanelPosting !== this.props.isDelPanelPosting) {
      if (nextProps.isDelPanelPosting !== 1) this.context.hideHud();
      if (nextProps.isDelPanelPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.pop();
        })
      }
    }
    if (nextProps.isUpdateSwitchBoxPosting !== this.props.isUpdateSwitchBoxPosting) {
      if (nextProps.isUpdateSwitchBoxPosting === 0) {
        InteractionManager.runAfterInteractions(() => {
          this._onRefresh();
        })
      }
    }
  }

  _gotoDetail(data) {
    var type = data.get('type');
    if (type === 'tending') {
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
    } else if (data.get('gotoParent')) {
      let cmp = null;
      var subType = this.props.parent.get('parentSubType');
      switch (this.props.parent.get('parentType')) {
        case 3:
          cmp = Room;
          if (subType === 8) {
            cmp = Floor;
          }
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

  _edit() {
    this.props.navigation.push('PageWarpper', {
      id: 'switch_box_edit',
      component: SwitchBoxEdit,
      passProps: {
        boxData: this.props.boxData,
        isCreate: false,
        submit: (data) => {
          data.ParentId = this.props.boxData.get('ParentId');
          data.Id = this.props.boxData.get('Id');
          this.props.updateLogbookSwitchBox(data);
        }
      }
    })
  }

  _locationDetail(rowData) {
    this.props.navigation.push('PageWarpper', {
      id: 'location_detail',
      component: LocationDetail,
      passProps: {
        rowData,
        images: this.props.locationImages
      }
    })
  }

  _getContentView() {
    return (
      <DetailView
        locationDetail={(rowData) => this._locationDetail(rowData)}
        noPermission={false}
        ownData={this.props.ownData}
        name={this.state.name}
        hiddenImage={this.state.index == 1}
        isLogTab={this.state.index == 1}
        logbookPermission={this.props.hasLogbookPermission}
        onBack={() => this._onBackClick()}
        emptyImageText="添加一张资产照片"
        changeImage={() => { this._onChangeImage() }}
        canEdit={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        changeImageComplete={(data) => { this._onChangeImageComplete(data) }}
        isFetching={this.props.isFetching}
        data={this.state.dataSource[this.state.index]}
        sectionData={this.state.sections[this.state.index]}
        onRefresh={() => this._onRefresh()}
        hasToolbar={false}
        onRowClick={(rowData) => this._gotoDetail(rowData)} />
    );
  }

  _onChangeImage() {
    this.props.navigation.push('PageWarpper', {
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 1,
        dataChanged: (chosenImages) => this.props.changeImage('switch_box', chosenImages)
      }
    });
  }

  _onChangeImageComplete(data) {
    try {
      let obj = JSON.parse(data);
      let { Result: { ImageKey } } = obj;
      this.props.changeImageComplete(ImageKey);
    } catch (e) {
    } finally {
    }
  }

  _onRefresh() {
    this.props.loadSwitchBoxDetail(this.props.ownData.get('Id'));
    this.props.getBuildingInfo(this.props.ownData.get('Id'));
  }

  _delete() {
    this.context.showSpinner();
    this.props.delLogbookPanel(this.props.ownData.get('Id'))
  }

  render() {
    return (
      <SwitchBoxView logbookPermission={this.props.logbookPermission}
        currentIndex={this.state.index} contentView={this._getContentView()}
        indexChanged={index => this.setState({ index: index })} edit={this._edit.bind(this)}
        title={this.props.title} delete={this._delete.bind(this)}
        ownData={this.props.ownData} onBack={this.props.navigation.pop}
      />
    )
  }
}

function mapStateToProps(state, ownProps) {
  let data = state.asset.switchBoxData;
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  //非logbook不能删除
  if (!data.get('isLogbook')) {
    hasLogbookPermission = false;
  }
  let boxData = data.get('boxData');
  let title = ownProps.ownData.get('Name');
  if (boxData) {
    title = boxData.get('Name');
  }
  return {
    boxData, title,
    logbookPermission: hasLogbookPermission,
    logPageData: data.get('logPageData'),
    logPageSectionData: data.get('logPageSectionData'),
    data: data.get('data'),
    sectionData: data.get('sectionData'),
    isFetching: data.get('isFetching'),
    parent: data.get('parent'),
    locationImages: data.get('locationImages'),
    isDelPanelPosting: state.asset.buildHierarchyData.get('isDelPanelPosting'),
    isUpdateSwitchBoxPosting: state.asset.buildHierarchyData.get('isUpdateSwitchBoxPosting'),
  }
}

export default connect(mapStateToProps, {
  loadSwitchBoxDetail, getBuildingInfo,
  updateLogbookSwitchBox, delLogbookPanel, changeImage, changeImageComplete
})(SwitchBox);
