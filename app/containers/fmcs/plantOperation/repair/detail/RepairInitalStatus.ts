import {
    RepairDetailItemType,
    RepairStatus
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {MaintainImages} from "../../../../../components/fmcs/plantOperation/maintain/detail/MaintainPicture";
import moment from "moment/moment";
import storage from "../../../../../utils/storage";

/**
 * 维修详情 基本执行 初始数据
 */
export const InitialBasicMsgData = () => [
    {
        title: '基本信息',
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        isExpand: true,
        sectionType: RepairDetailItemType.basicMsg,
        data: [
            {
                title: '工单编号',
                subTitle: '-',
            },
            {
                title: '工单名称',
                subTitle: '-',
            },
            {
                title: '计划维修时间',
                subTitle: '-',
            },
            {
                title: '执行人',
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
                title: '设备',
                subTitle: '-',
            },
            {
                title: '维修类型',
                subTitle: '-',
            },
            {
                title: '维修需求来源',
                subTitle: '-',
            },
            {
                title: '关联工单号',
                subTitle: '-',
            },
        ],
        pictures: [],
    },
    {
        title: '维修记录',
        icon: require('../../../../../images/aaxiot/plantOperation/maintain/shebeibaoyang.png'),
        isExpand: true,
        canEdit: true,
        sectionType: RepairDetailItemType.repairRecords,
        repairStatus: RepairStatus.initial,
        records: [],
    },

    {
        title: '图片',
        icon: require('../../../../../images/aaxiot/plantOperation/maintain/tupian.png'),
        isExpand: true,
        sectionType: RepairDetailItemType.repairPicture,
        canEdit: true,
        images: [],
    }
]

/**
 * 将接口返回的数据 转换成基本信息展示 业务模型数组
 * @param responseBasic 接口获取的保养基本信息
 * @param responseRepairList 接口获取的保养任务 集合
 * @param basicMsgData  用户展示的 保养详情业务模型
 * executorNames 执行人名称 (基本信息未返回这个字段, 暂时通过列表获取)
 * @param userId
 * @param executorNames 执行人
 */
export function convertBasicMessage(responseBasic: any, responseRepairList: any, basicMsgData: any[], userId: number, executorNames: string) {
    for (let msg of basicMsgData) {
        if (msg.sectionType == RepairDetailItemType.basicMsg) {
            msg.data[0].subTitle = responseBasic.code;
            msg.data[1].subTitle = responseBasic.name;
            msg.data[2].subTitle = moment(responseBasic.planDate).format(TimeFormatYMDHMS);
            msg.data[3].subTitle = executorNames;
            msg.data[6].subTitle = isEmptyString(responseBasic.deviceName) ? '-' : responseBasic.deviceName;
            msg.data[7].subTitle = convertRepairType(responseBasic.type);
            msg.data[8].subTitle = convertRepairSource(responseBasic.source);
            msg.data[9].subTitle = isEmptyString(responseBasic.relateCode) ? '-' : responseBasic.relateCode;
        } else if (msg.sectionType == RepairDetailItemType.repairRecords) {
            ///遍历保养任务 集合
            let tasks = [];
            if (responseRepairList && Object.keys(responseRepairList).length > 0) {
                for (let task of responseRepairList.list) {
                    tasks.push({
                        id: task.id,
                        taskId: task.taskId,
                        title: task.name,
                        content: task.record,
                        isEdit: false,
                    })
                }
                msg.faultPhenomenon = responseRepairList.faultPhenomenon;
                msg.faultCause = responseRepairList.faultCause;
                msg.records = tasks;
                msg.repairStatus = (
                    ((responseBasic.executorIds.indexOf(userId) == -1) || (responseBasic.status == '已完成')) ?
                        RepairStatus.view :
                        (tasks.length > 0 ? RepairStatus.addHasRecordsNoInput : RepairStatus.initial)
                );
            }
        }
        msg.canEdit = (responseBasic.executorIds.indexOf(userId) == -1) ? false : (responseBasic.status != '已完成');
    }
    return [...basicMsgData];
}

export function bindClassAndSystemCode(responseBasic: any, departmentCodes: any[], basicMsgData: any[]) {
    let departmentCode = '-';
    let systemCode = '-';
    for (let code of departmentCodes) {
        if (code.value == responseBasic.departmentCode) {
            departmentCode = code.label;
        }
        for (let child of code.children) {
            if (child.value == responseBasic.systemCode) {
                systemCode = child.label;
            }
        }
    }
    for (let msg of basicMsgData) {
        if (msg.sectionType == RepairDetailItemType.basicMsg) {
            msg.data[4].subTitle = departmentCode;
            msg.data[5].subTitle = systemCode;
        }
    }
    return [...basicMsgData];
}

/**
 * 检查是否有未保存的维修记录
 * @param basicMsgData
 */
export function checkHasNoSaveRecord(basicMsgData: any[]): boolean {
    let hasNoSaveRecord = false;
    for (let msg of basicMsgData) {
        if (msg.sectionType == RepairDetailItemType.repairRecords) {
            if (msg.repairStatus == RepairStatus.addHasRecordsHasInput || msg.repairStatus == RepairStatus.addNoRecords) {
                hasNoSaveRecord = true;
                break;
            }
        }
    }
    return hasNoSaveRecord;
}

const convertRepairType = (type: string) => {
    let repairType = '-';
    switch (type) {
        case '1':
            repairType = '内部维修';
            break;
        case '2':
            repairType = '委外维修';
            break;
    }
    return repairType;
}

export const convertRepairSource = (source: string) => {
    let repairSource = '-';
    switch (source) {
        case '1':
            repairSource = '巡检';
            break;
        case '2':
            repairSource = '异常点检';
            break;
        case '3':
            repairSource = '保养';
            break;
        case '4':
            repairSource = '厂务工单';
            break;
        case '5':
            repairSource = '突发故障';
            break;
        case '9':
            repairSource = '其他';
            break;
    }
    return repairSource;
}

/**
 * 维修异常图片展示
 * @param basicMsg
 * @param images
 * @param fileAttribute
 */
export function configRepairAbnormalImages(basicMsg: any[], images: any[], fileAttribute: string) {
    let files: string | any[] = [];
    if (!isEmptyString(fileAttribute)) {
        files = fileAttribute.split(',');
    }
    for (let msg of basicMsg) {
        if (msg.sectionType == RepairDetailItemType.basicMsg) {
            let tempArray = [];
            for (let image of images) {
                if (files.indexOf(String(image.id)) != -1) {
                    let url = storage.getOssBucket() + `/lego-bff/bff/ledger/rest/downloadFile?id=${image.id}`;
                    tempArray.push(url);
                }
            }
            msg.pictures = tempArray;
        }
    }
    return [...basicMsg];
}

/**
 * 构建图片展示模型
 * @param basicMsg
 * @param images
 */
export function configRepairPictures(basicMsg: any[], images: any[]) {
    for (let msg of basicMsg) {
        if (msg.sectionType == RepairDetailItemType.repairPicture) {
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
            needUpload: false,
            canRemove: true,
        })
    }
    return data;
}
