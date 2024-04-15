'use strict';

import React, { Component } from 'react';
import {
  Linking, View, Text, Platform,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
// import Video from 'react-native-video';

import { connect } from 'react-redux';

import appInfo from '../../utils/appInfo.js';
import Toolbar from '../../components/Toolbar';
import LogbookTechView from '../../components/my/LogbookTech';
import { Navigator } from 'react-native-deprecated-custom-components';
import VideoPlayer from './VideoPlayer';
import trackApi from '../../utils/trackApi.js';
import backHelper from '../../utils/backHelper';

class LogbookTech extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id);
  }
  componentWillUnmount() {
    trackApi.onPageEnd(this.props.route.id);
    backHelper.destroy(this.props.route.id);
  }
  _gotoVideoPlayer(strVideo) {
    var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
    sceneConfig.gestures = {};
    // console.warn('aaaaa',this.props.version.get('guideInfos'),);
    this.props.navigation.push('PageWarpper', {
      id: 'videoplayer',
      component: VideoPlayer,
      sceneConfig: sceneConfig,
      passProps: {
        videoKey: strVideo,
      }
    });
  }
  render() {
    return (
      <LogbookTechView
        guideInfos={this.props.guideInfos}
        onPlay={(strVideo) => {
          Alert.alert(
            '',
            '若在非WiFi网络下播放将产生流量费用,确认播放?',
            [
              {
                text: '否', onPress: () => {

                }
              },
              {
                text: '播放', onPress: () => {
                  this._gotoVideoPlayer(strVideo);
                }
              }
            ]
          )
        }}
        onBack={() => {
          this.props.navigation.pop();
        }} />
    )
  }
}

LogbookTech.propTypes = {
  navigator: PropTypes.object,
  guideInfos: PropTypes.object,
}

export default connect(null, {})(LogbookTech);
