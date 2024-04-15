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
import { TQBoard } from "../../../../components/fmcs/workBoard/gas/TQBoard";
import {
  gasBoardDestroyClear,
  loadBoardOverview,
  loadDetectorStatus,
  loadDetectorTask, loadDZQCount,
  loadGasAcidStatus,
  loadRefreshRate,
  loadSpcOverCount,
  loadTankFillTimeRemind
} from "../../../../actions/workboard/workboardAction";
import {
  convertDetectorStatus,
  convertDetectorTask,
  convertDZQTrafficCount,
  convertHXInfo,
  convertOverViewInfo,
  convertQhInfo,
  convertSPCOverCount,
  convertTimeRemind
} from "./GasBoardHelper";
import { DZQBoard } from "../../../../components/fmcs/workBoard/gas/DZQBoard";

function GasBoard(props: any) {
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
    getGasAcidStatus();
    getDetectorTask();
    getDetectorTaskStatus();
    getSpcOverCount();
    getTankFillTimeRemind();
    getDZQCount()
  }
  /**
   * 获取刷新频率
   */
  const getRefreshRate=() => {
    props.loadRefreshRate();
    startTimeInterval();
  }

  /**
   * 获取概览数据
   */
  const getOverViewDataInfo=() => {
    props.loadBoardOverview('QH');
  }

  /**
   * 获取特气状态统计数据
   */
  const getGasAcidStatus=() => {
    props.loadGasAcidStatus();
  }

  /**
   * 侦测器隔离任务统计-今日
   */
  const getDetectorTask=() => {
    props.loadDetectorTask();
  }

  /**
   * 侦测器状态统计
   */
  const getDetectorTaskStatus=() => {
    props.loadDetectorStatus();
  }

  /**
   * SPC超出统计
   */
  const getSpcOverCount=() => {
    props.loadSpcOverCount();
  }

  /**
   * 大宗气流量统计
   */
  const getDZQCount=() => {
    props.loadDZQCount();
  }

  /**
   * 槽车充填通知时间提醒
   */
  const getTankFillTimeRemind=() => {
    props.loadTankFillTimeRemind()
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
   * 特气
   */
  const tqInfo=React.useMemo(() => {
    if (Object.keys(props.aasAcidStatusInfo).length>0) {
      return convertQhInfo(props.aasAcidStatusInfo);
    } else {
      return [];
    }
  }, [props.aasAcidStatusInfo]);

  /**
   * 化学
   */
  const hxInfo=React.useMemo(() => {
    if (Object.keys(props.aasAcidStatusInfo).length>0) {
      return convertHXInfo(props.aasAcidStatusInfo);
    } else {
      return [];
    }
  }, [props.aasAcidStatusInfo]);

  /**
   * 侦测器任务
   */
  const zcqRwInfo=React.useMemo(() => {
    return convertDetectorTask(props.detectorTask);
  }, [props.detectorTask]);

  /**
   * 侦测器状态统计
   */
  const zcqZtInfo=React.useMemo(() => {
    return convertDetectorStatus(props.detectorStatus);
  }, [props.detectorStatus]);

  /**
   * SPC超出统计
   */
  const spcOverCountInfo=React.useMemo(() => {
    return convertSPCOverCount(props.spcOverCount);
  }, [props.spcOverCount]);

  /**
   * 槽车填充通知时间提醒
   */
  const timeRemindInfo=React.useMemo(() => {
    return convertTimeRemind(props.timeRemind);
  }, [props.timeRemind]);
  /**
   * 大宗气流量统计
   */
  const trafficCountInfo=React.useMemo(() => {
    return convertDZQTrafficCount(props.trafficCount);
  }, [props.trafficCount]);

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      timeInterval&&clearInterval(timeInterval);
      props.gasBoardDestroyClear()
    }
  }, []);


  const configGasHeaderTitles=() => {
    return [
      {
        title: '概览',
        value: 0,
      },
      {
        title: '特气',
        value: 1,
      },
      {
        title: '化学',
        value: 2,
      },
      {
        title: '侦测器',
        value: 3,
      },
      {
        title: '大宗气',
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
        <Overview data={overViewInfo} onRefresh={loadGasRequestData} />
        <TQBoard data={tqInfo} onRefresh={loadGasRequestData} />
        <TQBoard data={[...hxInfo, timeRemindInfo]} onRefresh={loadGasRequestData} />
        {/*@ts-ignore*/}
        <TQBoard data={[zcqZtInfo, zcqRwInfo]} onRefresh={loadGasRequestData} />
        <DZQBoard data={[spcOverCountInfo, trafficCountInfo]} onRefresh={loadGasRequestData} />
      </ScrollView>
    </View>

  )
}

const mapStateToProps=(state: any) => {
  let qhReducer=state.workBoard.qhReducer;
  return {
    refreshRate: qhReducer.refreshRate,
    overViewInfo: qhReducer.overViewInfo,
    aasAcidStatusInfo: qhReducer.aasAcidStatusInfo,
    detectorTask: qhReducer.detectorTask,
    detectorStatus: qhReducer.detectorStatus,
    spcOverCount: qhReducer.spcOverCount,
    timeRemind: qhReducer.timeRemind,
    trafficCount: qhReducer.trafficCount,
  }
}
export default connect(mapStateToProps, {
  loadBoardOverview,
  loadRefreshRate,
  loadGasAcidStatus,
  loadDetectorTask,
  loadDetectorStatus,
  loadSpcOverCount,
  loadTankFillTimeRemind,
  loadDZQCount,
  gasBoardDestroyClear,
})(GasBoard);
