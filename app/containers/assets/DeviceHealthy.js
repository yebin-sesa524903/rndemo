
'use strict';
import React, { Component } from 'react';
import {
  Alert,

  InteractionManager,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import DeviceHealthyView from '../../components/assets/DeviceHealthyView.js';
import TicketDetail from '../ticket/TicketDetail.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import trackApi from '../../utils/trackApi.js';

class DeviceHealthy extends Component {
  constructor(props) {
    super(props);
  }
  _loadHealthyData() {

  }
  _gotoDetail(data) {
  }
  componentDidMount() {
    trackApi.onPageBegin('device_healthy');
    backHelper.init(this.props.navigator, this.props.route.id);

    InteractionManager.runAfterInteractions(() => {
      backHelper.init(this.props.navigator, this.props.route.id, () => {
        this.props.navigation.pop();
      });
    });
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    trackApi.onPageEnd('device_healthy');
    backHelper.destroy(this.props.route.id);
  }
  render() {
    return (
      <DeviceHealthyView
        title={'设备列表'}
        devicesDatas={this.props.devicesDatas}
        isFetching={this.props.isFetching}
        onRefresh={() => this._loadHealthyData()}
        onRowClick={(rowData) => this._gotoDetail(rowData)}
        onBack={() => {
          this.props.navigation.pop();
        }}
      />
    );
  }
}

DeviceHealthy.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  hierarchyId: PropTypes.number,
  devicesDatas: PropTypes.object,//immutable
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user.get('user'),
  };
}

export default connect(mapStateToProps, {})(DeviceHealthy);
