import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { InteractionManager, View, Text, ScrollView } from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {
  MaintainContainerView
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainContainerView";
import { screenWidth } from "../../../../../utils/const/Consts";
import {
  fileModuleCode,
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";

import { TicketDetail } from 'rn-module-abnormal-ticket'
import { TicketDetail as InventoryDetaild } from 'rn-module-inventory-ticket'

import {
  loadDeviceDetail,
  clearDeviceDetail,
  queryDeviceMappingList,
  loadMonitorInfo,
  loadMaintenanceInfo,
  saveDeviceAlarmsInput,
  loadAlarmList, loadDeviceParams, apiGetOssPath, getRealtimeData, getDeviceConfig, getAssetStatus,
  loadDeviceTickets
} from "../../../../../actions/device/deviceAction";

import ImageView from "../../../../../components/imageview";
import storage from "../../../../../utils/storage";
import DeviceDetailView from '../../../../../components/fmcs/plantOperation/device/detail/DeviceDetail'
import {
  getDeviceFileList
} from "../../../../../actions/fileList/fileListAction";
// @ts-ignore
import FileOpener from 'react-native-file-opener'
import RNFS, { DocumentDirectoryPath } from "react-native-fs";
import { DeviceAlarmMsg } from "../../../../../components/fmcs/plantOperation/device/detail/DeviceAlarmMsg";
import {
  DeviceDataMonitor,
} from "../../../../../components/fmcs/plantOperation/device/detail/DeviceDataMonitor";
import { localStr } from "../../../../../utils/Localizations/localization";
import DeviceLogs from "../../../../../components/fmcs/plantOperation/device/detail/DeviceLogs";
import History from "../../../../assets/History";
import privilegeHelper from "../../../../../utils/privilegeHelper";

function DeviceDetail(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      if (props.isFromScan) {
        props.navigation.popToTop();
      } else {
        props.navigation.pop();
      }
    });
  }

  const [showImagePreview, setImagePreview]=useState(false)
  const [isManualPull, setIsManualPull]=useState(false);

  /**
   * 内容scrollView的引用, 方便点击改变scrollView的contentOffset
   */
  const scrollContentRef=React.useRef<ScrollView>(null);

  let [timeInterval, setTimeInterval]=React.useState<any>(undefined);

  React.useLayoutEffect(() => {
    setTimeout(() => {
      props.loadDeviceDetail(props.id);
      props.apiGetOssPath();
      props.getAssetStatus({ deviceId: props.id });
    }, 500);
  }, []);

  React.useLayoutEffect(() => {
    if (props.data) {
      props.loadDeviceParams(props.data.objectId)
      // updateAlarmsInput();
    }
  }, [props.data])

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      props.clearDeviceDetail();
    }
  }, [])

  /**
   * 开启定时器
   */
  const startTimeInterval=() => {
    if (!timeInterval) {
      let interval=setInterval(() => {
        // loadMonitorDataSource();
      }, 15000);
      setTimeInterval(interval);
    }
  }

  /**
   * 报警列表入参赋值
   */
  const updateAlarmsInput=() => {
    let input=props.alarmsInput;
    input.deviceId=props.data.objectId//props.id;
    input.pageNum=1;
    input.customerId=props.currentUser.CustomerId
    input.pageSize=20;
    props.saveDeviceAlarmsInput({ ...input });
  }

  /**
   * 报警列表入参变化 load报警列表
   */
  React.useEffect(() => {
    // if (props.alarmsInput.deviceId) {
    //props.loadAlarmList(props.alarmsInput);
    // }
  }, [props.alarmsInput]);

  /**
   * 获取数据监控/运维参数 数据
   */
  const loadMonitorDataSource=() => {
    props.getDeviceConfig({ hierarchyId: props.id, type: 2 });
  }


  React.useLayoutEffect(() => {
    if (props.deviceConfig&&props.deviceConfig.length>0&&props.isNeedLoadRealTime) {
      for (const config of props.deviceConfig) {
        props.getRealtimeData({
          device: config.deviceId,
          parameter: config.deviceParameterId,
          gateway: config.gatewayId,
        })
      }
    }
  }, [props.deviceConfig])

  // React.useEffect(() => {
  //     if (props.mappingList && Object.keys(props.mappingList).length > 0) {
  //         const list = props.mappingList.targets.map((item: any) => item.targetId)
  //         ///数据监控
  //         fetchMonitorInfo(list);
  //         ///运维参数
  //         fetchMaintenanceInfo(list);
  //     }
  // }, [props.mappingList])

  /**
   * 数据监控请求
   * @param list
   */
  const fetchMonitorInfo=(list: any[]) => {
    //props.loadMonitorInfo({deviceIds: list, category: 2});
  }

  /**
   * 运维参数请求
   */
  const fetchMaintenanceInfo=(list: any[]) => {
    //props.loadMaintenanceInfo({deviceIds: list, category: 5});
  }


  /**
   * 获取图片/文件列表
   */
  const loadDetailFileList=() => {
    props.getDeviceFileList(fileModuleCode.device+props.code);
  }


  const _loadTickets=(isInventory?: boolean) => {
    let body={
      pageNo: 1,
      customerId: props.currentUser.CustomerId,
      assets: [{ assetId: props.id, assetType: props.assetId }],
    }
    if (isInventory) {
      body={
        ...body,
        ...props.inventorys.filter
      }
    } else {
      body={
        ...body,
        ...props.tickets.filter
      }
    }
    props.loadDeviceTickets(body, isInventory);
  }

  const _toTicketDetail=(rowData: any) => {
    props.navigation.push('PageWarpper', {
      id: 'service_ticket_detail',
      component: TicketDetail,
      passProps: {
        ticketId: rowData.id,
        ticketChanged: () => _loadTickets()
      }
    })
  }

  const _toInventoryDetail=(rowData: any, selectIndex: number) => {
    props.navigation.push('PageWarpper', {
      id: 'inventory_ticket_detail',
      component: InventoryDetaild,
      passProps: {
        ticketId: rowData.id,
        deviceTab: selectIndex,
        ticketChanged: () => _loadTickets()
      }
    })
  }

  /**
   * 头部切换点击
   * @param headerObj
   */
  const onHeaderSwitch=(headerObj: { title: string, value: number }) => {
    switch (headerObj.value) {
      case 1:
        if (props.deviceConfig&&props.deviceConfig.length===0) {
          loadMonitorDataSource();
        }
        break;
      case 2:
        if (props.tickets&&props.tickets.data&&props.tickets.data.length===0) {
          _loadTickets(false);
        }
        break;
      case 3:
        if (props.inventorys&&props.inventorys.data&&props.inventorys.data.length===0) {
          _loadTickets(true);
        }
        break;
    }

    scrollContentRef.current?.scrollTo(
      {
        x: screenWidth()*headerObj.value,
        y: 0,
        animated: true,
      }
    )
  }

  const mimetype={
    'txt': 'text/plain',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.ms-powerpoint',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.ms-excel',
    'doc': 'application/msword',
    'docx': 'application/msword',
    'pdf': 'application/pdf',
  }

  const onPressFile=async (file: any) => {
    let name=file.fileName;
    let type=name.substr(name.lastIndexOf('.')+1).toLowerCase();
    // @ts-ignore
    type=mimetype[type];
    //需要先下载文件，在传递文件路径
    try {
      let filePath=`${DocumentDirectoryPath}/${file.id}-${file.fileName}`;
      let ret=await RNFS.exists(filePath);
      if (ret) {
        FileOpener.open(filePath, type).then(() => {
          console.log('success!!');
        }, (e: any) => {
          console.log('e', e);
        });
        return;
      }
      //开始下载文件了
      await RNFS.downloadFile({
        fromUrl: storage.getOssBucket()+`/lego-bff/bff/ledger/rest/downloadFile?id=${file.id}`,
        toFile: filePath,
      }).promise;
      FileOpener.open(filePath, type).then(() => {
        console.log('success!!');
      }, (e: any) => {
        console.log('e', e);
      });
    } catch (err) {
      //文件下载失败
      console.log('download error', err);
      return false;
    }


  }


  /**
   * 放大图片
   */
  const onPressImage=(index: number) => {
    setImagePreview(true);
  }


  const renderImageViewing=() => {
    if (!showImagePreview||!props.files||!props.files.imageList||props.files.imageList.length===0)
      return null;
    let images=props.files.imageList.map((item: any) => {
      return {
        uri: storage.getOssBucket()+`/lego-bff/bff/ledger/rest/downloadFile?id=${item.id}`,
        headers: { Cookie: storage.getOssToken() }
      }
    });
    // let basicMsg = props.basicMsgData;
    // for (let basicObj of basicMsg) {
    //     if (basicObj.sectionType == MaintainDetailItemType.maintainPicture) {
    //         for (let image of basicObj.images) {
    //             images.push({
    //                 uri: image.uri,
    //                 headers:{Cookie:storage.getOssToken()}
    //             });
    //         }
    //         break;
    //     }
    // }
    const ErrorView=() => (
      <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
        <Text style={{ color: Colors.text.white }}>{localStr('lang_asset_image_loading_exception')}</Text>
      </View>
    )

    return (
      <ImageView ErrorComponent={ErrorView}
        images={images}
        imageIndex={0}
        visible={showImagePreview}
        onRequestClose={() => setImagePreview(false)}
      />
    )
  }

  let children=[
    <DeviceDetailView isFetching={props.isFetching} onPressImage={onPressImage}
      data={props.data} params={props.params} logo={props.logo}
      ossPath={props.ossPath}
      displayHierarchy={props.displayHierarchy}
      documents={props.documents} deviceInfo={props.deviceInfo}
      deviceStatus={props.deviceStatus}
      images={props.images} onPressFile={onPressFile}
    />,
    <DeviceDataMonitor title={props.title}
      isFetching={isManualPull? false:props.isRealTimeRefresh}
      data={(props.deviceConfig&&props.deviceConfig.length>0)? [props.deviceConfig]:[]}
      onRefresh={() => {
        setIsManualPull(true);
        loadMonitorDataSource();
      }}
      onMonitorCallBack={(itemValue: any) => {
        props.navigation.push('PageWarpper', {
          id: 'history_view',
          component: History,
          passProps: {
            tagId: itemValue.tagId,
            unit: itemValue.unit,
            name: itemValue.name,
          }
        });

      }}
    />,
  ];

  let titles=[
    { title: localStr('lang_asset_device_info'), value: 0 },
    { title: localStr('lang_asset_realtime_data'), value: 1 },
  ];

  if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketExecute)||
    privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketFull)||
    privilegeHelper.hasAuth(privilegeHelper.CodeMap.OMTicketRead)) {
    children.push(<DeviceLogs key={'tickets'} title={props.title} click={_toTicketDetail}
      {...props.tickets} loc={props.displayHierarchy}
      onRefresh={() => {
        _loadTickets();
      }}
    />);
    titles.push({ title: localStr('lang_asset_tickets'), value: 2 })
  }
  if (privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketExecute)||
    privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketFull)||
    privilegeHelper.hasAuth(privilegeHelper.CodeMap.AssetTicketRead)) {
    children.push(<DeviceLogs key={'inventorys'} title={props.title} click={_toInventoryDetail} isInventory={true}
      {...props.inventorys} loc={props.displayHierarchy}
      onRefresh={() => {
        _loadTickets(true);
      }}
    />)
    titles.push({ title: localStr('lang_asset_inventory'), value: 3 })
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.seBgColor }}>
      <Toolbar title={props.title} borderColor={Colors.seBorderSplit} navIcon="back" onIconClicked={onPopBack} color={Colors.seBrandNomarl} />
      <View style={{ height: 46 }}>
        <HeaderSwitch onSwitchItem={onHeaderSwitch}
          backgroundColor={Colors.seBgContainer}
          normalCol={Colors.seTextTitle}
          selectedCol={Colors.seBrandNomarl}
          titles={titles} />
      </View>

      <MaintainContainerView scrollViewRef={scrollContentRef}
        children={children} />
      {renderImageViewing()}
    </View>
  )
}

const mapStateToProps=(state: any, props: any) => {
  let device=state.device.deviceDetail;
  const user=state.user.toJSON().user//.get('amUser')?state.user.get('amUser').toJSON():state.user.toJSON().user;
  let fileList=state.fileList;
  let title=undefined;
  if (props&&props.name) {
    title=props.name;
  }
  return {
    currentUser: user,
    isFetching: device.isFetching,
    isRealTimeRefresh: device.isRealTimeRefresh,
    isNeedLoadRealTime: device.isNeedLoadRealTime,
    data: device.data,
    deviceInfo: device.deviceInfo,
    params: device.params,
    images: fileList.images,
    documents: fileList.documents,
    ///数据监控/运维参数
    mappingList: device.mappingList,
    monitorData: device.monitorData,
    maintenanceData: device.maintenanceData,
    ///报警列表
    page: device.page,
    alarmList: device.alarmList,
    alarmsInput: device.alarmsInput,

    title: title||device?.data?.name,
    ossPath: device.ossPath,
    deviceConfig: device.deviceConfig,
    deviceStatus: device.deviceStatus,
    tickets: device.tickets,
    inventorys: device.inventorys
  }
}

export default connect(mapStateToProps, {
  loadDeviceDetail,
  getDeviceFileList,
  getDeviceConfig,
  getRealtimeData,

  queryDeviceMappingList,
  loadMonitorInfo,
  loadMaintenanceInfo,
  loadDeviceParams,
  saveDeviceAlarmsInput,
  loadAlarmList,
  clearDeviceDetail,
  apiGetOssPath,
  getAssetStatus,
  loadDeviceTickets,
})(DeviceDetail)

