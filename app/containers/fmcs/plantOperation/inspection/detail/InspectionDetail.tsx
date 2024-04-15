import React from "react";
import { connect } from "react-redux";
import { Alert, InteractionManager, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {
  InspectionDetailListContent
} from "../../../../../components/fmcs/plantOperation/inspection/detail/InspectionDetailListContent";
import {
  autoCaoBiao,
  inspectionDetailDestroyClear,
  inspectionDetailInspectSheet,
  inspectionDetailNFCSheet,
  inspectionDetailSaveTask,
  loadInspectDetail,
  loadInspectionTask,
  loadInspectRange,
  saveInspectionDetailInfo,
  saveTaskDetailInput,
  taskUpdateProject
} from "../../../../../actions/inspection/inspectionAction";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import { InspectionDetailItemType, } from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
  checkInspectionTaskIsInspect,
  checkNoCompleteTask,
  convertInspectionBasic,
  convertInspectionRange,
  findDeviceIdByDeviceCode,
  findSceneIdBySceneCode
} from "./InspectionStateHelper";

import { RequestStatus } from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import { isEmptyString, stringRemoveEmptyCharacter } from "../../../../../utils/const/Consts";
import { debounce } from "../../../../../utils";
import {
  InspectionRangeItemData
} from "../../../../../components/fmcs/plantOperation/inspection/detail/InspectionRangeItem";
import {
  ActionSheetType,
  InspectionActionSheet
} from "../../../../../components/fmcs/plantOperation/inspection/detail/InspectionMethod";
import NfcManager, { NfcTech, NfcEvents, Ndef } from 'react-native-nfc-manager';
import InspectionTask from "./InspectionTask";

/**
 * 巡检执行详情
 * @param props
 * @constructor
 */
function InspectionDetail(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }
  const [enabled, setEnabled]=React.useState(false);

  React.useEffect(() => {
    async function initNfc() {
      try {
        const supported=await NfcManager.isSupported();
        if (supported) {
          await NfcManager.start();
        }
        setEnabled(await NfcManager.isEnabled());

        if (supported) {
          NfcManager.setEventListener(
            NfcEvents.StateChanged,
            (evt: { state: string }) => {
              NfcManager.cancelTechnologyRequest().catch(() => 0);
              if (evt.state==='off') {
                setEnabled(false);
              } else if (evt.state==='on') {
                setEnabled(true);
              }
            },
          );
        }
      } catch (e) {
        SndToast.showTip('NFC不可用');
      }
    }
    initNfc().then(r => { });
  }, [])



  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      loadInspectionDetailInfo();
    });
  }, []);

  const loadInspectionDetailInfo=() => {
    let customerId=props.currentUser.CustomerId;
    let params={ taskId: props.id, customerId: customerId, userId: props.currentUser.Id };
    props.loadInspectDetail(params);
    props.loadInspectRange({ taskId: props.id, customerId: customerId });
    // props.loadInspectionTask(props.id);
  }

  /**
   * 监听接口返回 构建业务模型
   */
  /**
   * 更新基本信息 /巡检范围
   */
  React.useEffect(() => {
    if (props.responseDetail&&Object.keys(props.responseDetail).length>0&&props.responseRange&&Object.keys(props.responseRange).length>0) {
      let info=convertInspectionBasic(props.responseDetail, props.inspectionDetailInfo, props.currentUser.Id, props.executorName);
      let basicInfo=convertInspectionRange(props.responseRange, info);
      props.saveInspectionDetailInfo(basicInfo);
      SndToast.dismiss();
    } else {
      SndToast.showLoading('加载中...');
    }
  }, [props.responseDetail, props.responseRange]);

  /**
   * 更新巡检作业
   */
  // React.useEffect(() => {
  //   if (
  //     props.responseDetail&&
  //     props.responseRange&&
  //     // props.responseTask&&
  //     Object.keys(props.responseDetail).length>0
  //     &&Object.keys(props.responseRange).length>0
  //     // &&Object.keys(props.responseTask).length>0
  //   ) {
  //     SndToast.dismiss();
  //     let basicInfo=convertInspectionTask(props.responseTask, props.responseRange, props.responseDetail, props.inspectionDetailInfo, props.currentUser.Id);
  //     props.saveInspectionDetailInfo(basicInfo);
  //   } else {
  //     SndToast.showLoading();
  //   }
  // }, [props.responseTask, props.responseDetail, props.responseRange]);

  // /**
  //  * 监听更新巡检作业  请求结果
  //  */
  // React.useEffect(() => {
  //   if (props.updateProjectRequestStatus==RequestStatus.loading) {
  //     SndToast.showLoading('保存中...');
  //   } else if (props.updateProjectRequestStatus==RequestStatus.success) {
  //     SndToast.dismiss();
  //     SndToast.showSuccess('保存成功', undefined, 0.3);
  //     ///刷新这条数据
  //     updateInspectTask(props.projectTaskInfo);
  //   } else if (props.updateProjectRequestStatus==RequestStatus.error) {
  //     SndToast.dismiss();
  //   }
  // }, [props.updateProjectRequestStatus]);

  // /**
  //  * 某一条巡检作业成功后更新这条数据使其变更为编辑状态
  //  * @param task
  //  */
  // const updateInspectTask=(task: any) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (inspectionTasks.id==task.id) {
  //               inspectionTasks.status=InspectionTaskStatus.editInit;
  //               break;
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   props.saveInspectionDetailInfo([...dataSource]);
  // }

  /**
   * 监听保存详情请求
   */
  React.useEffect(() => {
    if (props.saveTaskRequestStatus==RequestStatus.loading) {
      SndToast.showLoading();
    } else if (props.saveTaskRequestStatus==RequestStatus.success) {
      SndToast.dismiss();
      onPopBack();
      props.refreshCallBack&&props.refreshCallBack();
    } else if (props.saveTaskRequestStatus==RequestStatus.error) {
      SndToast.dismiss();
    }
  }, [props.saveTaskRequestStatus]);

  // function getTagValueWithAbbreviation(strAbbrev: string, deviceId: number) {
  //   if (props.responseAbbreviation&&props.responseAbbreviation.length>0) {
  //     for (let element of props.responseAbbreviation) {
  //       if (strAbbrev===element.Abbreviation&&deviceId==element.DeviceId) {
  //         return element.Value;
  //       }
  //     }
  //   }
  //   return null;
  // }
  //
  // /**
  //  * 监听自动抄表的数组变化
  //  */
  // React.useEffect(() => {
  //   if (props.responseDetail&&Object.keys(props.responseDetail).length>0) {
  //     const dataSource=props.inspectionDetailInfo;
  //     for (let element of dataSource) {
  //       if (element.sectionType==InspectionDetailItemType.task) {
  //         if (element.data) {
  //           for (let datum of element.data) {
  //             for (let inspectionTasks of datum.inspectionTasks) {
  //               let tagAbbreviation=getTagValueWithAbbreviation(inspectionTasks.tagAbbreviation, datum.deviceId);
  //               if (!isEmptyString(tagAbbreviation)) {
  //                 inspectionTasks.value=tagAbbreviation;
  //               }
  //             }
  //           }
  //         }
  //         break;
  //       }
  //     }
  //     props.saveInspectionDetailInfo([...dataSource])
  //   }
  // }, [props.responseAbbreviation]);
  //
  //
  // // 监听自动抄表请求状态
  // React.useEffect(() => {
  //   if (props.autoCBRequestStatus==RequestStatus.loading) {
  //     SndToast.showLoading();
  //   } else if (props.autoCBRequestStatus==RequestStatus.success) {
  //     SndToast.dismiss();
  //     SndToast.showSuccess('抄表完成');
  //   } else if (props.autoCBRequestStatus==RequestStatus.error) {
  //     SndToast.dismiss();
  //   }
  // }, [props.autoCBRequestStatus]);

  /**
   * 读取nfc 内容
   */
  const readerNfc=async () => {
    let tag=null;
    try {
      await NfcManager.requestTechnology([NfcTech.Ndef]);
      tag=await NfcManager.getTag();
    } catch (ex) {
      // for tag reading, we don't actually need to show any error
      console.log(ex);
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
    return tag;
  }

  /**
   * 巡检详情销毁
   */
  React.useEffect(() => {
    return () => {
      props.inspectionDetailDestroyClear();
      SndToast.dismiss();
      NfcManager.cancelTechnologyRequest()
    }
  }, [])

  /**
   * 外层展开收起点击
   */
  const onPressExpand=(sectionType: InspectionDetailItemType) => {
    debounce(() => {
      const dataSource=props.inspectionDetailInfo;
      for (let element of dataSource) {
        if (element.sectionType==sectionType) {
          element.isExpand=!element.isExpand;
          break;
        }
      }
      props.saveInspectionDetailInfo([...dataSource]);
    });
  }

  // /**
  //  * 巡检项展开/收起点击
  //  */
  // const taskExpandCallBack=(id: number, sceneId: number, deviceId: number) => {
  //   debounce(()=>{
  //     const dataSource=props.inspectionDetailInfo;
  //     for (let element of dataSource) {
  //       if (element.sectionType==InspectionDetailItemType.task) {
  //         if (element.data) {
  //           for (let datum of element.data) {
  //             if (datum.id==id&&datum.sceneId==sceneId&&datum.deviceId==deviceId) {
  //               datum.isExpand=!datum.isExpand;
  //               break;
  //             }
  //           }
  //         }
  //         break;
  //       }
  //     }
  //     props.saveInspectionDetailInfo([...dataSource]);
  //   });
  // }
  //
  // /**
  //  * 填写正常点击
  //  */
  // const onPressInputNormal=(id: number, sceneId: number, deviceId: number) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (datum.id==id&&datum.sceneId==sceneId&&datum.deviceId==deviceId) {
  //               inspectionTasks.results='正常';
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   props.saveInspectionDetailInfo([...dataSource]);
  // }
  //
  // /**
  //  * 巡检结果 输入回调
  //  @param text
  //  * @param id
  //  * @param taskId
  //  * @param taskProjectId
  //  */
  // const resultsTextDidChange=(text: string, id: number, taskId: number, taskProjectId: number) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (inspectionTasks.id==id&&inspectionTasks.taskId==taskId&&inspectionTasks.taskProjectId==taskProjectId) {
  //               inspectionTasks.results=text;
  //               break;
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   props.saveInspectionDetailInfo([...dataSource]);
  // }
  //
  // /**
  //  * 抄表 数值文字变化
  //  * @param text
  //  * @param id
  //  * @param taskId
  //  * @param taskProjectId
  //  */
  // const valueTextChange=(text: string, id: number, taskId: number, taskProjectId: number) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (inspectionTasks.id==id&&inspectionTasks.taskId==taskId&&inspectionTasks.taskProjectId==taskProjectId) {
  //               inspectionTasks.value=text;
  //               break;
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   props.saveInspectionDetailInfo([...dataSource]);
  // }
  //
  // /**
  //  * 编辑按钮点击
  //  * @param id
  //  * @param taskId
  //  * @param taskProjectId
  //  */
  // const editCallBack=(id: number, taskId: number, taskProjectId: number) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (inspectionTasks.id==id&&inspectionTasks.taskId==taskId&&inspectionTasks.taskProjectId==taskProjectId) {
  //               inspectionTasks.status=InspectionTaskStatus.editing;
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   props.saveInspectionDetailInfo([...dataSource]);
  // }
  //
  // /**
  //  * 自动抄表
  //  * @param taskItem
  //  */
  // const onPressAutoCB=(taskItem: any) => {
  //   let arrAbbrevia: any[]=[];
  //   taskItem.inspectionTasks.forEach((item: any) => {
  //     if (item.tagAbbreviation) {
  //       arrAbbrevia.push(item.tagAbbreviation);
  //     }
  //   });
  //   props.autoCaoBiao({ deviceId: taskItem.deviceId, abbreviationList: arrAbbrevia })
  // }
  //
  // /**
  //  * 保存按钮点击
  //  * @param id
  //  * @param taskId
  //  * @param taskProjectId
  //  */
  // const saveCallBack=(id: number, taskId: number, taskProjectId: number) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   let params={
  //     id: -1,
  //     taskId: -1,
  //     executeResult: '',
  //     executeTime: moment().format('YYYY-MM-DD HH:mm:ss'),
  //     executorId: props.currentUser.Id,
  //     executorName: props.currentUser.Name,
  //   }
  //   let taskType=InspectionTaskType.panDu;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (inspectionTasks.id==id&&inspectionTasks.taskId==taskId&&inspectionTasks.taskProjectId==taskProjectId) {
  //               params.id=id;
  //               params.taskId=taskId;
  //               params.executeResult=datum.inspectionTaskType==InspectionTaskType.chaoBi? inspectionTasks.value:inspectionTasks.results;
  //
  //               taskType=datum.inspectionTaskType;
  //               break;
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   if (isEmptyString(params.executeResult)) {
  //     if (taskType==InspectionTaskType.chaoBi) {
  //       SndToast.showTip(`请输入数值`);
  //     } else {
  //       SndToast.showTip(`请输入巡检结果`);
  //     }
  //     return;
  //   }
  //   props.taskUpdateProject([params]);
  // }
  //
  // /**
  //  * 巡检项取消点击
  //  */
  // const cancelCallBack=(id: number, taskId: number, taskProjectId: number) => {
  //   const dataSource=props.inspectionDetailInfo;
  //   for (let element of dataSource) {
  //     if (element.sectionType==InspectionDetailItemType.task) {
  //       if (element.data) {
  //         for (let datum of element.data) {
  //           for (let inspectionTasks of datum.inspectionTasks) {
  //             if (inspectionTasks.id==id&&inspectionTasks.taskId==taskId&&inspectionTasks.taskProjectId==taskProjectId) {
  //               inspectionTasks.status=InspectionTaskStatus.editInit;
  //             }
  //           }
  //         }
  //       }
  //       break;
  //     }
  //   }
  //   props.saveInspectionDetailInfo([...dataSource]);
  // }

  ///巡检总结 回调
  const onPressTaskResult=(index: number) => {
    let input=props.saveTaskInput;
    input.isNormally=(index==0)
    props.saveTaskDetailInput({ ...input });
  }

  const remarkTextOnChange=(text: string) => {
    let input=props.saveTaskInput;
    input.remark=text;
    props.saveTaskDetailInput({ ...input });
  }

  const summaryTextOnChange=(text: string) => {
    let input=props.saveTaskInput;
    input.summary=text;
    props.saveTaskDetailInput({ ...input });
  }


  /**
   * 底部 刷卡点击
   */
  const onCreditCard=async () => {
    if (!enabled) {
      Alert.alert(
        '', '设备NFC功能未开启', [
        {
          text: '取消',
        },
        {
          text: '去开启',
          onPress: async () => {
            await NfcManager.goToNfcSetting();
          }
        }
      ]
      )
      return;
    }
    props.inspectionDetailNFCSheet({ visible: true });
    let tag=await readerNfc();
    if (tag) {
      const ndef=
        Array.isArray(tag.ndefMessage)&&tag.ndefMessage.length>0
          ? tag.ndefMessage[0]
          :null;
      // @ts-ignore
      if (ndef.tnf===Ndef.TNF_WELL_KNOWN) {
        // @ts-ignore
        let text=Ndef.text.decodePayload(ndef?.payload);
        text=stringRemoveEmptyCharacter(text);
        let result=JSON.parse(text);
        ///需要判断读取卡片的是哪个设备/哪个场景
        if (result) {
          if (result.type=='device') {
            ///设备
            let device=findDeviceIdByDeviceCode(result.device_code, props.responseRange.devices);
            if (device) {
              ///找到了 匹配的设备
              props.inspectionDetailNFCSheet({ visible: false });
              jumpToInspectionTask(device, true);
            } else {
              showAlertTip('当前任务不是针对该设备的，请确认后重新刷卡');
            }
          } else if (result.type=='scene') {
            ///场景
            let scene=findSceneIdBySceneCode(result.scene_code, props.responseRange.scenes);
            if (scene) {
              ///找到了 相匹配的场景
              props.inspectionDetailNFCSheet({ visible: false });
              jumpToInspectionTask(scene, true);
            } else {
              showAlertTip('当前任务不是针对该场景的，请确认后重新刷卡');
            }
          }
        }
      }
    }
  }

  /**
   * 完成提交点击
   */
  const onPressSummit=() => {
    // let hasNoComplete=checkNoCompleteTask(props.inspectionDetailInfo);
    // if (hasNoComplete) {
    //   SndToast.showTip('请先完成巡检项任务,再提交');
    //   return;
    // }
    let input=props.saveTaskInput;
    if (input.isNormally==undefined) {
      SndToast.showTip('请选择巡检结果');
      return;
    }
    if (isEmptyString(input.summary)) {
      SndToast.showTip('请输入巡检总结')
      return;
    }

    input.taskId=props.responseDetail.id;
    input.operatorId=props.currentUser.Id;
    props.inspectionDetailSaveTask(input);
  }

  /**
   * 待巡检/已完成 切换
   * @param itemObj
   */
  const onSwitchItem=(itemObj: any) => {
    const dataSource=props.inspectionDetailInfo;
    for (let element of dataSource) {
      if (element.sectionType==InspectionDetailItemType.range) {
        element.rangeIndex=itemObj.value;
        break;
      }
    }
    props.saveInspectionDetailInfo([...dataSource]);
  }

  /**
   * 待巡检项点击
   */
  const onPressWaitItem=(obj: InspectionRangeItemData) => {
    props.inspectionDetailInspectSheet({ visible: true, data: obj });
  }

  /**
   * 已完成巡检项 点击  当前巡检状态为已完成不可点击
   */
  const onPressDoneItem=(obj: InspectionRangeItemData) => {
    ///已经巡检完成了 直接进入 巡检项
    jumpToInspectionTask(obj);
    // props.inspectionDetailInspectSheet({visible: true, data: obj});
  }

  /**
   * 巡检方式 sheet 取消展示
   */
  const onPressInspectSheetCancel=() => {
    props.inspectionDetailInspectSheet({ visible: false, data: {} });
  }

  /**
   * 巡检方式选择
   * @param index 0:刷卡开始 1:直接开始
   */
  const onPressInspectSheetItem=async (index: number) => {
    props.inspectionDetailInspectSheet({ visible: false, data: props.inspectSheet.data });
    if (index==0) {
      if (!enabled) {
        Alert.alert(
          '', '设备NFC功能未开启', [
          {
            text: '取消',
          },
          {
            text: '去开启',
            onPress: async () => {
              await NfcManager.goToNfcSetting();
            }
          }
        ]
        )
        return;
      }
      props.inspectionDetailNFCSheet({ visible: true });
      readerNfcMessage().then();
    } else {
      ///直接开始
      jumpToInspectionTask(props.inspectSheet.data, false);
    }
  }

  const readerNfcMessage=async () => {
    let tag=await readerNfc();
    console.log(tag);
    if (tag) {
      const ndef=
        Array.isArray(tag.ndefMessage)&&tag.ndefMessage.length>0
          ? tag.ndefMessage[0]
          :null;
      // @ts-ignore
      if (ndef.tnf===Ndef.TNF_WELL_KNOWN) {
        // @ts-ignore
        let text=Ndef.text.decodePayload(ndef?.payload);
        text=stringRemoveEmptyCharacter(text);
        let result=JSON.parse(text);
        if (result.type=='device') {
          if (result.device_code!=props.inspectSheet.data.deviceCode) {
            showAlertTip('当前任务不是针对该设备的，请确认后重新刷卡');
            return;
          }
        } else if (result.type=='scene') {
          if (result.scene_code!=props.inspectSheet.data.code) {
            showAlertTip('当前任务不是针对该场景的，请确认后重新刷卡');
            return;
          }
        }
        ///隐藏NFC刷卡动画页面
        props.inspectionDetailNFCSheet({ visible: false });
        ///跳转巡检
        jumpToInspectionTask(props.inspectSheet.data, true);
      }
    }
  }

  /**
   * 跳转巡检执行
   * @param taskObj 当前巡检项 信息
   * @param isCreditCard 是否是刷卡进入 true:是;  false: 直接开始
   */
  const jumpToInspectionTask=(taskObj: any, isCreditCard?: boolean) => {
    let navigatorTitle='';
    if (Object.keys(taskObj).length>0) {
      if (isEmptyString(taskObj.name)) {
        ///底部刷卡进入
        if (taskObj.deviceCode!=undefined) {
          navigatorTitle=taskObj.deviceName;
        } else if (taskObj.sceneCode!=undefined) {
          navigatorTitle=taskObj.name;
        }
      } else {
        ///待巡检项进入
        navigatorTitle=taskObj.name;
      }
    }
    props.navigator.push({
      id: 'inspection_task',
      component: InspectionTask,
      passProps: {
        title: navigatorTitle,
        isCreditCard: isCreditCard,
        taskObj: taskObj,
        taskId: props.responseDetail.id,
        refreshCallBack: () => {
          ///刷新列表
          loadInspectionDetailInfo();
        }
      }
    })
  }

  const showAlertTip=(message: string) => {
    Alert.alert('', message,
      [
        {
          text: '确定',
          onPress: async () => {
            await readerNfc()
          }
        }
      ]
    )
  }
  /**
   * NFC sheet 取消显示
   */
  const onPressNFCSheetCancel=() => {
    props.inspectionDetailNFCSheet({ visible: false });
    NfcManager.cancelTechnologyRequest();
  }

  /**
   * 是否需要展示完成按钮
   */
  const isShowSubmit=() => {
    return (props.responseDetail.executeStatus!='4')&&(props.responseDetail.executorIds?.indexOf(props.currentUser.Id)!=-1);
  }
  /**
   * 底部完成按钮点击
   */
  const configBottomAction=() => {

    let detail=props.responseDetail;
    if (detail&&Object.keys(detail).length>0) {
      if (isShowSubmit()) {
        ///1.巡检都执行完成了 /当前巡检任务 处于执行中  ---->展示完成提交
        ///2.当前还有待执行的巡检,  展示刷卡
        let actionTitle='';
        let actionPress=undefined;
        if (checkInspectionTaskIsInspect(props.responseRange)) {
          ///还有待巡检
          actionTitle='刷卡';
          actionPress=onCreditCard;
        } else {
          ///巡检完成
          actionTitle='完成提交';
          actionPress=onPressSummit;
        }
        return (
          <BottleDetailActionView actions={[
            {
              title: actionTitle,
              textColor: Colors.white,
              onPressCallBack: actionPress,
              btnStyle: { marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme }
            }
          ]} />
        )
      }
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar title={props.responseDetail?.name} navIcon="back" onIconClicked={onPopBack} />
      <InspectionDetailListContent
        data={props.inspectionDetailInfo}
        onPressExpand={onPressExpand}
        onSwitchItem={onSwitchItem}
        onPressWaitItem={onPressWaitItem}
        onPressDoneItem={onPressDoneItem}
        onPressTaskResult={onPressTaskResult}
        remarkTextOnChange={remarkTextOnChange}
        summaryTextOnChange={summaryTextOnChange}
      />
      {configBottomAction()}
      <InspectionActionSheet title={'巡检'}
        actionSheetType={ActionSheetType.inspectionMeth}
        visible={props.inspectSheet.visible}
        onPressItem={onPressInspectSheetItem}
        onPressCancel={onPressInspectSheetCancel} />
      <InspectionActionSheet actionSheetType={ActionSheetType.NFC}
        visible={props.NFCSheet.visible}
        onPressCancel={onPressNFCSheetCancel} />
    </View>
  )
}

const mapStateToProps=(state: any) => {
  let inspectionDetail=state.inspection.InspectionDetailReducer;
  const user=state.user.toJSON().user;
  return {
    currentUser: user,
    responseDetail: inspectionDetail.responseDetail,
    responseRange: inspectionDetail.responseRange,
    // responseTask: inspectionDetail.responseTask,
    inspectionDetailInfo: inspectionDetail.inspectionDetailInfo,
    // responseAbbreviation: inspectionDetail.responseAbbreviation,
    // autoCBRequestStatus: inspectionDetail.autoCBRequestStatus,
    // updateProjectRequestStatus: inspectionDetail.updateProjectRequestStatus,
    projectTaskInfo: inspectionDetail.projectTaskInfo,

    inspectSheet: inspectionDetail.inspectSheet,
    NFCSheet: inspectionDetail.NFCSheet,

    saveTaskInput: inspectionDetail.saveTaskInput,
    saveTaskRequestStatus: inspectionDetail.saveTaskRequestStatus,
  }
}

export default connect(mapStateToProps, {
  loadInspectDetail,
  loadInspectRange,
  // autoCaoBiao,
  // loadInspectionTask,
  saveInspectionDetailInfo,
  // taskUpdateProject,
  inspectionDetailDestroyClear,
  saveTaskDetailInput,
  inspectionDetailSaveTask,
  inspectionDetailInspectSheet,
  inspectionDetailNFCSheet,
})(InspectionDetail)

