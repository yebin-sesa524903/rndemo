import {
  Board_Overview_Error,
  Board_Overview_Request,
  Board_Overview_Success,

  Machine_Board_Refresh_Rate_Request,
  Machine_Board_Refresh_Rate_Success,
  Machine_Board_Refresh_Rate_Error,

  Machine_Temperature_Humiture_Error,
  Machine_Temperature_Humiture_Request,
  Machine_Temperature_Humiture_Success,
  Machine_CUS_Low_Midd_Status_Error,
  Machine_CUS_Low_Midd_Status_Request,
  Machine_CUS_Low_Midd_Status_Success,

  Machine_PCW_Status_Error,
  Machine_PCW_Status_Request,
  Machine_PCW_Status_Success,

  Machine_PcwPv_Frequency_Error,
  Machine_PcwPv_Frequency_Request,
  Machine_PcwPv_Frequency_Success,

  Machine_Voc_Sex_Status_Request,
  Machine_Voc_Sex_Status_Success,
  Machine_Voc_Sex_Status_Error,
  Machine_Exhaust_Request,
  Machine_Exhaust_Success,
  Machine_Exhaust_Error,
  Machine_House_Temperate_Request,
  Machine_House_Temperate_Success,
  Machine_House_Temperate_Error,
  Machine_CUS_Low_IceHotWater_Success, Machine_Destroy_Clear,

} from "../../actions/workboard/workboardAction";

const initialState = {
  refreshRate: 5, ///看板刷新评率 默认5s
  overViewInfo: {}, ///课概览信息
  temperatureHumitureInfo: {},  ///无尘室温湿度
  pwdPvStatus: [], ///PCW系统 & PV系统
  cusLowMiddStatus: {},//CUS 低温-中温 温度和冰机状态
  cusIceHotWaterData: {}, ///CUS 低温中文冰水热水 曲线数据集合
  pcwPvFrequency: [],  //PCW/PV系统 泵频率
  vocSexStatus: [], //VOC/SEX废弃在线检测指标
  exhaustStatus: [],//排气压力
  houseTempStatus: [],//房间温度
}

export default function dkReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///获取刷新频率
    case Machine_Board_Refresh_Rate_Request:
      break;
    case Machine_Board_Refresh_Rate_Success:
      nextState.refreshRate = action.response;
      break;
    case Machine_Board_Refresh_Rate_Error:
      break;
    ///获取概览信息
    case Board_Overview_Request:
      break;
    case Board_Overview_Success:
      nextState.overViewInfo = action.response;
      break;
    case Board_Overview_Error:
      break;
    ///无尘室温湿度
    case Machine_Temperature_Humiture_Request:
      break;
    case Machine_Temperature_Humiture_Success:
      nextState.temperatureHumitureInfo = action.response;
      break;
    case Machine_Temperature_Humiture_Error:
      break;
    ///PCW系统 & PV系统
    case Machine_PCW_Status_Request:
      break;
    case Machine_PCW_Status_Success:
      nextState.pwdPvStatus = action.response;
      break;
    case Machine_PCW_Status_Error:
      break;
    ///CUS 低温-中温 温度和冰机状态
    case Machine_CUS_Low_Midd_Status_Request:
      break;
    case Machine_CUS_Low_Midd_Status_Success:
      nextState.cusLowMiddStatus = action.response;
      break;
    case Machine_CUS_Low_Midd_Status_Error:
      break;
      ///CUS 低温-中温 冰水热水 曲线数据集合
    case Machine_CUS_Low_IceHotWater_Success:
      nextState.cusIceHotWaterData = action.response;
      break;

    //PCW/PV系统 泵频率
    case Machine_PcwPv_Frequency_Request:
      break;
    case Machine_PcwPv_Frequency_Success:
      nextState.pcwPvFrequency = action.response;
      break;
    case Machine_PcwPv_Frequency_Error:
      break;
    //VOC/SEX废弃在线检测指标
    case Machine_Voc_Sex_Status_Request:
      break;
    case Machine_Voc_Sex_Status_Success:
      nextState.vocSexStatus = action.response;
      break;
    case Machine_Voc_Sex_Status_Error:
      break;
    //排气压力
    case Machine_Exhaust_Request:
      break;
    case Machine_Exhaust_Success:
      nextState.exhaustStatus = action.response;
      break;
    case Machine_Exhaust_Error:
      break;
    //房间温度
    case Machine_House_Temperate_Request:
      break;
    case Machine_House_Temperate_Success:
      nextState.houseTempStatus = action.response;
      break;
    case Machine_House_Temperate_Error:
      break;

    case Machine_Destroy_Clear:
      nextState.overViewInfo = {};
      nextState.temperatureHumitureInfo = {};
      nextState.pwdPvStatus = [];
      nextState.cusLowMiddStatus = {};
      nextState.cusIceHotWaterData = {};
      nextState.pcwPvFrequency = [];
      nextState.vocSexStatus = [];
      nextState.exhaustStatus = [];
      nextState.houseTempStatus = [];
      break;
  }
  return nextState || state;
}
