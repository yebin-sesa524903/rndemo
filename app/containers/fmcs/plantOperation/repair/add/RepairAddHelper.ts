import {
    RepairAddRowType,
    RepairDetailItemType
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {RepairAddBasicProps} from "../../../../../components/fmcs/plantOperation/repair/add/RepairAddBasic";

/**
 * 故障保修 数据模型
 */
export const InitialAddRepairInfo = ()=> [
    {
        title: '基本信息',
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        isExpand: true,
        sectionType: RepairDetailItemType.basicMsg,
        data: [
            {
                isRequire: true,
                canEdit: false,
                rowType: RepairAddRowType.orderNo,
                title: '工单编号',
                value: '',
            },
            {
                isRequire: true,
                canEdit: true,
                rowType: RepairAddRowType.orderName,
                title: '工单名称',
                value: '',
                placeholder: '请输入',
            },
            {
                isRequire: true,
                canEdit: true,
                rowType: RepairAddRowType.department,
                title: '课室',
                value: '',
                placeholder: '请选择',
                dropdownOptions: [],
            },
            {
                isRequire: false,
                canEdit: true,
                rowType: RepairAddRowType.system,
                title: '系统',
                value: '',
                placeholder: '请选择',
                dropdownOptions: [],
            },
            {
                isRequire: true,
                canEdit: true,
                rowType: RepairAddRowType.device,
                title: '设备',
                value: '',
                placeholder: '请选择',
            },
            {
                isRequire: true,
                canEdit: true,
                rowType: RepairAddRowType.repairType,
                title: '维修类型',
                value: '',
                placeholder: '内部维修/委外维修',
                dropdownOptions: [{title: '内部维修', id: '1'}, {title: '委外维修', id: '2'}],
            },
            {
                isRequire: true,
                canEdit: true,
                rowType: RepairAddRowType.repairSource,
                title: '维修需求来源',
                value: '',
                placeholder: '巡检/保养/异常点检/厂务工务/突发故障/其他',
                dropdownOptions: [
                    {title: '巡检', id: '1'},
                    {title: '保养', id: '2'},
                    {title: '异常点检', id: '3'},
                    {title: '厂务工务', id: '4'},
                    {title: '突发故障', id: '5'},
                    {title: '其他', id: '9'}],
            },
            {
                isRequire: false,
                canEdit: true,
                rowType: RepairAddRowType.relateOrderNo,
                title: '关联工单',
                value: '',
                placeholder: '请选择',
            },
            {
                isRequire: true,
                canEdit: true,
                rowType: RepairAddRowType.faultDescription,
                title: '故障描述',
                value: '',
                placeholder: '请输入',
            }
        ]
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
 * 更新添加故障报修 行信息
 * @param value
 * @param rowType
 * @param addRepairInfo
 */
export function updateRowValueWithType(value: string, rowType: RepairAddRowType, addRepairInfo: RepairAddBasicProps[]) {
    for (let info of addRepairInfo) {
        if (info.sectionType == RepairDetailItemType.basicMsg) {
            for (let datum of info.data) {
                if (datum.rowType == rowType) {
                    datum.value = value;
                    break;
                }
            }
        }
    }
    return [...addRepairInfo];
}

/**
 * 更新课室下拉选择
 * @param departmentCodes
 * @param addRepairInfo
 */
export function updateDepartmentCodes(departmentCodes: any[], addRepairInfo: RepairAddBasicProps[]) {
    for (let info of addRepairInfo) {
        if (info.sectionType == RepairDetailItemType.basicMsg) {
            for (let datum of info.data) {
                if (datum.rowType == RepairAddRowType.department) {
                    datum.dropdownOptions = departmentCodes;
                }
            }
        }
    }
    return [...addRepairInfo];
}

/**
 * 更新系统下拉选择
 * @param systemCodes
 * @param addRepairInfo
 */
export function updateSystemCodes(systemCodes: any[], addRepairInfo: RepairAddBasicProps[]) {
    for (let info of addRepairInfo) {
        if (info.sectionType == RepairDetailItemType.basicMsg) {
            for (let datum of info.data) {
                if (datum.rowType == RepairAddRowType.system) {
                    datum.dropdownOptions = systemCodes;
                }
            }
        }
    }
    return [...addRepairInfo];
}



/**
 * 构建图片展示模型
 * @param response
 * @param repairInfo
 */
export function configRepairPictures(response: any, repairInfo: any[]) {
    let res = JSON.parse(response).data;
    for (let basicObj of repairInfo) {
        if (basicObj.sectionType == RepairDetailItemType.repairPicture) {
            for (const image of basicObj.images) {
                if (image.name == res.fileName){
                    image.canRemove = true;
                    image.needUpload = false;
                    image.id = res.id;
                }
            }
        }
    }
    return [...repairInfo];
}

/**
 * 请求构建图片的id集合
 * @param addRepairInfo
 */
export function configFileAttribute(addRepairInfo: any[]){
    let fileAttribute = [];
    for (let basicObj of addRepairInfo) {
        if (basicObj.sectionType == RepairDetailItemType.repairPicture) {
            for (let image of basicObj.images){
                fileAttribute.push(image.id);
            }
        }
    }
    return fileAttribute;
}
