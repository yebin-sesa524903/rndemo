import React from "react";
import {connect} from "react-redux";
import {InteractionManager, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import InspectionDetail from "../detail/InspectionDetail";
import {
  inspectDatePickerVisible,
  inspectListDestroyClear,
  loadInspectionList,
  saveInspectionInput,
  saveInspectionSearchText
} from "../../../../../actions/inspection/inspectionAction";
import Scan from "../../../../assets/Scan";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import {ListItem} from "../../../../../components/fmcs/plantOperation/components/ListItem";
import {checkQrCodeIsRight, isEmptyString, TimeFormatYMD, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {convertInspectionStatus} from "../detail/InspectionStateHelper";
import SndToast from "../../../../../utils/components/SndToast";

/**
 * 巡检执行列表
 * @param props
 * @constructor
 */
function InspectionList(props: any) {

  const searchBarRef = React.useRef<TextInput>(null);

  /**
   * 将课室codes/系统codes赋值  请求巡检列表数据
   */
  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
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
        let input = props.inspectionInput;
        input.departmentCodes = departmentCodes;
        input.systemCodes = systemCodes;
        input.customerId = props.currentUser.CustomerId;
        props.saveInspectionInput({...input});
      }
    });
  }, [props.departmentCodes]);

  const loadListInformation = () => {
    if (props.inspectionInput.departmentCodes.length > 0 && props.inspectionInput.systemCodes.length > 0) {
      props.loadInspectionList(props.inspectionInput);
    }
  }
  /**
   * 获取列表
   */
  React.useEffect(() => {
    loadListInformation();
  }, [props.inspectionInput]);


  React.useEffect(() => {
    return () => {
      props.inspectListDestroyClear();
    }
  }, [])

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
    let input = props.inspectionInput;
    input.pageNum = 1;
    input.executeStatus = itemObj.value;
    props.saveInspectionInput({...input});
  }

  const listData = React.useMemo(() => {
    let dataList = [];
    for (let task of props.results) {
      let isComplete = task.executeStatus == '4';
      let names = '-';
      if (isComplete) {
        if (task.endExecutorNames.join('、').length > 0) {
          names = task.endExecutorNames.join('、');
        }
      } else {
        names = (isEmptyString(task.executorName) ? '-' : task.executorName);
      }

      let orderName = '-';
      if (isEmptyString(task.planId)) {
        orderName = task.planName;
      }
      dataList.push({
        title: task.name + '+' + task.code,
        orderName: orderName,
        timeText: isComplete ? '执行日期: ' : '计划日期: ',
        timeString: isComplete ? moment(task.executeTime).format(TimeFormatYMDHMS) : moment(task.planDate).format(TimeFormatYMDHMS),
        names: names,
        status: convertInspectionStatus(task.executeStatus),
        id: task.id,
      })
    }
    return dataList.length > 0 ? [{data: dataList}] : [];
  }, [props.results]);


  /**
   * list 行点击
   * @param item
   */
  const onPressListItem = (item: any) => {
    props.navigator.push({
      id: 'inspection_detail',
      component: InspectionDetail,
      passProps: {
        id: item.id,
        executorName: item.names,
        refreshCallBack: () => {
          loadListInformation();
        }
      }
    });
  }

  /**
   * 下拉刷新
   */
  const pullToRefresh = () => {
    let input = props.inspectionInput;
    input.pageNum = 1;
    props.saveInspectionInput({...input});
  }

  /**
   * 上拉加载
   */
  const pullLoadMore = () => {
    let input = props.inspectionInput;
    input.pageNum = props.page + 1;
    props.saveInspectionInput({...input});
  }

  const onSearchTextChange = (text: string) => {
    props.saveInspectionSearchText(text);
  }
  /**
   * 清除输入框文字
   */
  const onPressClear = () => {
    clearSearchBar()
    let input = props.inspectionInput;
    input.codeOrName = '';
    props.saveInspectionInput({...input});
  }

  const clearSearchBar = () => {
    searchBarRef && searchBarRef.current?.clear();
    props.saveInspectionSearchText('');
  }

  /**
   * 搜索按钮点击
   */
  const onPressSearch = () => {
    let input = props.inspectionInput;
    input.pageNum = 1;
    input.codeOrName = props.searchText;
    props.saveInspectionInput({...input});
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
          if (checkQrCodeIsRight(result)) {
            let input = props.inspectionInput;
            input.pageNum = 1;
            input.qrCode = result;
            props.saveInspectionInput({...input});
          } else {
            InteractionManager.runAfterInteractions(() => {
              SndToast.showTip('二维码不合法,请重新扫描', undefined, 2);
            });
          }
        }
      }
    });
  }

  /**
   * 日历点击
   */
  const clickRight = () => {
    props.inspectDatePickerVisible(true);
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
    let input = props.inspectionInput;
    input.pageNum = 1;
    input.codeOrName = '';
    input.qrCode = '';
    input.planBeginDate = dateTime;
    input.planEndDate = dateTime;
    props.saveInspectionInput({...input});
    clearSearchBar();
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar
        title={'巡检任务'}
        navIcon="back"
        onIconClicked={onPopBack}
        actions={[{
          iconType: 'calender',
        }]}
        onActionSelected={[clickRight]}/>
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
                      {title: '待执行', value: ['3']},
                      {title: '执行中', value: ['1']},
                      {title: '已完成', value: ['4']}]}/>
      <RefreshList sections={listData}
                   page={props.page}
                   refreshing={props.loading}
                   pullToRefresh={pullToRefresh}
                   pullLoadMore={pullLoadMore}
                   renderItem={(item) => ListItem(item.item, onPressListItem)}/>

      <DateTimePicker mode={'date'}
                      isVisible={props.datePickerVisible}
        // @ts-ignore
                      date={moment(props.inspectionInput.planBeginDate).toDate()}
                      onConfirm={(date) => {
                        props.inspectDatePickerVisible(false);
                        resetSearchFilter(date);
                      }}
                      onCancel={() => {
                        props.inspectDatePickerVisible(false);
                      }}/>
    </View>
  )
}

const mapStateToProps = (state: any) => {
  let inspections = state.inspection.InspectionListReducer;
  const user = state.user.toJSON().user;
  return {
    currentUser: user,
    inspectionInput: inspections.inspectionInput,
    loading: inspections.loading,
    page: inspections.page,
    results: inspections.results,
    searchText: inspections.searchText,
    datePickerVisible: inspections.datePickerVisible,
  }
}

export default connect(mapStateToProps, {
  loadInspectionList,
  saveInspectionInput,
  saveInspectionSearchText,
  inspectDatePickerVisible,
  inspectListDestroyClear,
})(InspectionList)

