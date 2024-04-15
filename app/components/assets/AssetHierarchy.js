
'use strict';
import React, { Component } from 'react';
import {
  View,
  InteractionManager,
  StyleSheet,
  Modal,
  Platform,
  Dimensions,
  FlatList,
  RefreshControl,
  Alert, Linking, ScrollView,
  BackHandler, Keyboard,
} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import Toolbar from '../Toolbar';
import List from '../List.js';
import HierarchyRow from './HierarchyRow';

import TouchFeedback from '../TouchFeedback.js';
import Text from '../Text.js';
import Icon from '../Icon.js';

import { MENU_GRAY, BLACK, LIST_BG, TAB_BORDER, GREEN } from '../../styles/color';

import ModalDropdown from 'react-native-modal-dropdown';
import ScrollableTabBar from './ScrollableTabBar';
import InputDialog from '../InputDialog';
import AlertDialog from '../AlertDialog';
import ActionSheet from '../actionsheet/SchActionSheet';
import Toast from 'react-native-root-toast';
import { isPhoneX } from '../../utils';
import Loading from '../Loading';

import SearchBar from '../SearchBar';


const ANDORID_OFFSET = Platform.OS == 'ios' ? 0 : 24;
const W_1_4 = parseInt(Dimensions.get('window').width / 4);
import Immutable from 'immutable';
import DetailView from "./DetailView";
import privilegeHelper from "../../utils/privilegeHelper";
import SinglePhotos from "../../containers/assets/SinglePhotos";
import SchActionSheet from "../actionsheet/SchActionSheet";
let toBottom = 0;
if (isPhoneX()) toBottom = 34;

export default class AssetHierarchyView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalShow: false,
      modalType: '',
      modalTitle: '',
      inputText: '',
      hintText: '',
      value: '', keyboardHeight: 0
    }
    this._scrollY = 0;
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (r1, r2) => r1 !== r2,
    });
    console.warn('isFromScan:', this.props.isFromScan);
  }

  _clear(disKeyboard) {
    if (disKeyboard) {
      Keyboard.dismiss();
    }
    this.setState({ value: '' }, () => {
      this.props.doFilter('', this.props.isFromScan);
    });
  }

  _searchChanged(text) {
    this.setState({ value: text }, () => {
      this._doFilter(text);
    });
  }

  _doFilter(text) {
    let lastTime = this._lastTime || 0;
    let duration = (new Date().getTime()) - lastTime;
    // console.log('duration',duration);
    if (duration < 500) {
      //记录本次要查询的关键字
      this._lastSearchText = text;
      if (this._filterTimer) clearTimeout(this._filterTimer);
      this._filterTimer = setTimeout(() => {
        this._doFilter(this._lastSearchText);
      }, 510 - duration);
      return;
    }
    this._lastTime = new Date().getTime();
    console.warn('-------filter');
    this.props.doFilter(text.trim(), this.props.isFromScan);
  }

  _registerEvents() {
    this._keyboardDidShowSubscription = Keyboard.addListener('keyboardDidShow', (e) => this._keyboardDidShow(e));
    this._keyboardDidHideSubscription = Keyboard.addListener('keyboardDidHide', (e) => this._keyboardDidHide(e));
  }

  _unRegisterEvents() {
    this._keyboardDidShowSubscription && this._keyboardDidShowSubscription.remove();
    this._keyboardDidHideSubscription && this._keyboardDidHideSubscription.remove();
  }

  _keyboardDidShow(e) {
    let offset = 70;
    if (Platform.OS === 'ios') {
      if (isPhoneX()) offset = 90;
      else offset = 70;
    }
    this.setState({ keyboardHeight: e.endCoordinates.height - offset, showKeyboard: true });
  }

  _keyboardDidHide() {
    this.setState({ keyboardHeight: 0, showKeyboard: false });
  }

  componentDidMount() {
    //注册监听事件
    this._registerEvents();
    //注册监听
    InteractionManager.runAfterInteractions(() => {
      this._back = BackHandler.addEventListener('hardwareBackPress', () => {
        if (this.state.value.length > 0) {
          this._clear();
          return true;
        }
        return false;
      });
    });
  }

  componentWillUnmount() {
    this._unRegisterEvents();
    if (this._filterTimer) clearTimeout(this._filterTimer);
    Keyboard.dismiss();
    // this.props.doFilter('');
    this._back && this._back.remove();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.addRoomPosting !== this.props.addRoomPosting ||
      nextProps.addFloorPosting !== this.props.addFloorPosting) {
      if (nextProps.addRoomPosting === 0 || nextProps.addFloorPosting === 0) {
        if (!this.refs.flatlist) {
          return;
        }
        //说明添加Room成功
        setTimeout(() => {
          this.refs.flatlist.scrollToEnd();
          InteractionManager.runAfterInteractions(() => {
            this.refs.flatlist.scrollToEnd();
            InteractionManager.runAfterInteractions(() => {
              this.refs.flatlist.scrollToEnd();
            })
          }, 500);
        })
      }
    }

    if ((nextProps.addPanelPosting === 0 && nextProps.addPanelPosting !== this.props.addPanelPosting) ||
      (nextProps.isAddSwitchBoxPosting === 0 && nextProps.isAddSwitchBoxPosting !== this.props.isAddSwitchBoxPosting)) {
      //计算滚动的偏移量
      let panelHeight = 56 * nextProps.panelCount;
      if (panelHeight > this._toBottom) {
        setTimeout(() => {
          let toScrollY = this._scrollY + (panelHeight - this._toBottom) + 10 + ANDORID_OFFSET + toBottom;
          this.refs.flatlist.scrollToOffset({ offset: toScrollY, animated: true });
        }, 500);
      }

    }

    if (nextProps.addCirclePosting != this.props.addCirclePosting) {
      if (nextProps.addCirclePosting == 0) {
        //计算滚动的偏移量
        let panelHeight = 56 * nextProps.circleCount;
        if (panelHeight > this._toBottom) {
          setTimeout(() => {
            let toScrollY = this._scrollY + (panelHeight - this._toBottom) + 10 + ANDORID_OFFSET + toBottom;
            this.refs.flatlist.scrollToOffset({ offset: toScrollY, animated: true });
          }, 500);
        }
      }
    }

    if (nextProps.isAddDevicePosting != this.props.isAddDevicePosting) {
      if (nextProps.isAddDevicePosting == 0) {
        //计算滚动的偏移量
        console.warn('deviceCount', nextProps.deviceCount);
        let deviceHeight = 56 * nextProps.deviceCount;
        if (deviceHeight > this._toBottom) {
          setTimeout(() => {
            let toScrollY = this._scrollY + (deviceHeight - this._toBottom) + 10 + ANDORID_OFFSET + toBottom;
            this.refs.flatlist.scrollToOffset({ offset: toScrollY, animated: true });
          }, 500);
        }
      }
    }

  }

  _renderMenuItem(index) {
    if (index === 'menuScan') {
      return (
        <View style={{ flex: 1 }}>
          <TouchFeedback
            onPress={() => {
              this.refs['modalMenu'].hide();
              this.props.onScanClick();
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, height: 42 }}>
              <Icon type='icon_scan' size={15} color={MENU_GRAY} />
              <Text style={{ fontSize: 14, color: MENU_GRAY, marginLeft: 8 }}>{'扫一扫'}</Text>
            </View>
          </TouchFeedback>
        </View>
      );
    } else if (index === 'menuBind') {
      return (
        <View style={{ flex: 1, }}>
          <TouchFeedback
            onPress={() => {
              this.refs['modalMenu'].hide();
              this.props.onBindClick();
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 14, height: 42 }}>
              <Icon type='icon_bind' size={15} color={MENU_GRAY} />
              <Text style={{ fontSize: 14, color: MENU_GRAY, marginLeft: 8 }}>{'绑定二维码'}</Text>
            </View>
          </TouchFeedback>
        </View>
      );
    }
  }
  _renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
    // console.warn(rowID);
    var key = `spr_${rowID}`;
    if (rowID !== '0' || !this.props.hasBindAuth) {
      return (<View style={{ height: 1, marginHorizontal: 14, backgroundColor: 'transparent' }} key={key} />);
    }
    return (<View style={{ height: 1, marginHorizontal: 14, backgroundColor: '#abafae' }} key={key} />);
  }
  _getDropMenu() {
    var arrMenu = ['menuScan'];
    var height = Platform.OS === 'ios' ? 42 : 42;
    if (this.props.hasBindAuth) {
      arrMenu.push('menuBind');
      height = Platform.OS === 'ios' ? 87 : 87;
    }
    let top = 56;
    if (Platform.OS === 'ios') {
      top = 64;
      if (isPhoneX()) top = 84;
    }
    return (
      <ModalDropdown ref='modalMenu'
        textStyle={{ color: 'transparent' }}
        style={{ height: 0, position: 'absolute', right: 12, top, backgroundColor: 'transparent' }}
        options={arrMenu}
        renderSeparator={this._renderSeparator.bind(this)}
        dropdownStyle={{ flex: 1, backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 1, height: 2 }, shadowOpacity: 0.5, height }}
        dropdownListProps={{}}
        renderRow={(index) => this._renderMenuItem(index)}
      />
    );
  }
  _renderRow(rowData, sectionId, rowId) {
    var isCurrent = false;

    let begin = new Date().getTime();
    return (
      <HierarchyRow currentRouteId={this.props.currentRouteId} isCurrent={isCurrent} rowData={rowData}
        addBox={(data, offset) => this._addBox(data, offset)}
        addDevice={(data, offset) => this._addDevice(rowData, offset)}
        rowId={rowId} changeAssetExpand={this.props.changeAssetExpand} logbookPermission={this.props.logbookPermission && !this.props.isFromScan}
        onRowClick={(rowData) => {
          this.props.onRowClick(rowData, rowId);
        }}
      />
    );
  }
  _pagerBarClicked(index) {
    // console.warn('index',index);
    if (this.props.currentIndex !== index) {
      this.props.indexChanged(index);
    }
  }
  _getTabArray() {
    var array = ['全部设备', '健康状况'];
    return array;
  }
  _getTabControl() {
    if (this.props.isFromScan) return null;
    var { width, height } = Dimensions.get('window');
    // var array = this._getTabArray();
    // if (!this.props.buildData.get('RiskFactor')) {
    //   return null;
    // }
    return (
      <ScrollableTabBar
        barStyle={{
          borderBottomWidth: 1,
          borderColor: TAB_BORDER,
        }}
        activeTextColor={GREEN}
        underlineStyle={{
          position: 'absolute',
          height: 3,
          backgroundColor: GREEN,
          bottom: 0,
        }}
        tabStyle={{
          height: 43,
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 10,
          paddingRight: 10,
        }}
        textStyle={{
          fontSize: 15,
        }}
        inactiveTextColor={'#353535'}
        containerWidth={width > height ? height : width}
        tabs={this.props.tabs}
        activeTab={this.props.currentIndex}
        scrollValue={{ '_value': this.props.currentIndex }}
        goToPage={(index) => this._pagerBarClicked(index)} />
    )

  }

  _toast(msg) {
    Toast.show(msg, {
      duration: 1500
    });
  }

  _addRoom() {
    this.props.createLogbookAsset('Room');
  }

  _addFloor() {
    this.props.createLogbookAsset('Floor');
  }

  _addDevice(rowData, toBottom) {
    this._toBottom = toBottom;
    //判断当前点击的时盘柜还是回路，如果是回路，直接创建设备
    if (rowData.Type === 200) {
      this.props.addDevice(rowData)
      return;
    }
    this._showMenu(rowData);
  }
  _addBox(rowData, toBottom) {
    this._toBottom = toBottom;
    let type = 'Panel';
    if (rowData.SubType === 8) type = 'SwitchBox';
    this.props.createLogbookAsset(type, rowData.Id);
  }

  _checkExistName(text, type) {
    let rows = this.props.data;//?this.props.data.toArray():[];
    if (rows.length == 0) return false;
    let ret = null;
    switch (type.type) {
      case 'room':
        ret = rows.find(item => item.Name === text && item.Type === 3);
        break;
      case 'box':
        let index = this.props.data.indexOf(type.data);
        if (index >= 0) {
          for (let i = index + 1; i < rows.length; i++) {
            if (rows[i].Type === rows[index]) {
              break;
            }
            if (rows[i].Name === text && rows[i].Type === 4) {
              ret = rows[i];
            }
          }
        }
        break;
    }
    return ret ? true : false;
  }

  _inputDialogClick(text, type) {
    text = text.trim();
    if (text == '' || text.length < 1) {
      Keyboard.dismiss();
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          this._toast(type.type == 'room' ? '配电室名称不能为空' : '配电柜名称不能为空');
        });
      }, 600);
      return;
    }
    if (this._checkExistName(text, type)) {
      Keyboard.dismiss();
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          this._toast(type.type == 'room' ? '配电室名称重复' : '配电柜名称重复');
        });
      }, 600);
      return;
    }
    this.setState({ modalShow: false });
    let data = {};
    switch (type.type) {
      case 'room':
        // data={
        //   type:'add_room',
        //   asset:{
        //     Name:text,
        //     Type:3,
        //     showType:3
        //   }
        // };
        this.props.addRoom(text);
        break;

      case 'box':
        this.props.addPanel(text, type.data.get('Id'));
        break;
    }

  }

  //呈现空页面,有权限才显示新建按钮
  _renderEmptyPage() {
    let addView = null;
    if (this.props.logbookPermission) {
      let fnaddView = (txt, click) => {
        return (<TouchFeedback onPress={() => {
          click();
        }}>
          <View style={{
            width: 112, height: 35, alignItems: 'center', justifyContent: 'center',
            marginTop: 8, borderColor: '#284e98', borderWidth: 1, borderRadius: 2
          }}>
            <Text style={{ fontSize: 16, color: '#284e98' }}>{txt}</Text>
          </View>
        </TouchFeedback>);
      };
      addView = (
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {fnaddView('新建配电室', this._addRoom.bind(this))}
          <View style={{ width: 16 }} />
          {fnaddView('新建楼层', this._addFloor.bind(this))}
        </View>
      )
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 17, color: '#888' }}>此建筑下没有资产</Text>
          {addView}
        </View>
      </View>
    );
  }

  _getRefreshControl() {
    var refreshControl = null;
    if (this.props.onRefresh) {
      var style;
      if (this.state.showRefreshControlStyle) {
        style = { backgroundColor: 'transparent' }
      }
      else {
        style = null;
      }
      // if(Platform.OS === 'android'){
      //   style = null;
      // }
      refreshControl = (
        <RefreshControl
          style={style}
          refreshing={this.props.isFetching}
          onRefresh={this.props.onRefresh}
          tintColor={GREEN}
          title="加载中，请稍候..."
          colors={[GREEN]}
          progressBackgroundColor={'white'}
        />
      );
      // console.warn('refreshControl');
    }
    return refreshControl;
  }

  _onScroll(e) {
    this._scrollY = e.nativeEvent.contentOffset.y;
  }

  _callPhone(tel) {
    if (Platform.OS === 'ios') {
      Linking.canOpenURL('tel:' + tel).then(supported => {
        if (!supported) {
          console.warn('Can\'t handle url: ' + tel);
        } else {
          return Linking.openURL('tel:' + tel);
        }
      }).catch(err => console.error('An error occurred', err));
    } else {
      Alert.alert('', tel, [
        {
          text: '取消', onPress: () => {
          }
        },
        {
          text: '呼叫', onPress: () => {
            Linking.canOpenURL('tel:' + tel).then(supported => {
              if (!supported) {
                console.warn('Can\'t handle url: ' + tel);
              } else {
                return Linking.openURL('tel:' + tel);
              }
            }).catch(err => console.error('An error occurred', err));
          }
        }
      ])
    }
  }

  _renderContact() {
    if (!this.props.contact || (this.props.contact.get('isFetching'))) {
      return (
        <Loading />
      )
    }

    if (!this.props.contact.get('contacts') || this.props.contact.get('contacts').size < 1
      || this.props.contact.get('error')) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 17, color: '#888' }}>{this.props.contact.get('error') || '暂无维护负责人'}</Text>
        </View>
      )
    }

    let arr = this.props.contact.get('contacts').map(item => {
      let phoneView = null;
      if (item.get('Telephone') && item.get('Telephone').length > 0) {
        phoneView = (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 14 }}>
            <Icon type="icon_phone" color="#888" size={15} />
            <Text onPress={() => {
              this._callPhone(item.get('Telephone'))
            }} style={{ fontSize: 15, color: '#219bfd', marginLeft: 10 }}>{item.get('Telephone')}</Text>
          </View>
        );
      }
      let mailView = null;
      if (item.get('Email') && item.get('Email').length > 0) {
        mailView = (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon type="icon_mail" color="#888" size={15} />
            <Text numberOfLines={1} style={{ flex: 1, fontSize: 15, color: '#888', marginLeft: 10 }}>
              {item.get('Email')}
            </Text>
          </View>
        );
      }
      let divW = 2;
      if (!item.get('Title') || item.get('Title').length === 0) {
        divW = 0;
      }
      return (
        <View style={{ marginTop: 10, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
            <Text numberOfLines={1} style={{ fontSize: 17, color: '#333' }}>{item.get('Name')}</Text>
            <View style={{ backgroundColor: '#e6e6e6', height: 16, width: divW, marginHorizontal: 15 }} />
            <Text numberOfLines={1} style={{ fontSize: 15, color: '#333' }}>{item.get('Title')}</Text>
          </View>
          {phoneView}
          {mailView}
        </View>
      )
    })
    return (
      <ScrollView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        {arr}
      </ScrollView>
    )
  }

  _renderBuildingDetail() {
    let listData = this.props.buildingData.get('listData')
    if (listData) {
      let data = listData.map((item) => item.toArray()).toArray();
      listData = this.ds.cloneWithRowsAndSections(data)
    } else {
      listData = listData = this.ds.cloneWithRowsAndSections([])
    }

    return (
      <DetailView
        ownData={this.props.ownData}
        hiddenImage={false}
        isLogTab={false}
        logbookPermission={false}
        emptyImageText="添加一张资产照片"
        changeImage={() => this.props.changeImage()}
        canEdit={privilegeHelper.hasAuth('AssetEditPrivilegeCode')}
        changeImageComplete={this.props.changeImageComplete}
        isFetching={this.props.buildingData.get('isFetching')}
        data={listData}
        sectionData={this.props.buildingData.get('section')}
        onRefresh={() => { this.props.refreshBuilding(); }}
        callPhone={(tel) => this._callPhone(tel)}
        hasToolbar={false}
        onRowClick={(rowData) => { this._clickRow(rowData) }} />
    );
  }

  _clickRow(rowData) {
    let type = rowData.get('type');
    if (type === 'singleLine') {
      this.props.navigation.push('PageWarpper', {
        id: 'assets_singlePhotos',
        component: SinglePhotos,
        passProps: {
          hierarchyId: this.props.ownData.get('Id'),
          arrPhotos: this.props.buildingData.get('arrPhotos'),
        }
      });
    }
  }

  _renderContentPage() {
    let addRoomView = null;
    if (this.props.listData && this.props.listData.getRowCount() > 0 && this.props.logbookPermission && !this.props.isFromScan) {
      addRoomView = (
        <View style={{
          height: 56, backgroundColor: '#fff', borderColor: '#e6e6e6', marginTop: -1, justifyContent: 'space-between',
          alignItems: 'center', paddingHorizontal: 64, borderTopWidth: 1, borderBottomWidth: 1, flexDirection: 'row'
        }}>
          <TouchFeedback onPress={() => this._addRoom()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon type={'icon_asset_add'} color={'#284e98'} size={17} />
              <Text style={{ marginLeft: 8, fontSize: 17, color: '#284e98' }}>配电室</Text>
            </View>
          </TouchFeedback>

          <TouchFeedback onPress={() => this._addFloor()}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon type={'icon_asset_add'} color={'#284e98'} size={17} />
              <Text style={{ marginLeft: 8, fontSize: 17, color: '#284e98' }}>楼层</Text>
            </View>
          </TouchFeedback>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <SearchBar inputBg={'#fff'}
          style={{ marginTop: -1, backgroundColor: '#f2f2f2', borderColor: '#f2f2f2', borderBottomWidth: 1 }}
          value={this.state.value}
          hint={'请搜索资产'}
          showCancel={this.state.showKeyboard || this.state.value.length > 0}
          onCancel={() => this._clear(true)}
          onClear={() => this._clear(false)}
          onChangeText={this._searchChanged.bind(this)}
        />
        {addRoomView}

        <FlatList style={{ flex: 1, backgroundColor: LIST_BG, marginBottom: toBottom }}
          ref='flatlist'
          scrollEventThrottle={1}
          onScroll={(e) => this._onScroll(e)}
          isFetching={this.props.isFetching}
          keyExtractor={(item, index) => `${item.Id}`}
          renderSeparator={() => null}
          emptyText='此楼宇下没有资产'
          refreshControl={this._getRefreshControl()}
          data={this.props.data ? this.props.data : []}
          renderItem={({ item, index }) => this._renderRow(item, null, item.rowIndex)}
        />
      </View>
    );
  }

  render() {
    // console.log('....render....,fetching',this.props.isFetching,this.props.listData);
    var actions = null;
    if (this.props.isFromScan !== true) {
      actions = [{
        title: '扫一扫',
        icon: require('../../images/scan_more/scan_more.png'),
        show: 'always', showWithText: false
      }];
    }
    let listData = this.props.listData;
    let isEmpty = false;
    if (this.props.isFetching === false) {
      if (listData && listData.getRowCount() > 0) {
        isEmpty = false;
      } else {
        isEmpty = true;
      }
    } else {
      isEmpty = false;
    }
    if (!listData) isEmpty = false;
    // isEmpty=false;
    // console.warn('AssetHierarchyView..render ',this.props.isFetching,this.props.listData);
    return (
      <View style={{
        flex: 1, backgroundColor: 'white',
      }}>
        <Toolbar
          title={this.props.isFromScan ? '扫描结果' : this.props.buildData.get('Name')}
          navIcon="back"
          actions={actions}
          onActionSelected={[() => {
            this.refs['modalMenu'].show();
          }]}
          onIconClicked={() => this.props.onBack()} />
        {this._getTabControl()}
        {this._getDropMenu()}
        {this._renderCurrentView(isEmpty)}
        {/*{isEmpty&&(this.props.currentIndex!==this.props.tabs.length-1)?this._renderEmptyPage():this._renderContentPage()}*/}
        <InputDialog title={this.state.modalTitle} type={this.state.modalType} hint={this.state.hintText}
          onClick={(text, type) => this._inputDialogClick(text, type)} inputText={this.state.inputText}
          onCancel={() => this.setState({ modalShow: false })}
          modalShow={this.state.modalShow} />
        {this._getActionSheet()}
      </View>
    );
  }

  _renderCurrentView(isEmpty) {
    let retView = null;
    if (this.props.isFromScan) {
      return this._renderContentPage();
    }
    retView = this.props.currentIndex === this.props.tabs.length - 1 ?
      this._renderBuildingDetail() :
      (isEmpty ? this._renderEmptyPage() : this._renderContentPage())
    return retView;
  }

  _menuClick(item) {
    this.setState({
      modalVisible: false,
      arrActions: []
    })
    switch (item.type) {
      case 'device':
        //创建设备
        this.props.addDevice(item.rowData);
        break;

      case 'manualAddDevice':
        this.props.createLogbookAsset('Device', item.rowData.Id);
        break;

      case 'circle':
        //创建回路
        this.props.createLogbookAsset('Circle', item.rowData.Id);
        break;
    }
  }

  _showMenu(rowData) {
    this.setState({
      arrActions: [
        { title: '回路', type: 'circle', rowData },
        { title: '手动添加设备', type: 'manualAddDevice', rowData },
        //{title:'扫码添加设备',type:'device',rowData}
      ],
      modalVisible: true
    })
  }

  _getActionSheet() {
    let arrActions = this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return (
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={() => {
            this.setState({ 'modalVisible': false });
          }}
          onSelect={item => this._menuClick(item)}
        >
        </SchActionSheet>
      )
    }
  }
}

AssetHierarchyView.propTypes = {
  navigator: PropTypes.object,
  onScanClick: PropTypes.func.isRequired,
  onBindClick: PropTypes.func.isRequired,
  user: PropTypes.object,
  currentRouteId: PropTypes.string,
  buildData: PropTypes.object,
  onBack: PropTypes.func.isRequired,
  currentPanel: PropTypes.number,
  isFromScan: PropTypes.bool,
  onRowClick: PropTypes.func.isRequired,
  addDevice: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  hasBindAuth: PropTypes.bool.isRequired,
  listData: PropTypes.object,
  onRefresh: PropTypes.func.isRequired,
  indexChanged: PropTypes.func.isRequired,
  currentIndex: PropTypes.number.isRequired,
}
