import React from "react";
import { InteractionManager, TextInput, View } from "react-native";
import { connect } from "react-redux";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import Toolbar from "../../../../../components/Toolbar.android";
import Colors from "../../../../../utils/const/Colors";
import { RefreshList } from "../../../../../utils/refreshList/RefreshList";
import SpareRepertoryDetail from '../detail/SpareRepertoryDetail';
import { ListItem } from "../../../../../components/fmcs/plantOperation/components/ListItem";
import {
  loadSpareRepertoryList,
  saveDatePickerVisible,
  saveSpareRepertoryListInput,
  spareRepertoryListDestroyClear,
  spareRepertorySaveSearchText
} from "../../../../../actions/spareRepertory/spareRepertoryAction";
import { isEmptyString, TimeFormatYMD, TimeFormatYMDHMS } from "../../../../../utils/const/Consts";
import Scan from "../../../../assets/Scan";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import { convertSpareRepertoryStatus } from "../detail/SpareRepertoryHelper";

function SpareRepertoryList(props: any) {
  const onPopBack=() => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const searchBarRef=React.useRef<TextInput>(null);

  /**
   * 将课室codes/系统codes赋值  请求巡检列表数据
   */
  React.useEffect(() => {
    if (props.departmentCodes.length>0) {
      let systemCodes=[], departmentCodes=[];
      for (let departmentCode of props.departmentCodes) {
        departmentCodes.push(departmentCode.value);
        let values=[];
        for (let child of departmentCode.children) {
          values.push(child.value);
        }
        systemCodes.push(...values);
      }
      let input=props.spareRepertoryInput;
      input.classroomIds=departmentCodes;
      input.ownerShipSystemIds=systemCodes;
      input.customerId = props.user.CustomerId;
      props.saveSpareRepertoryListInput({ ...input });
    }
  }, [props.departmentCodes]);


  const loadSpareRepertoryLisData = ()=>{
    if (props.spareRepertoryInput.classroomIds.length>0&&props.spareRepertoryInput.ownerShipSystemIds.length>0) {
      props.spareRepertoryInput.customerId=props.user.CustomerId;
      props.loadSpareRepertoryList(props.spareRepertoryInput);
    }
  }
  /**
   * 获取列表
   */
  React.useEffect(() => {
    loadSpareRepertoryLisData();
  }, [props.spareRepertoryInput])

  const listData=React.useMemo(() => {
    let dataList=[];
    for (let task of props.spareRepertoryList) {
      let isComplete=task.executionStatus=='FINISHED';
      let timeString='';
      if (isComplete) {
        timeString=isEmptyString(task.executionTime)? '-':moment(task.executionTime).format(TimeFormatYMDHMS);
      } else {
        timeString=moment(task.planStartTime).format(TimeFormatYMD)+'~'+moment(task.planEndTime).format(TimeFormatYMD);
      }

      dataList.push({
        title: task.inventoryName??'-',
        orderName: (task.inventoryNo??'-'),
        timeText: isComplete? '执行日期:':'计划日期:',
        timeString: timeString,
        names: isEmptyString(task.principal)? '-':task.principal,
        status: convertSpareRepertoryStatus(task.executionStatus),
        timeNeedWarp: !isComplete,
        id: task.id,
      })
    }
    return dataList.length>0? [{ data: dataList }]:[];
  }, [props.spareRepertoryList]);

  React.useEffect(() => {
    return () => {
      props.spareRepertoryListDestroyClear();
    }
  }, [])


  const onSwitchItem=(itemObj: any) => {
    let input=props.spareRepertoryInput;
    input.pageNo=1;
    input.status=itemObj.value;
    props.saveSpareRepertoryListInput({ ...input });
  }

  const onPressListItem=(itemObj: any) => {
    props.navigator.push(
      {
        id: 'spare_repertory_detail',
        component: SpareRepertoryDetail,
        passProps: {
          id: itemObj.id,
          customerId: props.user.CustomerId,
          departmentCodes: props.departmentCodes,
          refreshCallBack: () => {
            ///刷新列表
            loadSpareRepertoryLisData();
          }
        }
      }
    )
  }

  /**
   * 下拉刷新
   */
  const pullToRefresh=() => {
    let input=props.spareRepertoryInput;
    input.pageNo=1;
    props.saveSpareRepertoryListInput({ ...input });
  }

  /**
   * 上拉加载
   */
  const pullLoadMore=() => {
    let input=props.spareRepertoryInput;
    input.pageNo=props.page+1;
    props.saveSpareRepertoryListInput({ ...input });
  }

  const onSearchTextChange=(text: string) => {
    props.spareRepertorySaveSearchText(text);
  }
  /**
   * 清除输入框文字
   */
  const onPressClear=() => {
    clearSearchBar();
    let input=props.spareRepertoryInput;
    input.inventoryName='';
    props.saveSpareRepertoryListInput({ ...input });
  }


  const clearSearchBar=() => {
    searchBarRef&&searchBarRef.current?.clear();
    props.spareRepertorySaveSearchText('');
  }
  /**
   * 搜索按钮点击
   */
  const onPressSearch=() => {
    let input=props.spareRepertoryInput;
    input.inventoryName=props.searchText;
    props.saveSpareRepertoryListInput({ ...input });
  }

  /**
   * 扫描按钮点击
   */
  const onPressScan=() => {
    searchBarRef&&searchBarRef.current?.blur();
    props.navigator.push({
      id: 'scan_from_bottle_list',
      component: Scan,
      passProps: {
        scanText: '',
        scanResult: (result: string) => {
          ///扫描二维码得到扫描结果
          let input=props.spareRepertoryInput;
          input.qrCode=result;
          props.saveSpareRepertoryListInput({ ...input });
        }
      }
    });
  }

  /**
   * 日历点击
   */
  const clickCalender=() => {
    props.saveDatePickerVisible(true);
  }

  const onPressReset = ()=>{
    resetSearchFilter(new Date());
  }

  /**
   * 重置筛选条件
   * @param date
   */
  const resetSearchFilter = (date: Date)=>{
    let dateTime=moment(date).format('YYYY-MM-DD');
    let input=props.spareRepertoryInput;
    input.pageNo=1;
    input.inventoryName='';
    input.qrCode='';
    input.startTime=dateTime+' 00:00:00';
    input.endTime=dateTime+' 23:59:59';
    props.saveSpareRepertoryListInput({ ...input });
    clearSearchBar();
  }


  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar
        title={'备件盘点'}
        navIcon="back"
        onIconClicked={onPopBack}
        actions={[{
          iconType: 'calender',
        }]}
        onActionSelected={[clickCalender]} />
      <SearchBar textInputRef={searchBarRef}
        value={props.searchText}
        isHiddenScan={true}
        onSearchTextChange={onSearchTextChange}
        placeholder={'请输入盘点名称'}
        onPressClear={onPressClear}
        onPressReset={onPressReset}
        onPressSearch={onPressSearch} />
      <HeaderSwitch onSwitchItem={onSwitchItem}
        titles={[
          { title: '待执行', value: ['NOT_STARTED'] },
          { title: '执行中', value: ['EXECUTING'] },
          { title: '已完成', value: ['FINISHED'] }]} />
      <RefreshList sections={listData}
        page={props.page}
        refreshing={props.loading}
        pullToRefresh={pullToRefresh}
        pullLoadMore={pullLoadMore}
        renderItem={(item) => ListItem(item.item, onPressListItem)} />
      <DateTimePicker mode={'date'}
        isVisible={props.datePickerVisible}
        date={moment(props.spareRepertoryInput.startTime).toDate()}
        onConfirm={(date) => {
          props.saveDatePickerVisible(false);
          resetSearchFilter(date);
        }}
        onCancel={() => {
          props.saveDatePickerVisible(false);
        }} />
    </View>
  )
}

const mapStateToProps=(state: any) => {
  let spareRepertory=state.spareRepertory.spareRepertoryListReducer;
  const user=state.user.toJSON().user;
  return {
    user: user,
    loading: spareRepertory.loading,
    page: spareRepertory.page,
    spareRepertoryInput: spareRepertory.spareRepertoryInput,
    spareRepertoryList: spareRepertory.spareRepertoryList,
    searchText: spareRepertory.searchText,
    datePickerVisible: spareRepertory.datePickerVisible,
  }
}

export default connect(mapStateToProps, {
  loadSpareRepertoryList,
  saveSpareRepertoryListInput,
  spareRepertorySaveSearchText,
  saveDatePickerVisible,
  spareRepertoryListDestroyClear,
})(SpareRepertoryList)
