
'use strict';

import React, { Component } from 'react';
import { Alert, View, Text } from 'react-native';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import Toolbar from "../components/Toolbar";
import Icon from '../components/Icon'
import { GREEN } from '../styles/color';
import TouchFeedback from '../components/TouchFeedback';
import backHelper from "../utils/backHelper";
import trackApi from "../utils/trackApi";
class EmailSuccess extends Component {

  constructor(props) {
    super(props);
  }

  backToLogin() {
    this.props.navigation.popToTop();
  }

  componentDidMount() {
    backHelper.init(this.props.navigator, this.props.route.id);
    trackApi.onPageBegin(this.props.route.id);
  }
  componentWillUnmount() {
    backHelper.destroy(this.props.route.id);
    trackApi.onPageEnd(this.props.route.id);
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Toolbar
          title={'忘记密码'}
          navIcon="back"
          onIconClicked={() => this.props.navigation.pop()} />
        <View style={{ marginTop: 80, flex: 1, alignItems: 'center' }}>
          <Icon type={'icon_success'} color={GREEN} size={50} />
          <Text style={{ fontSize: 17, color: '#888', marginHorizontal: 40, lineHeight: 25, textAlign: 'center', marginTop: 21 }}>
            {`找回密码邮件已发送至您的邮箱 ${this.props.email}，24小时内有效，请及时查收`}
          </Text>
          <View style={{ alignSelf: "stretch", marginTop: 50 }}>
            <TouchFeedback style={{}} onPress={this.backToLogin.bind(this)}>
              <View style={{
                height: 40, borderRadius: 2, backgroundColor: GREEN, justifyContent: 'center',
                alignItems: 'center', marginHorizontal: 16,
              }}>
                <Text style={{ fontSize: 17, color: '#fff', fontWeight: '600' }}>{'返回登录页'}</Text>
              </View>
            </TouchFeedback>
          </View>
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
  };
}

export default connect(mapStateToProps, {})(EmailSuccess);
