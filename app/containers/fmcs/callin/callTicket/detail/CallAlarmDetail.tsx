import React from "react";
import { FlatList, InteractionManager, View } from "react-native";
import { connect } from "react-redux";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {
  callInDetailDestroyClear,
  callInOrderSaveInput, imageReviewInfoSave,
  loadTicketDetail,
  loadDeviceDetail,
  orderSave,
  saveAlarmDetailDataInfo,
} from "../../../../../actions/callin/callInAction";
import {
  CallInTicketItemType,
  configCallAlarmDataInfo,
  findCanEditOrderList,
} from "./CallInHelper";
import {
  CallInOrderItem,
  CallInOrderMsg,
  CallInOrderPicture
} from "../../../../../components/fmcs/callin/callTicket/CallInOrderMsg";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import { RequestStatus } from "../../../../../middleware/api";
import ViewDetailScreen from "../../../viewDetail/ViewDetailScreen";
import { AlarmDetailBasicInfo } from "../../../../../components/fmcs/callin/callTicket/AlarmDetailBasicInfo";
import { isEmptyString } from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";
import moment from "moment/moment";
import ImagePicker from "../../../../ImagePicker";
import ImageView from "react-native-image-viewing";


function CallAlarmDetail(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }
  React.useEffect(() => {
    loadCallInDetail();
  }, [])

  const loadCallInDetail = () => {
    let params = { orderId: props.orderId }
    props.loadTicketDetail(params)
  }
  React.useEffect(() => {
    if (Object.keys(props.responseDetail).length > 0 && props.responseDetail.deviceId) {
      props.loadDeviceDetail(props.responseDetail.deviceId);
    }
  }, [props.responseDetail.deviceId])

  React.useEffect(() => {
    if (Object.keys(props.responseDetail).length > 0 && Object.keys(props.responseDeviceDetail).length > 0) {
      configCallAlarmDataInfo(props.responseDetail, props.responseDeviceDetail, props.callAlarmDataInfo, props.departments, props.user.userHierarchyPath).then((info) => {
        props.saveAlarmDetailDataInfo(info);
        /**
         * 获取详情成功后 将保存工单入参赋值
         */
        let order = findCanEditOrderList(info);
        if (order && order.orderId && order.subOrderId){
          let input = props.orderSaveInput;
          input.orderId = order.orderId;
          input.subOrderId = order.subOrderId;
          input.content = order.content;
          if (order.files){
            input.files = order.files;
          }
          props.callInOrderSaveInput({...input});
        }
      });
    }
  }, [props.responseDetail, props.responseDeviceDetail])

  React.useEffect(() => {
    if (props.orderSaveInput.dateTime) {
      props.orderSave(props.orderSaveInput);
    }
  }, [props.orderSaveInput.dateTime])

  React.useEffect(() => {
    if (props.orderSaveRequestStatus == RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.orderSaveRequestStatus == RequestStatus.success) {
      SndToast.dismiss();
      if (props.orderSaveInput.isSave) {
        onPopBack();
        props.refreshListCallBack && props.refreshListCallBack();
      } else {
        SndToast.showSuccess('暂存成功', () => {
          loadCallInDetail()
        })
      }
    } else if (props.orderSaveRequestStatus == RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.orderSaveRequestStatus])

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      props.callInDetailDestroyClear();
    }
  }, [])

  /**
   * 展开/收起 点击
   * @param sectionType
   */
  const onPressExpend = (sectionType: CallInTicketItemType) => {
    const dataSource = props.callAlarmDataInfo;
    for (let dataSourceElement of dataSource) {
      if (dataSourceElement.sectionType == sectionType) {
        dataSourceElement.isExpand = !dataSourceElement.isExpand;
        break;
      }
    }
    props.saveAlarmDetailDataInfo([...dataSource]);
  }

  /**
   * 查看明细
   * @param title
   * @param content
   */
  const onPressSeeMore = (title: string, content: string) => {
    props.navigator.push({
      id: 'View_Detail_Screen',
      component: ViewDetailScreen,
      passProps: {
        title: title,
        remark: content,
      }
    })
  }

  /**
   * 课室处理内容变更
   * @param text
   */
  const contentTextChangeCallBack = (text: string) => {
    let input = props.orderSaveInput;
    input.content = text;
    props.callInOrderSaveInput({ ...input });
  }

  /**
   * 添加图片
   */
  const addImageCallBack = (item: CallInOrderItem) => {
    let imageLength = (item.pictures?.length) ?? 0;
    props.navigator.push({
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 5 - imageLength,
        dataChanged: (chosenImages: any[]) => {
          didPickerImage(chosenImages, item)
        }
      }
    });
  }

  /**
   * 刷新列表上传图片
   * @param images
   * @param item
   */
  const didPickerImage = (images: any[], item: CallInOrderItem) => {
    let tempData: CallInOrderPicture[] = [];
    for (let image of images) {
      tempData.push(
        {
          uri: image.uri,
          name: image.filename,
          subOrderId: item.subOrderId,
          needUpload: true,
          canRemove: false,
          uploadComplete: imageUploadComplete,
        }
      )
    }
    item.pictures = item.pictures?.concat(tempData);
    props.saveAlarmDetailDataInfo([...props.callAlarmDataInfo]);
  }

  /**
   * 图片上传成功 回调
   * @param response
   * @param item
   */
  const imageUploadComplete = (response: any, item: CallInOrderItem) => {
    if (response && response.retData) {
      let retData = response.retData;
      if (retData.errArray && retData.errArray.length == 0) {
        ///获取成功
        if (retData.fileArray) {
          ///给入参赋值
          let input = props.orderSaveInput;
          input.files = [...input.files, ...retData.fileArray];
          props.callInOrderSaveInput({ ...input });

          ///刷新列表
          for (let picture of item.pictures!) {
            let founded = false;
            for (const file of retData.fileArray) {
              if (file.name == picture.name) {
                picture.file = file.file;
                founded = true;
                break;
              }
            }
            if (founded) {
              picture.needUpload = false;
              picture.canRemove = true;
            }
          }
          props.saveAlarmDetailDataInfo([...props.callAlarmDataInfo]);
        }
      }
    }
  }

  /**
   * 删除图片
   */
  const removeImageCallBack = (image: CallInOrderPicture, item: CallInOrderItem) => {
    ///刷新列表
    item.pictures?.forEach((item, index, array) => {
      if (item.file == image.file) {
        array.splice(index, 1);
      }
    })
    props.saveAlarmDetailDataInfo([...props.callAlarmDataInfo]);
    ///修改入参
    let input = props.orderSaveInput;
    let tempArray = [];
    for (let file of input.files) {
      if (file.name == image.name && file.file == image.file) {
        continue
      }
      tempArray.push(file);
    }
    input.files = tempArray;
    props.callInOrderSaveInput({ ...input });
  }
  /**
   * 放大图片
   */
  const previewImageAction = (index: number, item: CallInOrderItem) => {
    let uris = []
    for (let image of item.pictures!) {
      uris.push({ uri: image.uri });
    }
    props.imageReviewInfoSave({ visible: true, index: index, images: uris })
  }

  /**
   * 图片浏览器 大图浏览
   */
  const renderImageViewing = () => {
    return (
      <ImageView
        images={props.imageReview.images}
        imageIndex={props.imageReview.index}
        visible={props.imageReview.visible}
        onRequestClose={() => props.imageReviewInfoSave({ visible: false, index: 0, images: [] })}
      />
    )
  }

  const renderItem = (detail: any) => {
    if (detail.sectionType == CallInTicketItemType.basicMsg) {
      return AlarmDetailBasicInfo({ ...detail, expandCallBack: onPressExpend, onPressDetail: onPressSeeMore });
    } else if (detail.sectionType == CallInTicketItemType.orderMsg) {
      return CallInOrderMsg({
        ...detail,
        expandCallBack: onPressExpend,
        contentTextChangeCallBack,
        onPressSeeMore,
        addImageCallBack,
        removeImageCallBack,
        previewImageAction,
      });
    }
    return <></>
  }


  /**
   * 点击暂存/完成
   * @param isSave
   */
  const orderSaveAction = (isSave?: boolean) => {
    let input = props.orderSaveInput;
    if (isEmptyString(input.content)) {
      SndToast.showTip('请填写课室处理内容');
      return;
    }
    let order = findCanEditOrderList(props.callAlarmDataInfo);
    input.orderId = order.orderId;
    input.subOrderId = order.subOrderId;
    input.isSave = isSave;
    input.dateTime = moment(new Date());
    props.callInOrderSaveInput({ ...input });
  }

  /**
   * 底部按钮
   */
  const renderBottomActions = () => {
    if (props.responseDetail && Object.keys(props.responseDetail).length > 0) {
      let founded = findCanEditOrderList(props.callAlarmDataInfo);
      if (founded && props.responseDetail.state == 3) {
        ///工单信息里有当前登录人课室处理信息 且 待执行才有保存按钮
        return (
          <BottleDetailActionView actions={[
            {
              title: '暂存',
              textColor: Colors.theme,
              btnStyle: { marginLeft: 30, marginRight: 12, flex: 1 },
              onPressCallBack: () => {
                orderSaveAction(undefined);
              },
            },
            {
              title: '完成',
              textColor: Colors.white,
              onPressCallBack: () => {
                orderSaveAction(true);
              },
              btnStyle: { marginRight: 30, flex: 1, backgroundColor: Colors.theme }
            }
          ]} />
        )
      }
    }

  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar title={'报警工单详情'} navIcon="back" onIconClicked={onPopBack} />
      <FlatList data={props.callAlarmDataInfo} keyExtractor={(item, index) => item.title}
        renderItem={(item) => renderItem(item.item)} />
      {renderBottomActions()}
      {renderImageViewing()}
    </View>
  )
}

const mapStateToProps = (state: any) => {
  let callIn = state.callIn.CallInDetailReducer;
  const user = state.user.toJSON();
  return {
    user: user,
    responseDetail: callIn.responseDetail,
    callAlarmDataInfo: callIn.callAlarmDataInfo,
    responseDeviceDetail: callIn.responseDeviceDetail,
    orderSaveInput: callIn.orderSaveInput,///工单保存入参
    orderSaveRequestStatus: callIn.orderSaveRequestStatus,

    ///图片预览所需数据
    imageReview: callIn.imageReview,
  }
}

export default connect(mapStateToProps, {
  loadTicketDetail,///获取工单详情
  loadDeviceDetail,
  saveAlarmDetailDataInfo,///业务模型保存
  callInOrderSaveInput, ///工单保存入参
  orderSave,///工单保存
  imageReviewInfoSave,  ///图片预览数据
  callInDetailDestroyClear
})(CallAlarmDetail)
