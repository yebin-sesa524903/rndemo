import React from "react";
import {Alert, FlatList, InteractionManager, ScrollView, View} from "react-native";
import {connect} from "react-redux";
import Toolbar from "../../../../../components/Toolbar.android";
import Colors from "../../../../../utils/const/Colors";
import {
  InventoryStatus,
  SpareRepertoryItemType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {
  inventorySubmit,
  loadSpareRepertoryDetail, saveDraft, saveInventoryIndex, spareRepertoryDetailDestroyClear,
  spareRepertoryDetailInfoDataSave, startExecute, updateInventoryStatus
} from "../../../../../actions/spareRepertory/spareRepertoryAction";
import {
  AbnormalBasicMsgItem,
  AbnormalBasicMsgItemProps
} from "../../../../../components/fmcs/plantOperation/abnormal/detail/AbnormalBasicMsgItem";
import SpareRepertoryList, {
  SpareRepertoryStatus
} from "../../../../../components/fmcs/plantOperation/spareRepertory/detail/SpareRepertoryList";
import {
  changeInventoryResult,
  changeInventoryStatus,
  checkHasNoSaveRecords,
  checkNoInventoryResults,
  configSaveDraftParams,
  configSpareRepertoryDataInfo,
  configSubmitParams,
  getCancelBeforeInventoryCount,
  updateSpareRepertoryDepartmentAndSystemCode
} from "./SpareRepertoryHelper";
import {RequestStatus} from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import ViewDetailScreen from "../../../viewDetail/ViewDetailScreen";

function SpareRepertoryDetail(props: any) {

  React.useEffect(() => {
    loadSpareRepertory();
  }, []);

  const loadSpareRepertory = () => {
    props.loadSpareRepertoryDetail({id: props.id, customerId: props.customerId});
  }

  React.useEffect(() => {
    if (Object.keys(props.spareRepertoryDetail).length > 0) {
      SndToast.dismiss();
      let info = configSpareRepertoryDataInfo(props.spareRepertoryDetail, props.spareRepertoryDataInfo, props.inventoryStatus);
      let detail = updateSpareRepertoryDepartmentAndSystemCode(props.spareRepertoryDetail, props.departmentCodes, info)
      props.spareRepertoryDetailInfoDataSave(detail);
      if (props.spareRepertoryDetail.executionStatus == 'FINISHED') {
        setTimeout(() => {
          props.saveInventoryIndex(1);
        }, 1000)
      }
    }else {
      SndToast.showLoading();
    }
  }, [props.spareRepertoryDetail, props.inventoryStatus]);

  React.useEffect(() => {
    if (props.inventoryRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.inventoryRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('保存成功');
      loadSpareRepertory();
    } else if (props.inventoryRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.inventoryRequestStatus]);


  React.useEffect(() => {
    if (props.inventorySubmitRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.inventorySubmitRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      onPopBack();
      props.refreshCallBack && props.refreshCallBack();
    } else if (props.inventorySubmitRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.inventorySubmitRequestStatus]);

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      props.spareRepertoryDetailDestroyClear();
      SndToast.dismiss();
    }
  }, []);

  /**
   * 展开收起点击
   * @param type
   */
  const onPressExpand = (type: SpareRepertoryItemType) => {
    const dataSource = props.spareRepertoryDataInfo;
    for (let element of dataSource) {
      if (element.sectionType == type) {
        element.isExpand = !element.isExpand;
        break;
      }
    }
    props.spareRepertoryDetailInfoDataSave([...dataSource]);
  }


  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  /**
   * 完成提交按钮点击
   */
  const onPressSubmit = () => {
    ///1.先检查是否有未输入盘点结果的盘点项,并给出提示
    let hasNoInventoryRes = checkNoInventoryResults(props.spareRepertoryDataInfo);
    if (hasNoInventoryRes) {
      SndToast.showTip('盘点结果不能为空,无备件请输入0');
      return;
    }
    ///2.提示对话框
    Alert.alert('', '提交之后将生成盘库报告，所有盘点结果均不可修改，确认提交？', [
      {
        text: '取消',
      },
      {
        text: '确定',
        onPress: () => {
          let params = configSubmitParams(props.spareRepertoryDetail.id, props.spareRepertoryDataInfo, props.inventoryStatus);
          props.inventorySubmit(params);
        }
      }
    ])

  }

  const configBottomAction = () => {
    if (props.spareRepertoryDetail.executionStatus != 'FINISHED') {
      return (
        <BottleDetailActionView actions={[
          {
            title: '完成提交',
            textColor: Colors.white,
            onPressCallBack: onPressSubmit,
            btnStyle: {marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme}
          }
        ]}/>
      )
    }
  }


  /**
   * 头部切换 待盘点/已完成
   * @param item
   */
  const onSwitchItem = (item: any) => {
    props.saveInventoryIndex(item.value);
  }

  /**
   * 开始盘点点击
   */
  const onPressStart = () => {
    if (props.spareRepertoryDetail.executionStatus == 'NOT_STARTED' && props.inventoryStatus != InventoryStatus.inventorying) {
      props.startExecute({id: props.spareRepertoryDetail.id});
    } else {
      if (props.inventoryStatus == InventoryStatus.initial) {
        props.updateInventoryStatus(InventoryStatus.inventorying);
      }
    }
  }

  /**
   * 保存按钮点击
   */
  const onPressSave = () => {
    let params = configSaveDraftParams(props.spareRepertoryDetail.id, props.spareRepertoryDataInfo);
    props.saveDraft(params);
  }

  /**
   * 盘点结果文字变化
   * @param text
   * @param id
   * @param isComplete
   */
  const onResultTextChange = (text: string, id: number, isComplete: boolean) => {
    let info = changeInventoryResult(text, id, isComplete, props.spareRepertoryDataInfo);
    props.spareRepertoryDetailInfoDataSave(info);
  }

  /**
   * 取消按钮点击
   */
  const onPressCancel = (id: number, isComplete: boolean) => {
    ///获取取消之前的 盘点数量
    let count = getCancelBeforeInventoryCount(props.spareRepertoryDetail, id);
    ///更新盘点状态
    let info = changeInventoryStatus(id, isComplete, props.spareRepertoryDataInfo, SpareRepertoryStatus.edit);
    ///更新盘点数量
    let newInfo = changeInventoryResult(String(count), id, isComplete, info);
    props.spareRepertoryDetailInfoDataSave(newInfo);
  }

  /**
   * 编辑按钮点击
   */
  const onPressEdit = (id: number, isComplete: boolean) => {
    ///先保存其他的 编辑项
    if (checkHasNoSaveRecords(props.spareRepertoryDataInfo)) {
      SndToast.showTip('请先保存正在编辑的盘点记录');
      return;
    }
    let info = changeInventoryStatus(id, isComplete, props.spareRepertoryDataInfo, SpareRepertoryStatus.editing);
    props.spareRepertoryDetailInfoDataSave(info);
  }

  /**
   * 查看明细
   * @param obj
   */
  const onPressViewDetail = (obj: AbnormalBasicMsgItemProps) => {
    props.navigator.push({
      id: 'View_Detail_Screen',
      component: ViewDetailScreen,
      passProps: {
        title: obj.remarkTitle,
        remark: obj.remark,
      }
    })
  }

  /**
   * render item
   * @param itemObj
   */
  const configSpareRepertoryItem = (itemObj: any) => {
    if (itemObj.sectionType == SpareRepertoryItemType.baseInfo) {
      return AbnormalBasicMsgItem({...itemObj, expandCallBack: onPressExpand, onPressViewDetail})
    } else if (itemObj.sectionType == SpareRepertoryItemType.spareList) {
      return SpareRepertoryList({
        ...itemObj,
        inventoryIndex: props.inventoryIndex,
        expandCallBack: onPressExpand,
        onSwitchItem: onSwitchItem,
        onPressStart: onPressStart,
        onPressSave: onPressSave,
        onPressEdit: onPressEdit,
        onPressCancel: onPressCancel,
        onResultTextChange: onResultTextChange,
      });
    }
    return <View/>
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar
        title={'备件盘点'}
        navIcon="back"
        onIconClicked={onPopBack}/>
      <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
        <FlatList data={props.spareRepertoryDataInfo}
                  contentContainerStyle={{
                    paddingBottom: 20
                  }}
                  renderItem={(item) => configSpareRepertoryItem(item.item)}
                  keyExtractor={(item, index) => item.title}/>
        {configBottomAction()}
      </View>
    </View>
  )
}

const mapStateToProps = (state: any) => {
  let spareRepertory = state.spareRepertory.spareRepertoryDetailReducer;
  return {
    spareRepertoryDetail: spareRepertory.spareRepertoryDetail,  ///详情接口返回
    spareRepertoryDataInfo: spareRepertory.spareRepertoryDataInfo,///盘点业务模型数组
    inventoryStatus: spareRepertory.inventoryStatus,///盘点状态  还未开始盘点/盘点中/盘点结束
    inventoryRequestStatus: spareRepertory.inventoryRequestStatus,///盘点请求状态
    inventoryIndex: spareRepertory.inventoryIndex,  ///盘点表  待盘点/已完成 index
    inventorySubmitRequestStatus: spareRepertory.inventorySubmitRequestStatus,///完成提交请求 状态
  }
}

export default connect(mapStateToProps, {
  loadSpareRepertoryDetail,
  spareRepertoryDetailInfoDataSave,
  updateInventoryStatus,
  startExecute,
  saveDraft,
  saveInventoryIndex,
  inventorySubmit,
  spareRepertoryDetailDestroyClear,
})(SpareRepertoryDetail)
