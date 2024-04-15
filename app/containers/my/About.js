
'use strict';

import React, { Component } from 'react';
import {
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';

import AboutView from '../../components/my/About.js';
import appInfo from '../../utils/appInfo.js';
import trackApi from '../../utils/trackApi.js';
import storage from "../../utils/storage";

class About extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }
  componentDidMount() {
    backHelper.init(this.props.navigator, 'about');
    trackApi.onPageBegin('about');
    let host = this.props.version.get('upgradeUri')
    console.log('host', host)
    // if(host) {
    //   host = host.trim();
    //   let index = host.lastIndexOf(':')
    //   if(index>0 && index !== 4 && index !== 5) {
    //     host = host.substring(0,index)+':93/download-app';
    //   }else {
    //     host += ':93/download-app';
    //   }
    // }
    this.setState({ host })
  }
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    backHelper.destroy('about');
    trackApi.onPageEnd('about');
  }
  render() {
    return (
      <AboutView user={this.props.user}
        version={this.props.version}
        appInfo={appInfo.get()}
        host={this.state.host}
        updateClick={() => {
          var upUri = 'https://www.fm.energymost.com/zh-cn/login';
          if (this.props.version.get('upgradeUri')) {
            upUri = this.props.version.get('upgradeUri');
          }
          Linking.openURL(upUri);
        }}
        onBack={() => this.props.navigation.pop()} />
    );
  }
}

About.propTypes = {
  navigator: PropTypes.object,
  user: PropTypes.object,
  version: PropTypes.object,
}


function mapStateToProps(state) {
  return {
    user: state.user.get('user'),
    version: state.version,
  };
}

export default connect(mapStateToProps, {})(About);
