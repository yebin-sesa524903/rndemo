
import React, { Component } from "react";
import { View, Text, Platform, TextInput, ScrollView, Alert } from 'react-native';
import { connect } from 'react-redux'
import Toolbar from "../components/Toolbar";
import TouchFeedback from "../components/TouchFeedback";
import PropTypes from "prop-types";
import { getVerificationCode, loginInfoChanged } from '../actions/loginAction';
import { clearValidateHost, setValidateHost } from '../middleware/api'
import Icon from "../components/Icon";
import { isEmptyString } from "../utils/const/Consts";

import Colors from "../utils/const/Colors";
import { localStr } from "../utils/Localizations/localization";

///测试地址
const hostUrl = 'https://starbucks-xt.eh.energymost.com';
///sup环境地址
// const hostUrl = 'https://eh-xsup.eh.energymost.com';

class HostConfig extends Component {
  constructor(props) {
    super(props);
    this.state = { host: props.host, history: [] };
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  }

  componentDidMount() {
    if (isEmptyString(this.props.host)) {
      this.setState({
        host: hostUrl,
      })
    }

    // this.setState({host:'http://starbucks-xt.eh.energymost.com'})
    // this.setState({host:'http://39.98.50.32:31888'})
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextState.configSuccess && !this.state.configSuccess) {
      //验证ok,可以设置了

    }
    if (!nextState.configSuccess) {
      //验证失败，给出提示

    }
  }

  _doSave() {
    if (this._enable()) {
      let host = this.state.host.trim();
      setValidateHost(host)
      this.context.showSpinner();
      host += '/lego-bff/healthz';
      fetch(host, { method: 'POST', headers: {}, body: {} })
        .then(res => {
          this.context.hideHud();
          if (res && res.status === 200) {
            console.warn('fetch sucess...', res);

            this.props.loginInfoChanged({ type: 'password', input: 'host', value: this.state.host.trim() });
            this.props.navigation.pop();
            this.props.hostChanged && this.props.hostChanged()

          } else {
            clearValidateHost();
            Alert.alert('', localStr('lang_host_config_network_invalid'));
          }
        })
        .catch(err => {
          this.context.hideHud();
          clearValidateHost();
          Alert.alert('', localStr('lang_host_config_network_invalid'));
          console.warn('fetch err...', err);
        });
    } else {
      this.props.navigation.pop();
    }
  }

  _enable() {
    return this.state.host && this.state.host.trim().length > 0;
  }

  _renderInput() {
    let clearIcon = null;
    if (this._enable()) {
      clearIcon = (
        <TouchFeedback onPress={() => this.setState(({ host: '' }))}>
          <View style={{
            height: 56, justifyContent: 'center', width: 56,
            alignItems: 'center', marginRight: -16
          }}>
            <Icon type="icon_unselect" color={Colors.seTextSecondary} size={15} />
          </View>
        </TouchFeedback>
      );
    }
    return (
      <View style={{
        flexDirection: 'row', height: 56, alignItems: 'center',
        backgroundColor: Colors.seBgLayout, paddingHorizontal: 16
      }}>
        <TextInput style={[{ fontSize: 17, color: Colors.seTextPrimary, flex: 1, marginHorizontal: 6, padding: 0 }]}
          numberOfLines={1} placeholder={localStr('lang_host_input_server_hint')}
          placeholderTextColor={Colors.seTextDisabled}
          autoCapitalize={'none'}
          onChangeText={(host) => this.setState({ host })}
          value={this.state.host}
        />
        {clearIcon}
      </View>
    )
  }

  _showBack() {
    // console.warn('------', this.props.navigation);
    return true;
    //debug
    // return this.props.navigation.getCurrentRoutes().length > 1
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBgContainer }}>
        <Toolbar
          title={localStr('lang_host_server_config')}
          navIcon={this._showBack() ? 'back' : null}
          color={Colors.seBrandNomarl}
          borderColor={Colors.seBorderSplit}
          actions={[{ title: localStr('lang_host_config_done'), disable: !this._enable() }]}

          onActionSelected={[() => this._doSave()]}
          onIconClicked={() => this.props.navigation.pop()} />
        <View style={{ backgroundColor: Colors.seTextDisabled, marginTop: 10, height: 55, justifyContent: 'center' }}>
          {this._renderInput()}
        </View>
        <Text style={{ fontSize: 16, color: Colors.seTextPrimary, margin: 16 }}>{localStr('lang_host_server_example')}</Text>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    posting: state.login.get('verifyCodePosting')
  }
}

export default connect(mapStateToProps, { getVerificationCode, loginInfoChanged })(HostConfig)
