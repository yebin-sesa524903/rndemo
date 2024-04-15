import React from "react";
import {InteractionManager, StyleSheet, View} from "react-native";
import {connect} from "react-redux";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {SimpleSearch} from "../../../../../components/fmcs/plantOperation/components/SimpleSearch";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {PaddingRadiusList} from "../../../../../components/fmcs/plantOperation/components/PaddingRadiusList";
import SndToast from "../../../../../utils/components/SndToast";
import {isEmptyString} from "../../../../../utils/const/Consts";
import {
    SpareListItem,
    SpareListItemProps
} from "../../../../../components/fmcs/plantOperation/spareOutStoreHouse/new/SpareListItem";
import {
    loadChooseSparePartList,
    saveLoadSparePartListInput, saveSparePartListData, selectSpareDestroyClear
} from "../../../../../actions/spareOutStore/spareOutStoreAction";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function SelectSpareList(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    React.useEffect(() => {
        let input = props.spareListInput;
        input.classroomId = props.classroomId;
        input.ownershipSystemId = props.ownershipSystemId;
        props.loadChooseSparePartList(input);
    }, [props.spareListInput]);

    React.useEffect(()=>{
        return ()=>{
            props.selectSpareDestroyClear()
        }
    }, []);

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        for (let spare of props.spareList) {
            let founded = false;
            for (let selectSpare of props.selectedSpares) {
                if (selectSpare.id == spare.id){
                    founded = true;
                }
            }
            if (founded){
                spare.isSelected = true;
                spare.editable = false;
            }else {
                spare.editable = true;
            }
        }

        let dataList = [];
        for (let spare of props.spareList) {
            dataList.push({
                id: spare.id,
                isSelected: spare.isSelected,
                editable: spare.editable,
                code: spare.code,
                name: spare.name,
                brand: spare.brand,
                type: spare.specification,
                inventory: (spare.inventory??0),
            })
        }
        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.spareList]);

    /**
     * 输入框变化回调
     * @param text
     */
    const textDidChange = (text: string) => {
        let input = props.spareListInput;
        input.pageNum = 1;
        if (isEmptyString(text)) {
            input.nameOrCode = null;
        } else {
            input.nameOrCode = text;
        }
        props.saveLoadSparePartListInput({...input});
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: SpareListItemProps) => {
        for (let listDatum of props.spareList) {
            if (listDatum.id == item.id){
                listDatum.isSelected = !listDatum.isSelected;
                break;
            }
        }
        props.saveSparePartListData([...props.spareList]);
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
        let selected = [];
        for (const argument of props.spareList) {
            if (argument.isSelected) {
                selected.push(argument);
            }
        }
        if (selected.length == 0) {
            SndToast.showTip('请选择备件');
            return;
        }
        onPopBack();
        props.selectedCallBack && props.selectedCallBack(selected);
    }
    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.spareListInput;
        input.pageNum = 1;
        props.saveLoadSparePartListInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.spareListInput;
        input.pageNum = props.page + 1;
        props.saveLoadSparePartListInput({...input});
    }

    /**
     * 出库单 列表展示
     */
    const renderRefreshList = () => {
        return (
            <PaddingRadiusList headerIcon={require('../../../../../images/aaxiot/plantOperation/maintain/xuanzedj.png')}
                               headerTitle={'选择备件'}
                               sections={listData}
                               page={props.page}
                               refreshing={props.loading}
                               pullToRefresh={pullToRefresh}
                               pullLoadMore={pullLoadMore}
                               renderItem={(item) => SpareListItem(item.item, itemOnSelected)}/>

        )
    }

    return (
        <View style={styles.container}>
            <Toolbar title={'添加选择备件'} navIcon="back" onIconClicked={onPopBack}/>
            <SimpleSearch placeholder={'输入备件编号/名称'} textDidChange={textDidChange}/>
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
    let spare = state.spareOutStore.spareOutStoreNewReducer;
    return {
        spareListInput: spare.spareListInput,
        loading: spare.loading,
        page: spare.page,
        spareList: spare.spareList,
    }
}


export default connect(mapStateToProps, {
    loadChooseSparePartList,
    saveLoadSparePartListInput,
    saveSparePartListData,
    selectSpareDestroyClear,
})(SelectSpareList)


