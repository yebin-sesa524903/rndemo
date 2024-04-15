
'use strict';
import React, { Component } from 'react';

import {
  View,
  Dimensions,
  StyleSheet,
  ImageBackground
  // InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text.js';
import TouchFeedback from '../TouchFeedback';
import Button from '../Button';
import { GREEN } from '../../styles/color.js';
import Icon from '../Icon.js';

export default class TrialView extends Component {
  constructor(props) {
    super(props);

  }
  _getContent() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Icon type='icon_schneider_en' color='transparent' size={125} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>{'EnergyHub'}</Text>
            <Text style={styles.subTitleText}>{'智能配电数字化服务云平台'}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            text={'产品试用'}
            textStyle={styles.trialButtonText}
            style={styles.trialButton}
            onClick={this.props.trialLogin} />
          <View style={styles.loginButton}>
            <TouchFeedback style={{ flex: 1, }} onPress={this.props.login}>
              <View style={{ flex: 1, paddingVertical: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.loginButtonText}>{'已有账号，去登录'}</Text>
                <Icon type='arrow_right' color='white' size={12} />
              </View>
            </TouchFeedback>
          </View>
        </View>
      </View>
    );
  }
  _getBackgroundImage(children) {
    var { width, height } = Dimensions.get('window');

    return (
      <ImageBackground
        sizeMode='contain'
        style={{ flex: 1, width, height }}
        source={require('../../images/trial/trial.png')}>
        {children}
      </ImageBackground>
    )
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {
          this._getBackgroundImage(this._getContent())
        }
      </View>

    );
  }
}

TrialView.propTypes = {
  user: PropTypes.object,
  trialLogin: PropTypes.func,
  login: PropTypes.func,
}

var styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    marginTop: 148,
    paddingHorizontal: 28,
    position: 'relative'
  },
  iconContainer: {
    position: 'absolute',
    left: 22,
    // paddingHorizontal:
  },
  textContainer: {
    position: 'absolute',
    top: 53,
  },
  titleText: {
    color: 'white',
    fontSize: 36,
  },
  subTitleText: {
    marginTop: 12,
    color: 'white',
    fontSize: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 28
  },
  trialButton: {
    backgroundColor: GREEN,
    height: 48,
    borderRadius: 5,
  },
  trialButtonText: {
    color: 'white',
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: 'transparent',
    // marginTop:21,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 15,
    marginRight: 8,
  },

});
