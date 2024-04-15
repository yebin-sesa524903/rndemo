import React from "react";
import { FlatList, InteractionManager, View, Alert, } from "react-native";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import { connect } from "react-redux";
import {
  SpareOutStoreHouseItemType,
  SpareOutStoreRowType,
  SpareOutStoreStatus,
  SpareOutUseType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
  SpareOutStoreSpareMsgData,
  SpareOutStoreSpareMsgItem
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/detail/SpareOutStoreSpareMsgItem";
import {
  SpareOutStoreAddBasicItem,
  SpareOutStoreAddBasicItemProps
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/new/SpareOutStoreAddBasicItem";
import {
  getDeviceDictionary,
  getWarehouseTicketNo,
  saveNewPareOutStoreDataInfo,
  spareOutStoreAddDestroyClear,
  submitInputSave,
  submitSpareOutStore
} from "../../../../../actions/spareOutStore/spareOutStoreAction";
// @ts-ignore
import ModalDropdown from "react-native-modal-dropdown";
import {
  changeAddSpareOutStoreCancelAction,
  changeAddSpareOutStoreStatus,
  checkOutStoreIsHasNoSave,
  configStoreDetailList, configStoreHasZeroRecord,
  updateDropdownOptions,
  updateSpareInfo,
  updateSpareOutStoreCount,
  updateSpareRowValueWithType,
  updateAddSpareOutStore
} from "./SpareAddHelper";
import moment from "moment";
import { isEmptyString } from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";
import RepairSelectAssets from "../../repair/add/RepairSelectAssets";
import SelectSpareList from "./SelectSpareList";
import { deleteSpareOutStore } from "../detail/SpareOutStoreHelper";
import { RequestStatus } from "../../../../../middleware/api";
import SpareSelectRelativeOrder from "./SpareSelectRelateveOrder";


function NewSpareOutStore(props: any) {
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const dropdownRef1=React.useRef<ModalDropdown>(null);
  const dropdownRef2=React.useRef<ModalDropdown>(null);
  const dropdownRef3=React.useRef<ModalDropdown>(null);

  /**
   * 给下拉选择框  dropdown 引用赋值, ModalDropdown 自定义renderRow 需要手动hide();
   */
  const bindDropdownRef=() => {
    for (let info of props.newDataInfo) {
      if (info.sectionType==SpareOutStoreHouseItemType.basicMsg) {
        for (let datum of info.data) {
          if (datum.rowType==SpareOutStoreRowType.class) {
            datum.dropdownRef=dropdownRef1;
          } else if (datum.rowType==SpareOutStoreRowType.system) {
            datum.dropdownRef=dropdownRef2;
          } else {
            datum.dropdownRef=dropdownRef3;
          }
        }
      }
    }
    props.saveNewPareOutStoreDataInfo([...props.newDataInfo]);
  }

  React.useEffect(() => {
    ///获取出库单号
    props.getWarehouseTicketNo();
    ///课室/系统下拉选择列表
    let departmentCodes=[];

    if (!props.repairDetail) {
      for (let departmentCode of props.departmentCodes) {
        departmentCodes.push({
          title: departmentCode.label,
          id: departmentCode.value,
        });
      }
    }
    let infoList=updateDropdownOptions(SpareOutStoreRowType.class, departmentCodes, props.newDataInfo);
    ///执行人
    infoList=updateSpareRowValueWithType(props.user.Name, SpareOutStoreRowType.executor, infoList);
    ///执行时间
    let timeString=moment().format('YYYY-MM-DD HH:mm:ss');
    infoList=updateSpareRowValueWithType(timeString, SpareOutStoreRowType.time, infoList);

    if (props.repairDetail) {
      infoList=updateAddSpareOutStore(props.repairDetail, infoList, props.fromUse);
      props.submitInput.classroomId=props.repairDetail.departmentCode;
      props.submitInput.ownershipSystemId=props.repairDetail.systemCode;
      props.submitInput.deviceId=props.repairDetail.deviceId;
      props.submitInput.use=props.fromUse;
      props.submitInput.associatedVoucher=props.repairDetail.code;
    }

    props.saveNewPareOutStoreDataInfo(infoList);

    //更新入参
    let submitInput=props.submitInput;
    submitInput.recipient=props.user.Name;
    submitInput.updateUser=props.user.Name;
    submitInput.warehouseExitTime=timeString;
    submitInput.updateTime=timeString;
    props.submitInputSave({ ...submitInput });

    ///获取用途
    props.getDeviceDictionary();
    ///绑定dropdown
    bindDropdownRef();

  }, []);

  /**
   * 出库单号监听
   */
  React.useEffect(() => {
    if (props.ticketNo.length>0) {
      ///更新列表
      let info=updateSpareRowValueWithType(props.ticketNo, SpareOutStoreRowType.warehouseExitNo, props.newDataInfo);
      props.saveNewPareOutStoreDataInfo(info);
      ///更新入参
      let submitInput=props.submitInput;
      submitInput.warehouseExitNo=props.ticketNo;
      props.submitInputSave({ ...submitInput });
    }
  }, [props.ticketNo]);

  /**
   * 用途下拉数组 更新
   */
  React.useEffect(() => {
    if (props.use.length>0) {
      let infoList=updateDropdownOptions(SpareOutStoreRowType.use, props.use, props.newDataInfo);
      props.saveNewPareOutStoreDataInfo(infoList);
    }
  }, [props.use]);

  /**
   * 监听提交请求
   */
  React.useEffect(() => {
    if (props.spareOutStoreSubmitRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.spareOutStoreSubmitRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('提交成功');
      onPopBack();
      props.refreshCallBack&&props.refreshCallBack();
    } else if (props.spareOutStoreSubmitRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.spareOutStoreSubmitRequestStatus]);

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      props.spareOutStoreAddDestroyClear()
    }
  }, []);

  /**
   * 展开/收起
   * @param sectionType
   */
  const expandCallBack=(sectionType: SpareOutStoreHouseItemType) => {
    const dataSource=props.newDataInfo;
    for (let element of dataSource) {
      if (element.sectionType==sectionType) {
        element.isExpand=!element.isExpand;
        break;
      }
    }
    props.saveNewPareOutStoreDataInfo([...dataSource]);
  }

  /**
   * 提交出库
   */
  const onPressSubmit=() => {
    let input=props.submitInput;
    if (isEmptyString(input.classroomId)) {
      SndToast.showTip('请选择课室');
      return;
    }
    if (isEmptyString(input.deviceId)) {
      SndToast.showTip('请选择设备');
      return;
    }
    if (isEmptyString(input.use)) {
      SndToast.showTip('请选择用途');
      return;
    }
    let detailList=configStoreDetailList(props.newDataInfo);
    if (detailList.length==0) {
      SndToast.showTip('请添加备件信息');
      return;
    }
    let spareName=configStoreHasZeroRecord(props.newDataInfo);
    if (!isEmptyString(spareName)) {
      SndToast.showTip(`(${spareName})出库数量不能为0`);
      return;
    }
    input.detailList=detailList;
    Alert.alert('', `提交后不可修改，您确定要提交吗？`, [
      {
        text: '取消',
      },
      {
        text: '确定',
        onPress: () => { props.submitSpareOutStore(input); },
      }
    ])
  }

  const configBottomAction=() => {
    return (
      <BottleDetailActionView actions={[
        {
          title: '提交出库',
          textColor: Colors.white,
          onPressCallBack: onPressSubmit,
          btnStyle: { marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme }
        }
      ]} />
    )
  }

  /**
   * 下拉框选择事件
   * @param option
   * @param rowType
   */
  const dropdownOnSelect=(option: any, rowType: SpareOutStoreRowType) => {
    let input=props.submitInput;
    let info: SpareOutStoreAddBasicItemProps[]=[];
    if (rowType==SpareOutStoreRowType.class) {
      ///课室下拉选择
      dropdownRef1.current?.hide();
      ///获取系统下拉选择 集合
      let systemCodes=getSystemCodesFromDepartmentCodes(option.id).systemCodes;

      ///更新系统下拉
      let spareInfo=updateDropdownOptions(SpareOutStoreRowType.system, systemCodes, props.newDataInfo);
      ///清空其他已选择的 关联课室的选项
      info=updateSpareRowValueWithType(option.title, SpareOutStoreRowType.class, spareInfo);
      info=updateSpareRowValueWithType('', SpareOutStoreRowType.system, info);
      info=updateSpareRowValueWithType('', SpareOutStoreRowType.device, info);
      info=updateSpareRowValueWithType('', SpareOutStoreRowType.relateOrderNo, info);

      ///赋值入参
      input.classroomId=option.id;
      input.ownershipSystemId=null;
      input.deviceId=null;
    } else if (rowType==SpareOutStoreRowType.system) {
      ///系统下拉选择
      dropdownRef2.current?.hide();
      info=updateSpareRowValueWithType(option.title, SpareOutStoreRowType.system, props.newDataInfo);
      input.ownershipSystemId=option.id;
    } else {
      dropdownRef3.current?.hide();
      info=updateSpareRowValueWithType(option.title, SpareOutStoreRowType.use, props.newDataInfo);
      input.use=option.id;
    }
    props.saveNewPareOutStoreDataInfo(info);
    props.submitInputSave({ ...input });
  }

  /**
   * 根据课室code获取系统codes集合
   * @param departmentCodeId
   */
  const getSystemCodesFromDepartmentCodes=(departmentCodeId: number) => {

    let systemCodes=[], ids=[];
    for (let departmentCode of props.departmentCodes) {
      if (departmentCode.value==departmentCodeId) {
        for (let child of departmentCode.children) {
          systemCodes.push({
            title: child.label,
            id: child.value,
          });
          ids.push(child.value);
        }
      }
    }
    return { systemCodes: systemCodes, ids: ids };
  }


  /**
   * 设备/关联单号选择
   * @param rowType
   */
  const actionCallBack=(rowType: SpareOutStoreRowType) => {
    let input=props.submitInput;
    if (isEmptyString(input.classroomId)) {
      SndToast.showTip('请选择课室');
      return;
    }

    if (rowType==SpareOutStoreRowType.device) {
      props.navigator.push({
        id: 'Repair_Select_Assets',
        component: RepairSelectAssets,
        passProps: {
          parentId: isEmptyString(input.ownershipSystemId)? getSystemCodesFromDepartmentCodes(input.classroomId).ids:[input.ownershipSystemId],

          customerId: props.user.CustomerId,
          selectedDeviceId: input.deviceId,
          selectCallBack: (deviceObj: any) => {
            ///更新列表
            let tempList=updateSpareRowValueWithType(deviceObj.deviceName, SpareOutStoreRowType.device, props.newDataInfo);
            props.saveNewPareOutStoreDataInfo(tempList);
            ///更新入参
            let submitInput=props.submitInput;
            submitInput.deviceId=deviceObj.deviceId;
            submitInput.deviceName=deviceObj.deviceName;
            props.submitInputSave({ ...submitInput });
          }
        }
      })
    } else if (rowType==SpareOutStoreRowType.relateOrderNo) {
      if (isEmptyString(input.deviceId)) {
        SndToast.showTip('请选择设备');
        return;
      }
      if (isEmptyString(input.use)) {
        SndToast.showTip('请选择用途');
        return;
      }
      props.navigator.push({
        id: 'Spare_Select_Relative_Order',
        component: SpareSelectRelativeOrder,
        passProps: {
          relateCode: input.associatedVoucher,
          departmentCode: input.classroomId,
          systemCode: input.ownershipSystemId,
          deviceId: input.deviceId,
          use: getUseTypeWithName(input.use),
          selectCallBack: (orderObj: any) => {
            ///更新列表
            let tempList=updateSpareRowValueWithType(orderObj.code, SpareOutStoreRowType.relateOrderNo, props.newDataInfo);
            props.saveNewPareOutStoreDataInfo(tempList);
            ///更新入参
            let submitInput=props.submitInput;
            submitInput.associatedVoucher=orderObj.code;
            props.submitInputSave({ ...submitInput });
          }
        }
      })
    }
  }
  /**
   * 获取用途类型
   * @param use
   */
  const getUseTypeWithName=(use: string) => {
    let useType=SpareOutUseType.maintain;
    if (use=='保养') {
      useType=SpareOutUseType.maintain;
    } else if (use=='维修') {
      useType=SpareOutUseType.repair;
    } else if (use=='耗材更换') {
      useType=SpareOutUseType.consumables;
    }
    return useType;
  }

  /**
   * 备注输入回调
   */
  const remarkTextChange=(text: string) => {
    let submitInput=props.submitInput;
    submitInput.remark=text;
    props.submitInputSave({ ...submitInput });
  }

  /**
   * 选择添加备件
   */
  const selectAddSpare=() => {
    let submitInput=props.submitInput;
    if (isEmptyString(submitInput.classroomId)) {
      SndToast.showTip('请选择课室');
      return;
    }

    if (checkOutStoreIsHasNoSave(props.newDataInfo)) {
      SndToast.showTip('请先保存备件出库信息再添加');
      return;
    }

    let classroomId=submitInput.classroomId;
    let systemIds=[];
    if (submitInput.ownershipSystemId==null) {
      systemIds=getSystemCodesFromDepartmentCodes(classroomId).ids;

    } else {
      systemIds=[submitInput.ownershipSystemId];
    }

    let selects=submitInput.detailList;
    props.navigator.push({
      id: 'Select_SpareList',
      component: SelectSpareList,
      passProps: {
        selectedSpares: selects,
        classroomId: classroomId,
        ownershipSystemId: systemIds,
        selectedCallBack: (spares: any[]) => {
          ///更新列表
          let info=updateSpareInfo(spares, props.newDataInfo);
          props.saveNewPareOutStoreDataInfo(info);
          // ///更新入参
          let input=props.submitInput;
          input.detailList=spares;
          props.submitInputSave({ ...input });
        }
      }
    })
  }

  /**
   * 出库数量变化
   * @param text
   * @param msgData
   */
  const onTextChange=(text: string, msgData: SpareOutStoreSpareMsgData) => {
    let info=updateSpareOutStoreCount(props.newDataInfo, text, msgData);
    props.saveNewPareOutStoreDataInfo(info);
  }

  /**
   * 保存按钮点击
   * @param msgData
   */
  const onPressSave=(msgData: SpareOutStoreSpareMsgData) => {
    let info=changeAddSpareOutStoreStatus(props.newDataInfo, SpareOutStoreStatus.edit, msgData);
    props.saveNewPareOutStoreDataInfo(info);
  }

  /**
   * 取消按钮点击
   * @param msgData
   * @param status
   */
  const onPressCancel=(msgData: SpareOutStoreSpareMsgData, status: SpareOutStoreStatus) => {
    let info=changeAddSpareOutStoreCancelAction(props.newDataInfo, status, msgData);
    props.saveNewPareOutStoreDataInfo(info);
  }
  /**
   * 编辑按钮点击
   * @param msgData
   */
  const onPressEdit=(msgData: SpareOutStoreSpareMsgData) => {
    let info=changeAddSpareOutStoreStatus(props.newDataInfo, SpareOutStoreStatus.editing, msgData);
    props.saveNewPareOutStoreDataInfo(info);
  }

  /**
   * 删除按钮点击
   * @param msgData
   */
  const onPressDelete=(msgData: SpareOutStoreSpareMsgData) => {
    ///更新列表
    let info=deleteSpareOutStore(props.newDataInfo, msgData);
    props.saveNewPareOutStoreDataInfo(info);
    ///更新入参
    let detailList=props.submitInput.detailList;
    props.submitInput.detailList=detailList.filter((item: SpareOutStoreSpareMsgData) => {
      return item.id!=msgData.id;
    });
    props.submitInputSave({ ...props.submitInput });
  }


  const renderItem=(itemObj: any) => {
    if (itemObj.sectionType==SpareOutStoreHouseItemType.basicMsg) {
      return SpareOutStoreAddBasicItem({
        ...itemObj,
        expandCallBack,
        dropdownOnSelect,
        actionCallBack,
        remarkTextChange
      });
    } else if (itemObj.sectionType==SpareOutStoreHouseItemType.spareInfo) {
      return SpareOutStoreSpareMsgItem({
        ...itemObj,
        onPressAdd: selectAddSpare,
        onPressCancel,
        onPressSave,
        onPressEdit,
        onTextChange,
        onPressDelete,
      });
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar
        title={'备件出库'}
        navIcon="back"
        onIconClicked={onPopBack}
      />
      <FlatList data={props.newDataInfo}
        keyExtractor={(item) => item.title}
        // @ts-ignore
        renderItem={(item) => renderItem(item.item)} />
      {configBottomAction()}
    </View>
  )
}

const mapStateToProps=(state: any) => {
  let spareOutStore=state.spareOutStore.spareOutStoreNewReducer;
  let user=state.user.toJSON().user;
  return {
    user: user,
    ticketNo: spareOutStore.ticketNo,
    use: spareOutStore.use,
    newDataInfo: spareOutStore.newDataInfo,
    submitInput: spareOutStore.submitInput,
    spareOutStoreSubmitRequestStatus: spareOutStore.spareOutStoreSubmitRequestStatus,
  }
}


export default connect(mapStateToProps, {
  saveNewPareOutStoreDataInfo,///展示的模型数组
  getWarehouseTicketNo,   ///获取出库单号
  getDeviceDictionary,    ///获取用途
  submitInputSave,    ///提交出库 入参保存
  submitSpareOutStore,///完成提交请求
  spareOutStoreAddDestroyClear,   ///销毁清除
})(NewSpareOutStore);
