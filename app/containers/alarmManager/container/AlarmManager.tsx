import React, { useEffect } from "react";
import { ScrollView, View } from "react-native";
import Colors from "../../../utils/const/Colors";
// @ts-ignore
import Toolbar from "../../../components/Toolbar";
import { AlarmHeader } from "../component/AlarmHeader";
import { MaintainContainerView } from "../../../components/fmcs/plantOperation/maintain/detail/MaintainContainerView";
import AlarmListContainer from "./AlarmListContainer";
import { screenWidth } from "../../../utils/const/Consts";
import { AlarmType } from "../utils";
import { connect } from "react-redux";
import { loadAlarmCodes, loadAlarmCount, loadHierarchyList } from "../actions";
import { localStr } from "../../../utils/Localizations/localization";
import { OfflineView } from "../../assetManager/container/AssetManager";

function AlarmManager(props: any) {
  const scrollContentRef=React.useRef<ScrollView>(null);
  const [selectIndex, setSelectIndex]=React.useState(0);

  const loadData=() => {
    props.loadAlarmCodes();
    let customerId=props.user.getIn(['user', 'CustomerId']);
    props.loadHierarchyList({ customerId: customerId, treeType: "fmhc", type: 1 });
  }

  useEffect(() => {
    if (global.isConnected()) {
      loadData()
    }

  }, [])
  const switchContentWithIndex=(index: number) => {
    refreshCallBack();
    scrollContentRef.current?.scrollTo(
      {
        x: screenWidth()*index,
        y: 0,
        animated: false,
      }
    )
  }

  const refreshCallBack=() => {
    let customerId=props.user.getIn(['user', 'CustomerId']);
    props.loadAlarmCount('1', customerId);
    props.loadAlarmCount('2', customerId);
  }

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={localStr('lang_alarm_tab')} color={Colors.seBrandNomarl} borderColor={Colors.seBrandNomarl} titleColor={Colors.seTextInverse} />
      <AlarmHeader content={[
        {
          title: localStr('lang_alarm_type_bu'),
          count: props.ywCount||0,
          isSelected: selectIndex==0,
          onPress: () => {
            setSelectIndex(0);
            switchContentWithIndex(0)
          }
        },
        {
          title: localStr("lang_alarm_type_comm"),
          count: props.txCount||0,
          isSelected: selectIndex==1,
          onPress: () => {
            setSelectIndex(1);
            switchContentWithIndex(1)
          }
        }
      ]} />
      <MaintainContainerView scrollViewRef={scrollContentRef}
        children={[
          global.isConnected()?
            <AlarmListContainer alarmType={AlarmType.yw}
              navigation={props.navigation}
              alarmCodes={props.alarmCodes}
              hierarchyList={props.hierarchyList}
              refreshCallBack={refreshCallBack} />
            :<OfflineView onRetry={loadData} />

          ,
          global.isConnected()?
            <AlarmListContainer alarmType={AlarmType.tx}
              navigation={props.navigation}
              hierarchyList={props.hierarchyList}
              refreshCallBack={refreshCallBack} />
            :<OfflineView onRetry={loadData} />
        ]} />
    </View>
  )
}


const mapStateToProps=(state: any) => {
  let alarm=state.alarmList;
  return {
    user: state.user,
    ywCount: alarm.ywCount,
    txCount: alarm.txCount,
    alarmCodes: alarm.alarmCodes,
    hierarchyList: alarm.hierarchyList,
  }
}
export default connect(mapStateToProps, {
  loadAlarmCount,
  loadAlarmCodes,
  loadHierarchyList
})(AlarmManager);
