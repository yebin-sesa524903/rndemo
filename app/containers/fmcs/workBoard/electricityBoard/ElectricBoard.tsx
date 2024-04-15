import React from 'react'
import {
  View,
  ScrollView,
} from 'react-native';
import { connect } from "react-redux";
import HeaderSwitch from "../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import Colors from "../../../../utils/const/Colors";
import { Overview } from "../../../../components/fmcs/workBoard/overview/Overview";
import { screenWidth } from "../../../../utils/const/Consts";
import { FZLBoard } from "../../../../components/fmcs/workBoard/electricity/FZLBoard";
import { ZJZTBoard } from "../../../../components/fmcs/workBoard/electricity/ZJZTBoard";
import {
  loadBoardOverview,
  loadElectricityRefreshRate,
  loadMainIncomingStatus,
  loadLoadRate,
  loadPmTasks,
  loadElecAlarmsInfo
} from "../../../../actions/workboard/workboardAction";
import {
  convertOverViewInfo,
  convertIncomingInfo,
  convertFzlInfo,
  convertAlarmInfoCount,
  convertPMInfoCount,
} from "./ElectBoardHelper";
import { BJBoard } from "../../../../components/fmcs/workBoard/electricity/BJBoard";
import privilegeHelper from "../../../../utils/privilegeHelper";
import permissionCode from "../../../../utils/permissionCode";
import SndToast from "../../../../utils/components/SndToast";
import MaintainList from "../../plantOperation/maintain/list/MaintainList";
import InspectionList from "../../plantOperation/inspection/list/InspectionList";
import RepairList from "../../plantOperation/repair/list/RepairList";

function ElectricBoard(props: any) {
  ///scrollView 引用
  const scrollViewRef=React.useRef<ScrollView>(null);
  ///定时器
  const [timeInterval, setTimeInterval]=React.useState<NodeJS.Timer>();

  React.useEffect(() => {
    getRefreshRate();
    loadGasRequestData();
  }, []);

  /**
   * 获取气化课所需 数据
   */
  const loadGasRequestData=() => {
    getOverViewDataInfo();
    getMainIncomingStatus();
    getPmTasks();
    getLoadRate();
    getElecAlarmsInfo()
  }
  /**
   * 获取刷新频率
   */
  const getRefreshRate=() => {
    props.loadElectricityRefreshRate();
    startTimeInterval();
  }

  /**
   * 获取概览数据
   */
  const getOverViewDataInfo=() => {
    props.loadBoardOverview('DK');
  }

  /**
   * 主进状态
   */
  const getMainIncomingStatus=() => {
    props.loadMainIncomingStatus();
  }

  /**
   * PM任务信息列表
   */
  const getPmTasks=() => {
    props.loadPmTasks();
  }

  /**
   * 负载率
   */
  const getLoadRate=() => {
    props.loadLoadRate();
  }

  /**
   * 报警信息列表
   */
  const getElecAlarmsInfo=() => {
    props.loadElecAlarmsInfo();
  }

  /**
   * 开启定时器 每过refreshRate 秒刷新页面
   */
  const startTimeInterval=() => {
    let interval=setInterval(() => {

    }, (1000*props.refreshRate*60));
    setTimeInterval(interval);
  }

  /**
   * 概览info
   */
  const overViewInfo=React.useMemo(() => {
    if (Object.keys(props.overViewInfo).length>0) {
      return convertOverViewInfo(props.overViewInfo);
    } else {
      return [];
    }
  }, [props.overViewInfo]);

  /**
   * 主进状态
   */
  const incomingInfo=React.useMemo(() => {
    if (Object.keys(props.incomingStatusInfo).length>0) {
      return convertIncomingInfo(props.incomingStatusInfo);
    } else {
      return [];
    }
  }, [props.incomingStatusInfo]);

  const fzlInfo=React.useMemo(() => {
    if (Object.keys(props.loadRates).length>0) {
      return convertFzlInfo(props.loadRates);
    } else {
      return [];
    }
  }, [props.loadRates]);

  /**
   * 报警信息
   */
  const bjInfo=React.useMemo(() => {
    return convertAlarmInfoCount(props.alarmInfos);
  }, [props.alarmInfos]);

  /**
  * PM任务
  */
  const pmInfo=React.useMemo(() => {
    return convertPMInfoCount(props.pmTaskInfos);
  }, [props.pmTaskInfos]);
  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      timeInterval&&clearInterval(timeInterval);
    }
  }, []);


  const configGasHeaderTitles=() => {
    return [
      {
        title: '概览',
        value: 0,
      },
      {
        title: '主进状态',
        value: 1,
      },
      {
        title: '负载率',
        value: 2,
      },
      {
        title: 'PM任务',
        value: 3,
      },
      {
        title: '报警信息',
        value: 4,
      }
    ]
  }

  /**
   * 头部切换点击
   * @param headerObj
   */
  const onHeaderSwitch=(headerObj: { title: string, value: number }) => {
    scrollViewRef.current?.scrollTo(
      {
        x: screenWidth()*headerObj.value,
        y: 0,
        animated: true,
      }
    )
  }

  const onPressViewDetail=(index: number) => {
    ///1.获取电课 codes
    let electricCode=undefined;
    for (let code of props.departmentCodes) {
      if (code.name=='电课'&&code.code=='DK') {
        electricCode=code;
        break;
      }
    }
    if (index==3) {
      if (!privilegeHelper.checkModulePermission(permissionCode.PLANT_MAINTAIN)) {
        SndToast.showTip('当前账号没有保养任务查看权限!');
        return;
      }
      ///保养列表
      props.navigator.push({
        id: 'maintain_list',
        component: MaintainList,
        passProps: {
          departmentCodes: [electricCode],
        }
      });
    } else if (index==4) {
      if (!privilegeHelper.checkModulePermission(permissionCode.PLANT_INSPECTION)) {
        SndToast.showTip('当前账号没有巡检任务查看权限!');
        return;
      }
      ///巡检
      props.navigator.push({
        id: 'inspection_list',
        component: InspectionList,
        passProps: {
          departmentCodes: [electricCode],
        }
      });
    } else if (index==5) {
      if (!privilegeHelper.checkModulePermission(permissionCode.PLANT_REPAIR)) {
        SndToast.showTip('当前账号没有维修任务查看权限!');
        return;
      }
      ///维修
      props.navigator.push({ id: 'repair_list', component: RepairList });
    }
  }





  return (
    <View style={{ flex: 1, backgroundColor: Colors.background.primary }}>
      <HeaderSwitch
        onSwitchItem={onHeaderSwitch}
        titles={configGasHeaderTitles()} />
      <ScrollView ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        pagingEnabled={true}
        scrollEnabled={false}
        style={{ flex: 1 }}
        horizontal={true}>
        <Overview data={overViewInfo} onPressViewDetail={onPressViewDetail} onRefresh={loadGasRequestData} />
        {/*@ts-ignore*/}
        <ZJZTBoard data={incomingInfo} />
        {/*@ts-ignore*/}
        <FZLBoard data={fzlInfo} />
        <BJBoard data={[pmInfo]} />
        <BJBoard data={[bjInfo]} />
      </ScrollView>
    </View>

  )
}

const mapStateToProps=(state: any) => {
  let dkReducer=state.workBoard.dkReducer;
  return {
    refreshRate: dkReducer.refreshRate,
    overViewInfo: dkReducer.overViewInfo,
    incomingStatusInfo: dkReducer.incomingStatusInfo,
    loadRates: dkReducer.loadRates,
    pmTaskInfos: dkReducer.pmTaskInfos,
    timeRemind: dkReducer.timeRemind,
    alarmInfos: dkReducer.alarmInfos,
  }
}
export default connect(mapStateToProps, {
  loadBoardOverview,
  loadElectricityRefreshRate,
  loadMainIncomingStatus,
  loadPmTasks,
  loadLoadRate,
  loadElecAlarmsInfo,
})(ElectricBoard);
