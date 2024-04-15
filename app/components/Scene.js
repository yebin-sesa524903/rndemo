'use strict';
import React, { Component } from 'react';

import {
  StatusBar,
  // View,
} from "react-native";
// import { Navigator } from 'react-native-deprecated-custom-components';
import PropTypes from 'prop-types';
import { STATUSBAR_COLOR } from '../styles/color';
// import Hud from './Hud.js';
import ContextComponent from './ContextComponent.js';
import Colors from "../utils/const/Colors";

export default class Scene extends Component {
  getChildContext() {
    return {
      showSpinner: () => {
        this._hud.showSpinner();
      },
      hideHud: () => {
        this._hud.hide();
      }
    };
  }
  _renderScene() {
    const CusComponent = this.props.initComponent.component;
    var route = this.props.route;
    var barStyle = 'default';
    // if (route.barStyle) {
    //   barStyle = route.barStyle;
    // }
    return (
      <ContextComponent
        navigation={this.props.navigation}
      >
        <StatusBar barStyle={barStyle} translucent={true} backgroundColor={Colors.seBrandNomarl} />
        <CusComponent
          navigation={this.props.navigation}
          route={route}
          {...this.props.initComponent.passProps}
        />
      </ContextComponent>
    );
  }
  getNavigator() {
    // console.warn('getNavigator',this.refs.navigation.resetTo);
    return this.props.navigation;
  }
  render() {
    return this._renderScene();
  }
}

Scene.propTypes = {
  initComponent: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object,
}

Scene.childContextTypes = {
  showSpinner: PropTypes.func,
  hideHud: PropTypes.func
}
