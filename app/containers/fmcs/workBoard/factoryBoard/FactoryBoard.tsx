import React from "react";
import { connect } from "react-redux";
import { ScrollView, View } from "react-native";
import {
  loadFMEnergy,
  loadFMErc,
  loadFMGasOperation,
  loadFMMachinery,
  loadFMMainV,
  loadFMTask,
  loadFMWater,
  fmDestroyClear,
  updateTaskIndex,
  updateEnergyIndex,
  loadFMDetectorStatus, loadFMVocDiscard, loadFMSexDiscard
} from "../../../../actions/workboard/workboardAction";
import HeaderSwitch from "../../../../components/fmcs/gasClass/airBottle/list/HeaderSwitch";
import { screenWidth } from "../../../../utils/const/Consts";
import { TaskBoard } from "../../../../components/fmcs/workBoard/fm/TaskBoard";
import {
  configErcData,
  configSkData,
  convertEnergyInfo,
  convertMainVStatus,
  convertTaskInfo,
  gasInfo, gxkInfo
} from "./FactoryBoardHelper";
import { EnergyBoard } from "../../../../components/fmcs/workBoard/fm/EnergyBoard";
import { DKBoard } from "../../../../components/fmcs/workBoard/fm/DKBoard";
import { JXKBoard } from "../../../../components/fmcs/workBoard/fm/JXKBoard";
import { QHKBoard } from "../../../../components/fmcs/workBoard/fm/QHKBoard";
import { ErcBoard } from "../../../../components/fmcs/workBoard/fm/ErcBoard";
import { SKBoard } from "../../../../components/fmcs/workBoard/fm/SKBoard";

function FactoryBoard(props: any) {

  const scrollViewRef=React.useRef<ScrollView>(null);

  React.useEffect(() => {
    loadBoardData();
  }, []);

  const loadBoardData=() => {
    loadCurrentMonthTask();
    loadLastMonthTask();
    loadCurrentEnergy();
    loadLastEnergy();
    loadMachinery();
    loadMainV();
    loadGasOperation();
    loadWaterDashboard();
    loadErc();
  }

  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      props.fmDestroyClear();
    }
  }, [])
  /**
   * 本月任务
   */
  const loadCurrentMonthTask=() => {
    props.loadFMTask({ type: 1 });
  }

  /**
   * 上月任务
   */
  const loadLastMonthTask=() => {
    props.loadFMTask({ type: 2 });
  }

  /**
   * 当月能耗
   */
  const loadCurrentEnergy=() => {
    props.loadFMEnergy({ type: 1 });
  }

  /**
   * 上月能耗
   */
  const loadLastEnergy=() => {
    props.loadFMEnergy({ type: 2 });
  }

  /**
   * 机械课运行数据
   */
  const loadMachinery=() => {
    props.loadFMMachinery();
    props.loadFMVocDiscard();
    props.loadFMSexDiscard();
  }

  /**
   * 电课运行
   */
  const loadMainV=() => {
    props.loadFMMainV();
  }

  /**
   * 气化课
   */
  const loadGasOperation=() => {
    props.loadFMGasOperation();
    props.loadFMDetectorStatus();
  }

  /**
   * 水课运行
   */
  const loadWaterDashboard=() => {
    props.loadFMWater()
  }

  /**
   * erc
   */
  const loadErc=() => {
    props.loadFMErc();
  }

  ///任务相关
  const currentTaskInfo=React.useMemo(() => {
    if (Object.keys(props.currentMonthTask).length>0) {
      return convertTaskInfo(props.currentMonthTask);
    } else {
      return [];
    }
  }, [props.currentMonthTask]);

  const lastTaskInfo=React.useMemo(() => {
    if (Object.keys(props.lastMonthTask).length>0) {
      return convertTaskInfo(props.lastMonthTask);
    } else {
      return [];
    }
  }, [props.lastMonthTask]);

  ///能耗相关
  const currentEnergyInfo=React.useMemo(() => {
    if (Object.keys(props.currentMonthEnergy).length>0) {
      return convertEnergyInfo(props.currentMonthEnergy);
    } else {
      return [];
    }
  }, [props.currentMonthEnergy]);

  const lastEnergyInfo=React.useMemo(() => {
    if (Object.keys(props.lastMonthEnergy).length>0) {
      return convertEnergyInfo(props.lastMonthEnergy);
    } else {
      return [];
    }
  }, [props.lastMonthEnergy]);

  /**
   * 机械课数据构建
   */
  const jxkInfo=React.useMemo(() => {
    if (Object.keys(props.machineryDashboard).length>0) {
      return gxkInfo(props.machineryDashboard, props.vocDiscard, props.sexDiscard);
    } else {
      return [];
    }
  }, [props.machineryDashboard, props.vocDiscard, props.sexDiscard])

  /**
   * 电课运行 主进状态数据构建
   */
  const incomingInfo=React.useMemo(() => {
    if (Object.keys(props.mainVStatus).length>0) {
      return convertMainVStatus(props.mainVStatus);
    } else {
      return [];
    }
  }, [props.mainVStatus]);

  /**
   * 气化课运行
   */
  const qhkInfo=React.useMemo(() => {
    if (Object.keys(props.gasOperation).length>0&&Object.keys(props.gmsMsg).length>0) {
      return gasInfo(props.gasOperation, props.gmsMsg);
    } else {
      return [];
    }
  }, [props.gasOperation, props.gmsMsg])

  /**
   * 水课数据构建
   */
  const shInfo=React.useMemo(() => {
    if (Object.keys(props.waterDashboard).length>0) {
      return configSkData(props.waterDashboard);
    } else {
      return [];
    }
  }, [props.waterDashboard])

  /**
   * erc data info
   */
  const ercInfo=React.useMemo(() => {
    if (Object.keys(props.ercData).length>0) {
      return configErcData(props.ercData, props.gmsMsg);
    } else {
      return [];
    }
  }, [props.ercData, props.gmsMsg])

  /**
   * 头部切换标题
   */
  const configGasHeaderTitles=() => {
    return [
      {
        title: '厂务任务',
        value: 0,
      },
      {
        title: '厂务能耗',
        value: 1,
      },
      {
        title: '机械课运行',
        value: 2,
      },
      {
        title: '电课运行',
        value: 3,
      },
      {
        title: '气化课运行',
        value: 4,
      },
      {
        title: '水课运行',
        value: 5,
      },
      {
        title: 'ERC运行',
        value: 6,
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
    <View style={{ flex: 1 }}>
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
        <TaskBoard title={'本月任务'}
          monthIndex={props.taskIndex}
          data={props.taskIndex==1? currentTaskInfo:lastTaskInfo}
          onRefresh={loadBoardData}
          onChange={(index: number) => props.updateTaskIndex(index)} />
        <EnergyBoard title={'厂务能耗'}
          monthIndex={props.energyIndex}
          onRefresh={loadBoardData}
          onChange={(index: number) => props.updateEnergyIndex(index)}
          data={props.energyIndex==1? currentEnergyInfo:lastEnergyInfo} />
        {/*@ts-ignore*/}
        <JXKBoard data={jxkInfo} onRefresh={loadBoardData} />
        {/*@ts-ignore*/}
        <DKBoard data={incomingInfo} onRefresh={loadBoardData} />
        {/*@ts-ignore*/}
        <QHKBoard data={qhkInfo} onRefresh={loadBoardData} />
        <SKBoard data={shInfo} onRefresh={loadBoardData} />
        {/*@ts-ignore*/}
        <ErcBoard data={ercInfo} onRefresh={loadBoardData} />
      </ScrollView>
    </View>
  )
}

const mapStateToProps=(state: any) => {
  let cwReducer=state.workBoard.cwReducer;
  return {
    currentMonthTask: cwReducer.currentMonthTask,///本月任务
    lastMonthTask: cwReducer.lastMonthTask,///上月任务
    taskIndex: cwReducer.taskIndex,

    currentMonthEnergy: cwReducer.currentMonthEnergy,///本月能耗
    lastMonthEnergy: cwReducer.lastMonthEnergy,///上月能耗
    energyIndex: cwReducer.energyIndex,

    machineryDashboard: cwReducer.machineryDashboard,///机械课运行
    vocDiscard: cwReducer.vocDiscard,
    sexDiscard: cwReducer.sexDiscard,

    mainVStatus: cwReducer.mainVStatus,///电课运行/主进状态
    gasOperation: cwReducer.gasOperation,///气化课运行
    gmsMsg: cwReducer.gmsMessage, ///GMS message
    waterDashboard: cwReducer.waterDashboard,///水课运行
    ercData: cwReducer.ercData, ///Erc 运行
  }
}

export default connect(mapStateToProps, {
  updateTaskIndex,
  loadFMTask,
  updateEnergyIndex,
  loadFMEnergy,
  loadFMMachinery,
  loadFMVocDiscard,
  loadFMSexDiscard,

  loadFMMainV,
  loadFMGasOperation,
  loadFMDetectorStatus,
  loadFMWater,
  loadFMErc,
  fmDestroyClear,
})(FactoryBoard);
