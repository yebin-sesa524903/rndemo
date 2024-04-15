import {
    MaintainDetailItemType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {MaintainItemsStatus} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainItems";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {
    MaintainReplacementData
} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainReplacement";
import {MaintainImages} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainPicture";
import moment from "moment";
import {sortArray} from "../../utils/Utils";
import storage from "../../../../../utils/storage";

export const InitialBasicMsg = () => [
    {
        title: '基本信息',
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        isExpand: true,
        canEdit: false,
        sectionType: MaintainDetailItemType.basicMsg,
        data: [
            {
                title: '任务编号',
                subTitle: '-',
            },
            {
                title: '设备',
                subTitle: '-',
            },
            {
                title: '规格型号',
                subTitle: '-',
            },
            {
                title: '课室',
                subTitle: '-',
            },
            {
                title: '系统',
                subTitle: '-',
            },
            {
                title: '计划日期',
                subTitle: '-',
            },
            {
                title: '执行人',
                subTitle: '-',
            },
            {
                title: '执行状态',
                subTitle: '-',
            },
            {
                title: '执行完成时间',
                subTitle: '-',
            },
          {
            title: '执行方式',
            subTitle: '-',
          }
        ]
    },

    {
        title: '保养项目',
        icon: require('../../../../../images/aaxiot/plantOperation/maintain/shebeibaoyang.png'),
        isExpand: true,
        canEdit: true,
        sectionType: MaintainDetailItemType.maintainItems,
        data: [],
    },

    {
        title: '异常总结',
        icon: require('../../../../../images/aaxiot/plantOperation/maintain/yichang.png'),
        isExpand: true,
        sectionType: MaintainDetailItemType.summaryExcept,
        canEdit: true,
    },

    {
        title: '设备运行总结',
        icon: require('../../../../../images/aaxiot/plantOperation/maintain/shebeiyunxing.png'),
        isExpand: true,
        sectionType: MaintainDetailItemType.summaryDevice,
        canEdit: true,
    },
    {
        title: '图片',
        icon: require('../../../../../images/aaxiot/plantOperation/maintain/tupian.png'),
        isExpand: true,
        sectionType: MaintainDetailItemType.maintainPicture,
        canEdit: true,
        images: [],
    }
]

/**
 * 将接口返回的数据 转换成基本信息展示 业务模型数组
 * @param responseBasic 接口获取的保养基本信息
 * @param responseTask 接口获取的保养任务 集合
 * @param basicMsg  用户展示的 保养详情业务模型
 * @param executorNames 执行人名称 (基本信息未返回这个字段, 暂时通过列表获取)
 * @param userId
 * @param isCreditCard
 */

export function convertBasicMessage(responseBasic: any, responseTask: any, basicMsg: any[], executorNames?: string, userId?: number, isCreditCard? : boolean) {
    let basicMsgData = basicMsg;
    for (let msg of basicMsg) {
        if (msg.sectionType == MaintainDetailItemType.basicMsg) {
            msg.data[0].subTitle = responseBasic.code;
            msg.data[1].subTitle = responseBasic.deviceName;
            msg.data[2].subTitle = `${responseBasic.deviceClass}/${responseBasic.deviceType}/${responseBasic.specification}`;
            msg.data[3].subTitle = isEmptyString(responseBasic.departmentName) ? '-' : responseBasic.departmentName;
            msg.data[4].subTitle = isEmptyString(responseBasic.systemName) ? '-' : responseBasic.systemName;
            msg.data[5].subTitle = moment(responseBasic.planDate).format(TimeFormatYMDHMS);
            msg.data[6].subTitle = executorNames;
            msg.data[7].subTitle = responseBasic.status;
            msg.data[8].subTitle = isEmptyString(responseBasic.finishedTime) ? '-' : moment(responseBasic.finishedTime).format(TimeFormatYMDHMS);
          msg.data[9].subTitle = getMaintainType(responseTask, isCreditCard) == 1 ? "直接开始" : '刷卡执行';
        } else if (msg.sectionType == MaintainDetailItemType.maintainItems) {
            ///遍历保养任务 集合
            let tasks = [];
            if (responseTask && responseTask.length > 0) {
                for (let task of responseTask) {
                    tasks.push({
                        projectId: task.projectId,
                        title: task.projectName,
                        isExpand: true,
                        maintainItems: configTaskItems(task.items, responseBasic.status),
                    })
                }
            }
            msg.data = tasks;
        } else if (msg.sectionType == MaintainDetailItemType.summaryExcept) {
            msg.value = responseBasic.abnormalSummary;
        } else if (msg.sectionType == MaintainDetailItemType.summaryDevice) {
            msg.value = responseBasic.deviceRunningSummary;
        }
        msg.canEdit = (responseBasic.executorIds.indexOf(userId) == -1) ? false : (responseBasic.status != '已完成');
    }
    return [...basicMsgData];
}

/**
 * 保养项 items 构建
 * @param items
 */
function configTaskItems(items: any, statusString: string) {
    let maintainItems: any[] = [];
    for (let item of items) {
        let status;
        if (statusString == '已完成') {
            status = MaintainItemsStatus.view;
        } else {
            if (isEmptyString(item.executeResult) && isEmptyString(item.remark)) {
                status = MaintainItemsStatus.new;
            } else {
                status = MaintainItemsStatus.edit;
            }
        }
        maintainItems.push({
            id: item.id,
            maintainItem: item.itemName,
            maintainContent: item.itemContent,
          maintainType: item.contentType,
          maintainResult: item.executeResult,
          contentValue: item.contentValue,
          remark: item.remark,
            status: status,
        })
    }
    return maintainItems;
}

/**
 * 获取当前保养任务是什么方式执行的  刷卡执行/直接开始  executorType 2:刷卡 / 1:直接开始
 * @param responseTask
 * @param isCreditCard 是否是刷卡 true:是;  false: 直接开始
 */
export function getMaintainType(responseTask: any, isCreditCard? : boolean) {
  let executorType = 1;
  if (responseTask && responseTask.length > 0) {
    for (let task of responseTask) {
      if (task.items && task.items.length > 0){
        for (let item of task.items) {
          if (item.executorType != undefined){
            executorType = item.executorType;
            break;
          }
        }
      }
    }
  }

  if (isCreditCard != undefined){
    return isCreditCard ? 2 : 1;
  }
  return executorType;
}

/**
 * 检查是否还有未完成的保养人任务 true 还有未完成的项  false 没有未完成的项
 * @param basicMsg
 */
export function checkNoCompleteMaintain(basicMsg: any[]): boolean {
    let hasNoComplete = false;
    for (let info of basicMsg) {
        if (info.sectionType == MaintainDetailItemType.maintainItems) {
            for (let task of info.data) {
                for (let maintainItem of task.maintainItems) {
                    if (maintainItem.status == MaintainItemsStatus.new || maintainItem.status == MaintainItemsStatus.editing) {
                        hasNoComplete = true;
                        break;
                    }
                }
            }
        }
    }
    return hasNoComplete;
}


/**
 * 将接口返回的备件更换数据 转换成 业务模型数组
 * @param responseSpareParts
 */
export function convertSpareParts(responseSpareParts: any) {
    let spareParts: MaintainReplacementData[] = [];
    let sortData = sortArray(responseSpareParts);
    for (let sort of sortData) {
        let toolsData = [];
        for (let sortObj of sort) {
            toolsData.push(configSparePartData(sortObj));
        }
        if (sort.length > 0) {
            let responseSpare = sort[0];
            spareParts.push({
                id: responseSpare.id,
                noTitle: '出库单号',
                userTitle: '领用人',
                outboundNo: responseSpare.warehouseExitNo,
                recipients: responseSpare.recipient,
                data: toolsData,
            })
        }
    }
    return spareParts;
}

function configSparePartData(responseSpare: any) {
    let data = [];
    for (let i = 0; i < 4; i++) {
        let obj = {name: '', value: ''};
        if (i == 0) {
            obj.name = '备件编码';
            obj.value = isEmptyString(responseSpare.code) ? '-' : responseSpare.code;
        } else if (i == 1) {
            obj.name = '名称';
            obj.value = isEmptyString(responseSpare.name) ? '-' : responseSpare.name;
        } else if (i == 2) {
            obj.name = '出库数量';
            obj.value = responseSpare.warehouseExitQuantity == null ? '-' : responseSpare.warehouseExitQuantity;
        } else if (i == 3) {
            obj.name = '退库数量';
            obj.value = responseSpare.warehouseExitCancelQuantity == null ? '-' : responseSpare.warehouseExitCancelQuantity;
        }
        data.push(obj);
    }
    return data;
}


/**
 * 将接口返回的数据转换成 业务模型数据
 * @param responseTools
 */
export function convertReceivingTools(responseTools: any) {
    let tools: MaintainReplacementData[] = [];
    for (let responseTool of responseTools) {
        tools.push({
            id: responseTool.id,
            taskId: responseTool.taskId,
            noTitle: '领用单号',
            userTitle: '领用人',
            outboundNo: responseTool.serialNo,
            recipients: responseTool.borrowByName,
            data: [configToolData(responseTool)],
        })
    }
    return tools;
}

function configToolData(responseTool: any) {
    let data = [];
    for (let i = 0; i < 4; i++) {
        let obj = {name: '', value: ''};
        if (i == 0) {
            obj.name = '工具名称';
            obj.value = responseTool.name;
        } else if (i == 1) {
            obj.name = '工具编码';
            obj.value = responseTool.code;
        } else if (i == 2) {
            obj.name = '领用状态';
            obj.value = responseTool.usageStatus == 0 ? '已领用' : '已归还';///领用状态 0: 已领用  1: 已归还
        } else if (i == 3) {
            obj.name = '领用时间';
            obj.value = moment(responseTool.borrowTime).format(TimeFormatYMDHMS);
        }
        data.push(obj);
    }
    return data;
}

/**
 * 构建图片展示模型
 * @param basicMsg
 * @param images
 */
export function configMaintainPictures(basicMsg: any[], images: any[]) {
    for (let msg of basicMsg) {
        if (msg.sectionType == MaintainDetailItemType.maintainPicture) {
            msg.images = convertImages(images);
        }
    }
    return [...basicMsg];
}

function convertImages(images: any[]) {
    let data: MaintainImages[] = [];
    for (let image of images) {
        data.push({
            id: image.id,
            uri: storage.getOssBucket() + `/lego-bff/bff/ledger/rest/downloadFile?id=${image.id}`,
            name: image.filename,
            canRemove: true,
            needUpload: false,
        })
    }
    return data;
}
