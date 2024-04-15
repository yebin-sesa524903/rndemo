import React from "react";
import { connect } from "react-redux";
import {
  Alert,
  Image,
  InteractionManager,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import { RefreshList } from "../../../../../utils/refreshList/RefreshList";
import { loadDeviceList, saveDeviceListInput, clearDeviceListInput, saveDeviceListSearch, loadDeviceStatus }
  from '../../../../../actions/device/deviceAction'
import Scan from "../../../../assets/Scan";
import { DeviceListItem } from "../../../../../components/fmcs/plantOperation/device/list/DeviceListItem";
import { isEmptyString, checkQrCodeIsRight, screenWidth } from "../../../../../utils/const/Consts";
import DeviceDetail from "../detail/DeviceDetail";
import { localStr } from "../../../../../utils/Localizations/localization";
// import { Filter } from "./Filter";

/**
 * 保养执行 列表
 * @param props
 * @constructor
 */
function DeviceList(props: any) {

  const searchBarRef=React.useRef<TextInput>(null);
  // const [filterVisible, setFilterVisible]=React.useState(false);

  /**
   * 监听列表请求入参变化 获取列表数据
   */
  React.useEffect(() => {
    if (props.input) {
      props.loadDeviceList(props.input);
    }
  }, [props.input]);

  React.useEffect(() => {
    let customerId=props.currentUser.CustomerId
    if (!isEmptyString(customerId)) {
      let input=props.input||{};
      input.tenantId=customerId;
      input.customerId=customerId;
      props.saveDeviceListInput({ ...input });
    }
  }, [props.currentUser.CustomerId]);



  React.useEffect(() => {
    initInput();//初始化入参
    return () => {
      props.clearDeviceListInput();
    }
  }, []);

  React.useEffect(() => {
    if (props.data&&props.data.length>0&&props.needLoadStatus) {
      ///通过id获取设备状态
      let ids=props.data[0].data?.map((item: { id: any }) => item.id).join(',');
      props.loadDeviceStatus({ deviceIdList: ids });
    }
  }, [props.data])

  const initInput=() => {
    let user=props.currentUser;
    if (!isEmptyString(user.CustomerId)) {
      // let params = {userId: user.Id, customerId: user.CustomerId};
      // props.loadDepartmentCodes(params);
      let customerId=props.currentUser.CustomerId;
      let input=props.input||{};
      input.pageIndex=1;
      input.tenantId=props.currentUser.CustomerId;
      input.customerId=customerId;
      props.saveDeviceListInput({ ...input });
    }
  }

  const getLocationInfo=(hierarchies: any[], locationId: number) => {
    let locationMsg='';
    let parentName='';
    let parentParentName='';
    let parentId=0;
    for (let hierarchy of hierarchies) {
      if (locationId==hierarchy.id) {
        parentId=hierarchy.parentId;
        break;
      }
    }
    let parParentId=0;
    for (let hierarchy of hierarchies) {
      if (parentId==hierarchy.id) {
        locationMsg=hierarchy.name;
        parParentId=hierarchy.parentId;
        break;
      }
    }
    let areaId=0;
    for (let hierarchy of hierarchies) {
      if (parParentId==hierarchy.id) {
        parentName=hierarchy.name;
        areaId=hierarchy.parentId;
        break;
      }
    }
    for (let hierarchy of hierarchies) {
      if (areaId==hierarchy.id) {
        parentParentName=hierarchy.name;
        break;
      }
    }
    return parentParentName+'/'+parentName+'/'+locationMsg;
  }

  const dataSource=React.useMemo(() => {
    if (props.data&&props.data.length>0) {
      let listDevice=props.data[0].data;
      for (const datum of listDevice) {
        if (datum.id) {
          datum.locations=getLocationInfo(props.hierarchyList, datum.id);
        }
      }
      return [...props.data];
    }
    return [];
  }, [props.data]);


  /**
   * 下拉刷新
   */
  const pullToRefresh=() => {
    let input=props.input;
    input.pageIndex=1;
    props.saveDeviceListInput({ ...input });
  }

  /**
   * 上拉加载
   */
  const pullLoadMore=() => {
    let input=props.input;
    input.pageIndex=props.page+1;
    props.saveDeviceListInput({ ...input });
  }

  /**
   * 搜索输入框变化
   * @param text
   */
  const onSearchTextChange=(text: string) => {
    props.saveDeviceListSearch(text);
  }

  const clearSearchBar=() => {
    searchBarRef&&searchBarRef.current?.clear();
    props.saveDeviceListSearch('');
  }
  /**
   * 清除输入框文字
   */
  const onPressClear=() => {
    clearSearchBar()
    let input=props.input;
    input.filter=null;
    props.saveDeviceListInput({ ...input });
  }

  /**
   * 搜索按钮点击
   */
  const onPressSearch=() => {
    let input=props.input;
    input.pageIndex=1;
    input.filter=props.searchText;
    props.saveDeviceListInput({ ...input });
  }

  // const renderFilterModal=() => {
  //   return (
  //     <Modal transparent={true}
  //       visible={filterVisible}
  //       onRequestClose={() => setFilterVisible(false)}>
  //       <View style={{ backgroundColor: '#00000066', flex: 1, flexDirection: 'row' }}>
  //         <Pressable style={{ width: '20%' }} onPress={() => setFilterVisible(false)} />
  //         <SafeAreaView style={{ width: '80%', backgroundColor: 'white' }}>
  //           <Filter />
  //         </SafeAreaView>
  //       </View>
  //     </Modal>
  //   )
  // }

  /**
   * list 行点击
   * @param maintain
   */
  const onPressListItem=(maintain: any) => {
    props.navigator.push({
      id: 'device_detail',
      component: DeviceDetail,
      passProps: {
        id: maintain.id,
        logo: maintain.logo,
        code: maintain.deviceCode,
        files: maintain.files||{},
        name: maintain.deviceName,
        displayHierarchy: maintain.locations||'--',
        refreshListCallBack: () => {

        }
      },
    });
  }
  /**
    * 扫码点击
    */
  const onPressScan=() => {
    props.navigator.push('PageWarpper', {
      id: 'scan_from_device_list',
      component: Scan,
      passProps: {
        scanText: '',
        pushToComponent: DeviceDetail,
        scanResult: (result: string) => {
          try {
            if (checkQrCodeIsRight(result.toLowerCase())) {
              let res=result.match(/\d+/);
              if (res&&res[0]) {
                let deviceId=res[0];
                onPressListItem({ id: deviceId });
                // let deviceItem=null
                // for (let datum of props.data) {
                //   for (let obj of datum.data) {
                //     if (obj.id==deviceId) {
                //       deviceItem=obj;
                //       break;
                //     }
                //   }
                // }
                // if (deviceItem) {
                //   onPressListItem(deviceItem);
                // } else {
                //   Alert.alert(
                //       '',
                //       '该资产不在本次盘点范围内',
                //       [
                //         {
                //           text: '知道了'
                //         }
                //       ]
                //   )
                // }

              }
            } else {
              InteractionManager.runAfterInteractions(() => {
                Alert.alert(
                  localStr('lang_asset_identify_fail'),
                  localStr('lang_asset_invalid_qrcode'),
                  [
                    {
                      text: localStr('lang_asset_alert_know')
                    }
                  ]
                )
              });
            }
          } catch (e) {
            InteractionManager.runAfterInteractions(() => {
              Alert.alert(
                localStr('lang_asset_identify_fail'),
                localStr('lang_asset_invalid_qrcode'),
                [
                  {
                    text: localStr('lang_asset_alert_know')
                  }
                ]
              )
            });
          }
        }
      }
    });
  }


  return (
    <View style={{ flex: 1, backgroundColor: Colors.seBgContainer }}>
      <View style={{ backgroundColor: Colors.seBrandNomarl }}>
        <View style={{ flexDirection: 'row', paddingBottom: 10, backgroundColor: Colors.seBgContainer, borderTopLeftRadius: 8, borderTopRightRadius: 8, overflow: 'hidden' }}>
          <SearchBar textInputRef={searchBarRef}
            value={props.searchText}
            onSearchTextChange={onSearchTextChange}
            placeholder={localStr('lang_asset_search_tip')}
            onPressClear={onPressClear}
            onPressScan={onPressScan}
            onPressSearch={onPressSearch}
            isHiddenScan={false} />
          {/*本期按不做, 后面可能会加上这暂时注释*/}
          {/*<Pressable onPress={() => setFilterVisible(true)}*/}
          {/*  style={{*/}
          {/*    marginTop: 10,*/}
          {/*    flexDirection: 'row',*/}
          {/*    alignItems: 'center',*/}
          {/*    marginLeft: 6,*/}
          {/*    marginRight: 10,*/}
          {/*  }}>*/}
          {/*  <Text style={{ fontSize: 14, color: Colors.text.sub, marginRight: 6 }}>筛选</Text>*/}
          {/*  <Image source={require('../../../../../images/filter/filter_b.png')} />*/}
          {/*</Pressable>*/}
          <View style={{ position: 'absolute', height: 1, backgroundColor: Colors.seBorderSplit, bottom: 0, left: 12, right: 12 }} />
        </View>
      </View>
      <RefreshList contentContainerStyle={{ paddingBottom: 15, backgroundColor: Colors.seBgContainer }}
        sections={props.loading? []:dataSource}
        page={props.page}
        refreshing={props.loading}
        pullToRefresh={pullToRefresh}
        pullLoadMore={pullLoadMore}
        renderItem={(item) => DeviceListItem(item.item, onPressListItem)} />
      {/*{renderFilterModal()}*/}
    </View>
  )
}


const mapStateToProps=(state: any) => {
  let deviceList=state.device.deviceList;
  const user=state.user.toJSON().user;
  return {
    currentUser: user,
    loading: deviceList.isFetching,
    page: deviceList.page,
    data: deviceList.data,
    searchText: deviceList.searchText,
    input: deviceList.input,
    needLoadStatus: deviceList.needLoadStatus
  }
}

export default connect(mapStateToProps, {
  loadDeviceList, saveDeviceListInput, clearDeviceListInput, saveDeviceListSearch, loadDeviceStatus
})(DeviceList)


