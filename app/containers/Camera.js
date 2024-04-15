
'use strict';
import React, { Component } from 'react';
import {
  InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import backHelper from '../../utils/backHelper';
import CameraView from '../../components/CameraView';
import trackApi from '../../utils/trackApi.js';

class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = { openCamera: false };
  }
  _mounted(v, cb = () => { }) {
    this.setState({ openCamera: v }, cb);
  }
  _onBackClick() {
    this.props.navigation.pop();
  }
  componentDidMount() {
    trackApi.onPageBegin(this.props.route.id);
    backHelper.init(this.props.navigator, this.props.route.id, () => {
      if (this.state.openCamera) {
        this._mounted(false, () => {
          this.props.navigation.pop();
        });

      }
    });
    InteractionManager.runAfterInteractions(() => {
      this._mounted(true);
      // var navigator = this.props.navigator;
      // if (navigator) {
      //   var callback = (event) => {
      //     // console.warn('event route:',event.data.route.id);
      //     // console.warn('current route:',this.props.route.id);
      //     if(event.data.route && event.data.route.id && event.data.route.id === this.props.route.id){
      //       this._mounted(true);
      //     }
      //   };
      //   // Observe focus change events from the owner.
      //   this._listener= navigator.navigationContext.addListener('willfocus', callback);
      //
      // }
    });

  }
  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
    this._listener && this._listener.remove();


  }

  render() {
    return (
      <CameraView
        openCamera={this.state.openCamera}
        onBack={() => {
          this.setState({ openCamera: false }, () => {
            this.props.navigation.pop()
          })
        }} />
    );
  }
}

Camera.propTypes = {
  navigator: PropTypes.object,
  route: PropTypes.object,
  exitScan: PropTypes.func.isRequired,
  building: PropTypes.object,
  isFetching: PropTypes.bool,
  hasAuth: PropTypes.bool,
  loadPanelHierarchy: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, {})(Camera);
