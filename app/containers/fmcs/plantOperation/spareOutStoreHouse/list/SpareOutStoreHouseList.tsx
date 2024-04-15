import React from "react";
import { InteractionManager, TextInput, View } from "react-native";
import { connect } from "react-redux";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import { ListItem } from "../../../../../components/fmcs/plantOperation/components/ListItem";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import Colors from "../../../../../utils/const/Colors";
import { RefreshList } from "../../../../../utils/refreshList/RefreshList";
import SpareOutStoreHouseDetail from "../detail/SpareOutStoreHouseDetail";
import BottleDetailActionView from "../../../../../components/fmcs/gasClass/airBottle/detail/BottleDetailActionView";
import {
  loadSpareOutStoreList,
  saveDatePickerVisible,
  saveSpareOutStoreListInput,
  spareOutStoreListDestroyClear,
  spareOutStoreSaveSearchText
} from "../../../../../actions/spareOutStore/spareOutStoreAction";
import { checkQrCodeIsRight, isEmptyString, TimeFormatYMD, TimeFormatYMDHMS } from "../../../../../utils/const/Consts";
import Scan from "../../../../assets/Scan";
import moment from "moment/moment";
import DateTimePicker from "react-native-modal-datetime-picker";
import NewSpareOutStore from "../new/NewSpareOutStore";
import SndToast from "../../../../../utils/components/SndToast";

function SpareOutStoreHouseList(props: any) {

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
      let input=props.spareOutStoreInput;
      input.pageNum=1;
      input.classroomIds=departmentCodes;
      input.ownerShipSystemIds=systemCodes;
      input.customerId = props.user.CustomerId;
      props.saveSpareOutStoreListInput({ ...input });
    }
  }, [props.departmentCodes]);


  const loadSpareOutStoreList = ()=>{
    if (props.spareOutStoreInput.classroomIds.length>0&&props.spareOutStoreInput.ownerShipSystemIds.length>0) {
      props.spareOutStoreInput.customerId=props.user.CustomerId;
      props.loadSpareOutStoreList(props.spareOutStoreInput);
    }
  }
  /**
   * 获取列表
   */
  React.useEffect(() => {
    loadSpareOutStoreList();
  }, [props.spareOutStoreInput])

  const listData=React.useMemo(() => {
    let dataList=[];
    for (let task of props.spareOutStoreList) {
      dataList.push({
        title: task.name??'-',
        orderName: (task.warehouseExitNo??'-'),
        timeText: '出库时间: ',
        timeString: isEmptyString(task.warehouseExitTime)? '-':moment(task.warehouseExitTime).format(TimeFormatYMDHMS),
        names: isEmptyString(task.recipient)? '-':task.recipient,
        id: task.id,
      })
    }
    return dataList.length>0? [{ data: dataList }]:[];
  }, [props.spareOutStoreList]);

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      props.spareOutStoreListDestroyClear();
    }
  }, [])

  /**
   * 点进进入详情
   * @param itemObj
   */
  const onPressListItem=(itemObj: any) => {
    props.navigator.push(
      {
        id: 'spareOutStoreHouse_detail',
        component: SpareOutStoreHouseDetail,
        passProps: {
          id: itemObj.id,
          customerId: props.user.CustomerId,
          departmentCodes: props.departmentCodes,
          refreshCallBack: () => {
            ///操作完成之后,回到列表刷新
            loadSpareOutStoreList()
          }
        }
      }
    )
  }

  /**
   * 备件出库
   */
  const onPressOutStore=() => {
    props.navigator.push(
      {
        id: 'New_SpareOutStore',
        component: NewSpareOutStore,
        passProps: {
          departmentCodes: props.departmentCodes,
          refreshCallBack: () => {
            ///操作完成之后,回到列表刷新
            loadSpareOutStoreList()
          }
        },
      }
    )
  }

  const configBottomAction=() => {
    return (
      <BottleDetailActionView actions={[
        {
          title: '备件出库',
          textColor: Colors.white,
          onPressCallBack: onPressOutStore,
          btnStyle: { marginRight: 10, marginLeft: 10, flex: 1, backgroundColor: Colors.theme }
        }
      ]} />
    )
  }

  /**
   * 下拉刷新
   */
  const pullToRefresh=() => {
    let input=props.spareOutStoreInput;
    input.pageNum=1;
    props.saveSpareOutStoreListInput({ ...input });
  }

  /**
   * 上拉加载
   */
  const pullLoadMore=() => {
    let input=props.spareOutStoreInput;
    input.pageNum=props.page+1;
    props.saveSpareOutStoreListInput({ ...input });
  }

  const onSearchTextChange=(text: string) => {
    props.spareOutStoreSaveSearchText(text);
  }
  /**
   * 清除输入框文字
   */
  const onPressClear=() => {
    clearSearchBar();
    let input=props.spareOutStoreInput;
    input.warehouseExitNo='';
    props.saveSpareOutStoreListInput({ ...input });
  }

  const clearSearchBar=() => {
    searchBarRef&&searchBarRef.current?.clear();
    props.spareOutStoreSaveSearchText('');
  }
  /**
   * 搜索按钮点击
   */
  const onPressSearch=() => {
    let input=props.spareOutStoreInput;
    input.pageNum=1;
    input.warehouseExitNo=props.searchText;
    props.saveSpareOutStoreListInput({ ...input });
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
          if (checkQrCodeIsRight(result)) {
            let input=props.spareOutStoreInput;
            input.pageNum=1;
            input.qrCode=result;
            props.saveSpareOutStoreListInput({ ...input });
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
  const clickCalender=() => {
    props.saveDatePickerVisible(true);
  }

  const onPressReset = ()=>{
    resetSearchFilter(new Date());
  }

  const resetSearchFilter = (date: Date)=>{
    let dateTime=moment(date).format(TimeFormatYMD);
    let input=props.spareOutStoreInput;
    input.pageNum=1;
    input.warehouseExitNo='';
    input.qrCode='';
    input.startTime=dateTime;
    input.endTime=dateTime;
    props.saveSpareOutStoreListInput({ ...input });
    clearSearchBar();
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <Toolbar
        title={'出库管理'}
        navIcon="back"
        onIconClicked={onPopBack}
        actions={[{
          iconType: 'calender',
        }]}
        onActionSelected={[clickCalender]} />
      <SearchBar textInputRef={searchBarRef}
        value={props.searchText}
        onSearchTextChange={onSearchTextChange}
        placeholder={'请输入出库单号'}
        onPressClear={onPressClear}
        onPressReset={onPressReset}
        onPressSearch={onPressSearch}
        onPressScan={onPressScan} />
      <RefreshList sections={listData}
        page={props.page}
        refreshing={props.loading}
        pullToRefresh={pullToRefresh}
        pullLoadMore={pullLoadMore}
        renderItem={(item) => ListItem(item.item, onPressListItem)} />
      {configBottomAction()}
      <DateTimePicker mode={'date'}
        isVisible={props.datePickerVisible}
        date={moment(props.spareOutStoreInput.startTime).toDate()}
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
  let spareOutStore=state.spareOutStore.spareOutStoreListReducer;
  const user=state.user.toJSON().user;
  return {
    user: user,
    loading: spareOutStore.loading,
    page: spareOutStore.page,
    spareOutStoreInput: spareOutStore.spareOutStoreInput,
    spareOutStoreList: spareOutStore.spareOutStoreList,
    searchText: spareOutStore.searchText,
    datePickerVisible: spareOutStore.datePickerVisible,
  }
}

export default connect(mapStateToProps, {
  saveSpareOutStoreListInput,
  loadSpareOutStoreList,
  spareOutStoreSaveSearchText,
  saveDatePickerVisible,
  spareOutStoreListDestroyClear,
})(SpareOutStoreHouseList)
