import {
  Board_Overview_Error,
  Board_Overview_Request,
  Board_Overview_Success,
  Electricity_Board_Refresh_Rate_Request,
  Electricity_Board_Refresh_Rate_Success,
  Electricity_Board_Refresh_Rate_Error,
  Electricity_Board_Mainv_Incoming_State_Error,
  Electricity_Board_Mainv_Incoming_State_Request,
  Electricity_Board_Mainv_Incoming_State_Success,
  Electricity_Board_Load_Rate_Error,
  Electricity_Board_Load_Rate_Request,
  Electricity_Board_Load_Rate_Success,
  Electricity_Board_Pm_Tasks_Error,
  Electricity_Board_Pm_Tasks_Request,
  Electricity_Board_Pm_Tasks_Success,
  Electricity_Alarms_Info_Error,
  Electricity_Alarms_Info_Request,
  Electricity_Alarms_Info_Success,
} from "../../actions/workboard/workboardAction";

const initialState = {
  refreshRate: 5, ///气化课看板刷新评率 默认5s
  overViewInfo: {}, ///气化课概览信息
  incomingStatusInfo: {},  ///主进状态
  loadRates: [], ///负载率
  pmTaskInfos: [],///PM任务信息列表
  alarmInfos: [],  ///报警信息列表
}

export default function dkReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///获取刷新频率
    case Electricity_Board_Refresh_Rate_Request:
      break;
    case Electricity_Board_Refresh_Rate_Success:
      nextState.refreshRate = action.response;
      break;
    case Electricity_Board_Refresh_Rate_Error:
      break;
    ///获取概览信息
    case Board_Overview_Request:
      break;
    case Board_Overview_Success:
      nextState.overViewInfo = action.response;
      break;
    case Board_Overview_Error:
      break;
    ///主进状态
    case Electricity_Board_Mainv_Incoming_State_Request:
      break;
    case Electricity_Board_Mainv_Incoming_State_Success:
      nextState.incomingStatusInfo = action.response;
      break;
    case Electricity_Board_Mainv_Incoming_State_Error:
      break;
    ///PM任务信息列表
    case Electricity_Board_Pm_Tasks_Request:
      break;
    case Electricity_Board_Pm_Tasks_Success:
      nextState.pmTaskInfos = action.response;
      break;
    case Electricity_Board_Pm_Tasks_Error:
      break;
    ///负载率
    case Electricity_Board_Load_Rate_Request:
      break;
    case Electricity_Board_Load_Rate_Success:
      nextState.loadRates = action.response;
      break;
    case Electricity_Board_Load_Rate_Error:
      break;
    ///报警信息列表
    case Electricity_Alarms_Info_Request:
      break;
    case Electricity_Alarms_Info_Success:
      nextState.alarmInfos = action.response;
      break;
    case Electricity_Alarms_Info_Error:
      break;

  }
  return nextState || state;
}
