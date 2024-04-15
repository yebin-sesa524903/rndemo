'use strict';

import React, { Component } from 'react';
import {
  Linking, View, Text, Platform
} from 'react-native';
import PropTypes from 'prop-types';
// import Video from 'react-native-video';

import { connect } from 'react-redux';

import appInfo from '../../utils/appInfo.js';
import Toolbar from '../../components/Toolbar';
import VideoPlayerView from '../../components/my/VideoPlayer';

class VideoPlayer extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {

  }
  getOssUri() {
    let bucketName = appInfo.get().ossBucket;
    let name = this.props.videoKey;
    let uri = `http://${bucketName}/${name}`;
    if (!appInfo.get().prod) {
      uri = `http://${bucketName}/${name}`;
      //http://se-t-data.energymost.com/image-ticket-log-15232-301479-1523598793528-11?x-oss-process=image/resize,w_2048,h_1536
    }
    return uri;
  }

  render() {
    let uri = this.getOssUri();
    return (
      <VideoPlayerView
        urlVideo={uri}
        onBack={() => {
          this.props.navigation.pop();
        }} />
    )
  }
}

VideoPlayer.propTypes = {
  navigator: PropTypes.object,
  videoKey: PropTypes.string,
}

export default connect(null, {})(VideoPlayer);
