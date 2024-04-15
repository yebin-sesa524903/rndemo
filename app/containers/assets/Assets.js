
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import {
  loadMyAssets, changeMyAssetExpand, createBuilding, deleteBuilding, updateBuilding,
  filterAssetByKeyWord
} from '../../actions/assetsAction';
import AssetsView from '../../components/assets/AssetsView';
import Scan from './Scan';
import AssetHierarchy from './AssetHierarchy';
import BuildingHealthy from './BuildingHealthy.js';
import trackApi from '../../utils/trackApi.js';
import { Navigator } from 'react-native-deprecated-custom-components';
import privilegeHelper from '../../utils/privilegeHelper';
import AssetNameEdit from "./AssetNameEdit";
import Immutable from 'immutable';
import { ticketCreateConditionChange } from "../../actions/ticketAction";

class Assets extends Component {

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  static lastViewCustomerId = null;

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (s1, s2) => s1 !== s2 });
    var data = props.data;
    if (data) {
      // data = data.toArray();
      // for(let i=0;i<data.length;i++){
      //   // data[i]=data[i].toArray();
      //   data[i].set('data',data[i].get('data').toArray());
      // }
      this.state = { dataSource: this.ds.cloneWithRowsAndSections(data), initIndex: 0 }//this.ds.cloneWithRows(data)};
    }
    else {
      this.state = { dataSource: this.ds.cloneWithRowsAndSections([]), initIndex: 0 };
    }
    this._traceDoOperate = false;
  }

  _loadMyAssets(filter) {
    // console.warn('filter',filter.toJSON());
    this.props.loadMyAssets(filter.toJSON());
  }

  _gotoDetail(rowData, type) {
    // console.warn('assets', rowData);
    rowData = Immutable.fromJS(rowData);
    trackApi.onTrackEvent('App_ViewAssetDetail', {
      from: '资产列表',
      asset_type: '建筑',
      customer_id: String(rowData.get('CustomerId') || ''),
      customer_name: rowData.get('CustomerName'),
      building_id: String(rowData.get('Id') || ''),
      building_name: rowData.get('Name'),
      // company_name:rowData.get('CustomerName'),
      //park_name:rowData.getIn(['Location','Province'])||''
    });
    if (Assets.lastViewCustomerId !== rowData.get('CustomerId')) {
      Assets.lastViewCustomerId = rowData.get('CustomerId');
      trackApi.onTrackEvent('App_VisitCustomer', {
        customer_id: String(rowData.get('CustomerId') || ''),
        customer_name: rowData.get('CustomerName'),
      });
    }

    // console.log('_gotoDetail',type);
    if (type === 'hearthy') {
      trackApi.onTrackEvent('App_ViewHealthStatus', {
        customer_id: String(rowData.get('CustomerId') || ''),
        customer_name: rowData.get('CustomerName'),
        building_name: rowData.get('Name'),
        building_id: String(rowData.get('Id') || ''),
      });
      var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
      sceneConfig.gestures = {};
      this.props.navigation.push('PageWarpper', {
        id: 'building_hearthy',
        component: BuildingHealthy,
        sceneConfig: sceneConfig,
        passProps: {
          hierarchyId: rowData.get('Id'),
          customer_id: String(rowData.get('CustomerId') || ''),
          customer_name: rowData.get('CustomerName'),
          building_name: rowData.get('Name'),
          building_id: String(rowData.get('Id') || ''),
        }
      });
    } else {
      this.props.navigation.push('PageWarpper', {
        id: 'AssetHierarchy',
        component: AssetHierarchy,
        passProps: {
          ownAsset: rowData
        }
      });
    }
  }

  _onRefresh() {
    this._loadMyAssets(this.props.filter);
  }
  _onScanClick() {
    // console.warn('didOnScanClick');
    this.props.navigation.push('PageWarpper', {
      id: 'scan_from_building',
      component: Scan,
      sceneConfig: 'FloatFromBottomAndroid',
      passProps: {

      }
    });
  }

  _changeAssetExpand(index, isFolder) {
    if (this.props.changeMyAssetExpand) {
      this.props.changeMyAssetExpand({ index, isFolder });
    }
  }

  componentDidMount() {
    trackApi.onPageBegin('my_asset');
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.asset.get('data')) {
        this._loadMyAssets(this.props.filter);
      }
    });
    // backHelper.init(this.props.navigator,'assets');
    trackApi.onTrackEvent('App_ViewTab', {
      module_name: '资产',
    });

    this.resetOperatorListener = DeviceEventEmitter.addListener('resetAssetsOperator', () => {
      this._resetOperator();
    });
    this.showMenuListener = DeviceEventEmitter.addListener('showActionSheet', (type) => {
      if (type === 'Building') {
        this._traceOperate('点击条目');
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    var data = nextProps.data;
    var oldData = this.props.data;
    var section = nextProps.section;
    var oldSection = this.props.section;
    if (data !== oldData || section !== oldSection) {
      InteractionManager.runAfterInteractions(() => {
        this.setState({ dataSource: this.ds.cloneWithRowsAndSections(data) })//this.ds.cloneWithRowsAndSections(data)});
      });
    }
    if (this.props.filter !== nextProps.filter) {
      //this is a hack for following senario
      //when back from filter page
      //sometimes list is empty
      //but when _loadMyAssets included in runAfterInteractions it is fixed
      InteractionManager.runAfterInteractions(() => {
        this._loadMyAssets(nextProps.filter);
      });
    }
    if (nextProps.delPosting !== this.props.delPosting) {
      if (nextProps.delPosting !== 1) this.context.hideHud();
    }
    if (nextProps.addPosting !== this.props.addPosting) {
      if (nextProps.addPosting === 0) {
        //添加成功了，定位到对应的位置
        this.setState({
          initIndex: nextProps.initIndex
        })

      }
    }
  }

  componentWillUnmount() {
    trackApi.onPageEnd('my_asset');
    // backHelper.destroy('assets');
    this.resetOperatorListener.remove();
    this.showMenuListener.remove();
  }

  //记录操作
  _traceOperate(op = '点击条目') {
    if (!this._traceDoOperate) {
      this._traceDoOperate = true;
      trackApi.onTrackEvent('App_ModuleOperation', {
        operation: op,
        module_name: '资产'
      });
    }
  }

  _resetOperator() {
    this._traceDoOperate = false;
  }


  _checkExistName(name, customerId) {
    let data = this.props.asset.get('data');
    if (data && data.size > 0) {
      let index = -1;
      for (let i = 0; i < data.size; i++) {
        let item = data.get(i);
        if (item.customerId === customerId) {
          index = i;
          break;
        }
      }
      for (let i = index + 1; i < data.size; i++) {
        let item = data.get(i);
        let id = item.Id;
        if (item.CustomerId !== customerId) break;
        if (id && id > 0 && item.Name === name) {
          return '建筑名称重复';
        }
      }
    }
    return false;
  }

  _createBuilding(rowData, index) {
    let title = '新建建筑';
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: 'building',
        customerId: rowData.customerId,
        customerName: rowData.customerName,
        onBack: () => this.props.navigation.pop(),
        title: title,
        hint: '请输入',
        checkName: name => this._checkExistName(name, rowData.customerId),
        submit: (text, holder, address) => {
          let loc = {};
          if (address.loc && address.loc.latitude && address.loc.longitude) {
            // loc={
            //   Latitude:address.loc.latitude,
            //   Longitude:address.loc.longitude
            // }
          }
          this.props.createBuilding({
            CustomerId: rowData.customerId,
            CustomerName: rowData.customerName,
            ParentId: rowData.customerId,
            Name: text,
            Location: address.Province,
            Districts: address.Districts,
            ...loc
          }, index)
        }
      }
    });
  }

  _editBuilding(editItem) {
    let title = '编辑建筑';
    let location = editItem.row.get('Location');
    if (location) location = location.toJS();
    // if(editItem.row.get('Location')){
    //   adderss=editItem.row.get('Location').get('Province');
    // }
    this.props.navigation.push('PageWarpper', {
      id: 'asset_name_edit',
      component: AssetNameEdit,
      passProps: {
        type: 'building',
        customerId: editItem.row.get('CustomerId'),
        customerName: editItem.row.get('CustomerName'),
        onBack: () => this.props.navigation.pop(),
        title: title,
        name: editItem.row.get('Name'),
        location: location,
        hint: '请输入',
        checkName: name => {
          if (name === editItem.row.get('Name')) return false
          return this._checkExistName(name, editItem.row.get('CustomerId'))
        },
        submit: (text, holder, address) => {
          let loc = {};
          if (address.loc && address.loc.latitude && address.loc.longitude) {
            // loc={
            //   Latitude:address.loc.latitude,
            //   Longitude:address.loc.longitude
            // }
          }
          this.props.updateBuilding(editItem.row.get('Id'), text, address, loc, { rowId: editItem.rowId, sid: editItem.sid });
        }
      }
    });
  }

  _delBuilding(editItem) {
    this.context.showSpinner('posting');
    this.props.deleteBuilding(editItem.row.get('Id'),
      { rowId: editItem.rowId, sid: editItem.sid },
      editItem.row.get('Name'));
  }

  render() {
    return (
      <AssetsView
        navigator={this.props.navigator}
        initIndex={this.state.initIndex}
        showSwitch={this.props.showSwitch}
        doDel={(del) => {
          this._traceOperate();
          this._delBuilding(del);
        }}
        doEdit={item => {
          this._traceOperate();
          this._editBuilding(item);
        }}
        canCreateBuilding={this.props.hasLogbookPermission}
        createBuilding={(rowData, index) => {
          this._traceOperate('点击创建');
          this._createBuilding(rowData, index);
        }}
        data={this.props.data}
        onScanClick={() => {
          this._traceOperate();
          this._onScanClick();
        }}
        isFetching={this.props.asset.get('isFetching')}
        listData={this.state.dataSource}
        section={this.props.section}
        hasFilter={this.props.hasFilter}
        nextPage={() => {
          this._traceOperate('加载更多');
          this.props.nextPage();
        }}
        currentPage={this.props.asset.get('CurrentPage')}
        onRefresh={() => {
          this._traceOperate('下拉刷新');
          this._onRefresh();
        }}
        changeAssetExpand={(index, isFolder) => {
          this._traceOperate();
          this._changeAssetExpand(index, isFolder);
        }}
        doFilter={(keyword) => { this.props.filterAssetByKeyWord(keyword) }}
        keyword={this.props.keyword}
        totalPage={this.props.asset.get('pageCount')}
        onRowClick={(rowData, type) => {
          this._traceOperate();
          this._gotoDetail(rowData, type);
        }} />
    );
  }
}

Assets.propTypes = {
  navigator: PropTypes.object,
  asset: PropTypes.object,
  route: PropTypes.object,
  filter: PropTypes.object,
  hasFilter: PropTypes.bool,
  loadMyAssets: PropTypes.func,
  nextPage: PropTypes.func,
}

function mapStateToProps(state) {
  let hasLogbookPermission = privilegeHelper.hasAuth('RegDeviceFullPrivilegeCode');
  let keyword = state.asset.assetData.get('keyword');
  let section = state.asset.assetData.get('data') || [];
  let realData = state.asset.assetData.get('realData') || [];
  if (keyword && keyword.trim().length > 0) {
    section = state.asset.assetData.get('filterSection') || [];
    realData = state.asset.assetData.get('filterRealData') || [];
  }
  // console.warn('section',section.length);
  return {
    hasLogbookPermission,
    hasFilter: false,
    keyword,
    filter: state.asset.assetData.get('filter'),
    asset: state.asset.assetData,
    section: section,//state.asset.assetData.get('data')||[],
    data: realData,//state.asset.assetData.get('realData')||[],
    delPosting: state.asset.assetData.get('isDeleteBuildingPosting'),
    addPosting: state.asset.assetData.get('isAddBuildingPosting'),
    initIndex: state.asset.assetData.get('scrollToIndex')
  };
}

export default connect(mapStateToProps, {
  loadMyAssets, changeMyAssetExpand, createBuilding,
  deleteBuilding, updateBuilding, filterAssetByKeyWord
})(Assets);
