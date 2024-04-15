
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';

import { loadMonitions, filterDidChanged, firstPage, nextPage, clearFilterResult, monitionChangeTab, restoreBillInit }
  from '../../actions/monitionAction';
import MonitionView from '../../components/monition/MonitionView';
import trackApi from '../../utils/trackApi.js';
import CommandBill from "./CommandBill";
import OperateBill from "./OperateBill";
import JobBill from "./JobBill";
import { BILL_COMMAND_ID, BILL_JOB_ID, BILL_OPERATE_ID } from "./billRoute";

class Monition extends Component {
  constructor(props) {
    super(props);
    this._traceDoOperate = false;
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    let data = props.data;
    if (data) {
      data = data.toArray();
      this.state = { dataSource: this.ds.cloneWithRows(data) };
    } else {
      this.state = { dataSource: this.ds.cloneWithRows([]) };
    }
    // }
  }
  _loadMonitions(tFilter) {
    if (!this._checkSubstation()) return;
    let filter = tFilter.toJSON();
    Object.assign(filter, {
      ticketStatus: this.props.subIndex + 1,
      "pageIndex": filter.CurrentPage,
      "pageSize": filter.ItemsPerPage,
      hierarchyId: this.props.substation.id
    })
    this.props.loadMonitions(filter, this.props.tabIndex);
  }

  _checkSubstation() {
    if (!this.props.substation) {
      DeviceEventEmitter.emit('substation', true)
      return false;
    }
    return this._checkBillPermission();
  }

  _checkBillPermission() {
    switch (this.props.tabIndex) {
      case 0:
        return this.props.billPermission.command.canRead;
      case 1:
        return this.props.billPermission.operate.canRead;
      case 2:
        return this.props.billPermission.job.canRead;
    }
    return false;
  }

  _onIndexChanged(index, isMain) {
    this.props.monitionChangeTab({
      tabIndex: index,
      isMain
    });
  }
  _filterClick() {
  }
  _gotoDetail(alarmId, fromHex) {

  }
  _onRefresh() {
    if (!this._checkSubstation()) return;
    if (this.props.filter.get('CurrentPage') === 1) {
      this._loadMonitions(this.props.filter);
    } else {
      this.props.firstPage();
    }
  }

  _bindEvent() {
    let navigator = this.props.navigator;
    if (navigator) {
      let callback = (event) => {
        if (!event.data.route || !event.data.route.id || (event.data.route.id === 'main')) {
          //this._checkSubstation();
          if (this._refreshOnFocus) {
            this._onRefresh();
            this._refreshOnFocus = false;
          }
          //恢复三票到初始状态
          this.props.restoreBillInit();
        }
      };
      this._listener = navigator.navigationContext.addListener('didfocus', callback);
      this._billChanged = DeviceEventEmitter.addListener('billChanged', () => {
        this._refreshOnFocus = true;
      });
    }
  }
  componentDidMount() {
    trackApi.onPageBegin('monition_list');
    InteractionManager.runAfterInteractions(() => {
      if (!this.props.data) {
        this._loadMonitions(this.props.filter);
      }

    });
    this._bindEvent();
    this.resetOperatorListener = DeviceEventEmitter.addListener('resetAlarmOperator', () => {
      this._resetOperator();
    });
  }
  componentWillReceiveProps(nextProps) {
    let data = nextProps.data;
    let oldData = this.props.data;
    if (data !== oldData) {
      this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
      let tmpDs = data ? this.ds.cloneWithRows(data.toArray()) : this.ds.cloneWithRows([]);
      this.setState({ dataSource: tmpDs });
    } else if (this.state.dataSource == null) {
      this.setState({ dataSource: this.ds.cloneWithRows([]) })
    }

    if (nextProps.substation !== this.props.substation) {
      setTimeout(() => {
        this._loadMonitions(nextProps.filter);
      }, 100)
      return;
    }

    if (this.props.filter !== nextProps.filter) {
      //如果是切换tab,有数据就不做处理,否则需要做处理
      if (this.props.tabIndex === nextProps.tabIndex &&
        this.props.subIndex === nextProps.subIndex) {
        this.setState({}, () => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
              this._loadMonitions(nextProps.filter);
            }, 100);
          });
        });
      } else if (true || !nextProps.data || nextProps.data.size === 0) {//切换刷新
        this.setState({}, () => {
          InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
              this._loadMonitions(nextProps.filter);
            }, 100);
          });
        });
      }
    }
  }



  componentWillUnmount() {
    trackApi.onPageEnd('monition_list');
    this.resetOperatorListener.remove();
    this._billChanged && this._billChanged.remove();
  }

  _addBill(data) {
    if (!this.props.substation) {
      DeviceEventEmitter.emit('substation', true)
      return;
    }
    let cmp = null;
    let id = null;
    switch (this.props.tabIndex) {
      case 0:
        cmp = CommandBill;
        id = BILL_COMMAND_ID;
        break;
      case 1:
        cmp = OperateBill;
        id = BILL_OPERATE_ID;
        break;
      case 2:
        cmp = JobBill;
        id = BILL_JOB_ID;
        data = {
          createSubstationHierarchyId: this.props.substation.id,
          createSubstationHierarchyName: this.props.substation.name,
          customerId: this.props.customerId,
          customerName: this.props.customerName,
        }
        break;
    }
    this.props.navigation.push('PageWarpper', {
      id,
      component: cmp,
      passProps: {
        initData: data
      }
    });
  }

  //记录操作
  _traceOperate(op = '点击条目') {
    if (!this._traceDoOperate) {
      this._traceDoOperate = true;
      trackApi.onTrackEvent('App_ModuleOperation', {
        operation: op,
        module_name: '三票'
      });
    }
  }

  _resetOperator() {
    this._traceDoOperate = false;
  }

  _clickRow = (row) => {
    if (!this._checkSubstation()) return;
    let CMP = null;
    let rid = null
    switch (this.props.tabIndex) {
      case 0:
        CMP = CommandBill
        rid = BILL_COMMAND_ID;
        break;
      case 1:
        CMP = OperateBill
        rid = BILL_OPERATE_ID;
        break;
      case 2:
        CMP = JobBill
        rid = BILL_JOB_ID;
        break;
    }
    if (CMP) {
      this.props.navigation.push('PageWarpper', {
        id: rid,
        component: CMP,
        passProps: {
          billId: row.get('id')
        }
      })
    }

  }

  render() {
    return (
      <MonitionView
        loadMonitions={() => this._loadMonitions()}
        isFetching={this.props.isFetching}
        listData={this.state.dataSource}
        sectionData={this.props.sectionData}
        hasFilter={this.props.hasFilter}
        substation={this.props.substation}
        billPermission={this.props.billPermission}
        nextPage={() => {
          this._traceOperate('加载更多');
          this.props.nextPage();
        }}
        clearFilter={() => {
          this._traceOperate('点击筛选');
          this.props.clearFilterResult();
        }}
        currentPage={this.props.filter.get('CurrentPage')}
        onRefresh={() => {
          this._traceOperate('下拉刷新');
          this._onRefresh();
        }}
        tabIndex={this.props.tabIndex}
        subIndex={this.props.subIndex}
        onIndexChanged={(index, isMain) => {
          this._traceOperate('点击分类');
          this._onIndexChanged(index, isMain);
        }}
        totalPage={this.props.pageCount}
        onFilterClick={() => {
          this._traceOperate('点击筛选');
          this._filterClick();
        }}
        onAddBill={(data) => this._addBill(data)}
        onRowClick={this._clickRow} />
    );
  }
}

function mapStateToProps(state) {
  let monitionList = state.monition.monitionList;
  let tabIndex = monitionList.get('tabIndex');
  let subIndex = monitionList.get('subIndex');
  let filter = monitionList.getIn(['tabs', tabIndex, subIndex, 'filter']);
  let tab = monitionList.getIn(['tabs', tabIndex, subIndex]);
  return {
    tabIndex, subIndex,
    data: tab.get('data'),
    sectionData: tab.get('sectionData'),
    filter: filter,
    substation: state.user.get('substation'),
    pageCount: tab.get('pageCount'),
    isFetching: tab.get('isFetching'),
    customerId: state.user.getIn(['user', 'CustomerId']),//user.get('CustomerId')
    customerName: state.user.getIn(['user', 'CustomerName']),
    billPermission: state.user.get('billPermission')
  };
}

export default connect(mapStateToProps, {
  loadMonitions, monitionChangeTab, filterDidChanged, firstPage,
  nextPage, clearFilterResult, restoreBillInit
})(Monition);
