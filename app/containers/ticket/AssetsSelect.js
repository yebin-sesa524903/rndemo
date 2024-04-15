
'use strict';
import React, { Component } from 'react';
import {

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { loadCustomerAssets, resetCustomerAssets, changeBuildingHierarchyExpanded } from '../../actions/assetsAction.js';
import { updateAssetsSelectInfo, getUsersFromAssets } from '../../actions/ticketAction.js';
import AssetsSelectView from '../../components/ticket/AssetsSelectView';
import trackApi from '../../utils/trackApi.js';
import Immutable from 'immutable';

class AssetsSelect extends Component {
  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = { dataSource: null };
  }
  _loadUsers(selectAssets) {
    var Assets = [];
    selectAssets.forEach((item) => {
      Assets.push(item.get('Id'));
    });
    var reqbody = {
      CustomerId: this.props.customerId,
      AssetIds: Assets,
      StartDate: this.props.startTime,
      EndDate: this.props.endTime,
    };

    this.props.getUsersFromAssets(reqbody);
  }
  _loadBuildings() {
    // console.warn('_loadBuildings...');
    this.props.loadCustomerAssets(this.props.customerId);
  }
  _didRowClick(rowData, sectionId, rowId) {
    this.props.updateAssetsSelectInfo({ type: 'assetSelect', value: { rowData, sectionId, rowId } });
  }
  _onSave() {
    // console.warn('showSpinner...');
    // this.context.showSpinner();

    this.props.updateAssetsSelectInfo({ type: 'save', value: Immutable.fromJS(this.props.selectAssets.toJS()) });
    this.props.doNext();
    // this._loadUsers(this.props.selectAssets);
  }
  _didSectionClick(value) {
    this.props.changeBuildingHierarchyExpanded(value.Id, false);
  }
  _onRefresh() {
    this._loadBuildings();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._loadBuildings();
    });
    backHelper.init(this.props.navigation, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
    var data = nextProps.data;
    var oldData = this.props.data;
    var secData = nextProps.sectionData;
    var oldSecData = this.props.sectionData;
    // console.warn('assetSelect componentWillReceiveProps...',this.props.isPosting,nextProps.isPosting);
    // if (nextProps.isPosting!==1 && this.props.isPosting===1) {
    //   // console.warn('hideHud 1');
    //   this.context.hideHud();
    //   if (nextProps.isPosting===2) {
    //     InteractionManager.runAfterInteractions(()=>{
    //       this.props.navigation.pop();
    //     });
    //   }
    //   return ;
    // }
    if ((data !== oldData && data) ||
      (secData !== oldSecData && secData)
    ) {
      if (data) {
        var obj = data.toArray();//data.map((item)=>item.toArray());//.toArray();
        InteractionManager.runAfterInteractions(() => {
          this.setState({
            dataSource: this.ds.cloneWithRowsAndSections(obj)
          });
        });
      }
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    if (!this.props.createEdit)
      this.props.resetCustomerAssets();
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <AssetsSelectView
        title={this.props.title}
        btnTitle={this.props.btnTitle}
        isFetching={this.props.isFetching}
        data={this.state.dataSource}
        sectionData={this.props.sectionData}
        selectAssets={this.props.selectAssets}
        onRowClick={(rowData, sectionId, rowId) => this._didRowClick(rowData, sectionId, rowId)}
        onSectionClick={(secData) => this._didSectionClick(secData)}
        onBack={() => this.props.navigation.pop()}
        onSave={() => this._onSave()}
        onRefresh={() => this._onRefresh()}
      />
    );
  }
}

AssetsSelect.propTypes = {
  navigation: PropTypes.object,
  title: PropTypes.string,
  customerId: PropTypes.number,
  route: PropTypes.object,
  hasAuth: PropTypes.bool,
  loadCustomerAssets: PropTypes.func,
  resetCustomerAssets: PropTypes.func,
  changeBuildingHierarchyExpanded: PropTypes.func,
  updateAssetsSelectInfo: PropTypes.func,
  getUsersFromAssets: PropTypes.func,
  isFetching: PropTypes.bool.isRequired,
  isPosting: PropTypes.number,
  data: PropTypes.object,
  sectionData: PropTypes.object,
  selectAssets: PropTypes.object,
  startTime: PropTypes.string,
  endTime: PropTypes.string,
}

function mapStateToProps(state, ownProps) {
  var assets = state.ticket.assetsSelect;
  var data = assets.get('data'),
    sectionData = assets.get('sectionData'),
    isFetching = assets.get('isFetching'),
    selectAssets = assets.get('selectAssets'),
    isPosting = assets.get('isPosting'),
    customerId = ownProps.customerId;
  return {
    isFetching,
    isPosting,
    data,
    sectionData,
    customerId,
    selectAssets,
  };
}

export default connect(mapStateToProps, { loadCustomerAssets, resetCustomerAssets, changeBuildingHierarchyExpanded, updateAssetsSelectInfo, getUsersFromAssets })(AssetsSelect);
