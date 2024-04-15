
import React from "react";
import {FlatList, InteractionManager, View} from 'react-native';
import {connect} from "react-redux";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {BucketDetailItem, BucketDetailProps} from "../../../../../components/fmcs/gasClass/acidBucket/detail/BucketDetailItem";
import {loadAcidBucketDetail} from "../../../../../actions/acidBucket/acidBucketAction";
import {statusConvertString} from "../list/AcidBucketList";
import moment from "moment";
import {TimeFormatYMDHM} from "../../../../../utils/const/Consts";

/**
 * 已完成
 * @constructor
 */
function AcidBucketCompleteDetail (props: any){

    React.useEffect(()=>{
        props.loadAcidBucketDetail(props.bucketObj.id);
    }, [])

    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    let configDetailData : BucketDetailProps[] = React.useMemo(()=>{
        const detail = props.bucketDetail;
        return [
            {
                title: '基本信息',
                icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
                dataObj: [
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '更换位置',
                        subTitle: `${detail.deviceName}(${detail.positionName})`,
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '计划时间',
                        subTitle: moment(detail.planChangeTime).format(TimeFormatYMDHM),
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '创建人',
                        subTitle: detail.createBy,
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '创建时间',
                        subTitle: moment(detail.createTime).format(TimeFormatYMDHM),
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '任务状态',
                        subTitle: statusConvertString(detail.status),
                    }
                ]
            },
            {
                title: '更换操作',
                icon: require('../../../../../images/aaxiot/acidBucket/change.png'),
                dataObj: [
                    {
                        isRequire: false,
                        canEdit:false,
                        title: '操作人',
                        subTitle: detail.operator,
                    },
                    {
                        isRequire: false,
                        canEdit:false,
                        title: '确认人',
                        subTitle: detail.confirm,
                    },
                    {
                        isRequire: false,
                        canEdit:false,
                        title: '开始时间',
                        subTitle: moment(detail.actualStartTime).format(TimeFormatYMDHM),
                    },
                    {
                        isRequire: false,
                        canEdit:false,
                        title: '结束时间',
                        subTitle: moment(detail.actualEndTime).format(TimeFormatYMDHM),
                    },
                    {
                        isRequire: false,
                        canEdit:false,
                        title: '酸桶批号',
                        subTitle: detail.serialNo,
                    },
                    {
                        isRequire: false,
                        canEdit:false,
                        title: '备注',
                        itemType:'tip',
                        subTitle: detail.remark,
                    }
                ]
            }
        ]
    }, [props.bucketDetail]);


    return (
        <View style={{flex: 1}}>
            <Toolbar title={'酸桶更换任务详情'} navIcon="back" onIconClicked={onPopBack}/>
            <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
                <FlatList data={configDetailData} renderItem={(item) => BucketDetailItem(item.item)}
                    // @ts-ignore
                          keyExtractor={(item, index) => item.title + index}/>
            </View>
        </View>
    )
}


const mapStateToProps = (state: any) => {
    const bucketDetail = state.acidBucket.AcidBucketDetailReducer;
    return {
        bucketDetail: bucketDetail.detail,
    }
}

export default connect(mapStateToProps, {loadAcidBucketDetail}) (AcidBucketCompleteDetail);
