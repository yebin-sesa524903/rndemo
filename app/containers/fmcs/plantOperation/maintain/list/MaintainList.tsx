import React from "react";
import {connect} from "react-redux";
import {Alert, InteractionManager, TextInput, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../../../components/Toolbar";
import SearchBar from "../../../../../components/fmcs/gasClass/airBottle/list/SearchBar";
import HeaderSwitch from "../../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import MaintainDetail from "../detail/MaintainDetail";
import {ListItem} from "../../../../../components/fmcs/plantOperation/components/ListItem";
import {
  loadMaintainTaskList, maintainActionSheet,
  maintainDatePickerVisible,
  maintainListDestroyClear, maintainNFCSheet,
  saveMaintainInput,
  saveMaintainSearchText
} from "../../../../../actions/maintain/maintainAction";
import {
  checkQrCodeIsRight,
  isEmptyString,
  stringRemoveEmptyCharacter,
  TimeFormatYMD,
  TimeFormatYMDHMS
} from "../../../../../utils/const/Consts";
import Scan from "../../../../assets/Scan";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment/moment";
import SndToast from "../../../../../utils/components/SndToast";
import {
  ActionSheetType,
  InspectionActionSheet
} from "../../../../../components/fmcs/plantOperation/inspection/detail/InspectionMethod";
import NfcManager, {Ndef, NfcEvents, NfcTech} from "react-native-nfc-manager";

/**
 * 保养执行 列表
 * @param props
 * @constructor
 */
function MaintainList(props: any) {
  /**
   * 返回按钮点击
   */
  const onPopBack = () => {
    InteractionManager.runAfterInteractions(() => {
      props.navigator.pop();
    });
  }

  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    async function initNfc() {
      try {
        const supported = await NfcManager.isSupported();
        if (supported) {
          await NfcManager.start();
        }
        setEnabled(await NfcManager.isEnabled());

        if (supported) {
          NfcManager.setEventListener(
            NfcEvents.StateChanged,
            (evt: { state: string }) => {
              NfcManager.cancelTechnologyRequest().catch(() => 0);
              if (evt.state === 'off') {
                setEnabled(false);
              } else if (evt.state === 'on') {
                setEnabled(true);
              }
            },
          );
        }
      } catch (e) {
        SndToast.showTip('NFC不可用');
      }
    }

    initNfc().then(r => {
    });
  }, [])


  const searchBarRef = React.useRef<TextInput>(null);

  /**
   * 将获取到的课时/系统费codes赋值给列表请求入参
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
        let input = props.maintainInput;
        input.departmentCodes = departmentCodes;
        input.systemCodes = systemCodes;
        input.customerId = props.currentUser.CustomerId;
        props.saveMaintainInput({...input});
      }
    });
  }, [props.departmentCodes]);


  const loadMaintainListData = () => {
    if (props.maintainInput.departmentCodes.length > 0 && props.maintainInput.systemCodes.length > 0) {
      props.loadMaintainTaskList(props.maintainInput);
    }
  }

  /**
   * 监听列表请求入参变化 获取列表数据
   */
  React.useEffect(() => {
    loadMaintainListData();
  }, [props.maintainInput]);


  /**
   * 销毁时操作
   */
  React.useEffect(() => {
    return () => {
      props.maintainListDestroyClear();
      NfcManager.cancelTechnologyRequest();
    }
  }, []);


  /**
   * 头部切换点击
   */
  const onSwitchItem = (value: any) => {
    let input = props.maintainInput;
    input.pageNum = 1;
    input.status = value.value;
    props.saveMaintainInput({...input});
  }

  /**
   * 列表数据源
   */
  const listData = React.useMemo(() => {
    let dataList = [];
    for (let task of props.maintainTasks) {
      let isComplete = task.status == '已完成';
      let names = '-';
      if (isComplete) {
        if (task.endExecutorNames.join('、').length > 0) {
          names = task.endExecutorNames.join('、');
        }
      } else {
        names = (isEmptyString(task.executorNames) ? '-' : task.executorNames);
      }
      dataList.push({
        title: task.deviceName,
        orderName: task.code,
        code: task.code,
        timeText: isComplete ? '执行日期: ' : '计划日期: ',
        timeString: isComplete ? moment(task.finishedTime).format(TimeFormatYMDHMS) : moment(task.planDate).format(TimeFormatYMDHMS),
        names: names,
        status: task.status,
        id: task.id,
        deviceCode: task.deviceCode,
      })
    }
    return props.maintainTasks.length > 0 ? [{data: dataList}] : [];
  }, [props.maintainTasks]);

  /**
   * 下拉刷新
   */
  const pullToRefresh = () => {
    let input = props.maintainInput;
    input.pageNum = 1;
    props.saveMaintainInput({...input});
  }

  /**
   * 上拉加载
   */
  const pullLoadMore = () => {
    let input = props.maintainInput;
    input.pageNum = props.page + 1;
    props.saveMaintainInput({...input});
  }

  /**
   * 搜索输入框变化
   * @param text
   */
  const onSearchTextChange = (text: string) => {
    props.saveMaintainSearchText(text);
  }
  /**
   * 清除输入框文字
   */
  const onPressClear = () => {
    clearSearchBar()
    let input = props.maintainInput;
    input.filter = '';
    props.saveMaintainInput({...input});
  }

  const clearSearchBar = () => {
    searchBarRef && searchBarRef.current?.clear();
    props.saveMaintainSearchText('');
  }

  /**
   * 搜索按钮点击
   */
  const onPressSearch = () => {
    let input = props.maintainInput;
    input.pageNum = 1;
    input.filter = props.searchText;
    props.saveMaintainInput({...input});
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
            let input = props.maintainInput;
            input.pageNum = 1;
            input.qrCode = result;
            props.saveMaintainInput({...input});
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
   * list 行点击
   * @param maintain
   */
  const onPressListItem = (maintain: any) => {
    if (maintain.status == '未开始') {
      props.maintainActionSheet({visible: true, data: maintain});
    } else {
      jumpToMaintainDetail(maintain);
    }

  }

  /**
   * 跳转详情
   * @param maintain
   * @param isCreditCard 是否是刷卡进入 true:是;  false: 直接开始
   */
  const jumpToMaintainDetail = (maintain: any, isCreditCard?: boolean) => {
    props.navigator.push({
      id: 'maintain_detail',
      component: MaintainDetail,
      passProps: {
        id: maintain.id,
        code: maintain.code,
        isCreditCard: isCreditCard,
        executorNames: maintain.names,
        refreshListCallBack: () => {
          ///刷新列表回调
          loadMaintainListData();
        }
      },
    });
  }


  /**
   * 读取nfc 内容
   */
  const renderNfc = async () => {
    let tag = null;
    try {
      await NfcManager.requestTechnology([NfcTech.Ndef]);
      tag = await NfcManager.getTag();
    } catch (ex) {
      // for tag reading, we don't actually need to show any error
      // console.log(ex);
    } finally {
      await NfcManager.cancelTechnologyRequest();
    }
    return tag;
  }


  const onPressSheetItem = async (index: number) => {
    props.maintainActionSheet({visible: false, data: props.actionSheet.data});
    if (index == 0) {
      if (!enabled) {
        Alert.alert(
          '', '设备NFC功能未开启', [
            {
              text: '取消',
            },
            {
              text: '去开启',
              onPress: async () => {
                await NfcManager.goToNfcSetting();
              }
            }
          ]
        )
        return;
      }
      props.maintainNFCSheet({visible: true});

      readHandleNfcMsg().then();
    } else {
      ///直接开始
      jumpToMaintainDetail(props.actionSheet.data, false);
    }
  }

  /**
   * 读取卡片信息
   */
  const readHandleNfcMsg = async ()=>{
    let tag = await renderNfc();
    console.log(tag);
    if (tag) {
      const ndef =
        Array.isArray(tag.ndefMessage) && tag.ndefMessage.length > 0
          ? tag.ndefMessage[0]
          : null;
      // @ts-ignore
      if (ndef.tnf === Ndef.TNF_WELL_KNOWN) {
        // @ts-ignore
        let payload = Ndef.text.decodePayload(ndef?.payload);
        payload = stringRemoveEmptyCharacter(payload);
        let result = JSON.parse(payload);
        if (result && result.type == 'device' && result.device_code == props.actionSheet.data.deviceCode){
          props.maintainNFCSheet({visible: false});
          jumpToMaintainDetail(props.actionSheet.data, true);
        }else {
          showAlertTip('当前任务不是针对该设备的，请确认后重新刷卡');
        }
      }
    }
  }

  const showAlertTip = (message: string)=>{
    Alert.alert('', message,
      [
        {
          text:'确定',
          onPress: async ()=>{
            await readHandleNfcMsg()
          }
        }
      ]
    )
  }

  const onPressCancel = () => {
    props.maintainActionSheet({visible: false, data: {}});
  }

  const onPressNFCSheetCancel = () => {
    NfcManager.cancelTechnologyRequest();
    props.maintainNFCSheet({visible: false});
  }

  /**
   * 日期点击
   */
  const onPressCalender = () => {
    props.maintainDatePickerVisible(true);
  }

  const onPressReset = () => {
    resetSearchFilter(new Date());
  }

  /**
   * 重置筛选条件
   * @param date
   */
  const resetSearchFilter = (date: Date) => {
    let dateTime = moment(date).format(TimeFormatYMD);
    let input = props.maintainInput;
    input.pageNum = 1;
    input.filter = '';
    input.qrCode = '';
    input.startTime = dateTime;
    input.endTime = dateTime;
    props.saveMaintainInput({...input});
    clearSearchBar()
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors.background.primary}}>
      <Toolbar title={'保养执行'} navIcon="back" onIconClicked={onPopBack} actions={[{iconType: 'calender'}]}
               onActionSelected={[onPressCalender]}/>
      <SearchBar textInputRef={searchBarRef}
                 value={props.searchText}
                 onSearchTextChange={onSearchTextChange}
                 placeholder={'请输入任务编号'}
                 onPressClear={onPressClear}
                 onPressReset={onPressReset}
                 onPressSearch={onPressSearch}
                 onPressScan={onPressScan}/>
      <HeaderSwitch onSwitchItem={onSwitchItem}
                    titles={[
                      {title: '待执行', value: ['未开始']},
                      {title: '执行中', value: ['执行中']},
                      {title: '已完成', value: ['已完成']}]}/>
      <RefreshList contentContainerStyle={{paddingBottom: 15}}
                   sections={listData}
                   page={props.page}
                   refreshing={props.loading}
                   pullToRefresh={pullToRefresh}
                   pullLoadMore={pullLoadMore}
                   renderItem={(item) => ListItem(item.item, onPressListItem)}/>
      <DateTimePicker mode={'date'}
                      date={moment(props.maintainInput.startTime).toDate()}
                      isVisible={props.datePickerVisible}
                      onConfirm={(date) => {
                        props.maintainDatePickerVisible(false);
                        resetSearchFilter(date);
                      }}
                      onCancel={() => {
                        props.maintainDatePickerVisible(false);
                      }}/>
      <InspectionActionSheet title={'保养'}
                             actionSheetType={ActionSheetType.inspectionMeth}
                             visible={props.actionSheet.visible}
                             onPressItem={onPressSheetItem}
                             onPressCancel={onPressCancel}/>
      <InspectionActionSheet actionSheetType={ActionSheetType.NFC}
                             visible={props.NFCSheet.visible}
                             onPressCancel={onPressNFCSheetCancel}/>
    </View>
  )
}

const mapStateToProps = (state: any) => {
  let maintain = state.maintain.MaintainListReducer;
  const user = state.user.toJSON().user;
  return {
    currentUser: user,
    loading: maintain.loading,
    page: maintain.page,
    searchText: maintain.searchText,
    maintainInput: maintain.maintainInput,
    maintainTasks: maintain.maintainTasks,
    datePickerVisible: maintain.datePickerVisible,

    actionSheet: maintain.actionSheet,
    NFCSheet: maintain.NFCSheet,
  }
}

export default connect(mapStateToProps, {
  loadMaintainTaskList,
  saveMaintainInput,
  saveMaintainSearchText,
  maintainDatePickerVisible,
  maintainListDestroyClear,
  maintainActionSheet,
  maintainNFCSheet,
})(MaintainList)

