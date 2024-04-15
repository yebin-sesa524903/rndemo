import React from "react";
import {connect} from "react-redux";
import {InteractionManager, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import ConsumablesDetail from "../detail/ConsumablesDetail";
import {ListItem} from "../../../../../components/fmcs/plantOperation/components/ListItem";
import {
    consumablesDatePickerVisible,
    consumablesListDestroyClear,
    loadConsumablesList,
    saveConsumablesInput,
    saveSearchText
} from "../../../../../actions/consumables/consumablesAction";
import Scan from "../../../../assets/Scan";
import moment from "moment/moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import {checkQrCodeIsRight, TimeFormatYMD, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import SndToast from "../../../../../utils/components/SndToast";

/**
 * 耗材更换 列表
 * @param props
 * @constructor
 */
function ConsumablesList(props: any) {
    /**
     * 返回按钮点击
     */
    const onPopBack = () => {
        InteractionManager.runAfterInteractions(() => {
            props.navigator.pop();
        });
    }

    const searchBarRef = React.useRef<TextInput>(null);

    /**
     * 将获取到的课时/系统费codes赋值给列表请求入参
     */
    React.useEffect(() => {
        if (props.departmentCodes.length > 0) {
            let systemCodes = [], departmentCodes = [];
            for (let departmentCode of props.departmentCodes) {
                departmentCodes.push(departmentCode.value);
                let values = [];
                for (let child of departmentCode.children) {
                    values.push(child.value);
                }
                systemCodes.push(...values);
            }
            let input = props.consumablesInput;
            input.customerId = props.currentUser.CustomerId;
            input.departmentCodes = departmentCodes;
            input.systemCodes = systemCodes;
            props.saveConsumablesInput({...input});
        }
    }, [props.departmentCodes]);


    const loadConsumablesListData = ()=>{
      if (props.consumablesInput.departmentCodes.length > 0 && props.consumablesInput.systemCodes.length > 0) {
        props.loadConsumablesList(props.consumablesInput);
      }
    }

    /**
     * 监听耗材入参变化 请求列表
     */
    React.useEffect(() => {
      loadConsumablesListData()
    }, [props.consumablesInput]);

    React.useEffect(() => {
        return () => {
            props.consumablesListDestroyClear();
        }
    }, []);

    /**
     * 头部切换点击
     */
    const onSwitchItem = (obj: any) => {
        let input = props.consumablesInput;
        input.pageNum = 1;
        input.status = obj.value;
        props.saveConsumablesInput({...input});
    }

    /**
     * 列表数据源
     */
    const listData = React.useMemo(() => {
        let dataList = [];
        for (let consumable of props.consumables) {
            let isComplete =  consumable.status == '4';
            dataList.push({
                title: consumable.deviceName,
                orderName: consumable.code + "+" + consumable.name,
                timeText: isComplete ? '执行日期: ' : '计划日期: ',
                timeString: isComplete ? moment(consumable.submitTime).format(TimeFormatYMDHMS) : moment(consumable.planDate).format(TimeFormatYMDHMS),
                names: isComplete ? consumable.updateUser : consumable.taskObjectName,
                id: consumable.id,
            })
        }

        return dataList.length > 0 ? [{data: dataList}] : [];
    }, [props.consumables]);

    /**
     * 下拉刷新
     */
    const pullToRefresh = () => {
        let input = props.consumablesInput;
        input.pageNum = 1;
        props.saveConsumablesInput({...input});
    }

    /**
     * 上拉加载
     */
    const pullLoadMore = () => {
        let input = props.consumablesInput;
        input.pageNum = props.page + 1;
        props.saveConsumablesInput({...input});
    }

    /**
     * list 行点击
     * @param itemObj
     */
    const onPressListItem = (itemObj: any) => {
        props.navigator.push(
            {
                id: 'consumables_detail',
                component: ConsumablesDetail,
                passProps: {
                    ticketId: itemObj.id,
                    customerId: props.currentUser.CustomerId,
                    departmentCodes: props.departmentCodes,
                    executorNames: itemObj.names,
                    refreshCallBack: () => {
                      loadConsumablesListData();
                    }
                }
            }
        )
    }

    const onSearchTextChange = (text: string) => {
        props.saveSearchText(text);
    }
    /**
     * 清除输入框文字
     */
    const onPressClear = () => {
        clearSearchBar();
        let input = props.consumablesInput;
        input.filter = '';
        props.saveConsumablesInput({...input});
    }

    const clearSearchBar = ()=>{
        searchBarRef && searchBarRef.current?.clear();
        props.saveSearchText('');
    }
    /**
     * 搜索按钮点击
     */
    const onPressSearch = () => {
        let input = props.consumablesInput;
        input.pageNum = 1;
        input.filter = props.searchText;
        props.saveConsumablesInput({...input});
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
                        let input = props.consumablesInput;
                        input.pageNum = 1;
                        input.qrCode = result;
                        props.saveConsumablesInput({...input});
                    }else {
                      InteractionManager.runAfterInteractions(() => {
                        SndToast.showTip('二维码不合法,请重新扫描', undefined, 2);
                      });
                    }
                }
            }
        });
    }

    const onPressCalender = () => {
        props.consumablesDatePickerVisible(true);
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
      let input = props.consumablesInput;
      input.pageNum = 1;
      input.filter = '';
      input.qrCode = '';
      input.startTime = dateTime;
      input.endTime = dateTime;
      props.saveConsumablesInput({...input});
      clearSearchBar();
    }

    return (
        <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
            <Toolbar title={'耗材更换任务'} navIcon="back" onIconClicked={onPopBack} actions={[{
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
            <HeaderSwitch onSwitchItem={onSwitchItem}
                          titles={[
                              {title: '待执行', value: '3'},
                              {title: '执行中', value: '1'},
                              {title: '已完成', value: '4'}]}/>
            <RefreshList sections={listData}
                         page={props.page}
                         refreshing={props.loading}
                         pullToRefresh={pullToRefresh}
                         pullLoadMore={pullLoadMore}
                         renderItem={(item) => ListItem(item.item, onPressListItem)}/>
            <DateTimePicker mode={'date'}
                            date={moment(props.consumablesInput.startTime).toDate()}
                            isVisible={props.datePickerVisible}
                            onConfirm={(date) => {
                                props.consumablesDatePickerVisible(false);
                              resetSearchFilter(date);
                            }}
                            onCancel={() => {
                                props.consumablesDatePickerVisible(false);
                            }}/>
        </View>
    )
}

const mapStateToProps = (state: any) => {
    let consumables = state.consumables.ConsumablesListReducer;
    const user = state.user.toJSON().user;
    return {
        currentUser: user,
        loading: consumables.loading,
        page: consumables.page,
        consumables: consumables.results,
        consumablesInput: consumables.consumablesInput,
        searchText: consumables.searchText,
        datePickerVisible: consumables.datePickerVisible,
    }
}

export default connect(mapStateToProps, {
    loadConsumablesList,
    saveConsumablesInput,
    saveSearchText,
    consumablesDatePickerVisible,
    consumablesListDestroyClear,
})(ConsumablesList)

