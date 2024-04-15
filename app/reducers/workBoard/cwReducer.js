import {
  FM_OverView_Destroy_Clear,
  FM_OverView_Detector_Status_Success,
  FM_OverView_Energy_Index,
  FM_OverView_Energy_Success,
  FM_OverView_Erc_Success,
  FM_OverView_GasOperation_Success,
  FM_OverView_Machinery_Success,
  FM_OverView_MainV_Success,
  FM_OverView_PTGL_SexDiscard_Success,
  FM_OverView_PTGL_VocDiscard_Success,
  FM_OverView_Task_Index,
  FM_OverView_Task_Success,
  FM_OverView_Water_Success
} from "../../actions/workboard/workboardAction";

const initialState = {
  taskIndex: 1, ///上月/当月 任务
  lastMonthTask: {},///上月任务
  currentMonthTask: {},///本月任务

  energyIndex: 1,
  lastMonthEnergy: {},///上月能耗
  currentMonthEnergy: {},///本月能耗
  machineryDashboard: [], ///机械课运行
  vocDiscard:[],  ///voc出入口浓度
  sexDiscard:[],  ///sex出入口浓度

  mainVStatus: [],  ///电课运行/主进状态
  gasOperation: {},  ///气化课运行
  gmsMessage:[],  ///GMS信息
  waterDashboard: [], ///水课运行
  ercData: {},  ///erc 运行
}

export default function cwReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case FM_OverView_Task_Success:
      if (action.body.type == 1) {
        ///当月
        nextState.currentMonthTask = action.response;
      } else {
        ///上月
        nextState.lastMonthTask = action.response;
      }
      break;
    case FM_OverView_Task_Index:
      nextState.taskIndex = action.data;
      break;

    case FM_OverView_Energy_Success:
      if (action.body.type == 1) {
        ///当月
        nextState.currentMonthEnergy = action.response;
      } else {
        ///上月
        nextState.lastMonthEnergy = action.response;
      }
      break;

    case FM_OverView_Energy_Index:
      nextState.energyIndex = action.data;
      break;

    case FM_OverView_Machinery_Success:
      nextState.machineryDashboard = action.response;
      break;
    case FM_OverView_PTGL_VocDiscard_Success:
      nextState.vocDiscard = action.response;
      break;

    case FM_OverView_PTGL_SexDiscard_Success:
      nextState.sexDiscard = action.response;
      break;

    case FM_OverView_MainV_Success:
      nextState.mainVStatus = action.response;
      break;

    case FM_OverView_GasOperation_Success:
      nextState.gasOperation = action.response;
      break;

    case FM_OverView_Detector_Status_Success:
      nextState.gmsMessage = action.response;
      break;

    case FM_OverView_Water_Success:
      nextState.waterDashboard = action.response;
      break;

    case FM_OverView_Erc_Success:
      nextState.ercData = action.response;
      break;

    case FM_OverView_Destroy_Clear:
      nextState.lastMonthTask = {};///上月任务
      nextState.currentMonthTask = {};///本月任务
      nextState.lastMonthEnergy = {};///上月能耗
      nextState.currentMonthEnergy = {};///本月能耗
      nextState.machineryDashboard = []; ///机械课运行
      nextState.sexDiscard = [];
      nextState.vocDiscard = [];

      nextState.mainVStatus = [];  ///电课运行/主进状态
      nextState.gasOperation = {};  ///气化课运行
      nextState.gmsMessage = [];  ///GMS
      nextState.waterDashboard = []; ///水课运行
      nextState.ercData = {};  ///erc 运行
      break;
  }
  return nextState || state;
}
