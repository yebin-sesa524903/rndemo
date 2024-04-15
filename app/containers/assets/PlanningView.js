
'use strict';
import React, { Component } from 'react';

import {
  View, Text,

  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import Toolbar from '../../components/Toolbar';

import List from '../../components/List.js';
import TendingRow from '../../components/assets/TendingRow.js';
import {
  loadPlannings, loadPlanningDetail
} from "../../actions/assetsAction";
import { connect } from "react-redux";
import TouchFeedback from '../../components/TouchFeedback';
import PlanDetail from "./PlanDetail";

import trackApi from '../../utils/trackApi';
import backHelper from '../../utils/backHelper';

export class PlanningView extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({ rowHasChanged: ((r1, r2) => r1 != r2) });
    this.state = {
      ds: null
    }
  }

  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._refresh();
    });
  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data ||
      (nextProps.data === this.props.data && (!nextProps.data || nextProps.data.size === 0))) {
      //更新数据
      if (nextProps.data) {
        let rows = nextProps.data.toArray();
        this.setState({ ds: this.ds.cloneWithRows(rows) })
      } else {
        this.setState({ ds: this.ds.cloneWithRows([]) })
      }
    }
  }

  _gotoPlanDetail(pid) {
    this.props.navigation.push('PageWarpper', {
      id: 'plan_detail',
      component: PlanDetail,
      passProps: {
        pid: pid
      }
    })
  }

  _refresh() {
    this.props.loadPlannings({
      "IsFinished": false,
      "CurrentPage": 0,
      "ItemsPerPage": 9999,
      "CustomerId": this.props.CustomerId,
      "HierarchyIds": [
        this.props.assetId
      ]
    })
  }

  _renderRow(rowData, sectionId, rowId) {
    return (
      <TouchFeedback onPress={() => {
        let id = rowData.get('Id');
        this._gotoPlanDetail(id);
      }}>
        <View style={{ padding: 16, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ flexShrink: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 17, color: '#333' }}>{rowData.get('Title')}</Text>
            </View>
            <View style={{
              flexShrink: 0, borderColor: '#d9d9d9', borderWidth: 1, justifyContent: 'center',
              alignItems: 'center', borderRadius: 11, height: 22, paddingHorizontal: 5, marginLeft: 8
            }}>
              <Text style={{ fontSize: 12, color: '#666', }}>{rowData.get('Intervals')}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, color: '#888' }}>{rowData.get('Content')}</Text>
        </View>
      </TouchFeedback>
    );
  }
  _getToolbar() {
    return (
      <Toolbar
        title={'进行中计划'}
        navIcon="back"
        onIconClicked={() => this.props.navigation.pop()}
      />
    );
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {this._getToolbar()}
        <List
          isFetching={this.props.isFetching}
          onRefresh={() => this._refresh()}
          listData={this.state.ds}
          currentPage={null}
          totalPage={null}
          emptyText={'无进行中计划'}
          renderRow={(rowData, sectionId, rowId) => this._renderRow(rowData, sectionId, rowId)}
        />
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isFetching: state.asset.plans.get('isFetching'),
    data: state.asset.plans.get('data'),
  };
}

export default connect(mapStateToProps, { loadPlannings, loadPlanningDetail })(PlanningView);
