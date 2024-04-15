import {
  Board_Overview_Error,
  Board_Overview_Request,
  Board_Overview_Success, Gas_Board_Destroy_Clear,
  Gas_Board_Detector_Task_Status_Error,
  Gas_Board_Detector_Task_Status_Request,
  Gas_Board_Detector_Task_Status_Success,
  Gas_Board_DetectorTask_Error,
  Gas_Board_DetectorTask_Request,
  Gas_Board_DetectorTask_Success,
  Gas_Board_DZQ_TrafficCount_Error,
  Gas_Board_DZQ_TrafficCount_Request,
  Gas_Board_DZQ_TrafficCount_Success,
  Gas_Board_Gas_Acid_State_Error,
  Gas_Board_Gas_Acid_State_Request,
  Gas_Board_Gas_Acid_State_Success,
  Gas_Board_Refresh_Rate_Error,
  Gas_Board_Refresh_Rate_Request,
  Gas_Board_Refresh_Rate_Success,
  Gas_Board_SPC_OverCount_Error,
  Gas_Board_SPC_OverCount_Request,
  Gas_Board_SPC_OverCount_Success,
  Gas_Board_TankFill_TimeRemind_Error,
  Gas_Board_TankFill_TimeRemind_Request,
  Gas_Board_TankFill_TimeRemind_Success,
} from "../../actions/workboard/workboardAction";

const initialState = {
  refreshRate: 5, ///气化课看板刷新评率 默认5s
  overViewInfo: {}, ///气化课概览信息
  aasAcidStatusInfo: {},  ///酸桶气瓶状态信息
  detectorTask: [], ///侦测器任务
  detectorStatus: [],///侦测器状态
  spcOverCount:[],  ///SPC超出统计
  timeRemind:[],  ///槽车充填通知时间提醒
  trafficCount:[],  ///大宗气流量统计
}

export default function qhReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///获取刷新频率
    case Gas_Board_Refresh_Rate_Request:
      break;
    case Gas_Board_Refresh_Rate_Success:
      nextState.refreshRate = action.response;
      break;
    case Gas_Board_Refresh_Rate_Error:
      break;
    ///获取概览信息
    case Board_Overview_Request:
      break;
    case Board_Overview_Success:
      nextState.overViewInfo = action.response;
      break;
    case Board_Overview_Error:
      break;
    ///气化酸桶统计
    case Gas_Board_Gas_Acid_State_Request:
      break;
    case Gas_Board_Gas_Acid_State_Success:
      nextState.aasAcidStatusInfo = action.response;
      break;
    case Gas_Board_Gas_Acid_State_Error:
      break;
    ///侦测器任务
    case Gas_Board_DetectorTask_Request:
      break;
    case Gas_Board_DetectorTask_Success:
      nextState.detectorTask = action.response;
      break;
    case Gas_Board_DetectorTask_Error:
      break;
    ///侦测器状态
    case Gas_Board_Detector_Task_Status_Request:
      break;
    case Gas_Board_Detector_Task_Status_Success:
      nextState.detectorStatus = action.response;
      break;
    case Gas_Board_Detector_Task_Status_Error:
      break;

      ///SPC超出统计
    case Gas_Board_SPC_OverCount_Request:
      break;
    case Gas_Board_SPC_OverCount_Success:
      nextState.spcOverCount = action.response;
      break;
    case Gas_Board_SPC_OverCount_Error:
      break;

      ///槽车充填通知时间提醒
    case Gas_Board_TankFill_TimeRemind_Request:
      break;
    case Gas_Board_TankFill_TimeRemind_Success:
      nextState.timeRemind = action.response;
      break;
    case Gas_Board_TankFill_TimeRemind_Error:
      break;

      ///大宗气流量统计
    case Gas_Board_DZQ_TrafficCount_Request:
      break;
    case Gas_Board_DZQ_TrafficCount_Success:
      nextState.trafficCount = action.response;
      break;
    case Gas_Board_DZQ_TrafficCount_Error:
      break;
    case Gas_Board_Destroy_Clear:
      nextState.overViewInfo = {};
      nextState.aasAcidStatusInfo = {};
      nextState.detectorTask = [];
      nextState.detectorStatus = [];
      nextState.spcOverCount = [];
      nextState.timeRemind = [];
      nextState.trafficCount = [];
      break;
  }
  return nextState || state;
}
