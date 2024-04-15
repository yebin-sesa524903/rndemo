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
import WaterBoardComponent from "../../../../components/fmcs/workBoard/water/WaterBoard";
import { FJWDBoard } from '../../../../components/fmcs/workBoard/machine/FJWDBoard';
import {
  loadBoardOverview,
  loadMachineRefreshRate,
  loadMachineTempHumiInfo, loadPcwStatus, loadMachineLowMiddIceStatus, loadPcwPvFrequency,
  loadVocSexStatus, loadMachineExhaust, loadHouseTemperate, loadMachineIceHotWater, machineDestroyClear,
} from "../../../../actions/workboard/workboardAction";
import {
  convertOverViewInfo,
  convertTempHumitureInfo,
  convertCusSystem,
  convertPcwSystem,
  convertVocSexSystem,
  convertExhaustStatus,
  convertHouseTemperateStatus, convertPvSystem,
} from "./MachineBoardHelper";
import { CUSSystem } from "../../../../components/fmcs/workBoard/mechanical/CUSSystem";
import privilegeHelper from "../../../../utils/privilegeHelper";
import permissionCode from "../../../../utils/permissionCode";
import SndToast from "../../../../utils/components/SndToast";
import MaintainList from "../../plantOperation/maintain/list/MaintainList";
import InspectionList from "../../plantOperation/inspection/list/InspectionList";
import RepairList from "../../plantOperation/repair/list/RepairList";
import PCWSystem from "../../../../components/fmcs/workBoard/mechanical/PCWSystem";

function MachineBoard(props: any) {
  ///scrollView 引用
  const scrollViewRef=React.useRef<ScrollView>(null);
  ///定时器
  const [timeInterval, setTimeInterval]=React.useState<NodeJS.Timer>();

  React.useEffect(() => {
    getRefreshRate();
    loadMachineRequestData();
  }, []);

  /**
   * 获取机械课所需 数据
   */
  const loadMachineRequestData=() => {
    getOverViewDataInfo();
    getMachineTempHumiInfo();
    getPcwStatus();
    getPcwPvFrequency();
    getMachLowMiddIceStatus();
    getVocSexStatus();
    getMachineExhaust();
    getHouseTemperate();
  }
  /**
   * 获取刷新频率
   */
  const getRefreshRate=() => {
    props.loadMachineRefreshRate();
    startTimeInterval();
  }

  /**
   * 获取概览数据
   */
  const getOverViewDataInfo=() => {
    props.loadBoardOverview('JX');
  }

  /**
   * 无尘室温湿度
   */
  const getMachineTempHumiInfo=() => {
    props.loadMachineTempHumiInfo();
  }

  /**
   * CUS 低温-中温 温度和冰机状态
   */
  const getMachLowMiddIceStatus=() => {
    props.loadMachineLowMiddIceStatus();
    props.loadMachineIceHotWater();
  }

  /**
   * PCW系统 & PV系统
   */
  const getPcwStatus=() => {
    props.loadPcwStatus();
  }

  /**
   * PCW/PV系统 泵频率
   */
  const getPcwPvFrequency=() => {
    props.loadPcwPvFrequency();
  }

  /**
   * VOC/SEX废弃在线检测指标
   */
  const getVocSexStatus=() => {
    props.loadVocSexStatus();
  }

  /**
   * 排气压力
   */
  const getMachineExhaust=() => {
    props.loadMachineExhaust();
  }

  /**
   * 房间温度
   */
  const getHouseTemperate=() => {
    props.loadHouseTemperate();
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
   * 无尘室温湿度
   */
  const tempHumInfo=React.useMemo(() => {
    if (Object.keys(props.temperatureHumitureInfo).length>0) {
      return convertTempHumitureInfo(props.temperatureHumitureInfo);
    } else {
      return [];
    }
  }, [props.temperatureHumitureInfo]);

  /**
   * CUS系统
   */
  const cusInfo=React.useMemo(() => {
    if (Object.keys(props.cusLowMiddStatus).length>0&&Object.keys(props.cusIceHotWaterData).length>0) {
      return convertCusSystem(props.cusLowMiddStatus, props.cusIceHotWaterData);
    } else {
      return [];
    }
  }, [props.cusLowMiddStatus, props.cusIceHotWaterData]);

  const pcwInfo=React.useMemo(() => {
    if (Object.keys(props.pwdPvStatus).length>0||Object.keys(props.pcwPvFrequency).length>0) {
      return convertPcwSystem(props.pwdPvStatus, props.pcwPvFrequency);
    } else {
      return [];
    }
  }, [props.pwdPvStatus, props.pcwPvFrequency]);

  const pvInfo=React.useMemo(() => {
    if (Object.keys(props.pwdPvStatus).length>0||Object.keys(props.pcwPvFrequency).length>0) {
      return convertPvSystem(props.pwdPvStatus, props.pcwPvFrequency);
    } else {
      return [];
    }
  }, [props.pwdPvStatus, props.pcwPvFrequency]);

  /**
   * VOC/SEX系统
   */
  const vocSexInfo=React.useMemo(() => {
    if (Object.keys(props.vocSexStatus).length>0) {
      return convertVocSexSystem(props.vocSexStatus);
    } else {
      return [];
    }
  }, [props.vocSexStatus]);

  /**
   * 排气压力
   */
  const pressureGasInfo=React.useMemo(() => {
    if (Object.keys(props.exhaustStatus).length>0) {
      return convertExhaustStatus(props.exhaustStatus);
    } else {
      return [];
    }
  }, [props.exhaustStatus]);

  /**
   * 房间温度
   */
  const houseTemperateInfo=React.useMemo(() => {
    if (Object.keys(props.houseTempStatus).length>0) {
      return convertHouseTemperateStatus(props.houseTempStatus);
    } else {
      return [];
    }
  }, [props.houseTempStatus]);
  /**
   * 销毁
   */
  React.useEffect(() => {
    return () => {
      timeInterval&&clearInterval(timeInterval);
      props.machineDestroyClear();
    }
  }, []);


  const configGasHeaderTitles=() => {
    return [
      {
        title: '概览',
        value: 0,
      },
      {
        title: '无尘温度/湿度',
        value: 1,
      },
      {
        title: ' CUS系统',
        value: 2,
      },
      {
        title: 'PCW系统',
        value: 3,
      },
      {
        title: 'PV系统',
        value: 4,
      },
      {
        title: 'VOC/SEX',
        value: 5,
      },
      {
        title: '排气压力',
        value: 6,
      },
      {
        title: '房间温度',
        value: 7,
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
    let machineCode=undefined;
    for (let code of props.departmentCodes) {
      if (code.name=='机械课'&&code.code=='JX') {
        machineCode=code;
        break;
      }
    }
    if (index==3) {
      if (!privilegeHelper.checkModulePermission(permissionCode.PLANT_MAINTAIN)) {
        SndToast.showTip('当前账号没有保养任务查看权限!');
        return;
      }
      if (machineCode===undefined) {
        SndToast.showTip('当前账号没有查看部门信息的权限!');
        return;
      }
      ///保养列表
      props.navigator.push({
        id: 'maintain_list',
        component: MaintainList,
        passProps: {
          departmentCodes: [machineCode],
        }
      });
    } else if (index==4) {
      if (!privilegeHelper.checkModulePermission(permissionCode.PLANT_INSPECTION)) {
        SndToast.showTip('当前账号没有巡检任务查看权限!');
        return;
      }
      if (machineCode===undefined) {
        SndToast.showTip('当前账号没有查看部门信息的权限!');
        return;
      }
      ///巡检
      props.navigator.push({
        id: 'inspection_list',
        component: InspectionList,
        passProps: {
          departmentCodes: [machineCode],
        }
      });
    } else if (index==5) {
      if (!privilegeHelper.checkModulePermission(permissionCode.PLANT_REPAIR)) {
        SndToast.showTip('当前账号没有维修任务查看权限!');
        return;
      }
      if (machineCode===undefined) {
        SndToast.showTip('当前账号没有查看部门信息的权限!');
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
        <Overview data={overViewInfo} onPressViewDetail={onPressViewDetail} onRefresh={loadMachineRequestData} />
        <WaterBoardComponent data={tempHumInfo} onRefresh={loadMachineRequestData} />
        {/*@ts-ignore*/}
        <CUSSystem data={cusInfo} onRefresh={loadMachineRequestData} />
        {/*@ts-ignore*/}
        <PCWSystem data={pcwInfo} onRefresh={loadMachineRequestData} />
        {/*@ts-ignore*/}
        <PCWSystem data={pvInfo} onRefresh={loadMachineRequestData} />
        <WaterBoardComponent data={vocSexInfo} onRefresh={loadMachineRequestData} />
        <WaterBoardComponent data={pressureGasInfo} onRefresh={loadMachineRequestData} />
        {/*@ts-ignore*/}
        <FJWDBoard data={houseTemperateInfo} onRefresh={loadMachineRequestData} />
      </ScrollView>
    </View>

  )
}

const mapStateToProps=(state: any) => {
  let jxkReducer=state.workBoard.jxkReducer;
  return {
    refreshRate: jxkReducer.refreshRate,
    overViewInfo: jxkReducer.overViewInfo,
    temperatureHumitureInfo: jxkReducer.temperatureHumitureInfo,  ///无尘室温湿度
    pwdPvStatus: jxkReducer.pwdPvStatus, ///PCW系统 & PV系统
    cusLowMiddStatus: jxkReducer.cusLowMiddStatus,//CUS 低温-中温 温度和冰机状态
    cusIceHotWaterData: jxkReducer.cusIceHotWaterData,  ///CUS低温-中文冰水 曲线数据集合
    pcwPvFrequency: jxkReducer.pcwPvFrequency,  //PCW/PV系统 泵频率
    vocSexStatus: jxkReducer.vocSexStatus, //VOC/SEX废弃在线检测指标
    exhaustStatus: jxkReducer.exhaustStatus,//排气压力
    houseTempStatus: jxkReducer.houseTempStatus,//房间温度
  }
}
export default connect(mapStateToProps, {
  loadBoardOverview,
  loadMachineRefreshRate,
  loadMachineTempHumiInfo,
  loadMachineLowMiddIceStatus,
  loadMachineIceHotWater,
  loadPcwStatus,
  loadPcwPvFrequency,
  loadVocSexStatus,
  loadMachineExhaust,
  loadHouseTemperate,
  machineDestroyClear,
})(MachineBoard);
