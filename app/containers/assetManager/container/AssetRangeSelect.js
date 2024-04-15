import React, { Component } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
// import SearchBar from "../../../components/SearchBar";
import { localStr } from '../../../utils/Localizations/localization';
import { getImageUrlByKey } from '../../fmcs/plantOperation/utils/Utils';
import Colors from '../../../utils/const/Colors';
import Icon from '../../../components/Icon';
import Toolbar from '../../../components/Toolbar';

export default class AssetRangeSelect extends Component {

  constructor(props) {
    super(props);
    let checkMap = {};
    let selCount = 0;
    console.log('props', props)
    if (props.checkList) {
      props.checkList.forEach(item => {
        checkMap[item] = item;
      });
      selCount = props.checkList.length;
    }
    let data = [];
    let level = 0;
    if (props.site) {
      level = props.site.level || 0;
      this._flatTreeToArray(props.site, data, level + 1, checkMap);
    }
    this.state = { level, data, checkMap, selCount }
  }

  _flatTreeToArray(tree, data, level, checkMap) {
    if (tree) {
      if (checkMap[tree.id]) checkMap[tree.id] = tree
      data.push(tree);
      if (!tree.level) tree.level = level;
      if (tree.children) {
        tree.children.forEach(item => {
          this._flatTreeToArray(item, data, level + 1, checkMap);
        })
      }
    }
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  toDetail = (item) => {
    console.log('toDetail', item, this.state.checkMap)
    if (this.state.checkMap[item.id]) {
      delete this.state.checkMap[item.id];
      this.setState({ checkMap: this.state.checkMap, selCount: this.state.selCount - 1 });
    } else {
      this.state.checkMap[item.id] = item;
      this.setState({ checkMap: this.state.checkMap, selCount: this.state.selCount + 1 });
    }
  }

  _onSubmit = () => {
    let assets = Object.values(this.state.checkMap).filter(item => item)
    this.props.onSubmit && this.props.onSubmit(assets);
    this.props.navigation.pop()
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBrandNomarl }}>
        <Toolbar title={localStr('lang_ticket_select_asset_range')} color={Colors.seBrandNomarl} borderColor={Colors.seBrandNomarl}
          onActionSelected={[this._onSubmit]}
          onIconClicked={() => this.props.navigation.pop()} navIcon={'back'}
          actions={[{ title: localStr('lang_toolbar_submit'), disable: !this.state.selCount, }]} />
        <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: Colors.seBgContainer }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.id}`}
            data={this.state.data}
            renderItem={({ item, index }) => this.renderRow(item)}
          />
        </View>
      </View>
    )
  }

  _renderCheckIcon(data) {
    //<Icon type='icon_check' size={10} color='white' />
    let isCheck = false;
    if (this.state.checkMap && this.state.checkMap[data.id]) isCheck = true;
    return (
      <View style={{
        justifyContent: 'center', alignItems: 'center',
        width: 18, height: 18, borderRadius: 9, backgroundColor: isCheck ? Colors.seBrandNomarl : undefined, borderWidth: 1,
        borderColor: isCheck ? Colors.seBrandNomarl : Colors.seTextPrimary
      }}>
        {isCheck ? <Icon type='icon_check' size={16} color={Colors.seTextInverse} /> : null}
      </View>
    )
  }

  renderRow(data) {
    return (
      <TouchableOpacity key={data.id} style={{
        flexDirection: 'row', alignItems: 'center', height: 48, borderBottomColor: Colors.seBorderSplit,
        borderBottomWidth: 1
      }} onPress={() => this.toDetail(data)}>
        {this._renderCheckIcon(data)}
        {<View style={{ width: 6 + (data.level - this.state.level) * 24 }} />}
        {/* {
          data.isGatewayDevice ? <Icon type={'icon_panel_box'} color={Colors.seTextPrimary} size={20} /> : <Image source={{ uri: getImageUrlByKey(data.iconKey) }} resizeMode={'contain'}
            style={{ width: 20, height: 20 }} />
        } */}
        <Text numberOfLines={1} style={{ color: Colors.seTextTitle, fontSize: 18, marginLeft: 0 }}>{data.name}</Text>

      </TouchableOpacity>
    )
  }
}

