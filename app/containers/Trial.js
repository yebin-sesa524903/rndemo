
'use strict';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../utils/backHelper';
import TrialView from '../components/login/TrialView';
import { demoLogin } from '../actions/loginAction.js';
import LoginWithPassword from './LoginWithPassword.js';
import Main from './Main';

class Trial extends Component {
  constructor(props) {
    super(props);
  }
  _gotoLogin() {
    this.props.navigation.push('PageWarpper', {
      id: 'login_password',
      component: LoginWithPassword,
    });
  }
  _gotoMainPage() {
    this.props.navigator.replace({ id: 'main', component: Main });
  }
  _trialLogin() {
    this.props.demoLogin();
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.demoUser) {
      this._gotoMainPage();
    }
  }
  componentWillUnmount() {
  }
  render() {
    return (
      <TrialView
        login={() => this._gotoLogin()}
        trialLogin={() => this._trialLogin()} />
    );
  }
}

Trial.propTypes = {
  navigator: PropTypes.object.isRequired,
  demoLogin: PropTypes.func,
}



function mapStateToProps(state) {
  return {
    demoUser: state.user.get('isDemoUser') && state.user.get('user')
  };
}

export default connect(mapStateToProps, { demoLogin })(Trial);
