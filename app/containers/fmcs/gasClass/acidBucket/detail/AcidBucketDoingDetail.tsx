import React from "react";
import {FlatList, InteractionManager, View} from 'react-native';
import {connect} from "react-redux";
import Colors from "../../../../../utils/const/Colors";
import {
    BucketDetailItem,
    BucketItemType
} from "../../../../../components/fmcs/gasClass/acidBucket/detail/BucketDetailItem";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import SndToast from "../../../../../utils/components/SndToast";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {
    bucketExecutingEdit,
    clearAcidBucketDetail,
    loadAcidBucketDetail,
    saveBucketExecutingInput,
    saveForExecutingDetailInfo
} from "../../../../../actions/acidBucket/acidBucketAction";
import moment from "moment";
import {RequestStatus} from "../../../../../middleware/api";
import {convertExecutingRequestDetail} from "./AcidBucketHelper";
import Scan from "../../../../assets/Scan";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";

/**
 * 执行中
 * @constructor
 */
function AcidBucketDoingDetail(props: any) {
    React.useEffect(() => {
        loadDetail()
    }, [])

    const loadDetail = () => {
        props.loadAcidBucketDetail(props.bucketObj.id);
    }

    /**
     * component will un mount
     */
    React.useEffect(() => {
        return () => {
            props.clearAcidBucketDetail();
        }
    }, []);

    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    React.useEffect(() => {
        if (!isEmptyString(props.executingInput.timeDate)) {
            props.bucketExecutingEdit(props.executingInput);
        }
    }, [props.executingInput.timeDate]);

    /**
     * 监听执行中请求状态
     */
    React.useEffect(() => {
        if (props.executingRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.executingRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            if (props.executingInput.flow) {
                SndToast.showSuccess('保存成功');
                loadDetail()
            } else {
                ///成功 返回上一层
                onPopBack();
                props.refreshCallBack && props.refreshCallBack();
            }
        } else if (props.executingRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.executingRequestStatus]);
    /**
     * 酸桶批号输入框变化 回调
     * @param text
     */
    const bucketSerialNoChange = (text: string) => {
        let input = props.executingInput;
        input.serialNo = text;
        props.saveBucketExecutingInput({...input});
    }

    /**
     * 酸桶提示文字输入框变化
     * @param text
     */
    const bucketTipChange = (text: string) => {
        let input = props.executingInput;
        input.remark = text;
        props.saveBucketExecutingInput({...input});
    }

    const isCurrentUser = (currentUserId: number) => {
        const detail = props.detail;
        return (detail.operatorId == currentUserId || detail.confirmId == currentUserId);
    }

    /**
     * 监听请求数据 构建业务模型数组
     */
    React.useEffect(() => {
        if (Object.keys(props.detail).length > 0) {
            let details = convertExecutingRequestDetail(props.detail, props.executingDetail, isCurrentUser(props.currentUser?.Id));
            props.saveForExecutingDetailInfo(details);

            ///给执行中请求入参赋值
            let input = props.executingInput;
            if (!isEmptyString(props.detail.serialNo)){
                input.serialNo = props.detail.serialNo;
            }
            if (!isEmptyString(props.detail.remark)){
                input.remark = props.detail.remark;
            }
            props.saveBucketExecutingInput({...input});
        }
    }, [props.detail]);

    /**
     * 扫码点击
     */
    const onPressScan = () => {
        props.navigator.push({
            id: 'scan_from_bottle_list',
            component: Scan,
            passProps: {
                scanText: '',
                scanResult: (result: string) => {
                    updateExecutingDetailInfo(result);
                }
            }
        });
    }

    /**
     * 更新列表展示及请求入参
     * @param result
     */
    const updateExecutingDetailInfo = (result: string) => {
        let detailInfo = props.executingDetail;
        detailInfo[1].dataObj[3].subTitle = result;
        props.saveForExecutingDetailInfo([...detailInfo]);

        let input = props.executingInput;
        input.serialNo = result;
        props.saveBucketExecutingInput({...input});
    }

    /**
     * 编辑酸桶状态
     * @param flow
     */
    const editBucket = (flow: boolean) => {
        let input = props.executingInput;
        if (input.serialNo.length == 0) {
            SndToast.showTip('请输入酸桶批号');
            return;
        }
        input.actualEndTime = flow ? '' : moment().format(TimeFormatYMDHMS);
        input.flow = flow;
        input.id = props.detail.id;
        input.actualStartTime = props.detail.actualStartTime;
        input.timeDate = moment().format(TimeFormatYMDHMS);
        props.saveBucketExecutingInput({...input});
    }

    /**
     * 底部按钮更具状态
     */
    const configBottomAction = () => {
        const isCurrent = isCurrentUser(props.currentUser?.Id);
        let actions: any[] = [];
        if (isCurrent) {
            actions = [
                {
                    title: '保存',
                    textColor: Colors.theme,
                    btnStyle: {marginLeft: 30, marginRight: 12, flex: 1},
                    onPressCallBack: () => {
                        editBucket(true);
                    },
                },
                {
                    title: '更换完成',
                    textColor: Colors.white,
                    onPressCallBack: () => {
                        editBucket(false);
                    },
                    btnStyle: {marginRight: 30, flex: 1, backgroundColor: Colors.theme}
                }];
        } else {
            actions = [];
        }
        return (
            actions.length > 0 && <BottleDetailActionView actions={actions}/>
        )
    }


    return (
        <View style={{flex: 1}}>
            <Toolbar title={'酸桶更换任务详情'} navIcon="back" onIconClicked={onPopBack}/>
            <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
                <FlatList data={props.executingDetail}
                          renderItem={(item) => BucketDetailItem({
                              ...item.item,
                              onPressScan: onPressScan,
                              textChangeCallBack: (text, type) => {
                                  if (type == BucketItemType.remark) {
                                      bucketTipChange(text);
                                  } else if (type == BucketItemType.serialNo) {
                                      bucketSerialNoChange(text);
                                  }
                              }
                          })}
                    // @ts-ignore
                          keyExtractor={(item, index) => item.title + index}/>
                {configBottomAction()}
            </View>
        </View>
    )
}

const mapStateToProps = (state: any) => {
    const bucketDetail = state.acidBucket.AcidBucketDetailReducer;
    const user = state.user.toJSON().user;
    return {
        currentUser: user,
        loading: bucketDetail.loading,
        ///执行中详情接口返回
        detail: bucketDetail.detail,
        ///编辑执行中 结果
        executingRequestStatus: bucketDetail.executingRequestStatus,
        ///编辑执行中 请求入参
        executingInput: bucketDetail.executingInput,
        ///编辑执行中 业务模型
        executingDetail: bucketDetail.executingDetail,
    }
}

export default connect(mapStateToProps,
    {
        loadAcidBucketDetail,
        clearAcidBucketDetail,
        bucketExecutingEdit,
        saveBucketExecutingInput,
        saveForExecutingDetailInfo,
    })(AcidBucketDoingDetail);
