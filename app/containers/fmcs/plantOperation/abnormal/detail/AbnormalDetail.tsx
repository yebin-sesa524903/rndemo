import React from "react";
import {connect} from "react-redux";
import {InteractionManager, View, FlatList, Alert} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {
    abnormalDetailDestroyClear,
    loadAbnormalDetail,
    loadAbnormalRecordList,
    saveAbnormalDetailDataInfo,
    saveAbnormalRecordList,
    saveAbnormalTask,
    saveAbnormalTaskResult,
} from "../../../../../actions/abnormal/abnormalAction";
import {
    AbnormalDetailItemType,
    AbnormalDetailRecordStatus,
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {
    addRecordToDataInfo,
    configAbnormalDataInfo,
    configAbnormalRecord,
    configAbnormalRecordsParams, hasEditingRecord,
    hasEmptyRecord, hasRecords,
    updateClassAndSystemCode
} from "./AbnormalHelper";
import {AbnormalBasicMsgItem} from "../../../../../components/fmcs/plantOperation/abnormal/detail/AbnormalBasicMsgItem";
import {
    AbnormalRecord,
    AbnormalRecordItem
} from "../../../../../components/fmcs/plantOperation/abnormal/detail/AbnormalRecordItem";
import SndToast from "../../../../../utils/components/SndToast";
import {RequestStatus} from "../../../../../middleware/api";
import {isEmptyString} from "../../../../../utils/const/Consts";
import ViewDetailScreen from "../../../viewDetail/ViewDetailScreen";

/**
 * 异常点检执行详情
 * @param props
 * @constructor
 */
function AbnormalDetail(props: any) {
    const FlatListRef = React.useRef<FlatList>(null)
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    /**
     * 获取详情、获取异常点检记录
     */
    React.useEffect(() => {
        loadDetailInfo();
        loadRecords();
    }, []);

    const loadDetailInfo = () => {
        props.loadAbnormalDetail({id: props.id, customerId: props.customerId})
    }

    const loadRecords = () => {
        props.loadAbnormalRecordList({taskId: props.id})
    }

    /**
     * 根据detail 设置详情数据
     * 设置点检记录数据
     */
    React.useEffect(() => {
      if (Object.keys(props.responseBasic).length > 0 && props.responseRecords) {
        SndToast.dismiss();
        let info = configAbnormalDataInfo(props.responseBasic, props.abnormalDataInfo, props.user.Id, props.executorNames);
        props.saveAbnormalDetailDataInfo(info);

        let records = configAbnormalRecord(props.responseBasic, props.responseRecords, props.abnormalDataInfo, props.user.Id);
        props.saveAbnormalDetailDataInfo(records);
      }else {
        SndToast.showLoading();
      }
    }, [props.responseRecords, props.responseBasic]);


    /**
     * 监听保存点检记录请求
     */
    React.useEffect(() => {
        if (props.saveRecordRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.saveRecordRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            loadRecords();
        } else if (props.saveRecordRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.saveRecordRequestStatus]);

    /**
     * 保存点检任务请求结果监听
     */
    React.useEffect(() => {
        if (props.saveTaskRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.saveTaskRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            onPopBack();
            props.refreshCallBack && props.refreshCallBack()

        } else if (props.saveTaskRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.saveTaskRequestStatus]);


    /**
     * 监听课室/系统code请求结果
     */
    React.useEffect(() => {
        if (props.departmentCodes.length > 0 && Object.keys(props.responseBasic).length > 0) {
            let info = updateClassAndSystemCode(props.responseBasic, props.departmentCodes, props.abnormalDataInfo);
            props.saveAbnormalDetailDataInfo(info);
        }
    }, [props.departmentCodes, props.responseBasic])

    /**
     * 销毁
     */
    React.useEffect(() => {
        return () => {
            props.abnormalDetailDestroyClear();
            SndToast.dismiss();
        }
    }, [])

    /**
     * 展开/收起 点击
     * @param sectionType
     */
    const onPressExpend = (sectionType: AbnormalDetailItemType) => {
        const dataSource = props.abnormalDataInfo;
        for (let dataSourceElement of dataSource) {
            if (dataSourceElement.sectionType == sectionType) {
                dataSourceElement.isExpand = !dataSourceElement.isExpand;
                break;
            }
        }
        props.saveAbnormalDetailDataInfo([...dataSource]);
    }

    /**
     * 点检记录相关点击事件
     */
    const onSelectDropdown = (option: string) => {
        props.saveAbnormalTaskResult(option);
    }

    /**
     * 点检内容输入文字变化
     * @param text
     * @param item
     */
    const recordTextChange = (text: string, item: AbnormalRecord) => {
        item.comment = text;
        props.saveAbnormalDetailDataInfo([...props.abnormalDataInfo]);
    }

    /**
     * 添加按钮点击
     */
    const onPressAdd = (code: string) => {
        if (hasEmptyRecord(props.abnormalDataInfo)) {
            SndToast.showTip('请先保存点检记录');
            return;
        }
        if (hasEditingRecord(props.abnormalDataInfo)){
            SndToast.showTip('请先保存正在编辑的点检项');
            return;
        }
        let info = addRecordToDataInfo(props.abnormalDataInfo, props.responseBasic.id, code);
        props.saveAbnormalDetailDataInfo([...info]);

        setTimeout(()=>{
            FlatListRef.current?.scrollToIndex({animated: true, index: 1, viewOffset: -60, viewPosition: 1, });
        }, 1000)


    }

    /**
     * 编辑按钮点击
     * @param item
     */
    const onPressEdit = (item: AbnormalRecord) => {
        if (hasEditingRecord(props.abnormalDataInfo)){
            SndToast.showTip('请先保存正在编辑的点检项');
            return;
        }
        item.recordStatus = AbnormalDetailRecordStatus.editing;
        props.saveAbnormalDetailDataInfo([...props.abnormalDataInfo]);
    }

    /**
     * 删除按钮点击
     * @param item
     */
    const onPressDelete = (item: AbnormalRecord) => {
        Alert.alert('确定删除', `是否删除"${item.comment}"点检记录?`, [
            {
                text: '取消',
            },
            {
                text: '确定',
                onPress: () => {
                    let records = props.responseRecords.filter((res: any) => {
                        return res.id != item.id;
                    })
                    let params = {
                        taskId: item.taskId,
                        list: records,
                    }
                    props.saveAbnormalRecordList(params);
                }
            }
        ]);
    }
    /**
     * 保存点检记录
     * @param item
     */
    const onPressSave = (item: AbnormalRecord) => {
        let params = configAbnormalRecordsParams(props.abnormalDataInfo, item);
        props.saveAbnormalRecordList(params);
    }
    /**
     * 取消点击
     */
    const onPressCancel = () => {
        loadRecords();
    }

  /**
   * 查看详情
   */
  const onPressViewDetail = (obj: any)=>{
    props.navigator.push({
      id: 'View_Detail_Screen',
      component: ViewDetailScreen,
      passProps: {
        title: obj.remarkTitle,
        remark: obj.remark,
      }
    })
    }

    /**
     * render item
     * @param itemObj
     */
    const configAbnormalDetailItem = (itemObj: any) => {
        if (itemObj.sectionType == AbnormalDetailItemType.basicMsg) {
            return AbnormalBasicMsgItem({...itemObj, expandCallBack: onPressExpend, onPressViewDetail});
        } else if (itemObj.sectionType == AbnormalDetailItemType.abnormalRecord) {
            return AbnormalRecordItem({
                ...itemObj,
                onPressAdd: onPressAdd,
                recordTextChange: recordTextChange,
                onPressEdit: onPressEdit,
                onPressDelete: onPressDelete,
                onPressSave: onPressSave,
                onPressCancel: onPressCancel,
                onSelectDropdown: onSelectDropdown,
            })
        }
        return <View/>
    }

    const configBottomAction = () => {
        return (
            <BottleDetailActionView actions={[
                {
                    title: '完成提交',
                    textColor: Colors.white,
                    onPressCallBack: onPressSubmit,
                    btnStyle: {marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme}
                }
            ]}/>
        )
    }


    /**
     * 完成提交
     */
    const onPressSubmit = () => {
        if (isEmptyString(props.taskResult)){
            SndToast.showTip('请先选择处理结果');
            return;
        }
        if (!hasRecords(props.abnormalDataInfo)){
            SndToast.showTip('请先添加点检记录');
            return;
        }
        let params = {
            taskId: props.responseBasic.id,
            executeResult: props.taskResult,
        }
        props.saveAbnormalTask(params);
    }


    return (
        <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
            <Toolbar
                title={'异常点检'}
                navIcon="back"
                onIconClicked={onPopBack}/>
            <FlatList ref={FlatListRef}
                      data={props.abnormalDataInfo}
                      renderItem={(item) => configAbnormalDetailItem(item.item)}
                      keyExtractor={(item, index) => item.title}/>
            {(props.responseBasic.status != '已完成') && (props.responseBasic.executorIds?.indexOf(props.user.Id) != -1) && configBottomAction()}
        </View>
    )
}

const mapStateToProps = (state: any) => {
    const abnormalDetail = state.abnormal.AbnormalDetailReducer;
    const user = state.user.toJSON().user;
    let departmentCodes = state.workbench.departmentCodes;
    return {
        user: user,
        departmentCodes: departmentCodes,
        responseBasic: abnormalDetail.responseBasic,
        responseRecords: abnormalDetail.responseRecords,
        abnormalDataInfo: abnormalDetail.abnormalDataInfo,
        saveRecordRequestStatus: abnormalDetail.saveRecordRequestStatus,
        saveTaskRequestStatus: abnormalDetail.saveTaskRequestStatus,

        taskResult: abnormalDetail.taskResult,
    }
}

export default connect(mapStateToProps, {
    loadAbnormalDetail, ///详情
    loadAbnormalRecordList,///点检记录
    saveAbnormalDetailDataInfo,
    saveAbnormalRecordList,///保存点检记录
    saveAbnormalTask,///保存点检任务
    saveAbnormalTaskResult,
    abnormalDetailDestroyClear,///页面销毁
})(AbnormalDetail)

