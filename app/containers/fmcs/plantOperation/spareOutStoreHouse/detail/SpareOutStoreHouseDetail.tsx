import React from "react";
import {View, InteractionManager, FlatList} from "react-native";
import {connect} from "react-redux";
import {
    SpareOutStoreHouseItemType, SpareOutStoreStatus,
} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {
    loadDetailInfo,
    saveWarehouseExit, saveWarehouseExitInputSave,
    spareOutStoreDataInfoSave,
    spareOutStoreDestroyClear,
} from "../../../../../actions/spareOutStore/spareOutStoreAction";
import {
    changeSpareOutStoreStatus,
    configExitStoreDetailList,
    configSpareOutStoreDataInfo,
    updateSpareOutStoreDepartmentAndSystemCode,
    updateWithdrawalCountCount
} from "./SpareOutStoreHelper";
import {
  AbnormalBasicMsgItem,
  AbnormalBasicMsgItemProps
} from "../../../../../components/fmcs/plantOperation/abnormal/detail/AbnormalBasicMsgItem";
import {
    SpareOutStoreSpareMsgData,
    SpareOutStoreSpareMsgItem
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/detail/SpareOutStoreSpareMsgItem";
import moment from "moment";
import {RequestStatus} from "../../../../../middleware/api";
import SndToast from "../../../../../utils/components/SndToast";
import {checkOutStoreIsHasNoSave} from "../new/SpareAddHelper";
import {TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import ViewDetailScreen from "../../../viewDetail/ViewDetailScreen";

function SpareOutStoreHouseDetail(props: any) {

    React.useEffect(() => {
        loadSpareOutStoreDetail();
    }, []);

    const loadSpareOutStoreDetail = () => {
        props.loadDetailInfo({id: props.id, customerId: props.customerId});
    }

    React.useEffect(() => {
        if (Object.keys(props.responseDetail).length > 0) {
          SndToast.dismiss();
            let info = configSpareOutStoreDataInfo(props.responseDetail, props.spareOutStoreDataInfo);
            let detail = updateSpareOutStoreDepartmentAndSystemCode(props.responseDetail, props.departmentCodes, info.dataInfo);
            props.spareOutStoreDataInfoSave(detail);
            props.saveWarehouseExitInputSave(info.input);
        }else {
          SndToast.showLoading();
        }
    }, [props.responseDetail]);

    /**
     * 监听提交请求
     */
    React.useEffect(() => {
        if (props.saveWarehouseExitRequestStatus == RequestStatus.loading) {
            SndToast.showLoading();
        } else if (props.saveWarehouseExitRequestStatus == RequestStatus.success) {
            SndToast.dismiss();
            SndToast.showSuccess('保存成功', ()=>{
                onPopBack();
                props.refreshCallBack && props.refreshCallBack();
            });
        } else if (props.saveWarehouseExitRequestStatus == RequestStatus.error) {
            SndToast.dismiss();
        }
    }, [props.saveWarehouseExitRequestStatus]);

    React.useEffect(()=>{
        return ()=>{
            props.spareOutStoreDestroyClear();
            SndToast.dismiss();
        }
    }, [])

    const onPressExpand = (type: SpareOutStoreHouseItemType) => {
        const dataSource = props.spareOutStoreDataInfo;
        for (let element of dataSource) {
            if (element.sectionType == type) {
                element.isExpand = !element.isExpand;
                break;
            }
        }
        props.spareOutStoreDataInfoSave([...dataSource]);
    }

    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    const configBottomAction = () => {
        return (
            <BottleDetailActionView actions={[
                {
                    title: '提交',
                    textColor: Colors.white,
                    onPressCallBack: onPressSubmit,
                    btnStyle: {marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme}
                }
            ]}/>
        )
    }

    /**
     * 提交出库点击
     */
    const onPressSubmit = () => {
        let input = props.exitSaveInput;

        if (checkOutStoreIsHasNoSave(props.spareOutStoreDataInfo)) {
            SndToast.showTip('请先保存备件退库信息再提交');
            return;
        }

        input.warehouseExitCancelUsername = props.user.Name;
        input.warehouseExitCancelTime = moment().format(TimeFormatYMDHMS);
        input.updateUser = props.user.Name;
        input.updateTime = props.responseDetail.updateTime;
        input.warehouseExitCancelRemark = '';
        input.detailList = configExitStoreDetailList(props.spareOutStoreDataInfo);
        props.saveWarehouseExit(input);
    }

    ///出库信息相关点击事件
    const onTextChange = (text: string, msgData: SpareOutStoreSpareMsgData) => {
        let info = updateWithdrawalCountCount(props.spareOutStoreDataInfo, text, msgData);
        props.spareOutStoreDataInfoSave(info);
    }
    /**
     * 退库点击
     */
    const onPressWithdrawal = (msgData: SpareOutStoreSpareMsgData) => {
        let info = changeSpareOutStoreStatus(props.spareOutStoreDataInfo, SpareOutStoreStatus.editing, msgData);
        props.spareOutStoreDataInfoSave(info);
    }

    /**
     * 保存按钮点击
     * @param msgData
     */
    const onPressSave = (msgData: SpareOutStoreSpareMsgData) => {
        if (Number(msgData.withdrawalCount) <= 0){
            SndToast.showTip('退库数量必须大于0');
            return;
        }
        let info = changeSpareOutStoreStatus(props.spareOutStoreDataInfo, SpareOutStoreStatus.withdrawal, msgData);
        props.spareOutStoreDataInfoSave(info);
    }

    /**
     * 取消按钮点击
     * @param msgData
     * @param status
     */
    const onPressCancel = (msgData: SpareOutStoreSpareMsgData, status: SpareOutStoreStatus) => {
        loadSpareOutStoreDetail();
    }
    /**
     * 编辑按钮点击
     * @param msgData
     */
    const onPressEdit = (msgData: SpareOutStoreSpareMsgData) => {
        let info = changeSpareOutStoreStatus(props.spareOutStoreDataInfo, SpareOutStoreStatus.editing, msgData);
        props.spareOutStoreDataInfoSave(info);
    }

    const onPressViewDetail = (obj: AbnormalBasicMsgItemProps)=>{
      props.navigator.push({
        id: 'View_Detail_Screen',
        component: ViewDetailScreen,
        passProps: {
          title: obj.remarkTitle,
          remark: obj.remark,
        }
      })
    }

    const renderSpareOutStoreItem = (item: any) => {
        if (item.sectionType == SpareOutStoreHouseItemType.basicMsg) {
            return AbnormalBasicMsgItem({...item, expandCallBack: onPressExpand, onPressViewDetail});
        } else if (item.sectionType == SpareOutStoreHouseItemType.spareInfo) {
            return SpareOutStoreSpareMsgItem({
                ...item,
                onPressWithdrawal,
                onPressSave,
                onPressCancel,
                onPressEdit,
                onTextChange,
            })
        }
        return <></>
    }

    return (
        <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
            <Toolbar
                title={'备件出库'}
                navIcon="back"
                onIconClicked={onPopBack}/>
            <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
                <FlatList data={props.spareOutStoreDataInfo}
                          renderItem={(item) => renderSpareOutStoreItem(item.item)}
                          keyExtractor={(item, index) => item.title}/>
                {configBottomAction()}
            </View>
        </View>
    )
}

const mapStateToProps = (state: any) => {
    let storeDetail = state.spareOutStore.spareOutStoreDetailReducer
    let user = state.user.toJSON().user;
    return {
        user: user,
        responseDetail: storeDetail.responseDetail, ///接口返回的 退库详情
        spareOutStoreDataInfo: storeDetail.spareOutStoreDataInfo,///自定义构建的 业务模型数组
        exitSaveInput: storeDetail.exitSaveInput,
        saveWarehouseExitRequestStatus: storeDetail.saveWarehouseExitRequestStatus ///退库保存 请求状态
    }
}

export default connect(mapStateToProps, {
    loadDetailInfo,///详情数据获取
    spareOutStoreDataInfoSave,///保存业务模型
    spareOutStoreDestroyClear,///销毁
    saveWarehouseExitInputSave,
    saveWarehouseExit,  ///退库保存请求
})(SpareOutStoreHouseDetail)
