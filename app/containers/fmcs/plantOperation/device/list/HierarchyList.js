import React, { Component } from 'react';
import { View, Text, Image, FlatList, Keyboard, TouchableOpacity, ScrollView, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// import SearchBar from "../../../components/SearchBar";
import SearchBar from '../../../../../components/fmcs/gasClass/airBottle/list/SearchBar';
import { loadHierarchyList } from '../../../../alarmManager/actions';
import { getImageUrl, screenHeight, screenWidth } from '../../../../../utils/const/Consts';
import { getImageUrlByKey } from '../../utils/Utils';
import Colors from '../../../../../utils/const/Colors';
import Icon from '../../../../../components/Icon';
import { localStr } from '../../../../../utils/Localizations/localization';
import Scan from '../../../../assets/Scan';
import DeviceDetail from "../detail/DeviceDetail";
import EmptyView from '../../../../../utils/refreshList/EmptyView';
import SndAlert from "../../../../../utils/components/SndAlert";
import AssetDetail from '../detail/AssetDetail';
import History from "../../../../assets/History";

class HierarchyList extends Component {

  constructor(props) {
    super(props);
    this.folderMap = {}
    this.state = { value: '', data: props.hierarchyListData }
  }

  static contextTypes = {
    showSpinner: PropTypes.func,
    hideHud: PropTypes.func
  };

  componentDidMount() {
    // this.props.loadHierarchyList({ "customerId": 1, "treeType": "fmhc", "type": 1 })
  }

  componentWillUnmount() {

  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.hierarchyListData !== this.props.hierarchyListData) {
      ///刷新列表
      this._doFilter(this.__keyword, nextProps.hierarchyListData);
    }
  }

  _clear(disKeyboard) {
    if (disKeyboard) {
      Keyboard.dismiss();
    }
    this.__keyword = '';
    this.setState({ value: '', data: this.props.hierarchyListData }, () => {
    });
  }

  _searchChanged = (text) => {
    this.__keyword = text.trim();
    this.setState({ value: text }, () => {
      this._doFilter(text);
    });
  }

  _doFilter(text, hierarchyList) {
    if (text) {
      text = text.trim();
    }
    if (!text || text.length === 0) {
      this.setState({ data: hierarchyList });
      return;
    }
    let lastTime = this._lastTime || 0;
    let duration = (new Date().getTime()) - lastTime;

    if (duration < 500) {
      //记录本次要查询的关键字
      this._lastSearchText = text;
      if (this._filterTimer) clearTimeout(this._filterTimer);
      this._filterTimer = setTimeout(() => {
        this._doFilter(this._lastSearchText);
      }, 510 - duration);
      return;
    }
    let arr = [];
    this.folderMap = {}
    this.props.hierarchyTreeData.forEach(child => {
      this.flatData(child, arr)
    })
    this.setState({ data: arr })
  }

  //处理点击折叠展开操作
  iconClick = (item) => {
    let flag = !this.folderMap[item.id];
    this.folderMap[item.id] = flag;
    let arr = [];
    let begin = Date.now();
    this.props.hierarchyTreeData.forEach(child => {
      this.flatData(child, arr)
    })

    this.setState({ data: arr })
  }

  flatData(item, arr, parentInclude) {
    if (!this.folderMap[item.id]) {
      if (this.__keyword) {
        if (parentInclude) {
          arr.push(item);
          if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
              this.flatData(child, arr, parentInclude);
            })
          }
          return;
        }
        if (item.__lowcase.includes(this.__keyword.toLowerCase())) {
          //自己符合关键字
          arr.push(item);
          if (item.children && item.children.length > 0) {
            item.children.forEach(child => {
              this.flatData(child, arr, true);
            })
          }
        } else {
          //自己不符合关键字,但是如果子孙有，还是要添加进去的
          if (item.children && item.children.length > 0) {
            let findChildren = []
            item.children.forEach(child => {
              this.flatData(child, findChildren);
            })
            if (findChildren.length > 0) {
              arr.push(item);
              findChildren.forEach(f => arr.push(f))
            }
          }
        }
      } else {
        arr.push(item);
        if (item.children && item.children.length > 0) {
          item.children.forEach(child => {
            this.flatData(child, arr);
          })
        }
      }
    } else {
      arr.push(item);
    }
  }



  toDetail = (item, isFromScan) => {
    //templateId:24 区域
    //templateId:25 城市
    //templateId:26 门店
    // templateId 27 表示是设备，需要跳转到设备详情
    // if (item.templateId === 25){
    //
    // }else if(item.templateId === 26){
    //
    // }else {
    if (item.templateType === '设备' || true) {
      let loc = [];
      let p = item.__parent;
      while (p) {
        loc.push(p.name);
        p = p.__parent;
      }
      let params = {
        id: 'device_detail',
        component: item.templateType === '设备' ? DeviceDetail : AssetDetail,
        passProps: {
          id: item.id,
          assetId: item.templateId,
          logo: item.iconKey,
          code: item.code,
          files: {},
          name: item.name,
          isFromScan: isFromScan,
          displayHierarchy: loc.reverse().join('/'),
          refreshListCallBack: () => {
          }
        },
      }
      this.props.navigation.push('PageWarpper', params);
    }
    // }
  }

  onPressScan = () => {
    this.canScan = true;
    this.props.navigation.push('PageWarpper', {
      id: 'scan_from_device_list',
      component: Scan,
      passProps: {
        scanText: '',
        pushToComponent: DeviceDetail,
        scanResult: (result) => {
          if (this.canScan === false) {
            return;
          }
          try {
            //应该是直接转JSON格式，判断id是否存在
            let device = JSON.parse(result);
            if (device && device.DeviceId) {
              let find = this.props.hierarchyListData.find(item => item.id === device.DeviceId)
              if (find) {
                this.toDetail(find, true);
                this.canScan = true;
                return;
              }
            }
            this.canScan = false;
            InteractionManager.runAfterInteractions(() => {
              SndAlert.alert(
                localStr('lang_asset_identify_fail'),
                localStr('lang_asset_invalid_qrcode'),
                [
                  {
                    text: localStr('lang_asset_alert_know'),
                    onPress: () => {
                      this.canScan = true;
                    }
                  }
                ]
              )
            });
          } catch (e) {
            this.canScan = false;
            InteractionManager.runAfterInteractions(() => {
              SndAlert.alert(
                localStr('lang_asset_identify_fail'),
                localStr('lang_asset_invalid_qrcode'),
                [
                  {
                    text: localStr('lang_asset_alert_know'),
                    onPress: () => {
                      this.canScan = true;
                    }
                  }
                ]
              )
            });
          }
        }
      }
    });
  }

  render() {
    let contentView = (
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={true}>
        <FlatList showsHorizontalScrollIndicator={true}
          contentContainerStyle={{ width: 'auto' }}
          refreshing={this.props.hierarchyListFetching}
          onRefresh={this.props.hierarchyListRefresh}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => `${item.id}`}
          data={this.state.data}
          ListEmptyComponent={
            <View style={{ width: screenWidth(), height: screenHeight() - 64 * 2 - 84, alignItems: 'center', justifyContent: 'center' }}>
              <EmptyView />
            </View>
          }
          estimatedItemSize={48}
          renderItem={({ item, index }) => this.renderRow(item)}
        />

      </ScrollView >
    );

    return (
      <View style={{ flex: 1, backgroundColor: Colors.seBrandNomarl }}>
        <View style={{ flex: 1, overflow: 'hidden', backgroundColor: Colors.seBgContainer, borderTopRightRadius: 8, borderTopLeftRadius: 8 }}>
          <View style={{ flexDirection: 'row' }}>
            <SearchBar
              value={this.state.value}
              onSearchTextChange={this._searchChanged}
              placeholder={localStr('lang_asset_search_asset_tip')}
              onPressClear={() => this._clear(false)}
              onPressScan={this.onPressScan}
              onPressSearch={() => this._searchChanged(this.state.value)}
              isHiddenScan={false} />
          </View>
          <View style={{ flex: 1, paddingHorizontal: 12 }}>
            {contentView}
          </View>
        </View>
      </View>
    )
  }


  renderRow(data) {
    let icon = null;
    if (data.children && data.children.length > 0) {
      icon = (
        <TouchableOpacity style={{ padding: 10, marginLeft: -10, }}
          onPress={() => this.iconClick(data)}>
          <Icon type={this.folderMap[data.id] ? 'icon_arrow_fold' : 'icon_arrow_unfold'} color={Colors.seTextTitle} size={18} />
        </TouchableOpacity>
      )
    } else {
      icon = <View style={{ width: 26 }} />
    }
    return (
      <View key={data.id} style={{ flexDirection: 'row', alignItems: 'center', height: 48, paddingLeft: 27 * (data.level - 1) }}>
        {icon}
        {
          data.isGatewayDevice ? <Icon type={'icon_panel_box'} color={Colors.seTextPrimary} size={20} /> : <Image source={{ uri: getImageUrlByKey(data.iconKey) }} resizeMode={'contain'}
            style={{ width: 20, height: 20 }} />
        }

        <TouchableOpacity onPress={() => this.toDetail(data)}>
          <Text numberOfLines={1} style={{ color: Colors.seTextTitle, fontSize: 18, marginLeft: 6 }}>{data.name}</Text>
        </TouchableOpacity>

      </View>
    )
  }
}


function mapStateToProps(state, ownProps) {
  let user = state.user;
  let hierarchyListData = state.device.deviceList.hierarchyListData || [];
  let hierarchyTreeData = state.device.deviceList.hierarchyTreeData || [];
  let hierarchyListFetching = state.device.deviceList.hierarchyListFetching;
  return {
    hierarchyListData, hierarchyTreeData, hierarchyListFetching
  };
}

export default connect(mapStateToProps, { loadHierarchyList })(HierarchyList);
