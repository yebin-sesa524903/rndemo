import React from 'react'
import {
  View,
  ScrollView, Alert, RefreshControl,
} from 'react-native';
import { connect } from "react-redux";
import HeaderSwitch from "../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import Colors from "../../../../utils/const/Colors";
import { Overview } from "../../../../components/fmcs/workBoard/overview/Overview";
import { isEmptyString, screenWidth } from "../../../../utils/const/Consts";
import {
  loadBoardOverview,
  loadWaterUpwTarget,
  loadWaterRefreshRate,
  loadWaterConsumption,
  loadRecycleRateData,
  loadWaterUpwConsumeData,
  loadWaterPowerConsumeData,
  waterBoardDestroyClear
} from "../../../../actions/workboard/workboardAction";
import { convertCSChartLineInfo, convertFSChartLineInfo, convertOverViewInfo } from "./WaterBoardHelper";
import WaterBoardComponent from "../../../../components/fmcs/workBoard/water/WaterBoard";
import MaintainList from "../../plantOperation/maintain/list/MaintainList";
import InspectionList from "../../plantOperation/inspection/list/InspectionList";
import RepairList from "../../plantOperation/repair/list/RepairList";
import privilegeHelper from "../../../../utils/privilegeHelper";
import permissionCode from "../../../../utils/permissionCode";
import SndToast from "../../../../utils/components/SndToast";

function WaterBoard(props: any) {
  ///scrollView 引用
  const scrollViewRef=React.useRef<ScrollView>(null);
  ///定时器
  const [timeInterval, setTimeInterval]=React.useState<NodeJS.Timer>();

  React.useEffect(() => {
    loadWaterChartData();
    startTimeInterval();
  }, [])

  /**
   * 开启定时器 每过refreshRate 秒刷新页面
   */
  const startTimeInterval=() => {
    let interval=setInterval(() => {
      // loadWaterChartData();
    }, 1000*props.refreshRate*60);
    setTimeInterval(interval);
  }

  /**
   * 获取水课看板展示所需数据
   */
  const loadWaterChartData=() => {
    getRefreshRate();
    getOverViewDataInfo();
    getUpwAndWwtStatus();
    getWaterConsumption();

    getWaterUpwConsumeData();
    getRecycleRateData();
    loadWaterPowerConsumeData();
  }

  /**
   * 获取刷新频率
   */
  const getRefreshRate=() => {
    props.loadWaterRefreshRate();
  }

  /**
   * 获取概览数据
   */
  const getOverViewDataInfo=() => {
    props.loadBoardOverview('SK');
  }

  /**
   * 获取UPW和WWT内控指标
   */
  const getUpwAndWwtStatus=() => {
    props.loadWaterUpwTarget();
  }

  /**
   * 化学品消耗统计
   */
  const getWaterConsumption=() => {
    props.loadWaterConsumption();
  }

  /**
   * 回收率指标
   */
  const getRecycleRateData=() => {
    props.loadRecycleRateData();
  }

  /**
   * 水量消耗
   */
  const getWaterUpwConsumeData=() => {
    props.loadWaterUpwConsumeData();
  }

  /**
   * 电量消耗
   */
  const loadWaterPowerConsumeData=() => {
    props.loadWaterPowerConsumeData();
  }

  /**
   * 概览info
   */
  const overViewData=React.useMemo(() => {
    if (Object.keys(props.overViewInfo).length>0) {
      return convertOverViewInfo(props.overViewInfo);
    } else {
      return [];
    }
  }, [props.overViewInfo]);

  /**
   * 纯水展示数据转换
   */
  const csInfo=React.useMemo(() => {
    if (Object.keys(props.upwWwtInfo).length>0) {
      return convertCSChartLineInfo(props.upwWwtInfo, props.consumptionInfo, props.upwWwtConsumerData, props.recycleRateData, props.upwWwtPowerConsumeData);
    } else {
      return [];
    }
  }, [props.upwWwtInfo, props.consumptionInfo, props.upwWwtConsumerData, props.recycleRateData, props.upwWwtPowerConsumeData]);

  /**
   * 废水展示数据转换
   */
  const fsInfo=React.useMemo(() => {
    if (Object.keys(props.upwWwtInfo).length>0) {
      return convertFSChartLineInfo(props.upwWwtInfo, props.consumptionInfo, props.upwWwtConsumerData, props.upwWwtPowerConsumeData);
    } else {
      return [];
    }
  }, [props.upwWwtInfo, props.consumptionInfo, props.upwWwtConsumerData, props.upwWwtPowerConsumeData]);

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      timeInterval&&clearInterval(timeInterval);
      props.waterBoardDestroyClear();
    }
  }, []);


  const configGasHeaderTitles=() => {
    return [
      {
        title: '概览',
        value: 0,
      },
      {
        title: '纯水',
        value: 1,
      },
      {
        title: '废水',
        value: 2,
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

  /**
   * 点击查看更多
   * @param index
   */
  const onPressViewDetail=(index: number) => {
    ///1.获取水课 codes
    let waterCode=undefined;
    for (let code of props.departmentCodes) {
      if (code.name=='水课'&&code.code=='SK') {
        waterCode=code;
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
          departmentCodes: [waterCode],
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
          departmentCodes: [waterCode],
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
        <Overview data={overViewData} onPressViewDetail={onPressViewDetail} onRefresh={loadWaterChartData} />
        <WaterBoardComponent data={csInfo} onRefresh={loadWaterChartData} />
        <WaterBoardComponent data={fsInfo} onRefresh={loadWaterChartData} />
      </ScrollView>
    </View>

  )
}

const mapStateToProps=(state: any) => {
  let skReducer=state.workBoard.skReducer;
  return {
    refreshRate: skReducer.refreshRate,
    overViewInfo: skReducer.overViewInfo,
    upwWwtInfo: skReducer.upwWwtInfo,

    consumptionInfo: skReducer.consumptionInfo,///化学品消耗
    recycleRateData: skReducer.recycleRateData,///回收率指标
    upwWwtConsumerData: skReducer.upwWwtConsumerData, ///UPW/WWT水量消耗指标
    upwWwtPowerConsumeData: skReducer.upwWwtPowerConsumeData, ///UPW/WWT电耗指标
  }
}
export default connect(mapStateToProps, {
  loadBoardOverview,
  loadWaterRefreshRate,
  loadWaterUpwTarget,
  loadWaterConsumption,
  loadRecycleRateData,
  loadWaterUpwConsumeData,
  loadWaterPowerConsumeData,
  waterBoardDestroyClear,
})(WaterBoard);
