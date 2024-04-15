import React, { Component } from 'react';
import { View, Text, Image, FlatList, InteractionManager, BackHandler, Keyboard, DeviceEventEmitter } from 'react-native';
import { connect } from 'react-redux';
import Toolbar from "../components/Toolbar";
import TouchFeedback from "../components/TouchFeedback";
import Main from './Main';
import backHelper from "../utils/backHelper";
import { loadCustomerList, updateUserCustomerId } from '../actions/loginAction';
import PropTypes from 'prop-types';
// import SearchBar from "../components/SearchBar";
import SearchBar from '../components/fmcs/gasClass/airBottle/list/SearchBar';
import storage from "../utils/storage"
import { getImageHost } from "../middleware/api";
import Colors, { isDarkMode } from "../utils/const/Colors";
import { debounce } from "../utils";
import { getImageUrlByKey } from "./fmcs/plantOperation/utils/Utils";
import { clearCacheTicket } from '../utils/sqliteHelper';
import { localStr } from '../utils/Localizations/localization';
class SelectPartner extends Component {


  constructor(props) {
    super(props);
    this.state = {};
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  _searchChanged = (text) => {
    this.setState({ value: text })
    debounce(() => {
      this.props.loadCustomerList(this.state.value || '');
    }, 1000)
  }

  componentWillUnmount() {
    this.props.loadCustomerList();
  }

  render() {
    let contentView = null;
    if (this.props.partners.length > 0) {
      contentView = (
        <FlatList
          keyExtractor={(item, index) => `${index}-${item}`}
          data={this.props.partners}
          renderItem={({ item, index }) => this.renderRow(item)}
        />
      );
    } else {
      contentView = (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.seBgContainer }}>
          <Image
            source={isDarkMode() ? require('../images/empty_box/empty_box_dark.png') : require('../images/empty_box/empty_box.png')}
            style={{ width: 55 }} />
          <Text style={{ fontSize: 16, color: Colors.seTextSecondary, marginTop: 8, textAlign: 'center' }}
            numberOfLines={2}>{localStr('lang_single_select_search_no_result')}</Text>
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBgContainer }}>
        <Toolbar title={localStr('lang_select_partners')} color={Colors.seBrandNomarl} navIcon={this.props.showBack ? "back" : null} onIconClicked={() => this.props.navigation.pop()} />
        <View style={{ flexDirection: 'row', marginTop: -1 }}>
          <SearchBar
            value={this.state.value || ''}
            onSearchTextChange={this._searchChanged}
            placeholder={localStr('lang_single_select_input_keyword')}
            onPressClear={() => this._searchChanged('')}
            onPressScan={this.onPressScan}
            onPressSearch={() => this._searchChanged(this.state.value)}
            isHiddenScan={true} />
        </View>

        {contentView}
      </View>
    )
  }

  switchToMain(data) {
    clearCacheTicket().then()
    ///设置customerId
    this.props.updateUserCustomerId(data.Id);
    storage.setCustomerId(String(data.Id)).catch(err => { });
    storage.setCustomerName(data.Name).catch();
    //有两种切换到Main的方式，一种返回，一种替换
    InteractionManager.runAfterInteractions(() => {
      if (this.props.showBack) {
        this.props.navigation.pop();
      } else {
        DeviceEventEmitter.emit('User_Select_Partner', { passCustomerId: data.Id });
      }
      this.context.hideHud();
    })
  }

  //这里就是一个业务组件
  _configImages(imageId) {

    if (imageId) {
      let url = getImageUrlByKey(imageId)//`/lego-bff/bff/ledger/rest/downloadFile?id=${imageId}`
      return (
        <Image source={{ uri: url, headers: { Cookie: storage.getOssToken() } }} resizeMode={'cover'}
          style={{ width: 60, height: 60 }} />
      )
    }
    return (
      <Image source={isDarkMode() ? require('../images/document_list/placeholder_dark.png') : require('../images/document_list/placeholder.png')} resizeMode={'cover'}
        style={{ width: 60, height: 60 }} />
    )
  }

  renderRow(data) {
    let isSelected = data.Id === this.props.selectedCustomer;
    return (
      <TouchFeedback onPress={() => {
        if (!isSelected) {
          this.context.showSpinner();
          this.switchToMain(data);
        }
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 80, backgroundColor: isSelected ? Colors.seBrandBg : Colors.seBgContainer }}>
          <View style={{
            width: 56, height: 56, borderWidth: 1.0, borderColor: Colors.seBorderColor, alignItems: 'center',
            justifyContent: 'center', borderRadius: 4
          }}>
            {this._configImages(data.LogoUrl)}
          </View>
          <View style={{
            borderBottomColor: Colors.seBorderSplit, borderBottomWidth: 1, alignSelf: 'stretch',
            justifyContent: 'center', flex: 1
          }}>
            <Text numberOfLines={1} style={{ fontSize: 17, color: isSelected ? Colors.seBrandNomarl : Colors.seTextPrimary, marginLeft: 12 }}>{data.Name}</Text>
          </View>
        </View>
      </TouchFeedback>
    )
  }
}

function mapStateToProps(state, ownProps) {
  let user = state.user;
  let partners = user.get('customerList') || [];
  return {
    partners: partners,

  };
}

export default connect(mapStateToProps, { updateUserCustomerId, loadCustomerList })(SelectPartner);
