import React from "react";
import {Image, InteractionManager, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {SimpleSearch} from "../../../../../components/fmcs/plantOperation/components/SimpleSearch";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {
    RepairSelectItem,
    RepairSelectItemProps
} from "../../../../../components/fmcs/plantOperation/repair/detail/RepairSelectItem";
import {PaddingRadiusList} from "../../../../../components/fmcs/plantOperation/components/PaddingRadiusList";
import {
    getRelateWorkOrders,
    relateWorkOrdersInputSave, repairSelectOrderDestroyClear,
    saveRelateWorkOrders
} from "../../../../../actions/repair/repairAction";
import SndToast from "../../../../../utils/components/SndToast";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import moment from "moment";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function RepairSelectOrder(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    React.useEffect(() => {
        let input = props.orderInput;
        input.departmentCode = props.departmentCode;
        input.systemCode = props.systemCode;
        input.deviceId = props.deviceId;
        input.type = props.type;
        props.getRelateWorkOrders(input);
    }, [props.orderInput]);

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let dataList = [];
        if (props.orders && props.orders.length > 0){
            let isFirstEnter = true;
            for (let order of props.orders) {
                if (order.isSelected != undefined){
                    isFirstEnter = false;
                    break;
                }
            }

            for (let order of props.orders) {
                if (props.relateCode && isFirstEnter){
                    if (order.code == props.relateCode) {
                        order.isSelected = true;
                        break;
                    }
                }
            }
            for (let order of props.orders) {
                dataList.push({
                    id: order.id,
                    isSelected: order.isSelected,
                    title1: '工单号',
                    value1: order.code,
                    title2: '名称',
                    value2: order.name,
                    title3: '日期',
                    value3: moment(order.planDate).format(TimeFormatYMDHMS),
                })
            }
        }
        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.orders]);

    React.useEffect(()=>{
        return ()=>{
            props.repairSelectOrderDestroyClear();
        }
    }, []);

    /**
     * 输入框变化回调
     * @param text
     */
    const textDidChange = (text: string) => {
        let input = props.orderInput;
        if (isEmptyString(text)) {
            input.filter = null;
        } else {
            input.filter = text;
        }
        props.relateWorkOrdersInputSave({...input});
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: RepairSelectItemProps) => {
        for (let listDatum of props.orders) {
            listDatum.isSelected = (listDatum.id == item.id);
        }
        props.saveRelateWorkOrders([...props.orders]);
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
                onPressCallBack:onPressSure,
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
        let orderObj = undefined;
        if (props.orders && props.orders.length > 0){
            for (const argument of props.orders) {
                if (argument.isSelected) {
                    orderObj = argument;
                    break;
                }
            }
        }
        if (orderObj == undefined) {
            SndToast.showTip('请选择关联工单');
            return;
        }
        onPopBack();
        props.selectCallBack && props.selectCallBack(orderObj);
    }
    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.orderInput;
        input.pageNum = 1;
        props.relateWorkOrdersInputSave({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.orderInput;
        input.pageNum = props.page + 1;
        props.relateWorkOrdersInputSave({...input});
    }

    /**
     * 出库单 列表展示
     */
    const renderRefreshList = () => {
        return (
            <PaddingRadiusList headerIcon={require('../../../../../images/aaxiot/plantOperation/maintain/xuanzedj.png')}
                               headerTitle={'关联工单号'}
                               sections={listData}
                               page={props.page}
                               refreshing={props.loading}
                               pullToRefresh={pullToRefresh}
                               pullLoadMore={pullLoadMore}
                               renderItem={(item) => RepairSelectItem(item.item, itemOnSelected)}/>

        )
    }

    return (
        <View style={styles.container}>
            <Toolbar title={'选择关联工单号'} navIcon="back" onIconClicked={onPopBack}/>
            <SimpleSearch placeholder={'输入关联工单号'} textDidChange={textDidChange}/>
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
    let repair = state.repair.RepairAddReducer;
    return {
        orderInput: repair.orderInput,///获取列表的入参
        loading: repair.orderLoading,
        page: repair.orderPage,
        orders: repair.relateOrders,    ///请求结果
    }
}


export default connect(mapStateToProps, {
    relateWorkOrdersInputSave,
    getRelateWorkOrders,
    saveRelateWorkOrders,
    repairSelectOrderDestroyClear,
})(RepairSelectOrder)


