import { InspectionDetailItemType, } from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
  InspectionTaskItemData,
  InspectionTaskItemDataItem,
  InspectionTaskStatus,
  InspectionTaskType
} from "../../../../../components/fmcs/plantOperation/inspection/detail/InspectionTaskItem";
import { isEmptyString, TimeFormatYMDHMS } from "../../../../../utils/const/Consts";
import moment from "moment";
import {
  InspectionRangeStatus
} from "../../../../../components/fmcs/plantOperation/inspection/detail/InspectionRangeItem";
import { InspectionTaskData, TaskData, TaskType } from "./InspectionTask";

export const InitialDetailInfo=() => [
  {
    title: '基本信息',
    icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
    isExpand: true,
    sectionType: InspectionDetailItemType.basicMsg,
    data: [
      {
        title: '任务编号',
        subTitle: '-',
      },
      {
        title: '工单状态',
        subTitle: '-',
      },
      {
        title: '计划日期',
        subTitle: '-',
      },
      {
        title: '执行人',
        subTitle: '-',
      }
    ]
  },
  {
    title: '巡检范围',
    canEdit: true,
    icon: require('../../../../../images/aaxiot/airBottle/range.png'),
    isExpand: true,
    sectionType: InspectionDetailItemType.range,
    waiteRange: [],
    doneRange: [],
    rangeIndex: 0,
  },
  {
    title: '巡检总结',
    icon: require('../../../../../images/aaxiot/plantOperation/inspection/xunjianzj.png'),
    isExpand: true,
    canEdit: true,
    sectionType: InspectionDetailItemType.summary,
  }
]

export function convertInspectionStatus(status?: string) {
  let statusString='';
  switch (status) {
    case '2':
    case '3':
      statusString='待执行';
      break;
    case '1':
      statusString='执行中';
      break;
    case '4':
      statusString='已完成';
      break;
  }
  return statusString;
}

/**
 * 将接口返回的巡检基本信息 转换成页面 业务模型数组
 * @param responseBasic 巡检基本信息接口返回
 * @param detailInfo 页面展示详情基本信息集合数组
 * @param userId
 * @param executorName
 */
export function convertInspectionBasic(responseBasic: any, detailInfo: any[], userId: number, executorName: string) {
  for (let info of detailInfo) {
    if (info.sectionType==InspectionDetailItemType.basicMsg) {
      info.data[0].subTitle=responseBasic.code;
      info.data[1].subTitle=convertInspectionStatus(responseBasic.executeStatus);
      info.data[2].subTitle=moment(responseBasic.planDate).format(TimeFormatYMDHMS);
      info.data[3].subTitle=executorName;
    } else if (info.sectionType==InspectionDetailItemType.range) {
      if (responseBasic.executorIds.indexOf(userId)==-1) {
        info.canEdit=false;
      } else {
        info.canEdit=(responseBasic.executeStatus!='4')
      }
    } else if (info.sectionType==InspectionDetailItemType.summary) {
      info.status=responseBasic.executeStatus;
      if (responseBasic.executorIds.indexOf(userId)==-1) {
        info.canEdit=false;
      } else {
        info.canEdit=(responseBasic.executeStatus!='4')
      }
      info.result=responseBasic.executeResult;
      info.remark=responseBasic.remark;
      info.summary=responseBasic.summary;
    }
  }
  return [...detailInfo];
}

/**
 * 将接口返回的巡检范围信息 转换成页面 业务模型数组
 * @param responseRange 巡检范围 接口返回
 * @param detailInfo   页面展示 数据集合
 */
export function convertInspectionRange(responseRange: any, detailInfo: any[]) {
  for (let info of detailInfo) {
    if (info.sectionType==InspectionDetailItemType.range) {
      if (responseRange!=undefined) {
        let scenes1=[], devices1=[];
        let scenes2=[], devices2=[];
        if (responseRange.scenes!=undefined) {
          for (let scene of responseRange.scenes) {
            if (scene.status==1) {
              ///被提交过
              let type=InspectionRangeStatus.direct;
              if (scene.executorType==1) {
                type=InspectionRangeStatus.direct;
              } else if (scene.executorType==2) {
                type=InspectionRangeStatus.creditCard;
              }
              scenes2.push({
                taskId: scene.taskId,
                name: scene.name,
                code: scene.code,
                sceneId: scene.sceneId,
                status: type,
              })
            } else if (scene.status==0) {
              ///待巡检状态
              scenes1.push({
                taskId: scene.taskId,
                name: scene.name,
                code: scene.code,
                sceneId: scene.sceneId,
                status: InspectionRangeStatus.waiteInspect,
              });
            }
          }
        }
        if (responseRange.devices!=undefined) {
          for (let device of responseRange.devices) {
            if (device.status==1) {
              ///被提交过
              let type=InspectionRangeStatus.direct;
              if (device.executorType==1) {
                type=InspectionRangeStatus.direct;
              } else if (device.executorType==2) {
                type=InspectionRangeStatus.creditCard;
              }
              devices2.push({
                name: device.deviceName,
                deviceCode: device.deviceCode,
                deviceId: device.deviceId,
                status: type,
              })
            } else if (device.status==0) {
              ///待巡检状态
              devices1.push({
                name: device.deviceName,
                deviceCode: device.deviceCode,
                deviceId: device.deviceId,
                status: InspectionRangeStatus.waiteInspect,
              })
            }
          }
        }

        info.waiteRange={ scenes: scenes1, devices: devices1 };
        info.doneRange={ scenes: scenes2, devices: devices2 };
      }
    }
  }
  return [...detailInfo];
}

/**
 * 检查当前巡检任务是否 还有待巡检的 巡检项
 * @param responseRange
 */
export function checkInspectionTaskIsInspect(responseRange: any) {
  ///是否还有 待巡检的巡检项
  let hasWaitInspectTask=false;
  if (responseRange) {
    if (responseRange.scenes!=undefined) {
      for (let scene of responseRange.scenes) {
        if (scene.status==0) {
          hasWaitInspectTask=true;
          break;
        }
      }
    }
    if (responseRange.devices!=undefined) {
      for (let device of responseRange.devices) {
        if (device.status==0) {
          hasWaitInspectTask=true;
          break;
        }
      }
    }
  }
  return hasWaitInspectTask;
}

/**
 * 将接口返回的巡检作业 转换成页面 业务模型数组
 * @param responseTask 接口返回的巡检作业信息
 * @param responseRange 巡检项
 * @param responseDetail 详情基本数据 这里有巡检状态
 * @param detailInfo 页面展示 数据集合
 * @param userId
 */
export function convertInspectionTask(responseTask: any[], responseRange: any, responseDetail: any, detailInfo: any[], userId: number) {
  for (let info of detailInfo) {
    if (info.sectionType==InspectionDetailItemType.task) {
      info.data=configTaskData(responseTask, responseRange, responseDetail, (responseDetail.executorIds.indexOf(userId)!=-1));
      info.executeStatus=responseDetail.executeStatus;
    }
  }
  return [...detailInfo];
}

/**
 * 巡检项 构建
 * @param responseTask
 * @param responseRange
 * @param responseDetail
 * @param containLoginUser  ///执行人是否包含当前登录人
 */
function configTaskData(responseTask: any[], responseRange: any, responseDetail: any, containLoginUser: boolean) {
  let dataInfo: InspectionTaskItemData[]=[];
  if (responseTask&&responseTask.length>0) {
    for (let task of responseTask) {
      let taskName=task.name;
      if (responseRange!=undefined) {
        if (responseRange.devices!=undefined) {
          let devices=responseRange.devices;
          for (const device of devices) {
            if (device.deviceId==task.deviceId) {
              taskName=device.deviceName+'#'+taskName;
              break;
            }
          }
        }
      }

      let taskItem: InspectionTaskItemData={};
      taskItem.title=taskName;
      taskItem.id=task.id;
      taskItem.sceneId=task.sceneId;
      taskItem.deviceId=task.deviceId;
      if (task.type=='抄表类') {
        taskItem.inspectionTaskType=InspectionTaskType.chaoBi;
      } else {
        taskItem.inspectionTaskType=InspectionTaskType.panDu;
      }
      taskItem.isExpand=true;
      taskItem.inspectionTasks=configTaskInspectionTasks(task.projectItems, taskItem.inspectionTaskType, responseDetail, containLoginUser);
      dataInfo.push(taskItem);
    }
  }
  return dataInfo;
}

/**
 * 巡检项 项目item
 * @param projectItems
 * @param inspectionTaskType
 * @param responseDetail
 * @param containLoginUser
 */
function configTaskInspectionTasks(projectItems: any[], inspectionTaskType: InspectionTaskType, responseDetail: any, containLoginUser: boolean) {
  let projects: InspectionTaskItemDataItem[]=[];
  ///当前巡检详情状态  未开始/执行中 才可编辑  已完成只能查看
  let executeStatus=responseDetail.executeStatus;
  let status=InspectionTaskStatus.new;
  for (let item of projectItems) {
    let project: InspectionTaskItemDataItem={};
    ///判断巡检项的状态
    if (!containLoginUser||executeStatus==4||executeStatus==2) {
      ///未释放/已完成状态  不能编辑巡检作业任务
      status=InspectionTaskStatus.view;
    } else {
      if (isEmptyString(item.inspectResult)) {
        status=InspectionTaskStatus.new;
      } else {
        status=InspectionTaskStatus.editInit;
      }
    }
    project.status=status;
    project.itemName=item.name;
    project.id=item.id;
    project.taskId=item.taskId;
    project.taskProjectId=item.taskProjectId;
    project.tagAbbreviation=item.tagAbbreviation;
    project.tagId=item.tagId;
    project.tagName=item.tagName;
    if (inspectionTaskType==InspectionTaskType.chaoBi) {
      project.range=(item.minValue? item.minValue:'-')+'~'+(item.maxValue? item.maxValue:'-');
      project.unit=item.unit;
      project.value=item.inspectResult;
    } else {
      project.content=item.content;
      project.results=item.inspectResult;
    }
    projects.push(project);
  }
  return projects;
}

/**
 * 检查是否还有未完成的巡检任务 true 还有未完成的项  false 没有未完成的项
 * @param detailInfo
 */
export function checkNoCompleteTask(detailInfo: any[]): boolean {
  let hasNoComplete=false;
  for (let info of detailInfo) {
    if (info.sectionType==InspectionDetailItemType.task) {
      for (let task of info.data) {
        for (let inspectionTask of task.inspectionTasks) {
          if (inspectionTask.status==InspectionTaskStatus.new||inspectionTask.status==InspectionTaskStatus.editing) {
            hasNoComplete=true;
            break;
          }
        }
      }
    }
  }
  return hasNoComplete;
}

/**
 * 构建巡检作业 展示数据
 * @param responseTask
 */
export function configTaskInfoMessage(responseTask: any) {
  let dataInfo: InspectionTaskData[]=[];
  if (responseTask&&responseTask.length>0) {
    for (let task of responseTask) {
      let taskItem: InspectionTaskData={};
      taskItem.title=task.name;
      taskItem.icon=require('../../../../../images/aaxiot/plantOperation/inspection/xunjianxiang.png');
      taskItem.id=task.id;
      taskItem.sceneId=task.sceneId;
      taskItem.deviceId=task.deviceId;
      if (task.type=='抄表类') {
        taskItem.inspectionTaskType=InspectionTaskType.chaoBi;
      } else {
        taskItem.inspectionTaskType=InspectionTaskType.panDu;
      }
      taskItem.isExpand=true;
      taskItem.data=configTaskItemData(task.projectItems, taskItem.inspectionTaskType);
      dataInfo.push(taskItem);
    }
  }
  return dataInfo;
}

function configTaskItemData(projectItems: any[], inspectionTaskType: InspectionTaskType) {
  let projects: TaskData[]=[];
  let status=InspectionTaskStatus.new;
  for (let item of projectItems) {
    let project: TaskData={};
    if (item.contentType!=null) {
      if (item.contentType==1) {
        ///文本
        project.taskType=TaskType.text;
      } else if (item.contentType==2) {
        project.taskType=TaskType.number;
      } else if (item.contentType==3) {
        project.taskType=TaskType.checkbox;
      } else if (item.contentType==4) {
        project.taskType=TaskType.dropdown;
      }
    }
    project.contentValue=item.contentValue;
    project.status=status;
    project.itemName=item.name;
    project.id=item.id;
    project.taskId=item.taskId;
    project.taskProjectId=item.taskProjectId;
    project.executorType=item.executorType;
    project.inspectResult=item.inspectResult;
    if (inspectionTaskType==InspectionTaskType.chaoBi) {
      project.range=(item.minValue? item.minValue:'-')+'~'+(item.maxValue? item.maxValue:'-');
      project.unit=item.unit;
      project.tagAbbreviation=item.tagAbbreviation;
      project.tagName=item.tagName;
      project.tagId=item.tagId;
    } else {
      project.content=item.content;
    }
    projects.push(project);
  }
  return projects;
}

/**
 * 通过场景code找场景id;
 * @param code
 * @param scenes
 */
export function findSceneIdBySceneCode(code: string, scenes: any[]) {
  let sceneObj=undefined;
  for (let scene of scenes) {
    if (scene.status==0&&scene.code==code) {
      sceneObj=scene;
      break;
    }
  }
  return sceneObj;
}

/**
 * 通过设备code找 设备id
 * @param deviceCode
 * @param devices
 */
export function findDeviceIdByDeviceCode(deviceCode: string, devices: any[]) {
  let deviceObj=undefined;
  for (let device of devices) {
    if (device.status==0&&device.deviceCode==deviceCode) {
      deviceObj=device;
      break;
    }
  }
  return deviceObj;
}



