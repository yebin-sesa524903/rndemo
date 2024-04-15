import {
  Board_Overview_Error,
  Board_Overview_Request,
  Board_Overview_Success,
  Board_Water_Upw_Wwt_State_Request,
  Board_Water_Upw_Wwt_State_Success,
  Board_Water_Upw_Wwt_State_Error,
  Board_Water_Refresh_Rate_Request,
  Board_Water_Refresh_Rate_Success,
  Board_Water_Refresh_Rate_Error,
  Board_Water_RecycleRateData_Request,
  Board_Water_RecycleRateData_Success,
  Board_Water_RecycleRateData_Error,
  Board_Water_Upw_Wwt_Consume_Request,
  Board_Water_Upw_Wwt_Consume_Success,
  Board_Water_Upw_Wwt_Consume_Error,
  Board_Water_Consumption_Request,
  Board_Water_Consumption_Success,
  Board_Water_Consumption_Error,
  Board_Water_PowerConsume_Request,
  Board_Water_PowerConsume_Success,
  Board_Water_PowerConsume_Error, Board_Water_Destroy_Clear,
} from "../../actions/workboard/workboardAction";

const initialState = {
  refreshRate: 5, ///水课看板刷新评率 默认5m
  overViewInfo: {}, ///水课概览信息
  upwWwtInfo: {},  ///水状态信息
  consumptionInfo: {},  ///化学品耗量统计
  recycleRateData: {},  ///回收率指标
  upwWwtConsumerData: {}, ////UPW/WWT水量消耗指标
  upwWwtPowerConsumeData: {},  ///UPW/WWT电耗指标
}

export default function skReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///获取刷新频率
    // case Board_Water_Refresh_Rate_Request:
    //   break;
    case Board_Water_Refresh_Rate_Success:
      nextState.refreshRate = action.response;
      break;
    case Board_Water_Refresh_Rate_Error:
      break;

    ///获取概览信息
    // case Board_Overview_Request:
    //   break;
    case Board_Overview_Success:
      nextState.overViewInfo = action.response;
      break;
    case Board_Overview_Error:
      break;

    ///水课 - UPW终端指标/WWT内控指标
    // case Board_Water_Upw_Wwt_State_Request:
    //   break;
    case Board_Water_Upw_Wwt_State_Success:
      nextState.upwWwtInfo = action.response;
      break;
    case Board_Water_Upw_Wwt_State_Error:
      break;

    ///化学品消耗统计
    // case Board_Water_Consumption_Request:
    //   break;
    case Board_Water_Consumption_Success:
      nextState.consumptionInfo = action.response;
      break;
    case Board_Water_Consumption_Error:
      break;

    ///回收率指标
    // case Board_Water_RecycleRateData_Request:
    //   break;
    case Board_Water_RecycleRateData_Success:
      nextState.recycleRateData = action.response;
      break;
    case Board_Water_RecycleRateData_Error:
      break;

    ///UPW/WWT水量消耗指标
    // case Board_Water_Upw_Wwt_Consume_Request:
    //   break;
    case Board_Water_Upw_Wwt_Consume_Success:
      nextState.upwWwtConsumerData = action.response;
      break;
    case Board_Water_Upw_Wwt_Consume_Error:
      break;

    ///UPW/WWT电耗指标
    // case Board_Water_PowerConsume_Request:
    //   break;
    case Board_Water_PowerConsume_Success:
      nextState.upwWwtPowerConsumeData = action.response;
      break;
    case Board_Water_PowerConsume_Error:
      break;

    case Board_Water_Destroy_Clear:
      nextState.overViewInfo = {}; ///水课概览信息
      nextState.upwWwtInfo = {};  ///水状态信息
      nextState.consumptionInfo = {};  ///化学品耗量统计
      nextState.recycleRateData = {};  ///回收率指标
      nextState.upwWwtConsumerData = {}; ////UPW/WWT水量消耗指标
      nextState.upwWwtPowerConsumeData = {}; ///UPW/WWT电耗指标
      break;
  }
  return nextState;
}
