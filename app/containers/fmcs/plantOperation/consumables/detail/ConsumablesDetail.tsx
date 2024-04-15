import React from "react";
import {connect} from "react-redux";
import {FlatList, InteractionManager, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {BasicMsgItem} from "../../../../../components/fmcs/plantOperation/components/BasicMsgItem";
import {
  ConsumablesDetailItemType,
  ConsumablesReplacementStatus
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";

import {
  bindTask,
  consumablesDetailDestroyClear,
  consumablesDetailInfoSave,
  consumablesGetWarehouseTicketNo,
  generateWarehouseExitOrder,
  loadConsumablesDetailInfo,
  saveConsumablesList,
  submitConsumablesDetail,
  unbindTask,
  updateBindTaskStatus,
} from "../../../../../actions/consumables/consumablesAction";
import {
  checkHasNoSaveRecords,
  configConsumablesList,
  configConsumablesSubmitParams,
  configGenerateWarehouseExitParams,
  convertBasicMessage,
  didSelectedConsumables,
  removeConsumables,
  updateDepartmentAndSystemCode
} from "./ConsumablesStateHelper";
import {
  SparePartsOutbound,
  SparePartsOutboundData
} from "../../../../../components/fmcs/plantOperation/consumables/detail/SparePartsOutbound";
import {
  ConsumablesReplacement, ConsumablesReplacementData
} from "../../../../../components/fmcs/plantOperation/consumables/detail/ConsumablesReplacement";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import SelectSpareList from "../../spareOutStoreHouse/new/SelectSpareList";
import {RequestStatus} from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import {isEmptyString} from "../../../../../utils/const/Consts";
import ConsumablesSelectSpareList from "./ConsumablesSelectSpareList";


/**
 * 耗材更换详情
 * @param props
 * @constructor
 */
function ConsumablesDetail(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const FlatListRef = React.useRef<FlatList>(null)

  React.useEffect(() => {
    loadConsumablesDetail();
  }, [])

  /**
   * 获取详情信息
   */
  const loadConsumablesDetail = () => {
    let params = {ticketId: props.ticketId, customerId: props.customerId};
    props.loadConsumablesDetailInfo(params);
  }
  /**
   * 获取耗材更换 工单号
   */
  const loadConsumablesTicketNo = () => {
    props.consumablesGetWarehouseTicketNo()
  }

  /**
   * 监听耗材详情请求 更新列表
   */
  React.useEffect(() => {
    if (Object.keys(props.responseDetail).length > 0) {
      SndToast.dismiss();
      let basicInfo = convertBasicMessage(props.responseDetail, props.detailInfo, props.user, props.executorNames);
      ///更新课室/系统
      let info = updateDepartmentAndSystemCode(props.responseDetail, props.departmentCodes, basicInfo);
      props.consumablesDetailInfoSave(info);

      let list = configConsumablesList(props.responseDetail);
      props.saveConsumablesList(list);
    }else {
      SndToast.showLoading();
    }
  }, [props.responseDetail]);

  /**
   * 生成备件 监听工单号的生成
   */
  React.useEffect(() => {
    if (props.ticketNo.length > 0) {
      let params = configGenerateWarehouseExitParams(props.ticketNo, props.consumablesList, props.responseDetail, props.user.Name);
      props.generateWarehouseExitOrder(params);
    }
  }, [props.ticketNo]);


  /**
   * 监听出库单生成请求
   */
  React.useEffect(() => {
    if (props.generateRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.generateRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      // SndToast.showSuccess('备件出库单生成成功');
      // ///刷新详情信息
      // loadConsumablesDetail();
      SndToast.showSuccess('提交成功');
      onPopBack();
      props.refreshCallBack && props.refreshCallBack()
    } else if (props.generateRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.generateRequestStatus])


  /**
   * 监听移除备件请求状态
   */
  React.useEffect(() => {
    if (props.removeSparePartRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.removeSparePartRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('移除成功');
      ///刷新详情信息
      loadConsumablesDetail();
    } else if (props.removeSparePartRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.removeSparePartRequestStatus]);

  /**
   * 监听添加备件请求
   */
  React.useEffect(() => {
    if (props.bindSparePartRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.bindSparePartRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('关联成功');
      props.updateBindTaskStatus(RequestStatus.initial);
      loadConsumablesDetail();
    } else if (props.bindSparePartRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.bindSparePartRequestStatus]);

  /**
   * 监听添加备件请求
   */
  React.useEffect(() => {
    if (props.saveConsumablesRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.saveConsumablesRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      // SndToast.showSuccess('提交成功');
      // onPopBack();
      // props.refreshCallBack && props.refreshCallBack()
      onPressCreationOutbound();
    } else if (props.saveConsumablesRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.saveConsumablesRequestStatus]);

  /**
   * 详情销毁
   */
  React.useEffect(() => {
    return () => {
      props.consumablesDetailDestroyClear();
      SndToast.dismiss();
    }
  }, [])

  /**
   * 展开收起点击
   * @param sectionType
   */
  const onPressExpend = (sectionType: ConsumablesDetailItemType) => {
    const dataSource = props.detailInfo;
    for (let dataElement of dataSource) {
      if (dataElement.sectionType == sectionType) {
        dataElement.isExpand = !dataElement.isExpand;
        break;
      }
    }
    props.consumablesDetailInfoSave([...dataSource]);
  }

  ///耗材更换清单相关事件点击
  const editCallBack = (itemObj: ConsumablesReplacementData) => {
    if (checkHasNoSaveRecords(props.detailInfo)) {
      SndToast.showTip("请先保存耗材更换清单!");
      return;
    }
    itemObj.inputStatus = ConsumablesReplacementStatus.edit;
    props.consumablesDetailInfoSave([...props.detailInfo]);
  }

  /**
   * 删除点击
   * @param itemObj
   */
  const deleteCallBack = (itemObj: ConsumablesReplacementData) => {
    let info = removeConsumables(itemObj, props.detailInfo, props.consumablesList);
    props.consumablesDetailInfoSave(info.detailInfo);
    props.saveConsumablesList(info.consumablesList);
  }

  /**
   * 取消点击
   * @param itemObj
   */
  const cancelCallBack = (itemObj: ConsumablesReplacementData) => {
    for (let consumable of props.consumablesList) {
      if (consumable.id == itemObj.id) {
        itemObj.quantity = consumable.quantity;
        break;
      }
    }
    itemObj.inputStatus = ConsumablesReplacementStatus.initial;
    props.consumablesDetailInfoSave([...props.detailInfo]);
  }

  /**
   * 耗材清单保存点击
   * @param itemObj
   */
  const saveRecordCallBack = (itemObj: ConsumablesReplacementData) => {
    if (isEmptyString(itemObj.quantity)) {
      SndToast.showTip('所属数量不能为空');
      return;
    }
    ///更新列表
    itemObj.inputStatus = ConsumablesReplacementStatus.initial;
    props.consumablesDetailInfoSave([...props.detailInfo]);
    ///保存选中的耗材清单数量
    for (let consumable of props.consumablesList) {
      if (consumable.id == itemObj.id) {
        consumable.quantity = itemObj.quantity;
        break;
      }
    }
    props.saveConsumablesList([...props.consumablesList]);
  }

  /**
   * 耗材 所需数量文字变化
   * @param text
   * @param itemObj
   */
  const textOnChange = (text: string, itemObj: ConsumablesReplacementData) => {
    itemObj.quantity = text;
    props.consumablesDetailInfoSave([...props.detailInfo]);
  }

  /**
   * 添加 耗材点击
   */
  const onPressAdd = () => {
    if (checkHasNoSaveRecords(props.detailInfo)) {
      SndToast.showTip("请先保存耗材更换清单!");
      return;
    }
    let ownershipSystemId: any[] = [];
    if (!isEmptyString(props.responseDetail.systemCode)) {
      ownershipSystemId = [props.responseDetail.systemCode];
    }
    props.navigator.push({
      id: 'Select_SpareList',
      component: SelectSpareList,
      passProps: {
        selectedSpares: props.consumablesList,
        classroomId: props.responseDetail.departmentCode,
        ownershipSystemId: ownershipSystemId,
        selectedCallBack: (spares: any[]) => {
          ///更新列表
          let info = didSelectedConsumables(props.detailInfo, spares, props.consumablesList);
          props.consumablesDetailInfoSave(info.detailInfo);
          ///保存选中的 耗材清单列表
          props.saveConsumablesList(info.selectedList);
        }
      }
    })
  }

  /**
   * 生成备件信息
   */
  const onPressCreationOutbound = () => {
    if (checkHasNoSaveRecords(props.detailInfo)) {
      SndToast.showTip("请先保存耗材更换清单!");
      return;
    }
    ///1.获取编号
    loadConsumablesTicketNo();
  }

  /**
   * 移除备件信息
   * @param spareItem
   */
  const onPressRemove = (spareItem: SparePartsOutboundData) => {
    let code = props.responseDetail.code;
    let params = {code: code, use: "耗材更换", warehouseExitIds: [spareItem.id]};
    props.unbindTask(params);
  }

  /**
   * 关联备件出库单
   */
  const onPressRelative = () => {
    props.navigator.push(
      {
        id: 'Consumables_SelectSpare_List',
        component: ConsumablesSelectSpareList,
        passProps: {
          departmentCode: props.responseDetail.departmentCode,
          systemCode: props.responseDetail.systemCode,
          deviceId: props.responseDetail.deviceId,
          code: props.responseDetail.code,
          use: '耗材更换',
          addCallBack: (params: any) => {
            //添加完回调
            props.bindTask(params)
          }
        }
      }
    )
  }

  /**
   * render item
   * @param itemObj
   */
  const configConsumablesDetailItem = (itemObj: any) => {
    if (itemObj.sectionType == ConsumablesDetailItemType.basicMsg) {
      return BasicMsgItem({...itemObj, expandCallBack: onPressExpend});
    } else if (itemObj.sectionType == ConsumablesDetailItemType.exchangeList) {
      return ConsumablesReplacement({
        ...itemObj,
        editCallBack,
        cancelCallBack,
        saveRecordCallBack,
        onPressAdd,
        textOnChange,
        deleteCallBack,
      });
    } else if (itemObj.sectionType == ConsumablesDetailItemType.outbound) {
      return SparePartsOutbound({...itemObj, onPressRemove});
    }
    return <View/>
  }

  const configBottomAction = () => {
    if (Object.keys(props.responseDetail).length == 0) {
      return <></>
    }
    if ((props.responseDetail.taskObject.indexOf(props.user.Id) != -1 || props.user.TitleCode == props.responseDetail.taskObject) && props.responseDetail.status != '4') {
      return (
        <BottleDetailActionView actions={[
          {
            title: '完成提交并生成备件出库单',
            textColor: Colors.white,
            onPressCallBack: onPressSubmit,
            btnStyle: {marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme}
          }
        ]}/>
      )
    }
  }

  /**
   * 完成移交点击
   */
  const onPressSubmit = () => {
    if (checkHasNoSaveRecords(props.detailInfo)) {
      SndToast.showTip("请先保存耗材更换清单!");
      return;
    }
    let submitParams = configConsumablesSubmitParams(props.responseDetail, props.detailInfo);
    props.submitConsumablesDetail(submitParams);
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar title={'耗材更换'} navIcon="back" onIconClicked={onPopBack}/>
      <FlatList ref={FlatListRef}
                data={props.detailInfo}
                keyExtractor={(item, index) => item.title}
                renderItem={(item) => configConsumablesDetailItem(item.item)}/>
      {configBottomAction()}
    </View>
  )
}

const mapStateToProps = (state: any) => {
  let consumables = state.consumables.ConsumablesDetailReducer;
  const user = state.user.toJSON().user;
  return {
    user: user,
    responseDetail: consumables.responseDetail,///耗材详情接口返回
    detailInfo: consumables.detailInfo,///保存详情展示信息
    consumablesList: consumables.consumablesList,///耗材更换清单保存
    ticketNo: consumables.ticketNo,///生成备件 获取单号
    generateRequestStatus: consumables.generateRequestStatus,///生成备件出库单 请求状态
    removeSparePartRequestStatus: consumables.removeSparePartRequestStatus,///删除备件请求状态
    bindSparePartRequestStatus: consumables.bindSparePartRequestStatus,///关联备件请求状态
    saveConsumablesRequestStatus: consumables.saveConsumablesRequestStatus,///完成提交请求状态
  }
}

export default connect(mapStateToProps, {
  consumablesDetailInfoSave,  ///更新业务模型数据
  loadConsumablesDetailInfo,///接口获取详情数据
  saveConsumablesList,    ///耗材更换清单保存

  consumablesGetWarehouseTicketNo,///添加备件 获取单号
  generateWarehouseExitOrder,

  unbindTask,///移除备件
  bindTask,   ///关联备件出库单
  updateBindTaskStatus,

  submitConsumablesDetail, ///完成提交
  consumablesDetailDestroyClear,  ///销毁
})(ConsumablesDetail)

