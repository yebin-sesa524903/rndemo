import React from "react";
import {FlatList, InteractionManager, View} from 'react-native';
import {connect} from "react-redux";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import {
    BottleDetailItem,
    BottleItemType,
    BottleSectionType
} from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetaiItem";
import {
    airBottleDetailLoadingStatus,
    cleaAirBottleDetail,
    loadAirBottleDetail
} from "../../../../../actions/airBottle/airBottleAction";
import {handleImageUrl, isEmptyString, TimeFormatYMD, TimeFormatYMDHM} from "../../../../../utils/const/Consts";
import moment from "moment/moment";
import {RequestStatus} from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import ImageView from "react-native-image-viewing";

///气瓶已完成 详情
function AirBottleCompleteDetail(props: any) {
    /**
     * 图片浏览 是否可见
     */
    const [imageViewingVisible, setImageViewingVisible] = React.useState({
        visible: false,
        sectionType: BottleSectionType.basicMsg,
        PTType: 1,
        index: 0
    });

    /**
     * 构建初始状态数组
     */
    const configInitialData = () => {
        return [
            {
                title: '基本信息',
                icon: require('../../../../../images/aaxiot/airBottle/basic_msg.png'),
                sectionType: BottleSectionType.basicMsg,
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                dataObj: [
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '气柜名称',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '计划时间',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '创建人',
                        subTitle: ''
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
                title: '前吹操作',
                icon: require('../../../../../images/aaxiot/airBottle/blow.png'),
                sectionType: BottleSectionType.blowing,
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                dataObj: [
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '前吹操作人',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '前吹确认人',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '前吹开始',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '前吹结束',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '备注',
                        subTitle: '',
                        type: BottleItemType.tip,
                    },
                ]
            },
            {
                title: '换瓶操作',
                icon: require('../../../../../images/aaxiot/airBottle/change.png'),
                sectionType: BottleSectionType.exchange,
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                dataObj: [
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '换瓶操作人',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '换瓶确认人',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: 'PT1照片',
                        type: BottleItemType.picture,
                        pictures: [],
                        onPressPicture: (index: number) => {
                            setImageViewingVisible({
                                visible: true,
                                sectionType: BottleSectionType.exchange,
                                PTType: 1,
                                index: index
                            });
                        }
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: 'PT2照片',
                        type: BottleItemType.picture,
                        pictures: [],
                        onPressPicture: (index: number) => {
                            setImageViewingVisible({
                                visible: true,
                                sectionType: BottleSectionType.exchange,
                                PTType: 2,
                                index: index
                            });
                        }
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '更换开始',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '更换结束',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '物料号',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '钢瓶号',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '有限日期',
                        subTitle: ''
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '垫片使用数量',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '备注',
                        subTitle: '',
                        type: BottleItemType.tip,
                    },
                ]
            },
            {
                title: 'Standby操作',
                icon: require('../../../../../images/aaxiot/airBottle/standby.png'),
                isExpand: true,
                expandCallBack: (sectionType: BottleSectionType) => {
                    onPressExpend(sectionType);
                },
                sectionType: BottleSectionType.standby,
                dataObj: [
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '待机操作人',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '待机确认人',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: 'PT1照片',
                        type: BottleItemType.picture,
                        pictures: [],
                        onPressPicture: (index: number) => {
                            setImageViewingVisible({
                                visible: true,
                                sectionType: BottleSectionType.standby,
                                PTType: 1,
                                index: index
                            });
                        }
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: 'PT2照片',
                        type: BottleItemType.picture,
                        pictures: [],
                        onPressPicture: (index: number) => {
                            setImageViewingVisible({
                                visible: true,
                                sectionType: BottleSectionType.standby,
                                PTType: 2,
                                index: index
                            });
                        }
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '待机开始',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '待机结束',
                        subTitle: '',
                    },
                    {
                        isRequire: false,
                        canEdit: false,
                        title: '备注',
                        subTitle: '',
                        type: BottleItemType.tip,
                    },
                ]
            }
        ];
    }

    const [detailDataSource, setDetailDataSource] = React.useState(configInitialData);

    /**
     * 请求详情数据
     */
    React.useEffect(() => {
        props.loadAirBottleDetail(props.airBottle.id);
    }, []);

    /**
     * 监听详情获取 请求状态
     */
    React.useEffect(() => {
        if (props.loadingStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.loadingStatus == RequestStatus.success) {
            SndToast.dismiss();
            props.airBottleDetailLoadingStatus(RequestStatus.initial);
        } else if (props.loadingStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.loadingStatus]);

    React.useEffect(() => {
        return () => {
            props.cleaAirBottleDetail();
            props.airBottleDetailLoadingStatus(RequestStatus.initial);
        }
    }, []);

    /**
     * 根据接口返回 刷新列表数据
     */
    React.useEffect(() => {
        const detail = props.detail;
        ///照片数组
        let changePT1 = [], changePT2 = [], waitPT1 = [], waitPT2 = [];
        if (detail.fileList && detail.fileList.length > 0) {
            for (const file of detail.fileList) {
                if (file.fieldCode.indexOf('CHANGE_PT1') !== -1) {
                    changePT1.push({uri: handleImageUrl(file.fileKey), needUpload: false});
                } else if (file.fieldCode.indexOf('CHANGE_PT2') !== -1) {
                    changePT2.push({uri: handleImageUrl(file.fileKey), needUpload: false});
                } else if (file.fieldCode.indexOf('WAIT_PT1_IMAGE') !== -1) {
                    waitPT1.push({uri: handleImageUrl(file.fileKey), needUpload: false});
                } else if (file.fieldCode.indexOf('WAIT_PT2_IMAGE') !== -1) {
                    waitPT2.push({uri: handleImageUrl(file.fileKey), needUpload: false});
                }
            }
        }

        for (let element of detailDataSource) {
            if (element.sectionType == BottleSectionType.basicMsg) {
                element.dataObj[0].subTitle = detail.deviceName + `(${detail.positionName})`;
                element.dataObj[1].subTitle = moment(detail.planChangeTime).format(TimeFormatYMDHM);
                element.dataObj[2].subTitle = detail.createBy;
                element.dataObj[3].subTitle = moment(detail.createTime).format(TimeFormatYMDHM);
                element.dataObj[4].subTitle = detail.statusDesc;
            } else if (element.sectionType == BottleSectionType.blowing) {
                element.dataObj[0].subTitle = detail.blowOperator;
                element.dataObj[1].subTitle = detail.blowConfirm;
                element.dataObj[2].subTitle = moment(detail.blowStartTime).format(TimeFormatYMDHM);
                element.dataObj[3].subTitle = moment(detail.blowEndTime).format(TimeFormatYMDHM);
                element.dataObj[4].subTitle = detail.blowRemark;
            } else if (element.sectionType == BottleSectionType.exchange) {
                element.dataObj[0].subTitle = detail.changeOperator;
                element.dataObj[1].subTitle = detail.changeConfirm;
                // @ts-ignore
                element.dataObj[2].pictures = changePT1;
                // @ts-ignore
                element.dataObj[3].pictures = changePT2;
                element.dataObj[4].subTitle = moment(detail.changeStartTime).format(TimeFormatYMDHM);
                element.dataObj[5].subTitle = isEmptyString(detail.changeEndTime) ? '-' : moment(detail.changeEndTime).format(TimeFormatYMDHM);
                element.dataObj[6].subTitle = detail.material;
                element.dataObj[7].subTitle = detail.cylinderNo;
                let validTime =  moment(detail.validTime).format(TimeFormatYMD);
                if (validTime == 'Invalid date' || validTime == 'invalid date'){
                    element.dataObj[8].subTitle = '-';
                }else {
                    element.dataObj[8].subTitle = validTime;
                }
                element.dataObj[9].subTitle = detail.shimActUsageQuantity;
                element.dataObj[10].subTitle = detail.changeRemark;
            } else if (element.sectionType == BottleSectionType.standby) {
                element.dataObj[0].subTitle = detail.waitOperator;
                element.dataObj[1].subTitle = detail.waitConfirm;
                // @ts-ignore
                element.dataObj[2].pictures = waitPT1;
                // @ts-ignore
                element.dataObj[3].pictures = waitPT2;
                element.dataObj[4].subTitle = moment(detail.waitStartTime).format(TimeFormatYMDHM);
                element.dataObj[5].subTitle = moment(detail.waitEndTime).format(TimeFormatYMDHM);
                element.dataObj[6].subTitle = detail.waitRemark;
            }
        }

        setDetailDataSource([...detailDataSource]);
    }, [props.detail]);

    /**
     * 展开收起点击
     * @param sectionType
     */
    const onPressExpend = (sectionType: BottleSectionType) => {
        const dataSource = detailDataSource;
        for (let dataSourceElement of dataSource) {
            // @ts-ignore
            if (dataSourceElement.sectionType == sectionType) {
                // @ts-ignore
                dataSourceElement.isExpand = !dataSourceElement.isExpand;
                break;
            }
        }
        setDetailDataSource([...dataSource]);
    }

    const onPop = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    /**
     * 图片浏览器 大图浏览
     */
    const renderImageViewing = () => {
        let images1 = [], images2 = [];
        let detail = props.detail;
        if (imageViewingVisible.sectionType == BottleSectionType.exchange) {
            ///更换图片预览
            if (detail.fileList && detail.fileList.length > 0) {
                for (const file of detail.fileList) {
                    if (file.fieldCode.indexOf('CHANGE_PT1') !== -1) {
                        images1.push({uri: handleImageUrl(file.fileKey)});
                    } else if (file.fieldCode.indexOf('CHANGE_PT2') !== -1) {
                        images2.push({uri: handleImageUrl(file.fileKey)});
                    }
                }
            }
        } else if (imageViewingVisible.sectionType == BottleSectionType.standby) {
            ///standby图片预览
            if (detail.fileList && detail.fileList.length > 0) {
                for (const file of detail.fileList) {
                    if (file.fieldCode.indexOf('WAIT_PT1_IMAGE') !== -1) {
                        images1.push({uri: handleImageUrl(file.fileKey)});
                    } else if (file.fieldCode.indexOf('WAIT_PT2_IMAGE') !== -1) {
                        images2.push({uri: handleImageUrl(file.fileKey)});
                    }
                }
            }
        }


        return (
            <ImageView
                images={imageViewingVisible.PTType == 1 ? images1 : images2}
                keyExtractor={(imageSrc, index) => imageSrc + String(index)}
                imageIndex={imageViewingVisible.index}
                visible={imageViewingVisible.visible}
                onRequestClose={() => setImageViewingVisible({
                    visible: false,
                    sectionType: BottleSectionType.basicMsg,
                    PTType: 1,
                    index: 0
                })}
            />
        )
    }

    return (
        <View style={{flex: 1}}>
            <Toolbar title={'气瓶更换任务详情'} navIcon="back" onIconClicked={onPop}/>
            <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
                <FlatList data={detailDataSource}
                          contentContainerStyle={{paddingBottom: 15}}
                          renderItem={(item) => BottleDetailItem(item.item)}
                    // @ts-ignore
                          keyExtractor={(item, index) => item.title + index}/>
            </View>
            {renderImageViewing()}
        </View>
    )
}


const mapStateToProps = (state: any) => {
    const bottleDetail = state.airBottle.AirBottleDetailReducer;
    return {
        detail: bottleDetail.detail,
        loadingStatus: bottleDetail.loadingStatus,
    }
}

export default connect(mapStateToProps, {
    loadAirBottleDetail,
    cleaAirBottleDetail,
    airBottleDetailLoadingStatus
})(AirBottleCompleteDetail);
