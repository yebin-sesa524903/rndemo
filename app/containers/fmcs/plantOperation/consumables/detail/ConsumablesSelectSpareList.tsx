import React from "react";
import {InteractionManager, StyleSheet, View} from "react-native";
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
import SndToast from "../../../../../utils/components/SndToast";
import {sortArray} from "../../utils/Utils";
import moment from "moment";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {
    loadOutboundList,
    spareListDestroyClear,
    spareListInputSave,
    updateConsumablesSpareList
} from "../../../../../actions/consumables/consumablesAction";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function ConsumablesSelectSpareList(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    React.useEffect(() => {
        let input = props.listInput;
        input.classroomIds = [props.departmentCode];
        if (!isEmptyString(props.systemCode)){
            input.ownerShipSystemIds = [props.systemCode];
        }
        props.spareListInputSave({...input});
    }, []);

    /**
     * 监听列表入参 请求列表数据
     */
    React.useEffect(() => {
        if (props.listInput.classroomIds.length > 0 && props.listInput.ownerShipSystemIds.length > 0) {
            props.loadOutboundList(props.listInput);
        }
    }, [props.listInput]);

    /**
     * 销毁清除
     */
    React.useEffect(() => {
        return () => {
            props.spareListDestroyClear();
        }
    }, [])

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let dataList = [];
        let tempArray: any = sortArray(props.sparePartList);
        if (tempArray && tempArray.length > 0) {
            for (let tempObj of tempArray) {
                if (tempObj && tempObj.length > 0) {
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
        let input = props.listInput;
        input.warehouseExitNo = text;
        props.spareListInputSave({...input});
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: MaintainOutboundOrderItemProps) => {
        for (let listDatum of props.sparePartList) {
            listDatum.isSelected = listDatum.id == item.id;
        }
        props.updateConsumablesSpareList([...props.sparePartList]);
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
    const onPressSure = () => {
        let selectedIds = [];
        for (const argument of props.sparePartList) {
            if (argument.isSelected) {
                selectedIds.push(argument.id);
                break;
            }
        }
        if (selectedIds.length == 0) {
            SndToast.showTip('请选择单据');
            return;
        }

        let params = {
            deviceId: props.deviceId,
            code: props.code,
            use: props.use,
            warehouseExitIds: selectedIds,
        }
        onPopBack();
        props.addCallBack && props.addCallBack(params);
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.listInput;
        input.pageNum = 1;
        props.spareListInputSave({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.listInput;
        input.pageNum = props.page + 1;
        props.spareListInputSave({...input});
    }

    /**
     * 出库单 列表展示
     */
    const renderRefreshList = () => {
        return (
            <PaddingRadiusList headerIcon={require('../../../../../images/aaxiot/plantOperation/maintain/xuanzedj.png')}
                               headerTitle={'选择单据'}
                               page={props.page}
                               sections={listData}
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
    let consumables = state.consumables.ConsumablesSpareListReducer;
    return {
        loading: consumables.loading,
        page: consumables.page,
        listInput: consumables.listInput,
        sparePartList: consumables.sparePartList,
    }
}


export default connect(mapStateToProps, {
    spareListInputSave,
    loadOutboundList,
    updateConsumablesSpareList,
    spareListDestroyClear,
})(ConsumablesSelectSpareList)


