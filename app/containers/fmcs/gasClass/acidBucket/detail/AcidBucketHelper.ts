import {statusConvertString} from "../list/AcidBucketList";
import {BucketItemType} from "../../../../../components/fmcs/gasClass/acidBucket/detail/BucketDetailItem";
import moment from "moment/moment";
import {isEmptyString, TimeFormatYMDHM} from "../../../../../utils/const/Consts";

/**
 * 酸桶更换待执行 前吹操作初始值
 */
export const AcidBucketDetailToDoData = ()=>[
    {
        title: '基本信息',
        icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
        sectionType: 0,
        dataObj: [
            {
                isRequire: false,
                canEdit: false,
                title: '更换位置',
                subTitle: '',
            },
            {
                isRequire: false,
                canEdit: false,
                title: '计划时间',
                subTitle: '',
            },
            {
                isRequire: false,
                canEdit: false,
                title: '创建人',
                subTitle: '',
            },
            {
                isRequire: false,
                canEdit: false,
                title: '创建时间',
                subTitle: '',
            },
            {
                isRequire: false,
                canEdit: false,
                title: '任务状态',
                subTitle: '',
            }
        ]
    },
    {
        title: '更换操作',
        icon: require('../../../../../images/aaxiot/acidBucket/change.png'),
        sectionType: 1,
        dataObj: [
            {
                isRequire: true,
                canEdit: true,
                title: '操作人',
                type: BucketItemType.operator,
                subTitle: '请选择',
            },
            {
                isRequire: true,
                canEdit: true,
                title: '确认人',
                type: BucketItemType.confirm,
                subTitle: '请选择',
            },
        ]
    }]

/**
 *  将接口返回的detail转换成页面业务模型
 * @param detail
 * @param acidDetailData
 * @param user
 */
export const convertRequestDetail = (detail: any, acidDetailData: any[], user?: any) => {
    let isAlloc = (detail.operatorId != undefined && detail.operatorId > 0) || (detail.confirmId != undefined && detail.confirmId > 0);
    let detailInfo = acidDetailData;
    for (let element of detailInfo) {
        if (element.sectionType == 0) {
            element.dataObj[0].subTitle = isEmptyString(detail.deviceName) ? '-' : detail.deviceName + `(${detail.positionName})`;
            element.dataObj[1].subTitle = moment(detail.planChangeTime).format(TimeFormatYMDHM);
            element.dataObj[2].subTitle = detail.createBy;
            element.dataObj[3].subTitle = moment(detail.createTime).format(TimeFormatYMDHM);
            element.dataObj[4].subTitle = statusConvertString(detail.status);
        } else if (element.sectionType == 1) {
            if (isAlloc) {
                element.dataObj[0].subTitle = detail.operator;
                element.dataObj[0].isRequire = !isAlloc;
                element.dataObj[0].canEdit = !isAlloc;
                element.dataObj[1].subTitle = detail.confirm;
                element.dataObj[1].isRequire = !isAlloc;
                element.dataObj[1].canEdit = !isAlloc;
            }else {
                let userName = '请选择';
                if (user != undefined){
                    userName = user.RealName;
                }
                element.dataObj[0].subTitle = userName;
                element.dataObj[0].isRequire = true;
                element.dataObj[0].canEdit = true;
                element.dataObj[1].subTitle = userName;
                element.dataObj[1].isRequire = true;
                element.dataObj[1].canEdit = true;
            }
        }
    }
    return [...detailInfo];
}


/**
 * 执行中数据初始值
 */
export const AcidBucketDoingDetail = ()=>
    [
        {
            title: '基本信息',
            icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
            sectionType: 0,
            dataObj: [
                {
                    isRequire: false,
                    canEdit: false,
                    title: '更换位置',
                    subTitle: '',
                },
                {
                    isRequire: false,
                    canEdit: false,
                    title: '计划时间',
                    subTitle: '',
                },
                {
                    isRequire: false,
                    canEdit: false,
                    title: '创建人',
                    subTitle: '',
                },
                {
                    isRequire: false,
                    canEdit: false,
                    title: '创建时间',
                    subTitle: '',
                },
                {
                    isRequire: false,
                    canEdit: false,
                    title: '任务状态',
                    subTitle: '',
                }
            ]
        },
        {
            title: '更换操作',
            icon: require('../../../../../images/aaxiot/acidBucket/change.png'),
            sectionType: 1,
            dataObj: [
                {
                    isRequire: false,
                    canEdit: false,
                    title: '操作人',
                    subTitle: '',
                },
                {
                    isRequire: false,
                    canEdit: false,
                    title: '确认人',
                    subTitle: '',
                },
                {
                    isRequire: false,
                    canEdit: false,
                    title: '开始时间',
                    subTitle: '',
                },
                {
                    isRequire: true,
                    canEdit: true,
                    itemType: 'scan',
                    title: '酸桶批号',
                    type: BucketItemType.serialNo,
                    subTitle: '',
                    placeholder: '请输入扫描酸桶批号',
                },
                {
                    isRequire: false,
                    canEdit: true,
                    itemType: 'tip',
                    title: '备注',
                    subTitle: '',
                    type: BucketItemType.remark,
                    placeholder: '请输入',
                }
            ]
        }
    ]

/**
 * 更新 编辑 执行中 业务模型
 * @param detail
 * @param acidDetailData
 * @param isCurrentUser
 */
export const convertExecutingRequestDetail = (detail: any, acidDetailData: any[], isCurrentUser: boolean) => {
    let detailInfo = acidDetailData;
    for (let element of detailInfo) {
        if (element.sectionType == 0) {
            element.dataObj[0].subTitle = detail.deviceName + `(${detail.positionName})`;
            element.dataObj[1].subTitle = moment(detail.planChangeTime).format(TimeFormatYMDHM);
            element.dataObj[2].subTitle = detail.createBy;
            element.dataObj[3].subTitle = moment(detail.createTime).format(TimeFormatYMDHM);
            element.dataObj[4].subTitle = statusConvertString(detail.status);
        } else if (element.sectionType == 1) {
            element.dataObj[0].subTitle = detail.operator;
            element.dataObj[1].subTitle = detail.confirm;
            element.dataObj[2].subTitle = moment(detail.actualStartTime).format(TimeFormatYMDHM);
            element.dataObj[3].isRequire = isCurrentUser;
            element.dataObj[3].subTitle = detail.serialNo;
            element.dataObj[3].canEdit = isCurrentUser;
            element.dataObj[4].canEdit = isCurrentUser;
            element.dataObj[4].subTitle = detail.remark;
        }
    }
    return [...detailInfo];
}
