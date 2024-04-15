import React from "react";
import {connect} from "react-redux";
import {InteractionManager, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import AbnormalDetail from "../detail/AbnormalDetail";
import {
    loadAbnormalList,
    saveAbnormalSearchInput,
    saveAbnormalListInput, abnormalListDestroyClear,
} from "../../../../../actions/abnormal/abnormalAction";

import Scan from "../../../../assets/Scan";
import DateTimePicker from "react-native-modal-datetime-picker";
import {ListItem} from "../../../../../components/fmcs/plantOperation/components/ListItem";
import {checkQrCodeIsRight, isEmptyString, TimeFormatYMD, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import moment from "moment/moment";
import SndToast from "../../../../../utils/components/SndToast";

/**
 * 异常点检执行 列表
 * @param props
 * @constructor
 */
function AbnormalList(props: any) {

    const searchBarRef = React.useRef<TextInput>(null);

    const [dateVisible, setDateVisible] = React.useState(false);

    React.useEffect(() => {
        loadList();
    }, [props.abnormalInput]);

    const loadList = ()=>{
        let input = props.abnormalInput;
        input.userId = props.userId
        input.customerId = props.customerId
        props.loadAbnormalList(props.abnormalInput)
    }

    React.useEffect(()=>{
        return ()=>{
            props.abnormalListDestroyClear();
        }
    }, []);

    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    /**
     * 头部切换点击
     */
    const onSwitchItem = (itemObj: { title: string, value: string }) => {
        let input = props.abnormalInput;
        input.pageNum = 1;
        input.status = itemObj.value;
        props.saveAbnormalListInput({...input});
    }

    const listData = React.useMemo(() => {
        let dataList = [];
        for (let task of props.results) {
            let isComplete = task.status == '已完成';
            let names = '-';
            if (isComplete){
                names = isEmptyString(task.updateUser) ? '-' : task.updateUser;
            }else {
                if (task.executorNames.join("、").length > 0){
                    names = task.executorNames.join("、");
                }
            }
            dataList.push({
                title: task.deviceName ?? '-',
                orderName: task.name + '+' + task.code ,
                timeText: isComplete ? '执行日期: ' : '产生日期: ',
                timeString: isComplete ? moment(task.updateTime).format(TimeFormatYMDHMS) : moment(task.occurrenceTime).format(TimeFormatYMDHMS),
                names: names,
                status: task.status == '未开始' ? '待执行' : task.status,
                id: task.id,
            })
        }
        return dataList.length > 0 ? [{data: dataList}] : dataList;
    }, [props.results]);

    /**
     * list 行点击
     * @param item
     */
    const onPressListItem = (item: any) => {
        props.navigator.push({
            id: 'abnormal_detail',
            component: AbnormalDetail,
            passProps: {
                id: item.id,
              customerId: props.customerId,
                executorNames: item.names,
                refreshCallBack: ()=>{
                    loadList();
                }
            }
        });
    }

    const onPressCalender = () => {
        setDateVisible(true)
    }

    const onPressScan = () => {
        props.navigator.push({
            id: 'scan_from_bottle_list',
            component: Scan,
            passProps: {
                scanText: '',
                scanResult: (result: string) => {
                    if (checkQrCodeIsRight(result)){
                        let input = props.abnormalInput;
                        input.page = 1;
                        input.qrCode = result;
                        props.saveAbnormalListInput({...input});
                    }else {
                      InteractionManager.runAfterInteractions(() => {
                        SndToast.showTip('二维码不合法,请重新扫描', undefined, 2);
                      });
                    }
                }
            }
        });
    }

    const onPressSearch = () => {
        let input = props.abnormalInput;
        input.page = 1;
        input.filter = props.searchText;
        props.saveAbnormalListInput({...input});
    }

    /**
     * 清除输入框文字
     */
    const onPressClear = () => {
        clearSearchBar()
        let input = props.abnormalInput;
        input.filter = '';
        props.saveAbnormalListInput({...input});
    }

    const clearSearchBar = ()=>{
        searchBarRef && searchBarRef.current?.clear();
        props.saveAbnormalSearchInput('');
    }


    const pullToRefresh = () => {
        let input = props.abnormalInput;
        input.page = 1;
        props.saveAbnormalListInput({...input});
    }

    const pullLoadMore = () => {
        let input = props.abnormalInput;
        input.page = props.page + 1;
        props.saveAbnormalListInput({...input});
    }

    const onPressReset = ()=>{
      resetSearchFilter(new Date());
    }
  /**
   * 重置筛选条件
   * @param date
   */
  const resetSearchFilter = (date: Date)=>{
      let dateTime = moment(date).format(TimeFormatYMD);
      let input = props.abnormalInput;
      input.filter = '';
      input.pageNum = 1;
      input.qrCode = '';
      input.startTime = dateTime;
      input.endTime = dateTime;
      props.saveAbnormalListInput({...input})
      clearSearchBar();
    }

    return (
        <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
            <Toolbar
                title={'异常点检工单'}
                navIcon="back"
                onIconClicked={onPopBack}
                actions={[{
                    iconType: 'calender',
                }]}
                onActionSelected={[onPressCalender]}/>
            <SearchBar placeholder={'请输入任务编号/任务名称'}
                       onPressScan={onPressScan}
                       onPressSearch={onPressSearch}
                       onPressClear={onPressClear}
                       onPressReset={onPressReset}
                       onSearchTextChange={(text: string) => {
                           props.saveAbnormalSearchInput(text);
                       }}/>
            <HeaderSwitch onSwitchItem={onSwitchItem}
                          titles={[
                              {title: '待执行', value: ['4']},
                              {title: '执行中', value: ['5']},
                              {title: '已完成', value: ['6']}]}/>
            <RefreshList
                // @ts-ignore
                sections={listData}
                page={props.page}
                refreshing={props.loading}
                pullToRefresh={pullToRefresh}
                pullLoadMore={pullLoadMore}
                renderItem={(item) => ListItem(item.item, onPressListItem)}/>
            <DateTimePicker
                mode={'date'}
                date={moment(props.abnormalInput.startTime).toDate()}
                isVisible={dateVisible}
                onConfirm={(date) => {
                    setDateVisible(false)
                    resetSearchFilter(date);
                }}
                onCancel={() => {
                    setDateVisible(false)
                }}
            />
        </View>
    )
}

const mapStateToProps = (state: any) => {
    let abnormals = state.abnormal.AbnormalListReducer;
    const user = state.user.toJSON().user;
    return {
        abnormalInput: abnormals.abnormalInput,
        userId: user.Id,
        customerId: user.CustomerId,
        page: abnormals.page,
        loading: abnormals.loading,
        results: abnormals.results,
        searchText: abnormals.searchText,
    }
}

export default connect(mapStateToProps, {
    loadAbnormalList,
    saveAbnormalSearchInput,
    saveAbnormalListInput,
    abnormalListDestroyClear,
})(AbnormalList)

