
'use strict';
import React, { Component } from 'react';

import {

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { loadBindHierarchyById, filterBindHierarchy, clearBindHierarchy } from '../../actions/assetsAction';
import BindHierarchyView from '../../components/assets/BindHierarchyView.js';
import Scan from './Scan.js';

import Room from './Room';
import Panel from './Panel';
import Device from './Device';
import trackApi from '../../utils/trackApi.js';
import Toast from "react-native-root-toast";

class AssetBindHierarchy extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = { dataSource: null };
  }

  _loadHierarchyByBuildingId(building, customerId, customerName) {
    var customerId = building.get('CustomerId');
    var customerName = building.get('CustomerName');
    this.props.loadBindHierarchyById(building.get('Id'), this.props.isFromScan, customerId, customerName);
  }

  _gotoDetail(rowData) {
    // console.warn('assets', rowData.get('Type'));
    if (rowData.get('Type') === 200) {
      Toast.show('回路暂不支持绑定二维码', {
        duration: 2000
      });
      return;
    }
    // var subType = rowData.get('SubType');
    // if (subType===8||subType===70) {
    //   Toast.show('此类资产暂不支持绑定二维码',{
    //     duration:2000
    //   });
    //   return;
    // }
    this.props.navigation.push('PageWarpper', {
      id: 'scan_from_hierarchy',
      component: Scan,
      passProps: {
        scanText: '将设备上二维码放入框内,\n自动扫描后即可绑定!',
        scanTitle: rowData.get('Name'),
        hierarchyId: rowData.get('Id'),
        isBindQRCode: true,
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
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._loadHierarchyByBuildingId(this.props.ownAsset);
    });
    backHelper.init(this.props.navigator, this.props.route.id);
  }

  componentWillReceiveProps(nextProps) {
    // console.warn('componentWillReceiveProps',this.props.isFetching,nextProps.listHierarchys);
    var data = nextProps.keyword ? nextProps.filterData : nextProps.listHierarchys;
    if (data) {
      InteractionManager.runAfterInteractions(() => {
        this.setState({ dataSource: this.ds.cloneWithRows(data.toArray()) });
      });
    }
  }

  _doFilter(keyword) {
    this.props.filterBindHierarchy(keyword);
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
    this.props.clearBindHierarchy();
  }

  render() {
    return (
      <BindHierarchyView
        buildData={this.props.ownAsset}
        onBack={() => this._onBackClick()}
        currentRouteId={this.props.route.id}
        isFromScan={this.props.isFromScan}
        onScanClick={() => this._onScanClick()}
        isFetching={this.props.isFetching}
        listData={this.state.dataSource}
        currentPanel={this.props.currentPanel}
        hasFilter={this.props.hasFilter}
        nextPage={() => this.props.nextPage()}
        currentPage={1}
        onRefresh={() => this._onRefresh()}
        totalPage={1}
        doFilter={keyword => this._doFilter(keyword)}
        onRowClick={(rowData) => this._gotoDetail(rowData)} />
    );
  }
}

AssetBindHierarchy.propTypes = {
  navigator: PropTypes.object,
  ownAsset: PropTypes.object,//is Building or Panel
  route: PropTypes.object,
  hasFilter: PropTypes.bool,
  currentPanel: PropTypes.number,
  isFromScan: PropTypes.bool,
  loadBindHierarchyById: PropTypes.func,
  nextPage: PropTypes.func,
  isFetching: PropTypes.bool.isRequired,
  listHierarchys: PropTypes.object,
  buildId: PropTypes.number,
}

function mapStateToProps(state, ownProps) {
  var buildHierarData = state.asset.hierarchyBindData;
  var listHierarchys = buildHierarData.get('data');
  var bId = buildHierarData.get('buildId');
  if (ownProps.isFromScan) {
    listHierarchys = buildHierarData.get('scanData');
    bId = buildHierarData.get('scanHierarchyId');
  }
  if (ownProps.ownAsset.get('Id') !== bId) {
    listHierarchys = null;
  }
  // console.warn('mapStateToProps',buildHierarData.get('isFetching'),ownProps.ownAsset.get('Id'),bId,listHierarchys);
  return {
    hasFilter: false,
    isFetching: buildHierarData.get('isFetching'),
    listHierarchys: listHierarchys,
    buildId: bId,
    keyword: buildHierarData.get('keyword'),
    filterData: buildHierarData.get('filterData')
  };
}

export default connect(mapStateToProps, {
  loadBindHierarchyById, filterBindHierarchy,
  clearBindHierarchy
})(AssetBindHierarchy);
