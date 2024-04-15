import React from "react";
import {connect} from "react-redux";
import {InteractionManager, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import RepairDetail from "../detail/RepairDetail";
import {ListItem} from "../../../../../components/fmcs/plantOperation/components/ListItem";
import RepairAddTask from "../add/RepairAddTask";
import {
    loadRepairList,
    repairDatePickerVisible,
    repairListDestroyClear,
    saveRepairListInput,
    saveRepairSearchText
} from "../../../../../actions/repair/repairAction";
import Scan from "../../../../assets/Scan";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment/moment";
import {checkQrCodeIsRight, isEmptyString, TimeFormatYMD, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";

/**
 * 维修执行 列表
 * @param props
 * @constructor
 */
function RepairList(props: any) {

    React.useEffect(() => {
        loadRepairList();
    }, [props.repairInput]);

    /**
     * 获取维修列表
     */
    const loadRepairList = () => {
        let input = props.repairInput;
        input.customerId = props.currentUser.CustomerId;
        props.loadRepairList(input);
    }

    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    const searchBarRef = React.useRef<TextInput>(null);

    React.useEffect(() => {
        return () => {
            props.repairListDestroyClear();
        }
    }, []);

    /**
     * 头部切换点击
     */
    const onSwitchItem = (value: any) => {
        let input = props.repairInput;
        input.pageNum = 1;
        input.status = value.value;
        if (value.value[0] == '2'){
            input.executorId = [props.currentUser.Id];
        }else {
            input.executorId = null;
        }

        props.saveRepairListInput({...input});
    }

    const listData = React.useMemo(() => {
        let dataList = [];
        for (let repair of props.repairs) {
            let names = '-';

            let isComplete = repair.status == '已完成';
            if (isComplete){
                names = isEmptyString(repair.updateUser) ? '-' : repair.updateUser;
            }else {
                names = repair.executorNames.join('、');
            }

            dataList.push({
                title: repair.deviceName ?? '-',
                orderName: repair.name + '+' + repair.code,
                code: repair.code,
                timeText: isComplete ? '执行日期: ' : '计划日期: ',
                timeString: isComplete ? moment(repair.updateTime).format(TimeFormatYMDHMS) : moment(repair.planDate).format(TimeFormatYMDHMS),
                names: names,
                id: repair.id,
            })
        }

        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.repairs]);

    /**
     * list 行点击
     * @param itemObj
     */
    const onPressListItem = (itemObj: any) => {
        props.navigator.push(
            {
                id: 'repair_Detail',
                component: RepairDetail,
                navigator:props.navigator,
                passProps:
                    {
                        id: itemObj.id,
                        customerId: props.currentUser.CustomerId,
                        code: itemObj.code,
                        executorNames: itemObj.names,
                        refreshCallBack: () => {
                            loadRepairList();
                        }
                    }
            }
        )
    }

    /**
     * 添加一个故障报修
     */
    const onPressAddRepair = () => {
        props.navigator.push({
            id: 'repair_Add_Task',
            component: RepairAddTask,
            passProps: {
                refreshCallBack: () => {
                    loadRepairList();
                }
            }
        })
    }

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.repairInput;
        input.pageNum = 1;
        props.saveRepairListInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.repairInput;
        input.pageNum = props.page + 1;
        props.saveRepairListInput({...input});
    }

    /**
     * 搜索输入框变化
     * @param text
     */
    const onSearchTextChange = (text: string) => {
        props.saveRepairSearchText(text);
    }
    /**
     * 清除输入框文字
     */
    const onPressClear = () => {
        clearSearchBar();
        let input = props.repairInput;
        input.filter = '';
        props.saveRepairListInput({...input});
    }

    const clearSearchBar = ()=>{
        searchBarRef && searchBarRef.current?.clear();
        props.saveRepairSearchText('');
    }

    /**
     * 搜索按钮点击
     */
    const onPressSearch = () => {
        let input = props.repairInput;
        input.pageNum = 1;
        input.filter = props.searchText;
        props.saveRepairListInput({...input});
    }

    /**
     * 扫描按钮点击
     */
    const onPressScan = () => {
        searchBarRef && searchBarRef.current?.blur();
        props.navigator.push({
            id: 'scan_from_bottle_list',
            component: Scan,
            passProps: {
                scanText: '',
                scanResult: (result: string) => {
                    ///扫描二维码得到扫描结果
                    if (checkQrCodeIsRight(result)){
                        let input = props.repairInput;
                        input.pageNum = 1;
                        input.qrCode = result;
                        props.saveRepairListInput({...input});
                    }else {
                      InteractionManager.runAfterInteractions(() => {
                        SndToast.showTip('二维码不合法,请重新扫描', undefined, 2);
                      });
                    }
                }
            }
        });
    }

    /**
     * 故障报修
     */
    const renderRepairHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <HeaderSwitch onSwitchItem={onSwitchItem}
                              titles={[
                                  {title: '待执行', value: ['4']},
                                  {title: '执行中', value: ['5']},
                                  {title: '已完成', value: ['6']},
                                  {title: '待审批', value: ['2']}
                              ]}/>
                <Pressable style={styles.pressContainer} onPress={onPressAddRepair}>
                    <Text style={{fontSize: 14, color: Colors.white}}>故障报修</Text>
                </Pressable>
            </View>
        )
    }

    /**
     * 日历按钮点击
     */
    const onPressCalender = () => {
        props.repairDatePickerVisible(true);
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
      let input = props.repairInput;
      input.pageNum = 1;
      input.filter = '';
      input.qrCode = '';
      input.startTime = dateTime;
      input.endTime = dateTime;
      props.saveRepairListInput({...input});
      clearSearchBar();
    }

    return (
        <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
            <Toolbar title={'维修工单'}
                     navIcon="back"
                     onIconClicked={onPopBack}
                     actions={[{
                         iconType: 'calender',
                     }]}
                     onActionSelected={[onPressCalender]}/>
            <SearchBar textInputRef={searchBarRef}
                       value={props.searchText}
                       onSearchTextChange={onSearchTextChange}
                       placeholder={'请输入任务编号/任务名称'}
                       onPressClear={onPressClear}
                       onPressReset={onPressReset}
                       onPressSearch={onPressSearch}
                       onPressScan={onPressScan}/>
            {renderRepairHeader()}
            <RefreshList contentContainerStyle={{paddingBottom: 15}}
                         sections={listData}
                         page={props.page}
                         refreshing={props.loading}
                         pullToRefresh={pullToRefresh}
                         pullLoadMore={pullLoadMore}
                         renderItem={(item) => ListItem(item.item, onPressListItem)}/>
            <DateTimePicker mode={'date'}
                            date={moment(props.repairInput.startTime).toDate()}
                            isVisible={props.datePickerVisible}
                            onConfirm={(date) => {
                                props.repairDatePickerVisible(false);
                              resetSearchFilter(date)
                            }}
                            onCancel={() => {
                                props.repairDatePickerVisible(false);
                            }}/>
        </View>
    )
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        paddingRight: 15,
    },
    pressContainer: {
        width: 80,
        height: 28,
        backgroundColor: Colors.theme,
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    }
})

const mapStateToProps = (state: any) => {
    let repair = state.repair.RepairListReducer;
    const user = state.user.toJSON().user;
    return {
        currentUser: user,
        loading: repair.loading,
        page: repair.page,
        repairs: repair.results,
        repairInput: repair.repairInput,
        searchText: repair.searchText,
        datePickerVisible: repair.datePickerVisible,
    }
}

export default connect(mapStateToProps, {
    saveRepairListInput,
    loadRepairList,
    saveRepairSearchText,
    repairDatePickerVisible,
    repairListDestroyClear,
})(RepairList)

