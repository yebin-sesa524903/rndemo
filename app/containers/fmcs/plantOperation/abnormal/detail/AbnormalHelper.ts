import {
    AbnormalDetailItemType,
    AbnormalDetailRecordStatus
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {AbnormalRecord} from "../../../../../components/fmcs/plantOperation/abnormal/detail/AbnormalRecordItem";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import moment from "moment";


export const InitialAbnormalData = ()=>
    [
        {
            title: '基本信息',
            icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
            isExpand: true,
            sectionType: AbnormalDetailItemType.basicMsg,
            dataObj: [
                {
                    title: '工单编号',
                    content: '-'
                },
                {
                    title: '工单名称',
                    content: '-'
                },
                {
                    title: '产生时间',
                    content: '-'
                },
                {
                    title: '执行人',
                    content: '-'
                },
                {
                    title: '课室',
                    content: '-'
                },
                {
                    title: '系统',
                    content: '-'
                },
                {
                    title: '设备',
                    content: '-'
                },
                {
                    title: '来源',
                    content: '-'
                },
            ],
            remarkTitle:"异常点检内容",
            remark: '',
        },
        {
            title: '点检记录',
            icon: require('../../../../../images/aaxiot/airBottle/summary.png'),
            showAdd: true,
            taskResult: '',
            sectionType: AbnormalDetailItemType.abnormalRecord,
            records: []
        }
    ]


export function configAbnormalDataInfo(responseBasic: any, dataInfo: any[], userId: number, executorNames: string) {
    const detail = responseBasic;
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.basicMsg) {
            if (Object.keys(detail).length != 0) {
                element.dataObj[0].content = detail.code;
                element.dataObj[1].content = detail.name;
                element.dataObj[2].content = moment(detail.occurrenceTime).format(TimeFormatYMDHMS);
                element.dataObj[3].content = executorNames;
                element.dataObj[6].content = detail.deviceName;
                element.dataObj[7].content = convertAbnormalSource(detail.source);
                element.remark = detail.comment;
            }
        } else if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            let showAdd = (detail.executorIds?.indexOf(userId) != -1) && (detail.status != '已完成');
            element.showAdd = showAdd
            element.taskResult = showAdd ? (detail.executeResult??'请选择') : (detail.executeResult??'-');
        }
    }
    return [...dataInfo];
}

export const convertAbnormalSource = (source: string)=>{
    let repairSource = '-';
    switch (source){
        case '1':
            repairSource = 'Totalview报警';
            break;
        case '2':
            repairSource = 'SCADA';
            break;
        case '3':
            repairSource = '异常';
            break;
        case '4':
            repairSource = 'callin通知';
            break;
        case '9':
            repairSource = '其他';
            break;
    }
    return repairSource;
}


/**
 * 更新课室/系统名称
 * @param responseBasic
 * @param departmentCodes
 * @param basicMsgData
 */
export function updateClassAndSystemCode(responseBasic: any, departmentCodes: any[], basicMsgData: any[]){
    let departmentCode = '-';
    let systemCode = '-';
    for (let code of departmentCodes){
        if (code.value == responseBasic.departmentCode){
            departmentCode = code.label;
        }
        for (let child of code.children) {
            if (child.value == responseBasic.systemCode){
                systemCode = child.label;
            }
        }
    }
    for (let msg of basicMsgData) {
        if (msg.sectionType == AbnormalDetailItemType.basicMsg) {
            msg.dataObj[4].content = departmentCode;
            msg.dataObj[5].content = systemCode;
        }
    }
    return [...basicMsgData];
}


/**
 * 点检记录构建数组模型
 * @param responseBasic
 * @param responseRecord
 * @param dataInfo
 * @param userId
 */
export function configAbnormalRecord(responseBasic: any, responseRecord: any, dataInfo: any[], userId: number) {
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            element.records = configRecords(responseRecord, responseBasic.status, responseBasic?.executorIds?.indexOf(userId) != -1);
        }
    }
    return [...dataInfo];
}

/**
 * 构建点检记录列表 数据
 * @param responseRecord
 * @param status
 * @param hasCurrent    ///执行人是否包含当前登录用户
 */
function configRecords(responseRecord: any, status: string, hasCurrent: boolean) {
    let records: AbnormalRecord[] = [];
    for (let record of responseRecord) {
        records.push({
            id: record.id,
            taskId: record.taskId,
            code: isEmptyString(record.code) ? '-' : record.code,
            comment: record.comment,
            recordStatus: (!hasCurrent ?  AbnormalDetailRecordStatus.preview : (status == '已完成' ? AbnormalDetailRecordStatus.preview : AbnormalDetailRecordStatus.edit)),
        })
    }
    return records;
}

/**
 * 添加一条记录
 * @param dataInfo
 * @param taskId
 * @param code
 */
export function addRecordToDataInfo(dataInfo: any[], taskId: string, code: string) {
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            let record = {
                id: '',
                taskId: taskId,
                code: String(Number(code) + 1),
                comment: '',
                recordStatus: AbnormalDetailRecordStatus.initial,
            }
            element.records.push(record);
        }
    }
    return [...dataInfo];
}

/**
 * 保存记录将已保存的记录拿出来
 * @param dataInfo
 * @param itemObj
 */
export function configAbnormalRecordsParams(dataInfo: any[], itemObj: AbnormalRecord) {
    let records = [];
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            for (let item of element.records) {
                records.push({
                    id: item.id,
                    taskId: item.taskId,
                    code: item.code,
                    comment: item.comment,
                })
            }
        }
    }
    return {
        taskId: itemObj.taskId,
        list: records,
    }
}

/**
 * 是否有空记录
 * @param dataInfo
 */
export function hasEmptyRecord(dataInfo: any[]) {
    let hasEmpty = false;
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            for (let elementElement of element.records) {
                if (isEmptyString(elementElement.id)) {
                    hasEmpty = true;
                    break;
                }
            }
        }
    }
    return hasEmpty;
}

/**
 * 是否有正在编辑的记录
 * @param dataInfo
 */
export function hasEditingRecord(dataInfo: any[]){
    let hasEditing = false;
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            for (let elementElement of element.records) {
                if (elementElement.recordStatus == AbnormalDetailRecordStatus.editing || elementElement.recordStatus == AbnormalDetailRecordStatus.initial) {
                    hasEditing = true;
                    break;
                }
            }
        }
    }
    return hasEditing;
}

/**
 * 是否有点击记录
 * @param dataInfo
 */
export function hasRecords(dataInfo: any[]){
    let hasRecord = false;
    for (let element of dataInfo) {
        if (element.sectionType == AbnormalDetailItemType.abnormalRecord) {
            if (element.records.length > 0){
                hasRecord = true;
                break;
            }
        }
    }
    return hasRecord;
}
