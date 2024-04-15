
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../utils/backHelper';
import ImagePickerView from '../components/ImagePicker.js';
import trackApi from '../utils/trackApi.js';
import FeedBack from "./my/FeedBack";
import { Navigator } from "react-native-deprecated-custom-components";
import ImageCategory from '../components/ImageCategory';
import DeviceInfo from 'react-native-device-info';
import { compressImages } from '../utils/imageCompress';

const IS_IOS = Platform.OS == 'ios';

class ImagePicker extends Component {
  constructor(props) {
    super(props);
    let initGroupName = 'All Photos';
    if (IS_IOS && Number.parseFloat(DeviceInfo.getSystemVersion()) >= 13) {
      initGroupName = 'All Photos';
    }
    this.state = {
      displayName: '所有照片',
      groupName: IS_IOS ? initGroupName : undefined
    };
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }
  _onBackClick() {
    this.props.navigation.pop();
  }
  _done(chosenImages) {
    //如果选择了图片压缩，则给出提示，等待压缩完成
    if (this.props.compressImage) {
      // this.context.showSpinner('posting');
      compressImages(chosenImages, res => {
        // this.context.hideHud();
        this.props.dataChanged(res);
        this.props.navigation.pop();
      });
    } else {
      this.props.dataChanged(chosenImages);
      this.props.navigation.pop();
    }
  }
  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
  }
  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
  }

  _titleClick() {
    var sceneConfig = Navigator.SceneConfigs.FloatFromBottom;
    sceneConfig.gestures = {};
    this.props.navigation.push('PageWarpper', {
      id: 'imageCategory', component: ImageCategory,
      sceneConfig: sceneConfig,
      passProps: {
        changeAlbum: (album, name) => this._changeAlbum(album, name),
        onClose: () => this.props.navigation.pop()
      }
    });
  }

  _changeAlbum(displayName, name) {
    this.props.navigation.pop();
    this.setState({
      displayName: displayName,
      groupName: name
    })
  }

  render() {
    return (
      <ImagePickerView
        album={this.state.displayName}
        groupName={this.state.groupName}
        titleClick={() => this._titleClick()}
        max={this.props.max}
        done={(chosenImages) => this._done(chosenImages)}
        onBack={() => this._onBackClick()} />
    );
  }
}

ImagePicker.propTypes = {
  navigator: PropTypes.object,
  dataChanged: PropTypes.func,
  max: PropTypes.number,
  route: PropTypes.object,
  compressImage: PropTypes.bool

}
ImagePicker.defaultProps = {
  max: 100
}

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, {})(ImagePicker);
