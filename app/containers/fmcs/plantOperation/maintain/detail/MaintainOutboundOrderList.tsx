import React from "react";
import {Image, InteractionManager, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {SimpleSearch} from "../../../../../components/fmcs/plantOperation/components/SimpleSearch";
import {
    MaintainOutboundOrderItem,
    MaintainOutboundOrderItemProps
} from "../../../../../components/fmcs/plantOperation/maintain/list/MaintainOutboundOrderItem";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {PaddingRadiusList} from "../../../../../components/fmcs/plantOperation/components/PaddingRadiusList";
import {
    addSparePartItem,
    getWarehouseExitList,
    saveSpareListInput,
    sparePartDestroyClear,
    updateSpareList
} from "../../../../../actions/spareTools/apareToolsAction";
import SndToast from "../../../../../utils/components/SndToast";
import {RequestStatus} from "../../../../../middleware/api";
import {sortArray} from "../../utils/Utils";
import moment from "moment";
import {TimeFormatYMDHMS} from "../../../../../utils/const/Consts";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function MaintainOutboundOrderList(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    React.useEffect(()=>{
        let input = props.spareListInput;
        input.classroomIds = [props.departmentCode];
        if (props.systemCode){
          input.ownerShipSystemIds = [props.systemCode];
        }
        input.use = props.use;
        props.saveSpareListInput({...input});
    }, []);

    /**
     * 监听列表入参 请求列表数据
     */
    React.useEffect(()=>{
        if (props.spareListInput.classroomIds.length > 0){
            props.getWarehouseExitList(props.spareListInput);
        }
    }, [props.spareListInput]);

    /**
     * 监听添加备件请求
     */
    React.useEffect(()=>{
        if (props.addSparePartRequestStatus == RequestStatus.loading){
            SndToast.showLoading();
        }else if(props.addSparePartRequestStatus == RequestStatus.success){
            SndToast.dismiss();
            onPopBack();
            props.refreshCallBack && props.refreshCallBack();
        }else if(props.addSparePartRequestStatus == RequestStatus.initial){
            SndToast.dismiss();
        }
    }, [props.addSparePartRequestStatus]);

    /**
     * 销毁清除
     */
    React.useEffect(()=>{
        return ()=>{
            props.sparePartDestroyClear();
        }
    }, [])

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let dataList = [];
        let tempArray : any = sortArray(props.sparePartList);
        if (tempArray && tempArray.length > 0){
            for (let tempObj of tempArray) {
                if (tempObj && tempObj.length > 0){
                    let sparePart = tempObj[0];
                    dataList.push({
                        id: sparePart.id,
                        isSelected: sparePart.isSelected,
                        number: sparePart.warehouseExitNo,
                        userName: sparePart.recipient,
                        dateString: moment(sparePart.updateTime).format(TimeFormatYMDHMS),
                    })
                }
            }
        }
        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.sparePartList]);

    /**
     * 输入框变化回调
     * @param text
     */
    const textDidChange = (text: string) => {
        let input = props.spareListInput;
        input.warehouseExitNo = text;
        props.saveSpareListInput({...input});
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: MaintainOutboundOrderItemProps) => {
        for (let listDatum of props.sparePartList) {
            if (listDatum.id == item.id) {
                listDatum.isSelected = !listDatum.isSelected;
                break;
            }
        }
        props.updateSpareList([...props.sparePartList]);
    }

    /**
     * 底部按钮更具状态
     */
    const configBottomAction = () => {
        let actions = [
            {
                title: '取消',
                textColor: Colors.theme,
                btnStyle: {marginLeft: 30, marginRight: 12, flex: 1},
                onPressCallBack: () => {
                    onPopBack();
                },
            },
            {
                title: '确定',
                textColor: Colors.white,
                onPressCallBack: onPressSure,
                btnStyle: {marginRight: 30, flex: 1, backgroundColor: Colors.theme}
            }];
        return (
            <BottleDetailActionView actions={actions}/>
        )
    }

    /**
     * 确认按钮点击
     */
    const onPressSure = ()=>{
        let selectedIds = [];
        for (const argument of props.sparePartList) {
            if (argument.isSelected){
                selectedIds.push(argument.id);
            }
        }
        if (selectedIds.length == 0){
            SndToast.showTip('请选择单据');
            return;
        }

        let params = {
            deviceId: props.deviceId,
            code: props.code,
            use: props.use,
            warehouseExitIds: selectedIds,
        }
        props.addSparePartItem(params);
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.spareListInput;
        input.pageNum = 1;
        props.saveSpareListInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.spareListInput;
        input.pageNum = props.page + 1;
        props.saveSpareListInput({...input});
    }

    /**
     * 出库单 列表展示
     */
    const renderRefreshList = () => {
        return (
            <PaddingRadiusList headerIcon={require('../../../../../images/aaxiot/plantOperation/maintain/xuanzedj.png')}
                               headerTitle={'选择单据'}
                               sections={listData}
                               page={props.page}
                               refreshing={props.loading}
                               pullToRefresh={pullToRefresh}
                               pullLoadMore={pullLoadMore}
                               renderItem={(item) => MaintainOutboundOrderItem(item.item, itemOnSelected)}/>
        )
    }

    return (
        <View style={styles.container}>
            <Toolbar title={'关联备件出库单'} navIcon="back" onIconClicked={onPopBack}/>
            <SimpleSearch placeholder={'输入出库单编号'} textDidChange={textDidChange}/>
            {renderRefreshList()}
            {configBottomAction()}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.primary
    },
})

const mapStateToProps = (state: any) => {
    let spareTools = state.spareTools;
    return {
        spareListInput: spareTools.spareListInput,///获取列表的入参
        loading: spareTools.spareLoading,
        page: spareTools.sparePage,
        sparePartList: spareTools.sparePartList,    ///备件列表
        addSparePartRequestStatus: spareTools.addSparePartRequestStatus,
    }
}


export default connect(mapStateToProps, {
    saveSpareListInput,
    getWarehouseExitList,
    updateSpareList,
    addSparePartItem,
    sparePartDestroyClear,
})(MaintainOutboundOrderList)


