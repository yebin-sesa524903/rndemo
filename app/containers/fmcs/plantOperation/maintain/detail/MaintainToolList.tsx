import React from "react";
import {Image, InteractionManager, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import {SimpleSearch} from "../../../../../components/fmcs/plantOperation/components/SimpleSearch";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {
    MaintainToolItem,
    MaintainToolItemProps
} from "../../../../../components/fmcs/plantOperation/maintain/list/MaintainToolItem";
import {PaddingRadiusList} from "../../../../../components/fmcs/plantOperation/components/PaddingRadiusList";
import {
    addToolUseItem,
    loadToolList,
    saveToolListInput, toolDestroyClear,
    updateToolList
} from "../../../../../actions/spareTools/apareToolsAction";
import SndToast from "../../../../../utils/components/SndToast";
import {RequestStatus} from "../../../../../middleware/api";
import {isEmptyString, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import moment from "moment";


/**
 * 关联备件出库单 列表
 * @constructor
 */
function MaintainToolList(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    /**
     * 监听列表入参 请求列表数据
     */
    React.useEffect(()=>{
        props.loadToolList(props.toolListInput);
    }, [props.toolListInput]);

    /**
     * 监听添加备件请求
     */
    React.useEffect(()=>{
        if (props.addToolRequestStatus == RequestStatus.loading){
            SndToast.showLoading();
        }else if(props.addToolRequestStatus == RequestStatus.success){
            SndToast.dismiss();
            onPopBack();
            props.refreshCallBack && props.refreshCallBack();
        }else if(props.addToolRequestStatus == RequestStatus.initial){
            SndToast.dismiss();
        }
    }, [props.addToolRequestStatus]);

    React.useEffect(()=>{
        return ()=>{
            props.toolDestroyClear();
        }
    }, []);

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let dataList = [];
        for (let tool of props.toolList) {
            dataList.push({
                id: tool.id,
                isSelected: tool.isSelected,
                toolNumber: tool.serialNo,
                toolName: tool.name,
                userName: tool.borrowByName,
                dateString: moment(tool.borrowTime).format(TimeFormatYMDHMS),
            })
        }
        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.toolList]);

    /**
     * 输入框变化回调
     * @param text
     */
    const textDidChange = (text: string) => {
        let input = props.toolListInput;
        input.pageItem.page = 1;
        if (text.length > 0){
            input.toolName = text;
        }else {
            input.toolName = null;
        }
        props.saveToolListInput({...input});
    }

    /**
     * checkbox点选
     */
    const itemOnSelected = (item: MaintainToolItemProps) => {
        for (let listDatum of props.toolList) {
            listDatum.isSelected = listDatum.id == item.id;
        }
        props.updateToolList([...props.toolList]);
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
        let selectedObj = undefined;
        for (const argument of props.toolList) {
            if (argument.isSelected){
                selectedObj = argument;
                break;
            }
        }
        if (selectedObj == undefined){
            SndToast.showTip('请选择单据');
            return;
        }

        let params = {
            taskId: isEmptyString(selectedObj.taskId) ? props.taskId : selectedObj.taskId,
            toolUsageId: selectedObj.id,
        }
        props.addToolUseItem(params);
    }


    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.toolListInput;
        input.pageNum = 1;
        props.saveToolListInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.toolListInput;
        input.pageNum = props.page + 1;
        props.saveToolListInput({...input});
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
                               renderItem={(item) => MaintainToolItem(item.item, itemOnSelected)}/>

        )
    }

    return (
        <View style={styles.container}>
            <Toolbar title={'关联工具领用单'} navIcon="back" onIconClicked={onPopBack}/>
            <SimpleSearch placeholder={'输入工具名称'} textDidChange={textDidChange}/>
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
        toolListInput: spareTools.toolListInput,///获取列表的入参
        loading: spareTools.toolLoading,
        page: spareTools.toolPage,
        toolList: spareTools.toolList,    ///领用工具列表
        addToolRequestStatus: spareTools.addToolRequestStatus,
    }
}


export default connect(mapStateToProps, {
    saveToolListInput,
    loadToolList,
    addToolUseItem,
    updateToolList,
    toolDestroyClear,
})(MaintainToolList)


