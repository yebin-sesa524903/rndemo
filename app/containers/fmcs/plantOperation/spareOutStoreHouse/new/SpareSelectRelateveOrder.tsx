import React from "react";
import {InteractionManager, StyleSheet, View} from "react-native";
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
import SndToast from "../../../../../utils/components/SndToast";
import {isEmptyString, TimeFormatYMD, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import moment from "moment";
import {SpareOutUseType} from "../../../../../components/fmcs/plantOperation/defined/ConstDefined";
import {
    loadMaintainTaskList, maintainListDestroyClear,
    maintainTasksUpdate,
    saveMaintainInput
} from "../../../../../actions/maintain/maintainAction";
import {
    loadRepairList,
    repairListDestroyClear,
    repairTasksUpdate,
    saveRepairListInput
} from "../../../../../actions/repair/repairAction";
import {
    consumablesListDestroyClear,
    consumablesTasksUpdate,
    loadConsumablesList,
    saveConsumablesInput
} from "../../../../../actions/consumables/consumablesAction";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function SpareSelectRelativeOrder(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }
    /**
     * 监听传入use变化 设置对应的列表入参
     */
    React.useEffect(() => {
        let input = props.orderInput;
        input.startTime = null;
        input.endTime = null;
        input.deviceId = props.deviceId;
        if (props.use == SpareOutUseType.maintain) {
            if (!isEmptyString(props.departmentCode)) {
                input.departmentCodes = [props.departmentCode];
            }
            if (!isEmptyString(props.systemCode)) {
                input.systemCodes = [props.systemCode];
            }
            input.status = ['未开始', '执行中', '已完成'];
            input.customerId = props.user.CustomerId;
            props.saveMaintainInput({...input});
        } else if (props.use == SpareOutUseType.repair) {
            input.customerId = props.user.CustomerId;
            input.status = ['4', '5', '6', '2'];
            props.saveRepairListInput({...input});
        } else if (props.use == SpareOutUseType.consumables) {
            if (!isEmptyString(props.departmentCode)) {
                input.departmentCodes = [props.departmentCode];
            }
            if (!isEmptyString(props.systemCode)) {
                input.systemCodes = [props.systemCode];
            }
            input.status = null;
            props.saveConsumablesInput({...input});
        }
    }, [props.use]);

    /**
     * 监听入参的更改 获取列表数据
     */
    React.useEffect(() => {
        if (props.use == SpareOutUseType.maintain) {
            if (props.orderInput.departmentCodes.length > 0) {
                props.loadMaintainTaskList(props.orderInput);
            }
        } else if (props.use == SpareOutUseType.repair) {
            if (props.orderInput.customerId) {
                props.loadRepairList(props.orderInput);
            }
        } else if (props.use == SpareOutUseType.consumables) {
            if (props.orderInput.departmentCodes.length > 0) {
                props.loadConsumablesList(props.orderInput);
            }
        }
    }, [props.orderInput]);

    /**
     * 销毁
     */
    React.useEffect(() => {
        return () => {
            if (props.use == SpareOutUseType.maintain) {
                props.maintainListDestroyClear();
            } else if (props.use == SpareOutUseType.repair) {
                props.repairListDestroyClear();
            } else if (props.use == SpareOutUseType.consumables) {
                props.consumablesListDestroyClear();
            }
        }
    }, [])

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let dataList = [];
        if (props.orders && props.orders.length > 0) {
            let isFirstEnter = true;
            for (let order of props.orders) {
                if (order.isSelected != undefined) {
                    isFirstEnter = false;
                    break;
                }
            }

            for (let order of props.orders) {
                if (props.relateCode && isFirstEnter) {
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
                    value2: props.use == SpareOutUseType.maintain ? order.deviceName : order.name,
                    title3: '日期',
                    value3: moment(order.planDate).format(TimeFormatYMD),
                })
            }
        }
        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.orders]);

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
        if (props.use == SpareOutUseType.maintain) {
            props.saveMaintainInput({...input});
        } else if (props.use == SpareOutUseType.repair) {
            props.saveRepairListInput({...input});
        } else if (props.use == SpareOutUseType.consumables) {
            props.saveConsumablesInput({...input});
        }
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: RepairSelectItemProps) => {
        for (let listDatum of props.orders) {
            listDatum.isSelected = (listDatum.id == item.id);
        }
        if (props.use == SpareOutUseType.maintain) {
            props.maintainTasksUpdate([...props.orders]);
        } else if (props.use == SpareOutUseType.repair) {
            props.repairTasksUpdate([...props.orders]);
        } else if (props.use == SpareOutUseType.consumables) {
            props.consumablesTasksUpdate([...props.orders])
        }
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
        let orderObj = undefined;
        if (props.orders && props.orders.length > 0) {
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
        if (props.use == SpareOutUseType.maintain) {
            input.pageNum = 1;
            props.saveMaintainInput({...input});
        } else if (props.use == SpareOutUseType.repair) {
            input.pageNum = 1;
            props.saveRepairListInput({...input});
        } else if (props.use == SpareOutUseType.consumables) {
            input.page = 1;
            props.saveConsumablesInput({...input});
        }
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.orderInput;
        if (props.use == SpareOutUseType.maintain) {
            input.pageNum = props.page + 1;
            props.saveMaintainInput({...input});
        } else if (props.use == SpareOutUseType.repair) {
            input.pageNum = props.page + 1;
            props.saveRepairListInput({...input});
        } else if (props.use == SpareOutUseType.consumables) {
            input.page = props.page + 1;
            props.saveConsumablesInput({...input});
        }
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

const mapStateToProps = (state: any, props: any) => {
    let maintain = state.maintain.MaintainListReducer;
    let repair = state.repair.RepairListReducer;
    let consumables = state.consumables.ConsumablesListReducer;
    let input = {};
    let loading = false;
    let page = 1;
    let orders = [];
    if (props.use == SpareOutUseType.maintain) {
        input = maintain.maintainInput;
        loading = maintain.loading;
        page = maintain.page;
        orders = maintain.maintainTasks;
    } else if (props.use == SpareOutUseType.repair) {
        input = repair.repairInput;
        loading = repair.loading;
        page = repair.page;
        orders = repair.results;
    } else if (props.use == SpareOutUseType.consumables) {
        input = consumables.consumablesInput;
        loading = consumables.loading;
        page = consumables.page;
        orders = consumables.results;
    }
    const user = state.user.toJSON().user;
    return {
        user: user,
        orderInput: input,///获取列表的入参
        loading: loading,
        page: page,
        orders: orders,    ///请求结果
    }
}

export default connect(mapStateToProps, {
    ///保养
    saveMaintainInput,
    loadMaintainTaskList,
    maintainTasksUpdate,
    maintainListDestroyClear,
    ///维修
    saveRepairListInput,
    loadRepairList,
    repairTasksUpdate,
    repairListDestroyClear,

    ///耗材
    saveConsumablesInput,
    loadConsumablesList,
    consumablesTasksUpdate,
    consumablesListDestroyClear,
})(SpareSelectRelativeOrder)


