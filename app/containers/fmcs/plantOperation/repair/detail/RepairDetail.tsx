import React from "react";
import { connect } from "react-redux";
import { Alert, InteractionManager, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import { isEmptyString, screenWidth } from "../../../../../utils/const/Consts";
import {
  MaintainContainerView
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainContainerView";
import { RepairBasic } from "../../../../../components/fmcs/plantOperation/repair/detail/RepairBasic";
import {
  fileModuleCode,
  RepairDetailItemType,
  RepairStatus
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
  loadDetailRepairList,
  loadRepairBasicDetail,
  loadRepairImages,
  repairDetailDestroyClear,
  repairDetailSubmit,
  saveReceivingToolsData,
  saveRepairBasicMsg,
  saveRepairDetailSaveRepairListInput,
  saveSparePartsReplacementData,
  saveTaskRepairList,
} from "../../../../../actions/repair/repairAction";
import { MaintainReplacement } from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainReplacement";
import {
  bindClassAndSystemCode,
  checkHasNoSaveRecord,
  configRepairAbnormalImages,
  configRepairPictures,
  convertBasicMessage
} from "./RepairInitalStatus";
import { RequestStatus } from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import {
  loadChangeSparePart,
  loadToolItems,
  removeSparePartItem,
  removeToolUseItem
} from "../../../../../actions/spareTools/apareToolsAction";
import { convertReceivingTools, convertSpareParts } from "../../maintain/detail/MaintainStateHelper";
import MaintainToolList from "../../maintain/detail/MaintainToolList";
import MaintainOutboundOrderList from "../../maintain/detail/MaintainOutboundOrderList";
import {
  fileDestroyClear,
  fileListDelete,
  filePreviewVisible,
  getDeviceFileList
} from "../../../../../actions/fileList/fileListAction";
import ImagePicker from "../../../../ImagePicker";
import ImageView from "react-native-image-viewing";
import { debounce } from "../../../../../utils";
import NewSpareOutStore from "../../spareOutStoreHouse/new/NewSpareOutStore";

/**
 * 维修详情
 * @param props
 * @constructor
 */
function RepairDetail(props: any) {

  React.useEffect(() => {
    loadRepairDetailInformation();
    loadToolItems();
    loadSparePartItems();
    loadDetailFileList();
  }, []);

  /**
   * 获取维修详情需要展示的数据
   */
  const loadRepairDetailInformation=() => {
    props.loadRepairBasicDetail({ id: props.id, customerId: props.customerId });
    props.loadDetailRepairList({ taskId: props.id });
  }

  /**
   * 监听详情数据请求 展示
   */
  React.useEffect(() => {
    if (Object.keys(props.responseBasic).length>0&&props.responseRepairList) {
      SndToast.dismiss();
      let basicMsg=convertBasicMessage(props.responseBasic, props.responseRepairList, props.basicMsgData, props.currentUser.Id, props.executorNames);
      props.saveRepairBasicMsg([...basicMsg]);
    } else {
      SndToast.showLoading();
    }

    if (props.responseRepairList&&Object.keys(props.responseRepairList).length>0&&!isEmptyString(props.responseRepairList.taskId)) {
      ///维修记录有值 将保存维修记录 入参赋值
      props.saveRepairDetailSaveRepairListInput(props.responseRepairList);
    }
  }, [props.responseBasic, props.responseRepairList])

  /**
   * 监听保存维修记录请求状态
   */
  React.useEffect(() => {
    if (props.saveRepairRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.saveRepairRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      loadRepairDetailInformation();
    } else if (props.saveRepairRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.saveRepairRequestStatus]);


  /**
   * 完成提交请求状态
   */
  React.useEffect(() => {
    if (props.submitRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.submitRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('提交成功', () => {
        onPopBack();
        props.refreshCallBack&&props.refreshCallBack();
      })
    } else if (props.submitRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.submitRequestStatus]);

  /**
   * fileAttribute 有值 需要从40000000+deviceId 获取图片
   */
  React.useEffect(() => {
    if (Object.keys(props.responseBasic).length>0) {
      props.loadRepairImages(fileModuleCode.repairWorkOrderDeviceImg+props.responseBasic.deviceId);
    }
  }, [props.responseBasic])

  /**
   * 监听维修异常图片获取
   */
  React.useEffect(() => {
    let basicData=configRepairAbnormalImages(props.basicMsgData, props.repairImages, props.responseBasic.fileAttribute);
    props.saveRepairBasicMsg(basicData);
  }, [props.repairImages]);

  /**
   * 获取图片/文件列表
   */
  const loadDetailFileList=() => {
    props.getDeviceFileList(fileModuleCode.repairWorkOrder+props.id);
  }

  /**
   * 监听文件获取
   */
  React.useEffect(() => {
    let basicData=configRepairPictures(props.basicMsgData, props.images);
    props.saveRepairBasicMsg(basicData);
  }, [props.images]);

  /**
   * 监听文件删除请求状态
   */
  React.useEffect(() => {
    if (props.fileListDeleteRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.fileListDeleteRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      ///刷新列表
      loadDetailFileList();
    } else if (props.fileListDeleteRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.fileListDeleteRequestStatus]);

  /**
   * 监听课室/系统code请求结果
   */
  React.useEffect(() => {
    if (props.departmentCodes.length>0&&Object.keys(props.responseBasic).length>0) {
      let info=bindClassAndSystemCode(props.responseBasic, props.departmentCodes, props.basicMsgData);
      props.saveRepairBasicMsg([...info]);
    }
  }, [props.departmentCodes, props.responseBasic]);

  /**
   * 页面销毁操作
   */
  React.useEffect(() => {
    return () => {
      props.repairDetailDestroyClear();
      props.fileDestroyClear();
      SndToast.dismiss();
    }
  }, []);

  /**
   * 获取详情关联的领用工具
   */
  const loadToolItems=() => {
    props.loadToolItems({ taskId: fileModuleCode.maintenanceTask+props.id });
  }
  /**
   * 监听工具领用关联详情数据
   */
  React.useEffect(() => {
    let tools=convertReceivingTools(props.toolItems);
    props.saveReceivingToolsData(tools);
  }, [props.toolItems]);

  /**
   * 监听移除工具领用请求
   */
  React.useEffect(() => {
    if (props.removeToolRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.removeToolRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      ///刷新列表
      loadToolItems();
    } else if (props.removeToolRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.removeToolRequestStatus]);

  /**
   * 获取详情关联的 备件更换
   */
  const loadSparePartItems=() => {
    props.loadChangeSparePart({ "code": props.code, "use": "维修" });
  }

  /**
   * 监听备件更换关联详情数据
   */
  React.useEffect(() => {
    let spareParts=convertSpareParts(props.sparePartItems);
    props.saveSparePartsReplacementData(spareParts);
  }, [props.sparePartItems]);

  /**
   * 监听移除备件领用请求
   */
  React.useEffect(() => {
    if (props.removeSparePartRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.removeSparePartRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      ///刷新列表
      loadSparePartItems();
    } else if (props.removeSparePartRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.removeSparePartRequestStatus]);

  /**
   * 返回按钮点击
   */
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const scrollContentRef=React.useRef<ScrollView>(null);

  /**
   * 外层展开收起点击
   */
  const onPressExpand=(sectionType: RepairDetailItemType) => {
    debounce(() => {
      const dataSource=props.basicMsgData;
      for (let element of dataSource) {
        if (element.sectionType==sectionType) {
          element.isExpand=!element.isExpand;
          break;
        }
      }
      props.saveRepairBasicMsg([...dataSource]);
    })
  }

  /**
   * 头部切换点击
   * @param headerObj
   */
  const onHeaderSwitch=(headerObj: { title: string, value: number }) => {
    scrollContentRef.current?.scrollTo(
      {
        x: screenWidth()*headerObj.value,
        y: 0,
        animated: true,
      }
    )
  }
  /**
   * 关联备件出库单点击
   */
  const replacementCallBack=() => {
    props.navigator.push({
      id: 'Maintain_Outbound_Order_List',
      component: MaintainOutboundOrderList,
      passProps: {
        departmentCode: props.responseBasic.departmentCode,
        systemCode: props.responseBasic.systemCode,
        code: props.responseBasic.code,
        deviceId: props.responseBasic.deviceId,
        use: '维修',
        refreshCallBack: () => {
          loadSparePartItems();
        }
      }
    })
  }

  /**
   * 创建备件出库单点击
   */
  const createCallBack=() => {
    props.navigator.push(
      {
        id: 'New_SpareOutStore',
        component: NewSpareOutStore,
        passProps: {
          repairDetail: props.responseBasic,
          fromUse: '保养',
          refreshCallBack: () => {
            ///操作完成之后,回到列表刷新
            loadSparePartItems();
          }
        },
      }
    )
  }

  /**
   * 备件更换移除按钮点击
   */
  const replacementRemoveCallBack=(item: any) => {
    Alert.alert('确定要移除', `确定要移除"${item.outboundNo}"吗?`, [
      {
        text: '取消',
      },
      {
        text: '确定',
        onPress: () => {
          let params={
            code: props.responseBasic.code,
            warehouseExitIds: [item.id],
            use: '维修'
          };
          props.removeSparePartItem(params);
        }
      }
    ]);
  }

  /**
   * 关联领用工具单点击
   */
  const toolCallBack=() => {
    props.navigator.push({
      id: 'Maintain_Tool_List',
      component: MaintainToolList,
      passProps: {
        taskId: fileModuleCode.maintenanceTask+props.responseBasic.id,
        refreshCallBack: () => {
          loadToolItems();
        }
      }
    })
  }

  /**
   * 删除领用工具点击回调
   */
  const toolRemoveCallBack=(item: any) => {
    Alert.alert('确定要移除', `确定要移除"${item.outboundNo}"吗?`, [
      {
        text: '取消',
      },
      {
        text: '确定',
        onPress: () => {
          let params={ taskId: item.taskId, toolUsageId: item.id };
          props.removeToolUseItem(params);
        }
      }
    ]);
  }

  /**
   * 完成按钮
   */
  const renderComplete=() => {
    if (isShowSubmit()) {
      return (
        <Pressable style={styles.pressContainer}
          onPress={onPressComplete}>
          <Text style={styles.pressText}>完成提交</Text>
        </Pressable>
      )
    }

  }

  /**
   * 是否展示已完成按钮
   */
  const isShowSubmit=() => {
    return (props.responseBasic.status!='已完成')&&!repairIsPending()&&(props.responseBasic.executorIds?.indexOf(props.currentUser.Id)!=-1);
  }

  /**
   * 是否是待审批
   */
  const repairIsPending=() => {
    if (Object.keys(props.responseBasic).length>0) {
      return (props.responseBasic.status=='待审批');
    } else {
      return false;
    }
  }

  /**
   * 完成提交点击
   */
  const onPressComplete=() => {
    let input=props.addRecordsInput;
    if (input.list.length==0) {
      SndToast.showTip('请先添加维修记录');
      return;
    }
    let hasNoIdRecord=checkHasNoIdRecord(input.list);
    if (hasNoIdRecord) {
      SndToast.showTip('请先保存维修记录再提交');
      return;
    }
    if (checkHasNoSaveRecord(props.basicMsgData)) {
      SndToast.showTip('请先保存维修记录,再提交');
      return;
    }
    props.repairDetailSubmit({ taskId: props.responseBasic.id });
  }

  ///维修记录点击事件回调
  /**
   * 故障现象
   * @param text
   */
  const faultPhenomenonTextChange=(text: string) => {
    let input=props.addRecordsInput;
    input.faultPhenomenon=text;
    props.saveRepairDetailSaveRepairListInput({ ...input });
  }
  /**
   * 故障原因
   * @param text
   */
  const faultCauseTextChange=(text: string) => {
    let input=props.addRecordsInput;
    input.faultCause=text;
    props.saveRepairDetailSaveRepairListInput({ ...input });
  }

  /**
   * 添加维修记录
   */
  const addRecordCallBack=() => {
    if (checkHasNoSaveRecord(props.basicMsgData)) {
      SndToast.showTip('请先保存维修记录再添加');
      return;
    }
    let basicMsg=props.basicMsgData;
    for (let basic of basicMsg) {
      if (basic.sectionType==RepairDetailItemType.repairRecords) {
        if (basic.records.length==0) {
          basic.repairStatus=RepairStatus.addNoRecords;
        } else {
          basic.repairStatus=RepairStatus.addHasRecordsHasInput;
        }
        basic.repairRecord=undefined;
      }
    }
    props.saveRepairBasicMsg([...basicMsg]);
  }

  /**
   * 保存维修记录
   */
  const saveRecordCallBack=() => {
    let input=props.addRecordsInput;
    if (isEmptyString(input.faultPhenomenon)) {
      SndToast.showTip('请填写故障现象');
      return;
    }
    if (isEmptyString(input.faultCause)) {
      SndToast.showTip('请填写故障原因');
      return;
    }
    input.taskId=props.responseBasic.id;
    props.saveTaskRepairList(input);
  }

  /**
   * 取消添加记录
   */
  const cancelCallBack=(id?: string) => {
    if (isEmptyString(id)) {
      let basicMsg=props.basicMsgData;
      for (let basic of basicMsg) {
        if (basic.sectionType==RepairDetailItemType.repairRecords) {
          if (basic.records.length==0) {
            basic.repairStatus=RepairStatus.initial;
          } else {
            basic.repairStatus=RepairStatus.addHasRecordsNoInput;
          }
        }
      }
      props.saveRepairBasicMsg([...basicMsg]);
    } else {
      loadRepairDetailInformation();
    }
  }

  /**
   * 维修项目 文字变化
   */
  const repairTaskTextChange=(text: string, id?: string) => {
    let input=props.addRecordsInput;
    if (input.list.length==0) {
      let listObj={
        taskId: props.responseBasic.id,
        name: text,
      }
      input.list=[listObj];
    } else {
      ///1.新增记录时 还未保存 先输入的维修项目 这时候id没有值
      ///2.已经有一条记录 后面再新增记录时 这时候还没有id
      ///3.已存在一条记录,在这条记录基础上做的修改
      let hasNoIdRecord=checkHasNoIdRecord(input.list);
      let idIsEmpty=isEmptyString(id);
      if (!hasNoIdRecord&&idIsEmpty) {
        let listObj={
          taskId: props.responseBasic.id,
          name: text,
        }
        input.list.push(listObj);
      } else {
        for (let listObj of input.list) {
          if (isEmptyString(listObj.id)) {
            listObj.name=text;
          } else {
            if (listObj.id==id) {
              listObj.name=text;
            }
          }
        }
      }
    }
    props.saveRepairDetailSaveRepairListInput({ ...input });
  }


  /**
   * 检查是否包含没有id的记录
   * @param list
   */
  const checkHasNoIdRecord=(list: any[]) => {
    let has=false;
    for (let listObj of list) {
      if (isEmptyString(listObj.id)) {
        has=true;
        break;
      }
    }
    return has;
  }
  /**
   * 维修实施记录文字变化
   */
  const repairRecordTextChange=(text: string, id?: string) => {
    let input=props.addRecordsInput;
    if (input.list.length==0) {
      let listObj={
        taskId: props.responseBasic.id,
        record: text,
      }
      input.list=[listObj];
    } else {
      let hasNoIdRecord=checkHasNoIdRecord(input.list);
      let idIsEmpty=isEmptyString(id);
      if (!hasNoIdRecord&&idIsEmpty) {
        let listObj={
          taskId: props.responseBasic.id,
          record: text,
        }
        input.list.push(listObj);
      } else {
        for (let listObj of input.list) {
          if (isEmptyString(listObj.id)) {
            listObj.record=text;
          } else {
            if (listObj.id==id) {
              listObj.record=text;
            }
          }
        }
      }
    }
    props.saveRepairDetailSaveRepairListInput({ ...input });
  }
  /**
   * 编辑按钮点击
   * @param id
   */
  const editCallBack=(id?: string) => {
    if (checkHasNoSaveRecord(props.basicMsgData)) {
      SndToast.showTip('请先保存正在编辑的维修记录');
      return;
    }
    let basicMsg=props.basicMsgData;
    for (let basic of basicMsg) {
      if (basic.sectionType==RepairDetailItemType.repairRecords) {
        let record;
        for (let recordObj of basic.records) {
          if (recordObj.id==id) {
            record=recordObj;
            break;
          }
        }
        basic.records=basic.records.filter((itemObj: any) => {
          return itemObj.id!=id;
        });
        basic.repairRecord=record;
        basic.repairStatus=RepairStatus.addHasRecordsHasInput;
      }
    }
    props.saveRepairBasicMsg([...basicMsg]);
  }
  /**
   * 删除按钮点击
   * @param id
   */
  const deleteCallBack=(id?: string) => {
    let input=props.addRecordsInput;
    input.list=input.list.filter((item: any) => {
      return item.id!=id;
    })
    props.saveTaskRepairList(input);
  }

  /**
   * 添加图片
   */
  const addImageCallBack=() => {
    let imageCount=0;
    for (let basicObj of props.basicMsgData) {
      if (basicObj.sectionType==RepairDetailItemType.repairPicture) {
        imageCount=basicObj.images.length;
      }
    }
    props.navigator.push({
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 10-imageCount,
        dataChanged: (chosenImages: any[]) => {
          didPickerImage(chosenImages)
        }
      }
    });
  }

  /**
   * 刷新列表上传图片
   * @param images
   */
  const didPickerImage=(images: any[]) => {
    let basicMsg=props.basicMsgData;
    let tempData=[];
    for (let image of images) {
      tempData.push(
        {
          uri: image.uri,
          name: image.filename,
          needUpload: true,
          canRemove: false,
          deviceId: fileModuleCode.repairWorkOrder+props.id,
          uploadComplete: imageUploadComplete,
        }
      )
    }
    for (let basicObj of basicMsg) {
      if (basicObj.sectionType==RepairDetailItemType.repairPicture) {
        basicObj.images.push(...tempData);
      }
    }
    props.saveRepairBasicMsg([...basicMsg]);
  }

  /**
   * 图片上传成功
   */
  const imageUploadComplete=(response: any) => {
    loadDetailFileList();
  }

  /**
   * 删除图片
   */
  const removeImageCallBack=(image: any) => {
    props.fileListDelete(image.id);
  }
  /**
   * 放大图片
   */
  const onPressImage=(index: number, isRepairAbnormal: boolean) => {
    props.filePreviewVisible({ visible: true, index: index, isRepairAbnormal: isRepairAbnormal })
  }

  /**
   * 图片浏览器 大图浏览
   */
  const renderImageViewing=() => {
    let images=[];
    let basicMsg=props.basicMsgData;
    for (let basicObj of basicMsg) {
      if (props.previewVisible.isRepairAbnormal) {
        if (basicObj.sectionType==RepairDetailItemType.basicMsg) {
          for (let image of basicObj.pictures) {
            images.push({
              uri: image,
            });
          }
          break;
        }
      } else {
        if (basicObj.sectionType==RepairDetailItemType.repairPicture) {
          for (let image of basicObj.images) {
            images.push({
              uri: image.uri,
            });
          }
          break;
        }
      }
    }

    return (
      <ImageView
        images={images}
        imageIndex={props.previewVisible.index}
        visible={props.previewVisible.visible}
        onRequestClose={() => props.filePreviewVisible({ visible: false, index: 0, isRepairAbnormal: false })}
      />
    )
  }


  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar title={'设备维修'} navIcon="back" onIconClicked={onPopBack} />
      <HeaderSwitch onSwitchItem={onHeaderSwitch}
        titles={
          repairIsPending()?
            [{ title: '基本执行', value: 0 }]:
            [{ title: '基本执行', value: 0 },
            { title: '备件更换', value: 1 },
            { title: '领用工具', value: 2 }
            ]} />
      {
        repairIsPending()?
          <RepairBasic
            data={props.basicMsgData}
            onPressExpand={onPressExpand}
            onPressImage={onPressImage}
            isPending={true}
          />
          :
          <MaintainContainerView scrollViewRef={scrollContentRef}
            children={[
              <RepairBasic
                data={props.basicMsgData}
                onPressExpand={onPressExpand}
                isPending={false}
                faultPhenomenonTextChange={faultPhenomenonTextChange}
                faultCauseTextChange={faultCauseTextChange}
                addRecordCallBack={addRecordCallBack}
                saveRecordCallBack={saveRecordCallBack}
                cancelCallBack={cancelCallBack}
                repairTaskTextChange={repairTaskTextChange}
                repairRecordTextChange={repairRecordTextChange}
                editCallBack={editCallBack}
                deleteCallBack={deleteCallBack}
                addImageCallBack={addImageCallBack}
                removeImageCallBack={removeImageCallBack}
                onPressImage={onPressImage}
                bottomActions={renderComplete}
              />,
              <MaintainReplacement data={props.sparePartsReplacementData}
                relationalCallBack={replacementCallBack}
                createCallBack={createCallBack}
                onPressRemove={replacementRemoveCallBack}
                pressTitle={isShowSubmit()? '关联备件出库单':''}
                pressTitle2={isShowSubmit()? '创建备件出库单':''}
              />,
              <MaintainReplacement data={props.receivingToolsData}
                relationalCallBack={toolCallBack}
                onPressRemove={toolRemoveCallBack}
                pressTitle={isShowSubmit()? '关联工具领用单':''} />,
            ]}
          />
      }
      {renderImageViewing()}
    </View>
  )
}

const styles=StyleSheet.create({
  pressContainer: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 2,
    marginBottom: 20,
    backgroundColor: Colors.theme
  },
  pressText: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: 'bold'
  }
})


const mapStateToProps=(state: any) => {
  let repairDetail=state.repair.RepairDetailReducer;
  let spareTools=state.spareTools;
  let fileList=state.fileList;
  const user=state.user.toJSON().user;
  let departmentCodes=state.workbench.departmentCodes;
  return {
    currentUser: user,
    departmentCodes: departmentCodes,
    responseBasic: repairDetail.responseBasic,  ///维修基本信息接口返回
    responseRepairList: repairDetail.responseRepairList,    ///维修记录接口返回

    basicMsgData: repairDetail.basicMsgData,///基本执行展示数据
    sparePartsReplacementData: repairDetail.sparePartsReplacementData,///备件更换列表数据
    receivingToolsData: repairDetail.receivingToolsData,    ///领用工具列表数据

    addRecordsInput: repairDetail.addRecordsInput,  ///添加维修记录入参
    saveRepairRequestStatus: repairDetail.saveRepairRequestStatus,///保存维修记录 请求状态

    repairImages: repairDetail.repairImages,///异常图片
    submitRequestStatus: repairDetail.submitRequestStatus,///提交报修 请求状态

    toolItems: spareTools.toolItems,    ///保养关联的领用工具
    removeToolRequestStatus: spareTools.removeToolRequestStatus,    ///移除工具领用 请求状态

    sparePartItems: spareTools.sparePartItems,  ///保养关联的 备件领用
    removeSparePartRequestStatus: spareTools.removeSparePartRequestStatus,///移除备件领用 请求状态

    images: fileList.images,///图片集合
    fileListDeleteRequestStatus: fileList.fileListDeleteRequestStatus,
    previewVisible: fileList.previewVisible,
  }
}

export default connect(mapStateToProps, {
  saveRepairBasicMsg,
  loadRepairBasicDetail,///获取基本信息
  loadDetailRepairList,///获取维修记录
  saveRepairDetailSaveRepairListInput,///保存维修记录入参
  saveTaskRepairList, ///保存维修记录

  repairDetailSubmit,   ///完成提交保存请求
  repairDetailDestroyClear,   ///页面销毁重置操作

  saveReceivingToolsData, ///保存领用工具展示数据
  loadToolItems,  ///获取关联的领用工具列表
  removeToolUseItem,///移除领用工具

  saveSparePartsReplacementData,///保存备件更换展示数据
  loadChangeSparePart,    ///获取关联的备件更换列表
  removeSparePartItem,    ///移除领用工具

  loadRepairImages,
  getDeviceFileList,  ///文件列表
  fileListDelete,
  filePreviewVisible,
  fileDestroyClear,
})(RepairDetail)

