import React from "react";
import { connect } from "react-redux";
import { InteractionManager, View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {
  MaintainContainerView
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainContainerView";
import { isEmptyString, screenWidth } from "../../../../../utils/const/Consts";
import {
  fileModuleCode,
  MaintainDetailItemType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
  MaintainBasic,
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainBasic";
import {
  MaintainReplacement,
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainReplacement";
import MaintainOutboundOrderList from "./MaintainOutboundOrderList";
import MaintainToolList from "./MaintainToolList";
import {
  loadMaintainBasicMsg,
  loadMaintainTasks,
  maintainDestroyClear,
  maintainSaveTaskData,
  saveMaintainBasicMsg,
  saveMaintainTaskDataInput,
  saveReceivingTools, saveSparePartsReplacement,
  saveTaskUpdateInput,
  updateMaintainTask
} from "../../../../../actions/maintain/maintainAction";
import {
  checkNoCompleteMaintain,
  configMaintainPictures,
  convertBasicMessage,
  convertReceivingTools,
  convertSpareParts, getMaintainType
} from "./MaintainStateHelper";
import SndToast from "../../../../../utils/components/SndToast";
import { RequestStatus } from "../../../../../middleware/api";
import { MaintainItemsStatus } from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainItems";
import { InitialTaskInput, InitialUpdateInput } from "../../../../../reducers/maintain/maintainDetailReducer";
import {
  loadChangeSparePart,
  loadToolItems,
  removeSparePartItem,
  removeToolUseItem
} from "../../../../../actions/spareTools/apareToolsAction";
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
 * 保养执行详情
 * @param props
 * @constructor
 */
function MaintainDetail(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }
  /**
   * 内容scrollView的引用, 方便点击改变scrollView的contentOffset
   */
  const scrollContentRef=React.useRef<ScrollView>(null);

  React.useEffect(() => {
    loadMaintainTaskDetail();
    loadToolItems();
    loadSparePartItems();
    loadDetailFileList();
  }, []);

  /**
   * 获取保养详情数据
   */
  const loadMaintainTaskDetail=() => {
    let params={
      taskId: props.id,
      customerId: props.currentUser.CustomerId,
      userId: props.currentUser.Id,
    }
    props.loadMaintainBasicMsg(params);
    props.loadMaintainTasks(props.id);
  }

  /**
   * 获取详情关联的领用工具
   */
  const loadToolItems=() => {
    props.loadToolItems({ taskId: props.id });
  }


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
    props.loadChangeSparePart({ "code": props.code, "use": "保养" });
  }


  /**
   * 获取图片/文件列表
   */
  const loadDetailFileList=() => {
    props.getDeviceFileList(fileModuleCode.maintenanceTask+props.id);
  }


  /**
   * 监听备件更换关联详情数据
   */
  React.useEffect(() => {
    let spareParts=convertSpareParts(props.sparePartItems);
    props.saveSparePartsReplacement(spareParts);
  }, [props.sparePartItems]);

  /**
   * 监听文件获取
   */
  React.useEffect(() => {
    let basicData=configMaintainPictures(props.basicMsgData, props.images);
    props.saveMaintainBasicMsg(basicData);
  }, [props.images]);
  /**
   * 监听工具领用关联详情数据
   */
  React.useEffect(() => {
    let tools=convertReceivingTools(props.toolItems);
    props.saveReceivingTools(tools);
  }, [props.toolItems]);

  /**
   * 监听 保养基本信息/保养任务请求 构建保养详情业务模型数据
   */
  React.useEffect(() => {
    if (Object.keys(props.responseBasic).length>0&&props.responseTask) {
      SndToast.dismiss();
      let newBasic=convertBasicMessage(props.responseBasic, props.responseTask, props.basicMsgData, props.executorNames, props.currentUser.Id, props.isCreditCard);
      props.saveMaintainBasicMsg(newBasic);
    } else {
      SndToast.showLoading();
    }
  }, [props.responseBasic, props.responseTask]);


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
   * 保养项目 执行结果监听
   */
  React.useEffect(() => {
    if (props.updateTaskStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.updateTaskStatus==RequestStatus.success) {
      SndToast.dismiss();
      ///清空保养项 保存入参
      props.saveTaskUpdateInput(InitialUpdateInput());
      loadMaintainTaskDetail();
    } else if (props.updateTaskStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.updateTaskStatus]);

  /**
   * 监听保养详情完成提交 请求结果
   */
  React.useEffect(() => {
    if (props.saveTaskDataStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.saveTaskDataStatus==RequestStatus.success) {
      SndToast.dismiss();
      SndToast.showSuccess('提交成功', () => {
        onPopBack();
        props.refreshListCallBack&&props.refreshListCallBack();
        props.saveTaskUpdateInput(InitialUpdateInput());
      })
    } else if (props.saveTaskDataStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.saveTaskDataStatus]);

  /**
   * 销毁时操作
   */
  React.useEffect(() => {
    return () => {
      props.maintainDestroyClear();
      props.fileDestroyClear();
      SndToast.dismiss();
    }
  }, []);

  /**
   * 外层展开收起点击
   */
  const onPressExpand=(sectionType: MaintainDetailItemType) => {
    debounce(() => {
      const dataSource=props.basicMsgData;
      for (let element of dataSource) {
        if (element.sectionType==sectionType) {
          element.isExpand=!element.isExpand;
          break;
        }
      }
      props.saveMaintainBasicMsg([...dataSource]);
    })
  }

  /**
   * 里层 保养项 展开/收起点击
   */
  const onPressMaintainExpand=(projectId: string) => {
    debounce(() => {
      const dataSource=props.basicMsgData;
      for (let element of dataSource) {
        if (element.sectionType==MaintainDetailItemType.maintainItems) {
          if (element.data) {
            for (let datum of element.data) {
              if (datum.projectId==projectId) {
                // @ts-ignore
                datum.isExpand=!datum.isExpand;
                break;
              }
            }
          }
          break;
        }
      }
      props.saveMaintainBasicMsg([...dataSource]);
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
   * 备件领用关联点击
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
        use: '保养',
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
   * 备件领用移除按钮点击
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
            use: '保养'
          };
          props.removeSparePartItem(params);
        }
      }
    ]);
  }


  /**
   * 工具领用 关联点击
   */
  const toolCallBack=() => {
    props.navigator.push({
      id: 'Maintain_Tool_List',
      component: MaintainToolList,
      passProps: {
        taskId: props.responseBasic.id,
        refreshCallBack: () => {
          loadToolItems();
        }
      }
    })
  }
  /**
   *  工具领用移除按钮点击
   * @param item
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
          onPress={commitTask}>
          <Text style={styles.pressText}>完成提交</Text>
        </Pressable>
      )
    }
  }

  const isShowSubmit=() => {
    return (props.responseBasic.status!='已完成')&&(props.responseBasic.executorIds?.indexOf(props.currentUser.Id)!=-1);
  }

  /**
   * 保养任务完成提交
   */
  const commitTask=() => {
    ///1.检查是否有未填写的 保养项
    let hasNoComplete=checkNoCompleteMaintain(props.basicMsgData);
    if (hasNoComplete) {
      SndToast.showTip('请先完成保养项目任务,再提交');
      return;
    }
    ///2.检查设备运行总结是否填写
    let input=props.saveTaskInput;
    if (isEmptyString(input.operationSummary)) {
      SndToast.showTip('请填写设备运行总结');
      return;
    }
    input.taskId=props.responseBasic.id;

    let user=props.currentUser;
    input.userId=user.Id;
    input.userName=user.Name;

    props.maintainSaveTaskData(input);
  }

  /**
  * 保养项目 结果回调
  * @param text
  * @param id
  * @param contentType
  */
  const taskResultsTextChange=(text: string|number, id: string, contentType?: number) => {
    if (contentType==3) {
      ///选择
      let basicMsg=props.basicMsgData;
      for (let basicObj of basicMsg) {
        if (basicObj.sectionType==MaintainDetailItemType.maintainItems) {
          ///保养项
          for (let data of basicObj.data) {
            for (let maintainItem of data.maintainItems) {
              if (maintainItem.id==id) {
                if (maintainItem.contentValue&&maintainItem.contentValue.length>0) {
                  let contents=maintainItem.contentValue.split(',');
                  if (text==contents[0]) {
                    maintainItem.selectedIndex=0;
                  } else {
                    maintainItem.selectedIndex=1;
                  }
                }
                break;
              }
            }
          }
        }
      }
      props.saveMaintainBasicMsg([...basicMsg]);
    }
    let updateInput=props.updateTaskInput;
    updateInput.executeResult=text;
    updateInput.id=id;
    props.saveTaskUpdateInput({ ...updateInput });
  }

  /**
   * 保养项目 说明输入回调
   * @param text
   * @param id
   */
  const taskRemarkTextChange=(text: string, id: string) => {
    let updateInput=props.updateTaskInput;
    updateInput.remark=text;
    updateInput.id=id;
    props.saveTaskUpdateInput({ ...updateInput });
  }

  /**
   * 保存保养项
   * @param id
   */
  const taskOnSave=(id: string) => {
    let updateInput=props.updateTaskInput;
    if (updateInput.id==id) {
      if (typeof updateInput.executeResult=="string"&&isEmptyString(updateInput.executeResult)) {
        SndToast.showTip('保养项结果不能为空!');
        return;
      }
      let user=props.currentUser;
      updateInput.executorId=user.Id;
      updateInput.executorName=user.Name;
      updateInput.executorType=getMaintainType(props.responseTask, props.isCreditCard);
      props.updateMaintainTask([updateInput]);
    }
  }

  /**
   * 编辑保养项点击
   */
  const editTaskOnPress=(id: string, result: string, remark?: string) => {
    let hasNoComplete=checkNoCompleteMaintain(props.basicMsgData);
    let updateInput=props.updateTaskInput;
    if (!isEmptyString(updateInput.id)) {
      if (hasNoComplete&&updateInput.id!=id) {
        SndToast.showTip('请先保存正在编辑的保养项');
        return;
      }
    }
    updateMaintainTaskBasicMsg(id, MaintainItemsStatus.editing);
    updateInput.id=id;
    updateInput.executeResult=result;
    updateInput.remark=remark;
    updateInput.executorType=getMaintainType(props.responseTask, props.isCreditCard);
    props.saveTaskUpdateInput({ ...updateInput });
  }

  /**
   * 取消编辑保养任务
   * @param id
   */
  const cancelTaskAction=(id: string) => {
    updateMaintainTaskBasicMsg(id, MaintainItemsStatus.edit);
  }

  /**
   * 更新保养任务 基本信息
   * @param id
   * @param status
   */
  const updateMaintainTaskBasicMsg=(id: string, status: MaintainItemsStatus) => {
    let basicMsg=props.basicMsgData;
    for (let basicObj of basicMsg) {
      if (basicObj.sectionType==MaintainDetailItemType.maintainItems) {
        ///保养项
        for (let data of basicObj.data) {
          for (let maintainItem of data.maintainItems) {
            if (maintainItem.id==id) {
              maintainItem.status=status;
              break;
            }
          }
        }
        break;
      }
    }
    props.saveMaintainBasicMsg([...basicMsg]);
  }

  /**
   * 异常总结回调
   */
  const exceptTextCallBack=(text: string) => {
    let input=props.saveTaskInput;
    input.exceptionSummary=text;
    props.saveMaintainTaskDataInput({ ...input });
  }

  /**
   * 设备异常总结 文字输入回调
   * @param text
   */
  const deviceTextCallBack=(text: string) => {
    let input=props.saveTaskInput;
    input.operationSummary=text;
    props.saveMaintainTaskDataInput({ ...input });
  }

  /**
   * 添加图片
   */
  const addImageCallBack=() => {
    let imageLength=0;
    for (let basicObj of props.basicMsgData) {
      if (basicObj.sectionType==MaintainDetailItemType.maintainPicture) {
        imageLength=basicObj.images.length;
      }
    }
    props.navigator.push({
      id: 'imagePicker',
      component: ImagePicker,
      passProps: {
        max: 10-imageLength,
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
          deviceId: fileModuleCode.maintenanceTask+props.id,
          uploadComplete: imageUploadComplete,
        }
      )
    }
    for (let basicObj of basicMsg) {
      if (basicObj.sectionType==MaintainDetailItemType.maintainPicture) {
        basicObj.images.push(...tempData);
      }
    }
    props.saveMaintainBasicMsg([...basicMsg]);
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
  const onPressImage=(index: number) => {
    props.filePreviewVisible({ visible: true, index: index })
  }

  /**
   * 图片浏览器 大图浏览
   */
  const renderImageViewing=() => {
    let images=[];
    let basicMsg=props.basicMsgData;
    for (let basicObj of basicMsg) {
      if (basicObj.sectionType==MaintainDetailItemType.maintainPicture) {
        for (let image of basicObj.images) {
          images.push({
            uri: image.uri,
          });
        }
        break;
      }
    }

    return (
      <ImageView
        images={images}
        imageIndex={props.previewVisible.index}
        visible={props.previewVisible.visible}
        onRequestClose={() => props.filePreviewVisible({ visible: false, index: 0 })}
      />
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar title={'保养任务'} navIcon="back" onIconClicked={onPopBack} />
      <HeaderSwitch onSwitchItem={onHeaderSwitch}
        titles={[
          { title: '基本执行', value: 0 },
          { title: '备件更换', value: 1 },
          { title: '领用工具', value: 2 }]} />
      <MaintainContainerView scrollViewRef={scrollContentRef}
        children={[
          <MaintainBasic data={props.basicMsgData}
            onPressExpand={onPressExpand}
            taskExpandCallBack={onPressMaintainExpand}
            resultsTextDidChange={taskResultsTextChange}
            remarkTextDidChange={taskRemarkTextChange}
            saveCallBack={taskOnSave}
            editCallBack={editTaskOnPress}
            cancelCallBack={cancelTaskAction}
            exceptTextChange={exceptTextCallBack}
            deviceTextChange={deviceTextCallBack}
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
            pressTitle={isShowSubmit()? '关联备件领用单':''} />,
        ]} />
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
  let maintain=state.maintain.MaintainDetailReducer;
  let spareTools=state.spareTools;
  let fileList=state.fileList;
  const user=state.user.toJSON().user;
  return {
    currentUser: user,
    responseBasic: maintain.responseBasic,
    responseTask: maintain.responseTask,
    basicMsgData: maintain.basicMsgData,
    sparePartsReplacementData: maintain.sparePartsReplacementData,
    receivingToolsData: maintain.receivingToolsData,

    updateTaskInput: maintain.updateTaskInput,  ///更新保养项目任务入参
    updateTaskStatus: maintain.updateTaskStatus,    ///更新任务保养项目执行状态 的请求结果
    saveTaskInput: maintain.saveTaskInput,      ///保养保存 入参
    saveTaskDataStatus: maintain.saveTaskDataStatus,    ///保存基本信息请求状态

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
  loadMaintainBasicMsg,
  loadMaintainTasks,
  saveMaintainBasicMsg,
  saveTaskUpdateInput,    ///保养项更新 入参
  updateMaintainTask,     ///更新保养项 保养任务

  saveMaintainTaskDataInput,  ///保养详情入参
  maintainSaveTaskData,   ///保养详情保存基本信息
  maintainDestroyClear,   ///页面销毁 重置一些数据

  saveReceivingTools, ///保存领用工具列表 业务模型数组
  loadToolItems,  ///获取关联的领用工具列表
  removeToolUseItem,///移除领用工具

  saveSparePartsReplacement,///保存备件更换列表 业务模型数组
  loadChangeSparePart,    ///获取关联的备件更换列表
  removeSparePartItem,    ///移除领用备件

  getDeviceFileList,  ///文件列表
  fileListDelete, ///文件删除
  filePreviewVisible,///文件预览放大
  fileDestroyClear,
})(MaintainDetail)

