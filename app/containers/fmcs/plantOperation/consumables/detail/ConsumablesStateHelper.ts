import {
    ConsumablesDetailItemType,
    ConsumablesReplacementStatus,
    ConsumablesStatus,
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {
    SparePartsOutboundData
} from "../../../../../components/fmcs/plantOperation/consumables/detail/SparePartsOutbound";
import {
    ConsumablesReplacementData
} from "../../../../../components/fmcs/plantOperation/consumables/detail/ConsumablesReplacement";
import {sortArray} from "../../utils/Utils";
import moment from "moment";

export const InitialDetailInfo = ()=> [
    {
        title: '基本信息',
        canEit: false,
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        isExpand: true,
        sectionType: ConsumablesDetailItemType.basicMsg,
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
                title: '计划执行时间',
                subTitle: '-',
            },
            {
                title: '执行人',
                subTitle: '-'
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
                title: '工单状态',
                subTitle: '-',
            },
            {
                title: '取消原因',
                subTitle: '-',
            },
            {
                title: '工单描述',
                subTitle: '-',
            }
        ]
    },
    {
        title: '耗材更换清单',
        canEdit: true,
        icon: require('../../../../../images/aaxiot/consumables/haocaigenhuanqingdan.png'),
        sectionType: ConsumablesDetailItemType.exchangeList,
        status: ConsumablesStatus.waitExecute,
        data: []
    },
    {
        title: '备件出库单',
        canEdit: true,
        icon: require('../../../../../images/aaxiot/consumables/beijianchukudan.png'),
        sectionType: ConsumablesDetailItemType.outbound,
        data: []
    }
]

/**
 * 将接口返回的数据 转换成基本信息展示 业务模型数组
 * @param responseBasic 接口获取的耗材基本信息
 * @param basicMsgData  用户展示的 耗材详情业务模型
 * @param user
 * @param executorNames
 */
export function convertBasicMessage(responseBasic: any, basicMsgData: any[], user: any, executorNames: string) {
    for (let msg of basicMsgData) {
        if (msg.sectionType == ConsumablesDetailItemType.basicMsg) {
            msg.data[0].subTitle = responseBasic.code;
            msg.data[1].subTitle = responseBasic.name;
            msg.data[2].subTitle = moment(responseBasic.planDate).format(TimeFormatYMDHMS);
            msg.data[3].subTitle = executorNames;
            msg.data[6].subTitle = isEmptyString(responseBasic.deviceName) ? '-' : responseBasic.deviceName;
            msg.data[7].subTitle = convertConsumablesStatus(responseBasic.status);
            msg.data[8].subTitle = isEmptyString(responseBasic.cancelReason) ? '-' : responseBasic.cancelReason;
            msg.data[9].subTitle = isEmptyString(responseBasic.remark) ? '-' : responseBasic.remark;
        } else if (msg.sectionType == ConsumablesDetailItemType.exchangeList) {
            if (responseBasic.status == '4') {
                msg.status = ConsumablesStatus.complete;
            } else if (responseBasic.status == '1') {
                msg.status = ConsumablesStatus.executing;
            } else {
                msg.status = ConsumablesStatus.waitExecute;
            }
            msg.data = convertChangeList(responseBasic);
        } else if (msg.sectionType == ConsumablesDetailItemType.outbound) {
            msg.data = convertWarehouseExitList(responseBasic.warehouseExitList);
        }
        if (responseBasic.status == '4'){
            ///已完成不能编辑
            msg.canEdit = false;
        }else{
            ///执行人包含当前登录用户 或者  任务分配到岗位,当前登录账号为该岗位;
            msg.canEdit = (responseBasic.taskObject.indexOf(user.Id) != -1) || user.TitleCode == responseBasic.taskObject;
        }
    }
    return [...basicMsgData];
}

/**
 * 更新课室及系统
 * @param responseBasic
 * @param departmentCodes
 * @param basicMsgData
 */
export function updateDepartmentAndSystemCode(responseBasic: any, departmentCodes: any[], basicMsgData: any[]) {
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
        if (msg.sectionType == ConsumablesDetailItemType.basicMsg) {
            msg.data[4].subTitle = departmentCode;
            msg.data[5].subTitle = systemCode;
        }
    }
    return [...basicMsgData];
}

/**
 * 从详情中构建并 保存 耗材清单
 * @param responseBasic
 */
export function configConsumablesList(responseBasic: any) {
    let spareList = [];
    if (responseBasic.spareList && responseBasic.spareList.length > 0) {
        for (const element of responseBasic.spareList) {
            spareList.push({
                id: element.sparePartAssetId,
                name: element.name,
                sparePartCode: element.sparePartCode,
                quantity: element.quantity,
            })
        }
    }
    return spareList;
}

/**
 * 构建 更换清单 模型数组
 * @param responseBasic
 */
const convertChangeList = (responseBasic: any) => {
    let data: ConsumablesReplacementData[] = [];
    if (responseBasic.spareList && responseBasic.spareList.length > 0) {
        for (let element of responseBasic.spareList) {
            let status = ConsumablesReplacementStatus.initial;
            if (responseBasic.status == '4') {
                status = ConsumablesReplacementStatus.preview;
            } else if (responseBasic.status == '1' && element.quantity == undefined) {
                status = ConsumablesReplacementStatus.edit;
            }

            data.push({
                id: element.sparePartAssetId,
                ticketId: element.ticketId,
                name: element.name,
                code: element.sparePartCode,
                quantity: element.quantity,
                inputStatus: status,
                inputPlaceholder: '请输入'
            })
        }
    }
    return data;
}


/**
 * 更新备件状态
 * @param detailInfo
 * @param id
 * @param status
 */
export function changeConsumablesStatus(detailInfo: any[], id: number, status: ConsumablesReplacementStatus) {
    for (let info of detailInfo) {
        if (info.sectionType == ConsumablesDetailItemType.exchangeList) {
            for (let datum of info.data) {
                if (datum.id == id) {
                    datum.inputStatus = status;
                    break;
                }
            }
        }
    }
    return [...detailInfo]
}

/**
 * 选择耗材回调 刷新列表
 * @param detailInfo
 * @param spareList
 * @param selectedList
 */
export function didSelectedConsumables(detailInfo: any[], spareList: any[], selectedList: any[]) {
    let newConsumables = [];
    for (const spare of spareList) {
        let founded = false;
        for (const selected of selectedList) {
            if (selected.id == spare.id) {
                founded = true;
            }
        }
        if (!founded) {
            newConsumables.push(spare);
        }
    }
    for (let info of detailInfo) {
        if (info.sectionType == ConsumablesDetailItemType.exchangeList) {
            if (newConsumables.length > 0) {
                for (const element of newConsumables) {
                    info.data.push({
                        id: element.id,
                        name: element.name,
                        code: element.code,
                        quantity: 1,
                        inputStatus: ConsumablesReplacementStatus.edit,
                        inputPlaceholder: '请输入'
                    })
                    selectedList.push({
                        id: element.id,
                        name: element.name,
                        sparePartCode: element.code,
                        quantity: 1,
                    })
                }

            }
        }
    }
    return {detailInfo: [...detailInfo], selectedList: selectedList};
}

/**
 * 删除耗材清单记录
 * @param item
 * @param detailInfo
 * @param consumablesList
 */
export function removeConsumables(item: ConsumablesReplacementData, detailInfo: any[], consumablesList: any[]) {
    for (let info of detailInfo) {
        if (info.sectionType == ConsumablesDetailItemType.exchangeList) {
            info.data.splice(info.data.indexOf(item), 1);
        }
    }
    let records = consumablesList.filter((res: any) => {
        return res.id != item.id;
    })
    return {detailInfo: [...detailInfo], consumablesList: records};
}

/**
 * 检查有没有保存的记录
 * @param detailInfo
 */
export function checkHasNoSaveRecords(detailInfo: any[]): boolean {
    let hasNoSave = false;
    for (let info of detailInfo) {
        if (info.sectionType == ConsumablesDetailItemType.exchangeList) {
            for (let datum of info.data) {
                if (datum.inputStatus == ConsumablesReplacementStatus.edit) {
                    hasNoSave = true;
                    break;
                }
            }
        }
    }
    return hasNoSave;
}

/**
 * 耗材状态转换
 * @param type
 */
const convertConsumablesStatus = (type: string) => {
    let statusString = '-';
    switch (type) {
        case '3':
            statusString = '待执行';
            break;
        case '1':
            statusString = '执行中';
            break;
        case '4':
            statusString = '已完成';
            break;
    }
    return statusString;
}

/**
 * 生成备件出库单 入参 构建
 * @param ticketNo
 * @param consumablesList
 * @param responseDetail
 * @param userName
 */
export function configGenerateWarehouseExitParams(ticketNo: string, consumablesList: any[], responseDetail: any, userName: string) {
    let detailList = [];
    for (let consumable of consumablesList){
        detailList.push({
            assetEntryId: consumable.id,
            warehouseExitQuantity: consumable.quantity,
        })
    }

    return {
        detailList: detailList,
        deviceId: responseDetail.deviceId,
        deviceName: responseDetail.deviceName,
        classroomId: responseDetail.departmentCode,
        ownershipSystemId: responseDetail.systemCode,
        warehouseExitTime: moment().format(TimeFormatYMDHMS),
        use: '耗材更换',
        associatedVoucher: responseDetail.code,
        recipient: userName,
        warehouseExitNo: ticketNo,
    }
}

/**
 * 备件出库单构建
 * @param responseTools
 */
export function convertWarehouseExitList(responseTools: any) {
    let tools: SparePartsOutboundData[] = [];
    if (responseTools && responseTools.length > 0) {
        let sortData = sortArray(responseTools);
        for (let sort of sortData) {
            let toolsData = [];
            for (let sortObj of sort) {
                toolsData.push(configToolData(sortObj));
            }
            if (sort.length > 0) {
                let responseTool = sort[0];
                tools.push({
                    id: responseTool.id,
                    noTitle: '出库单号',
                    userTitle: '领用人',
                    outboundNo: responseTool.warehouseExitNo,
                    recipients: responseTool.recipient,
                    data: toolsData,
                })
            }
        }
    }
    return tools;
}

/**
 * 备件出库单数据组合
 * @param responseTool
 */
function configToolData(responseTool: any) {
    let data = [];
    for (let i = 0; i < 4; i++) {
        let obj = {name: '', value: ''};
        if (i == 0) {
            obj.name = '备件编码';
            obj.value = responseTool.code;
        } else if (i == 1) {
            obj.name = '名称';
            obj.value = responseTool.name;
        } else if (i == 2) {
            obj.name = '出库数量';
            obj.value = responseTool.warehouseExitQuantity ?? '-';
        } else if (i == 3) {
            obj.name = '退库数量';
            obj.value = responseTool.warehouseExitCancelQuantity ?? '-';
        }
        data.push(obj);
    }
    return data;
}


/**
 * 构建提交入参
 * @param responseDetail
 * @param basicMsgData
 */
export function configConsumablesSubmitParams(responseDetail: any, basicMsgData: any[]) {
    let spareList = [];
    let warehouseExitList = [];

    for (let info of basicMsgData) {
        if (info.sectionType == ConsumablesDetailItemType.exchangeList) {
            for (let datum of info.data) {
                spareList.push({
                    sparePartAssetId: datum.id,
                    sparePartCode: datum.code,
                    quantity: datum.quantity,
                    name: datum.name,
                })
            }
        }else if(info.sectionType == ConsumablesDetailItemType.outbound){
            for (let datum of info.data) {
                warehouseExitList.push(datum.outboundNo);
            }
        }
    }
    let taskObj = '';
    let taskObject = responseDetail.taskObject;
    if (typeof taskObject == 'string'){
        taskObj = taskObject;
    }else {
        taskObj = taskObject.join(',');
    }

    let params = Object.assign({}, responseDetail, {
        spareList: spareList,
        taskObject: taskObj,
        warehouseExitList: warehouseExitList,
    })
    return params;
}
