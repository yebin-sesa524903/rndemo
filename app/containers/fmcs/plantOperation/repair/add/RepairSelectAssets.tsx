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
    getBoundedDevice,
    relateDeviceInputSave,
    repairSelectDeviceDestroyClear,
    saveRelateDevice
} from "../../../../../actions/repair/repairAction";
import {isEmptyString} from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function RepairSelectAssets(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    React.useEffect(() => {
        let input = props.deviceInput;
        input.parentId = props.parentId;
        input.customerId = props.customerId;
        props.getBoundedDevice(input);
    }, [props.deviceInput]);

    React.useEffect(() => {
        return () => {
            props.repairSelectDeviceDestroyClear();
        }
    }, []);

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let isFirstEnter = true;
        for (let device of props.devices) {
            if (device.isSelected != undefined) {
                isFirstEnter = false;
                break;
            }
        }

        for (let device of props.devices) {
            if (props.selectedDeviceId && isFirstEnter) {
                if (device.deviceId == props.selectedDeviceId) {
                    device.isSelected = true;
                    break;
                }
            }
        }

        let dataList = [];
        for (let device of props.devices) {
            dataList.push({
                id: device.deviceId,
                isSelected: device.isSelected,
                title1: '设备编号',
                value1: device.deviceCode ?? '-',
                title2: '设备名称',
                value2: device.deviceName,
                title3: '型号',
                value3: `${device.deviceClass}/${device.type}/${device.specification}`,
            })
        }
        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.devices]);

    /**
     * 输入框变化回调
     * @param text
     */
    const textDidChange = (text: string) => {
        let input = props.deviceInput;
        if (isEmptyString(text)) {
            input.deviceCodeOrName = null;
        } else {
            input.deviceCodeOrName = text;
        }
        props.relateDeviceInputSave({...input});
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: RepairSelectItemProps) => {
        for (let listDatum of props.devices) {
            listDatum.isSelected = (listDatum.deviceId == item.id);
        }
        props.saveRelateDevice([...props.devices]);
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
        let deviceObj = undefined;
        for (const argument of props.devices) {
            if (argument.isSelected) {
                deviceObj = argument;
                break;
            }
        }
        if (!deviceObj) {
            SndToast.showTip('请选择资产');
            return;
        }
        onPopBack();
        props.selectCallBack && props.selectCallBack(deviceObj);
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.deviceInput;
        input.page = 1;
        props.relateDeviceInputSave({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.deviceInput;
        input.page = props.page + 1;
        props.relateDeviceInputSave({...input});
    }

    /**
     * 出库单 列表展示
     */
    const renderRefreshList = () => {
        return (
            <PaddingRadiusList
                headerIcon={require('../../../../../images/aaxiot/plantOperation/repair/select_asset.png')}
                headerTitle={'选择资产'}
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
            <Toolbar title={'添加选择资产'} navIcon="back" onIconClicked={onPopBack}/>
            <SimpleSearch placeholder={'输入设备编号/名称'} textDidChange={textDidChange}/>
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
        deviceInput: repair.deviceInput,///获取列表的入参
        loading: repair.devicesLoading,
        page: repair.devicesPage,
        devices: repair.devices,    ///请求结果
    }
}


export default connect(mapStateToProps, {
    relateDeviceInputSave,
    getBoundedDevice,
    saveRelateDevice,
    repairSelectDeviceDestroyClear,
})(RepairSelectAssets)


