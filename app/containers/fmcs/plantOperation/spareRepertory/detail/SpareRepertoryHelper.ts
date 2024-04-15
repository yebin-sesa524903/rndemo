import {
    ConsumablesDetailItemType,
    InventoryStatus,
    SpareRepertoryItemType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
    SpareRepertoryStatus
} from "../../../../../components/fmcs/plantOperation/spareRepertory/detail/SpareRepertoryList";
import {isEmptyString, TimeFormatYMD, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import moment from "moment";

export const InitialSpareRepertoryDetailInfo = () =>
    [
        {
            icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
            title: '基本信息',
            isExpand: true,
            sectionType: SpareRepertoryItemType.baseInfo,
            dataObj: [
                {
                    title: '盘点计划名称',
                    content: '-'
                },
                {
                    title: '盘点编号',
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
                    title: '计划日期',
                    content: '-'
                },
                {
                    title: '盘点负责人',
                    content: '-'
                },
                {
                    title: '执行状态',
                    content: '-'
                }
            ],
            remarkTitle:"备注",
            remark: '-'
        },
        {
            icon: require('../../../../../images/aaxiot/airBottle/summary.png'),
            title: '备件盘点表',
            isExpand: true,
            canEdit: true,
            sectionType: SpareRepertoryItemType.spareList,
            waitData: [],
            doneData: [],
        }
    ]

/**
 * 构建盘点详情业务模型数组
 * @param responseBasic
 * @param dataInfo
 * @param inventoryStatus
 */
export function configSpareRepertoryDataInfo(responseBasic: any, dataInfo: any[], inventoryStatus: InventoryStatus) {
    for (let element of dataInfo) {
        if (element.sectionType == SpareRepertoryItemType.baseInfo) {
            if (Object.keys(responseBasic).length != 0) {
                element.dataObj[0].content = responseBasic.inventoryName;
                element.dataObj[1].content = responseBasic.inventoryNo;
                element.dataObj[4].content = moment(responseBasic.planStartTime).format(TimeFormatYMD) + '至' + moment(responseBasic.planEndTime).format(TimeFormatYMD) ;
                element.dataObj[5].content = responseBasic.principal;
                element.dataObj[6].content = convertSpareRepertoryStatus(responseBasic.executionStatus);
                element.remark = (isEmptyString(responseBasic.remark) ? '-' : responseBasic.remark);
            }
        } else if (element.sectionType == SpareRepertoryItemType.spareList) {
            let showStart = (responseBasic.executionStatus != 'FINISHED');
            element.showStart = showStart;
            element.canEdit = showStart;
            element.inventoryStatus = inventoryStatus;
            let listData1: any[] = [], listData2: any[] = [];
            if (responseBasic.list && responseBasic.list.length > 0) {
                for (let listElement of responseBasic.list) {
                    if (listElement.inventoryResults == null) {
                        listData1.push(configInventoryData(listElement, false, SpareRepertoryStatus.initial, inventoryStatus));
                    } else {
                        listData2.push(configInventoryData(listElement, true, SpareRepertoryStatus.edit, inventoryStatus));
                    }
                }
            }
            element.waitData = listData1;
            element.doneData = listData2;
        }
    }
    return [...dataInfo];
}


/**
 * 更新课室及系统
 * @param responseBasic
 * @param departmentCodes
 * @param basicMsgData
 */
export function updateSpareRepertoryDepartmentAndSystemCode(responseBasic: any, departmentCodes: any[], basicMsgData: any[]) {
    let departmentCode = '-';
    let systemCode = '-';
    for (let code of departmentCodes) {
        if (code.value == responseBasic.classroomId) {
            departmentCode = code.label;
        }
        for (let child of code.children) {
            if (child.value == responseBasic.ownershipSystemId) {
                systemCode = child.label;
            }
        }
    }
    for (let msg of basicMsgData) {
        if (msg.sectionType == SpareRepertoryItemType.baseInfo) {
            msg.dataObj[2].content = departmentCode;
            msg.dataObj[3].content = systemCode;
        }
    }
    return [...basicMsgData];
}

function configInventoryData(listElement: any, isComplete: boolean, repertoryStatus: SpareRepertoryStatus, inventoryStatus: InventoryStatus) {
    let tempData = [];
    for (let i = 0; i < 6; i++) {
        if (i == 0) {
            tempData.push({
                title: '备件名称',
                content: listElement.name,
                canEdit: false,
            })
        } else if (i == 1) {
            tempData.push({
                title: '备件编码',
                content: listElement.code,
                canEdit: false,
            })
        } else if (i == 2) {
            tempData.push({
                title: '品牌',
                content: listElement.brand,
                canEdit: false,
            })
        } else if (i == 3) {
            tempData.push({
                title: '类型',
                content: listElement.typeName,
                canEdit: false,
            })
        } else if (i == 4) {
            tempData.push({
                id: listElement.id,
                inventoryId: listElement.inventoryId,
                title: '盘点结果',
                content: String(listElement.inventoryResults),
                canEdit: !isComplete,
                repertoryStatus: repertoryStatus,
            })
        } else if (i == 5) {
            if (inventoryStatus == InventoryStatus.inventorying) {
                tempData.push({
                    id: listElement.id,
                    inventoryId: listElement.inventoryId,
                    content: '',
                    canEdit: true,
                    repertoryStatus: repertoryStatus,
                })
            }
        }
    }
    return tempData;
}

/**
 * 修改 盘点数据的状态
 * @param id
 * @param isComplete
 * @param dataInfo
 * @param repertoryStatus
 */
export function changeInventoryStatus(id: number, isComplete: boolean, dataInfo: any[], repertoryStatus: SpareRepertoryStatus) {
    for (let element of dataInfo) {
        if (element.sectionType == SpareRepertoryItemType.spareList) {
            if (isComplete) {
                for (let data of element.doneData) {
                    if (data[data.length - 1].id == id) {
                        data[data.length - 1].repertoryStatus = repertoryStatus;
                        data[data.length - 2].repertoryStatus = repertoryStatus;
                        data[data.length - 2].canEdit = (repertoryStatus == SpareRepertoryStatus.editing);
                    }
                }
            } else {
                for (let data of element.waitData) {
                    if (data[data.length - 1].id == id) {
                        data[data.length - 1].repertoryStatus = repertoryStatus;
                        data[data.length - 2].repertoryStatus = repertoryStatus;
                        data[data.length - 2].canEdit = (repertoryStatus == SpareRepertoryStatus.editing);
                    }
                }
            }
        }
    }
    return [...dataInfo];
}

/**
 * 获取取消之前的 盘点结果
 * @param responseBasic
 * @param id
 */
export function getCancelBeforeInventoryCount(responseBasic: any, id: number) {
    let inventory = 0;
    for (let record of responseBasic.list){
        if (record.id == id){
            if (record.inventoryResults != null){
                inventory = record.inventoryResults;
            }
            break;
        }
    }
    return inventory;
}

/**
 * 更新盘点结果
 * @param text
 * @param id
 * @param isComplete
 * @param dataInfo
 */
export function changeInventoryResult(text: string, id: number, isComplete: boolean, dataInfo: any[]) {
    for (let element of dataInfo) {
        if (element.sectionType == SpareRepertoryItemType.spareList) {
            if (isComplete) {
                for (let data of element.doneData) {
                    if (data[data.length - 2].id == id) {
                        data[data.length - 2].content = text;
                    }
                }
            } else {
                for (let data of element.waitData) {
                    if (data[data.length - 2].id == id) {
                        data[data.length - 2].content = text;
                    }
                }
            }
        }
    }
    return [...dataInfo];
}

/**
 * 构建保存草稿入参
 * @param inventoryId
 * @param dataInfo
 */
export function configSaveDraftParams(inventoryId: number, dataInfo: any[]) {
    let params: any = {
        inventoryId: inventoryId,
        list: []
    }

    for (let element of dataInfo) {
        if (element.sectionType == SpareRepertoryItemType.spareList) {
            for (let data of element.doneData) {
                params.list.push({
                    id: data[data.length - 2].id,
                    inventoryResults: data[data.length - 2].content,
                })
            }
            for (let data of element.waitData) {
                params.list.push({
                    id: data[data.length - 2].id,
                    inventoryResults: data[data.length - 2].content,
                })
            }
        }
    }
    return params;
}


/**
 * 完成提交 入参构建
 * @param inventoryId
 * @param dataInfo
 * @param inventoryStatus
 */
export function configSubmitParams(inventoryId: number, dataInfo: any[], inventoryStatus: InventoryStatus) {
    let params: any = {
        inventoryId: inventoryId,
        list: []
    }

    for (let element of dataInfo) {
        if (element.sectionType == SpareRepertoryItemType.spareList) {
            for (let data of element.doneData) {
                params.list.push({
                    id: (inventoryStatus == InventoryStatus.inventorying ? data[data.length - 2].id : data[data.length - 1].id),
                    inventoryResults: (inventoryStatus == InventoryStatus.inventorying ? data[data.length - 2].content : data[data.length - 1].content),
                })
            }
        }
    }
    return params;
}

/**
 * 检查是否还有未盘点的项目
 * @param dataInfo
 */
export function checkNoInventoryResults(dataInfo: any[]) {
    let hasNoInventoryResult = false;
    for (let element of dataInfo) {
        if (element.sectionType == SpareRepertoryItemType.spareList) {
            if (element.waitData.length > 0) {
                hasNoInventoryResult = true;
                break;
            }
        }
    }
    return hasNoInventoryResult;
}

/**
 * 检查是否有未保存到盘点记录
 * @param dataInfo
 */
export function checkHasNoSaveRecords(dataInfo: any[]) {
    let hasNoSaveResult = false;
    let spareList = JSON.parse(JSON.stringify(dataInfo));
    for (let element of spareList) {
        if (element.sectionType == SpareRepertoryItemType.spareList) {
            if (element.doneData.length > 0) {
                for (const datum of element.doneData) {
                    if (datum.length > 0){
                        let spareObj = datum.pop();
                        if (spareObj.repertoryStatus == SpareRepertoryStatus.editing){
                            hasNoSaveResult = true;
                            break;
                        }
                    }
                }
            }
        }
    }
    return hasNoSaveResult;
}

/**
 * 状态转换
 * @param responseStatus
 */
export function convertSpareRepertoryStatus(responseStatus: string) {
    let statusString = '';
    switch (responseStatus) {
        case 'NOT_STARTED':
            statusString = '待执行';
            break;
        case 'EXECUTING':
            statusString = '执行中';
            break;
        case 'FINISHED':
            statusString = '已完成';
            break;
    }
    return statusString;
}
