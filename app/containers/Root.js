'use strict';

import React, { Component } from 'react'
import {
  Animated,
  Easing,
  Dimensions, Appearance
} from 'react-native';
import { Provider } from 'react-redux'
import Entry from './Entry';
import configureStore from '../store/configureStore';
import { StackNavigator, createStackNavigator, createNavigationContainer, StackRouter, createNavigator } from 'react-navigation';
import NetInfo from "@react-native-community/netinfo";
import PageWarpper from './PageWarpper.js';
import { RootSiblingParent } from 'react-native-root-siblings';
import { forHorizontal, forVertical, forFadeScaleFromRightBottom } from './TransitionDirection.js';
import { changeTheme } from "../utils/const/Colors";
import Main from "./Main";
import { Provider as AntProvider } from "@ant-design/react-native";

let isNetConnected = false;

NetInfo.addEventListener(
  (isConnected) => {
    isNetConnected = isConnected.isConnected;
  }
);

global.isConnected = () => {
  return isNetConnected;
};


let TransitionConfiguration = (toTransitionProps, fromTransitionProps) => {
  var isBack = false;
  if (fromTransitionProps && fromTransitionProps.navigation) {
    isBack = fromTransitionProps.navigation.state.index >= toTransitionProps.navigation.state.index;
  }
  const routeName = isBack ? fromTransitionProps.scene.route.routeName : toTransitionProps.scene.route.routeName;
  var curTransProps = isBack ? fromTransitionProps : toTransitionProps;
  var name = '';
  if (curTransProps.scene && curTransProps.scene.route && curTransProps.scene.route.params) {
    name = curTransProps.scene.route.params.direction;
  }
  return {
    transitionSpec: {
      duration: 300,
      timing: Animated.timing,
    },
    screenInterpolator: (sceneProps) => {
      const { position, scene, layout, scenes, screenProps, navigation, progress } = sceneProps;
      const { index, route } = scene;
      // console.warn('screenInterpolator...',scene.route.params.id==='chat_view');
      var funcDirection = forHorizontal;
      if (name === 'forFadeScaleFromRightBottom') {
        funcDirection = forFadeScaleFromRightBottom;
      } else if (name === 'forVertical') {
        funcDirection = forVertical;
      }
      return funcDirection(sceneProps);
    }
  }
};

var RootStack = createStackNavigator(
  {
    Entry: { screen: (props) => <Entry navigation={props.navigation} />, navigationOptions: ({ navigation }) => ({ header: null }) },
    // chat_view: { screen: (props) => <Chat navigation={props.navigation} /> },
    // LoginWithPassword: { screen: (props) => <LoginWithPassword navigation={props.navigation} /> , navigationOptions: ({ navigation }) => ({header: null})},
    // login_mobile: { screen: (props) => <LoginWithMobile navigation={props.navigation} /> },
    Main: { screen: (props) => <Main navigation={props.navigation} />, navigationOptions: ({ navigation }) => ({ header: null }) },
    PageWarpper: { screen: (props) => <PageWarpper navigation={props.navigation} />, navigationOptions: ({ navigation }) => ({ header: null }) },
  },
  {
    initialRouteName: 'Entry',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'transparent',
    },
    transitionConfig: TransitionConfiguration,
    navigationOptions: {
      gesturesEnabled: true,
    },
  },
);

export default class Root extends Component {
  state = {
    didMount: false
  }
  componentDidMount() {
    changeTheme();
    this.setState({
      didMount: true
    })

    this._lastColorTheme = Appearance.getColorScheme()
    if (Platform.OS === 'ios') {
      Appearance.addChangeListener(theme => {
        if (Appearance.getColorScheme() !== this._lastColorTheme) {
          this._lastColorTheme = Appearance.getColorScheme();
          changeTheme();
          this.setState({ didMount: false })
          setTimeout(() => {
            this.setState({ didMount: true })
          }, 100);
        }
      })
    }
  }

  render() {
    if (!this.state.didMount) {
      return null
    }
    return (
      <Provider store={configureStore()}>
        <RootSiblingParent>
          {/*<JobComponent/>*/}
          <AntProvider style={{ flex: 1 }}>
            <RootStack />
          </AntProvider>
        </RootSiblingParent>
      </Provider>
    )
  }
}
