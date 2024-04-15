
'use strict';
import React, { Component } from 'react';
import {

  Alert,
  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import { getCustomer } from '../../actions/ticketAction';
import CustomerSelView from '../../components/ticket/CustomerSelView';
import CreateTicket from './CreateTicket';
import trackApi from '../../utils/trackApi.js';
import AssetsSelect from './AssetsSelect';


class CustomerSelect extends Component {
  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    this.state = { dataSource: null };
  }
  _loadCustomers() {
    this.props.getCustomer();
  }
  _onPostingCallback(type, startTime) {
    InteractionManager.runAfterInteractions(() => {
      this.props.onPostingCallback(type, startTime);
      this.props.navigation.popToTop();
    });
  }
  _didRowClick(rowData) {
    this.props.navigation.push('PageWarpper', {
      id: 'ticket_assets',
      component: AssetsSelect,
      passProps: {
        customerId: rowData.get('CustomerId'),
        title: '请选择资产范围',
        btnTitle: '下一步',
        doNext: () => {
          this.props.navigation.push('PageWarpper', {
            id: 'ticket_create',
            component: CreateTicket,
            passProps: {
              customer: rowData,
              alarm: null,
              ticketInfo: null,
              onPostingCallback: (type, startTime) => { this._onPostingCallback(type, startTime) },
            }
          });
        }
      }
    });
  }
  _checkAuth() {
    this.props.checkAuth(2135);
  }
  _showAuth() {
    if (this.props.hasAuth === null) { //do nothing wait api
      return false;
    }
    if (this.props.hasAuth === false) {
      Alert.alert('', '您没有这一项的操作权限，请联系系统管理员');
      return false;
    }
    return true;
  }
  _onRefresh() {
    this._loadCustomers();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    InteractionManager.runAfterInteractions(() => {
      this._loadCustomers();
    });
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {
    var data = nextProps.data;
    var oldData = this.props.data;
    if (data !== oldData && data) {
      var obj = data.map((item) => item.toArray()).toArray();
      InteractionManager.runAfterInteractions(() => {
        this.setState({
          dataSource: this.ds.cloneWithRowsAndSections(obj)
        });
      });
    }
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <CustomerSelView
        isFetching={this.props.isFetching}
        data={this.state.dataSource}
        sectionData={this.props.sectionData}
        onRowClick={(rowData) => this._didRowClick(rowData)}
        onBack={() => this.props.navigation.pop()}
        onRefresh={() => this._onRefresh()}
      />
    );
  }
}

CustomerSelect.propTypes = {
  navigator: PropTypes.object,
  customers: PropTypes.object,
  route: PropTypes.object,
  hasAuth: PropTypes.bool,
  getCustomer: PropTypes.func,
  checkAuth: PropTypes.func,
  isFetching: PropTypes.bool.isRequired,
  data: PropTypes.object,
  sectionData: PropTypes.object,
  onPostingCallback: PropTypes.func,
}

function mapStateToProps(state) {
  var customers = state.ticket.customers;
  var data = customers.get('data'),
    sectionData = customers.get('sectionData'),
    isFetching = customers.get('isFetching');
  return {
    isFetching,
    data,
    sectionData,
  };
}

export default connect(mapStateToProps, { getCustomer })(CustomerSelect);
