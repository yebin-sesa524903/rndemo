import {
    SpareOutStoreHouseItemType,
    SpareOutStoreStatus,
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {
    SpareOutStoreSpareMsgData
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/detail/SpareOutStoreSpareMsgItem";
import moment from "moment";

export const InitialSpareOutStoreData = () => [
    {
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        title: '基本信息',
        isExpand: true,
        sectionType: SpareOutStoreHouseItemType.basicMsg,
        dataObj: [
            {
                title: '出库单号',
                content: '-'
            },
            {
                title: '课室',
                content: '-'
            },
            {
                title: '出库时间',
                content: '-'
            },
            {
                title: '执行人',
                content: '-'
            },
            {
                title: '所属系统',
                content: '-'
            },
            {
                title: '设备',
                content: '-'
            },
            {
                title: '用途',
                content: '-'
            },
            {
                title: '关联单号',
                content: '-'
            },
        ],
        remarkTitle: "备注",
        remark: '-'
    },
    {
        icon: require('../../../../../images/aaxiot/airBottle/baseInfo.png'),
        title: '备件信息',
        canEdit: true,
        isWithdrawal: true,
        sectionType: SpareOutStoreHouseItemType.spareInfo,
        data: [],
    }
]


/**
 * 构建盘点详情业务模型数组
 * @param responseBasic
 * @param dataInfo
 */
export function configSpareOutStoreDataInfo(responseBasic: any, dataInfo: any[]) {
    for (let element of dataInfo) {
        if (element.sectionType == SpareOutStoreHouseItemType.basicMsg) {
            if (Object.keys(responseBasic).length != 0) {
                element.dataObj[0].content = responseBasic.warehouseExitNo;
                // element.dataObj[1].content = responseBasic.classroomId;
                element.dataObj[2].content = moment(responseBasic.warehouseExitTime).format(TimeFormatYMDHMS);
                element.dataObj[3].content = responseBasic.recipient;
                // element.dataObj[4].content = responseBasic.ownershipSystemId;
                element.dataObj[5].content = (isEmptyString(responseBasic.deviceName) ? '-' : responseBasic.deviceName);
                element.dataObj[6].content = responseBasic.use;
                element.dataObj[7].content = (isEmptyString(responseBasic.associatedVoucher) ? '-' : responseBasic.associatedVoucher);
                element.remark = (isEmptyString(responseBasic.remark) ? '-' : responseBasic.remark);
            }
        } else if (element.sectionType == SpareOutStoreHouseItemType.spareInfo) {
            let spares = [];
            ///是否是退库操作
            let isWithdrawal = true;
            element.isWithdrawal = isWithdrawal;
            if (responseBasic.detailList && responseBasic.detailList.length > 0) {
                for (let detailObj of responseBasic.detailList) {
                    spares.push({
                        id: detailObj.id,
                        assetEntryId: detailObj.assetEntryId,
                        spareName: detailObj.name,
                        code: detailObj.code,
                        inventory: detailObj.inventory,
                        warehouseExitId: detailObj.warehouseExitId,
                        outStoreCount: detailObj.warehouseExitQuantity,
                        withdrawalCount: detailObj.warehouseExitCancelQuantity ?? 0,
                        spareOutStatus: isWithdrawal ? SpareOutStoreStatus.withdrawal : SpareOutStoreStatus.edit,
                    })
                }
            }
            element.data = spares;
        }
    }
    let input = Object.assign({}, {
        id: responseBasic.id,
        warehouseExitNo: responseBasic.warehouseExitNo,
        use: responseBasic.use,
        associatedVoucher: responseBasic.associatedVoucher,
        recipient: responseBasic.recipient,
        warehouseExitTime: responseBasic.warehouseExitTime,
        remark: responseBasic.remark,
        classroomId: responseBasic.classroomId,
        ownershipSystemId: responseBasic.ownershipSystemId,
        deviceId: responseBasic.deviceId,
        deviceName: responseBasic.deviceName,
    });

    return {dataInfo: [...dataInfo], input: input};
}


/**
 * 更新课室及系统
 * @param responseBasic
 * @param departmentCodes
 * @param basicMsgData
 */
export function updateSpareOutStoreDepartmentAndSystemCode(responseBasic: any, departmentCodes: any[], basicMsgData: any[]) {
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
        if (msg.sectionType == SpareOutStoreHouseItemType.basicMsg) {
            msg.dataObj[1].content = departmentCode;
            msg.dataObj[4].content = systemCode;
        }
    }
    return [...basicMsgData];
}


/**
 * 更新备件信息 状态
 * @param dataInfo
 * @param spareOutStatus
 * @param msgData
 */
export function changeSpareOutStoreStatus(dataInfo: any[], spareOutStatus: SpareOutStoreStatus, msgData: SpareOutStoreSpareMsgData) {
    for (const datum of dataInfo) {
        if (datum.sectionType == SpareOutStoreHouseItemType.spareInfo){
            for ( let spareObj of datum.data) {
                if (spareObj.id == msgData.id){
                    spareObj.spareOutStatus = spareOutStatus;
                    /// 处理输入为空的情况
                    if (spareOutStatus == SpareOutStoreStatus.withdrawal){
                        ///保存点击
                        if (typeof spareObj.withdrawalCount == "string"){
                            if (isEmptyString(spareObj.withdrawalCount)){
                                spareObj.withdrawalCount = 0;
                            }
                        }
                    }
                    break;
                }
            }
        }
    }
    return [...dataInfo];
}

/**
 * 删除一条备件记录
 * @param dataInfo
 * @param msgData
 */
export function deleteSpareOutStore(dataInfo: any[], msgData: SpareOutStoreSpareMsgData){
    for (let datum of dataInfo) {
        if (datum.sectionType == SpareOutStoreHouseItemType.spareInfo){
            datum.data.splice(datum.data.indexOf(msgData), 1);
        }
    }
    return [...dataInfo];
}

/**
 * 更新退库数量
 * @param dataInfo
 * @param text
 * @param msgData
 */
export function updateWithdrawalCountCount(dataInfo: any[], text: string, msgData: SpareOutStoreSpareMsgData){
    for (const datum of dataInfo) {
        if (datum.sectionType == SpareOutStoreHouseItemType.spareInfo){
            for ( let spareObj of datum.data) {
                if (spareObj.id == msgData.id){
                    if (spareObj.outStoreCount >= Number(text)){
                        spareObj.withdrawalCount = text;
                    }else {
                        spareObj.withdrawalCount = spareObj.outStoreCount;
                    }
                    break;
                }
            }
        }
    }
    return [...dataInfo];
}


/**
 * 完成提交 构建 入参里detailList
 * @param dataInfo
 */
export function configExitStoreDetailList(dataInfo: any[]) {
    let detailList = [];
    for (const datum of dataInfo) {
        if (datum.sectionType == SpareOutStoreHouseItemType.spareInfo){
            for ( let spareObj of datum.data) {
                detailList.push({
                    id: spareObj.id,
                    assetEntryId: spareObj.assetEntryId,
                    inventory:spareObj.inventory,
                    warehouseExitId: spareObj.warehouseExitId,
                    warehouseExitQuantity: Number(spareObj.outStoreCount),  ///出库数量
                    warehouseExitCancelQuantity: Number(spareObj.withdrawalCount) == 0 ? null : Number(spareObj.withdrawalCount),///退库数量
                })
            }
        }
    }
    return detailList;
}
