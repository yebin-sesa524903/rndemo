
'use strict';
import React, { Component } from 'react';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import trackApi from '../../utils/trackApi.js';
import PropTypes from 'prop-types';
import AdminListView from '../../components/assets/AdminListView';

class AdminList extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }

  render() {
    return (
      <AdminListView
        admin={this.props.admin}
        onBack={() => { this.props.navigation.pop() }} />
    );
  }
}

AdminList.propTypes = {
  navigator: PropTypes.object,
  admin: PropTypes.object,
  route: PropTypes.object,
}

function mapStateToProps(state, ownProps) {
  var admins = state.asset.roomDetailData.get('admin');
  var id = ownProps.adminId;
  var admin = admins.find((item) => {
    return item.get('Id') === id;
  })
  return {
    admin
  };
}

export default connect(mapStateToProps, {})(AdminList);
