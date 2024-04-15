export const Board_Overview_Request = 'Board_Overview_Request';
export const Board_Overview_Success = 'Board_Overview_Success';
export const Board_Overview_Error = 'Board_Overview_Error';

/**
 * 看板概览数据请求
 * @returns {function(*): *}
 */
export function loadBoardOverview(departmentCode) {
  return (dispatch) => {
    return dispatch({
      types: [Board_Overview_Request, Board_Overview_Success, Board_Overview_Error],
      url: `/fmcs/api/water/comprehensive/board/getDeviceTaskData?departmentCode=${departmentCode}`,
    })

  }
}

/*****************************气化课综合看板***********************************************/

export const Gas_Board_Refresh_Rate_Request = 'Gas_Board_Refresh_Rate_Request';
export const Gas_Board_Refresh_Rate_Success = 'Gas_Board_Refresh_Rate_Success';
export const Gas_Board_Refresh_Rate_Error = 'Gas_Board_Refresh_Rate_Error';

/**
 * 气化课-获取综合看板-刷新频率
 * @returns {function(*): *}
 */
export function loadRefreshRate() {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_Refresh_Rate_Request, Gas_Board_Refresh_Rate_Success, Gas_Board_Refresh_Rate_Error],
      url: '/fmcs/api/gas/total/board/getRefreshRate',
    })
  }
}

export const Gas_Board_Gas_Acid_State_Request = 'Gas_Board_Gas_Acid_State_Request';
export const Gas_Board_Gas_Acid_State_Success = 'Gas_Board_Gas_Acid_State_Success';
export const Gas_Board_Gas_Acid_State_Error = 'Gas_Board_Gas_Acid_State_Error';

/**
 * 气瓶、酸桶状态统计
 * @param body
 * @returns {function(*): *}
 */
export function loadGasAcidStatus(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_Gas_Acid_State_Request, Gas_Board_Gas_Acid_State_Success, Gas_Board_Gas_Acid_State_Error],
      url: '/fmcs/api/gas/total/board/statusStatistics',
      body
    })
  }
}


export const Gas_Board_DetectorTask_Request = 'Gas_Board_DetectorTask_Request';
export const Gas_Board_DetectorTask_Success = 'Gas_Board_DetectorTask_Success';
export const Gas_Board_DetectorTask_Error = 'Gas_Board_DetectorTask_Error';

/**
 * 侦测器隔离任务统计-今日
 * @returns {function(*): *}
 */
export function loadDetectorTask() {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_DetectorTask_Request, Gas_Board_DetectorTask_Success, Gas_Board_DetectorTask_Error],
      url: '/fmcs/api/gas/total/board/detector/isolationTask/statistics',
    })
  }
}



export const Gas_Board_Detector_Task_Status_Request = 'Gas_Board_Detector_Task_Status_Request';
export const Gas_Board_Detector_Task_Status_Success = 'Gas_Board_Detector_Task_Status_Success';
export const Gas_Board_Detector_Task_Status_Error = 'Gas_Board_Detector_Task_Status_Error';

/**
 * 侦测器状态统计
 * @returns {function(*): *}
 */
export function loadDetectorStatus() {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_Detector_Task_Status_Request, Gas_Board_Detector_Task_Status_Success, Gas_Board_Detector_Task_Status_Error],
      url: '/fmcs/api/gas/total/board/detector/status/statistics',
    })
  }
}

export const Gas_Board_TankFill_TimeRemind_Request = 'Gas_Board_TankFill_TimeRemind_Request';
export const Gas_Board_TankFill_TimeRemind_Success = 'Gas_Board_TankFill_TimeRemind_Success';
export const Gas_Board_TankFill_TimeRemind_Error = 'Gas_Board_TankFill_TimeRemind_Error';

/**
 * 槽车填充通知时间提醒
 * @returns {function(*): *}
 */
export function loadTankFillTimeRemind() {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_TankFill_TimeRemind_Request, Gas_Board_TankFill_TimeRemind_Success, Gas_Board_TankFill_TimeRemind_Error],
      url: '/fmcs/api/gas/total/board/tankFill/timeRemind',
    })
  }
}

export const Gas_Board_SPC_OverCount_Request = 'Gas_Board_SPC_OverCount_Request';
export const Gas_Board_SPC_OverCount_Success = 'Gas_Board_SPC_OverCount_Success';
export const Gas_Board_SPC_OverCount_Error = 'Gas_Board_SPC_OverCount_Error';

/**
 * SPC超出统计
 * @returns {function(*): *}
 */
export function loadSpcOverCount() {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_SPC_OverCount_Request, Gas_Board_SPC_OverCount_Success, Gas_Board_SPC_OverCount_Error],
      url: '/fmcs/api/gas/total/board/spc/overCount',
    })
  }
}

export const Gas_Board_DZQ_TrafficCount_Request = 'Gas_Board_DZQ_TrafficCount_Request';
export const Gas_Board_DZQ_TrafficCount_Success = 'Gas_Board_DZQ_TrafficCount_Success';
export const Gas_Board_DZQ_TrafficCount_Error = 'Gas_Board_DZQ_TrafficCount_Error';

/**
 * 大宗气流量统计
 * @returns {function(*): *}
 */
export function loadDZQCount(body = { page: 1, pageSize: 12 }) {
  return (dispatch) => {
    return dispatch({
      types: [Gas_Board_DZQ_TrafficCount_Request, Gas_Board_DZQ_TrafficCount_Success, Gas_Board_DZQ_TrafficCount_Error],
      url: '/fmcs/api/gas/flow/stats',
      body: body
    })
  }
}


export const Gas_Board_Destroy_Clear = 'Gas_Board_Destroy_Clear';

/**
 * 气化看板销毁
 * @returns {function(*): *}
 */
export function gasBoardDestroyClear(){
  return (dispatch) => {
    return dispatch({
      type: Gas_Board_Destroy_Clear,
    })
  }
}



/*****************************水课综合看板***********************************************/


export const Board_Water_Refresh_Rate_Request = 'Board_Water_Refresh_Rate_Request';
export const Board_Water_Refresh_Rate_Success = 'Board_Water_Refresh_Rate_Success';
export const Board_Water_Refresh_Rate_Error = 'Board_Water_Refresh_Rate_Error';

/**
 * 水课-获取综合看板-刷新频率
 * @returns {function(*): *}
 */
export function loadWaterRefreshRate() {
  return (dispatch) => {
    return dispatch({
      types: [Board_Water_Refresh_Rate_Request, Board_Water_Refresh_Rate_Success, Board_Water_Refresh_Rate_Error],
      url: '/fmcs/api/water/comprehensive/board/getRefreshRate',
    })
  }
}

/**
 * 水课 - UPW终端指标/WWT内控指标
 * @param body
 * @returns {function(*): *}
 */

export const Board_Water_Upw_Wwt_State_Request = 'Board_Water_Upw_Wwt_State_Request';
export const Board_Water_Upw_Wwt_State_Success = 'Board_Water_Upw_Wwt_State_Success';
export const Board_Water_Upw_Wwt_State_Error = 'Board_Water_Upw_Wwt_State_Error';

export function loadWaterUpwTarget() {
  return (dispatch) => {
    return dispatch({
      types: [Board_Water_Upw_Wwt_State_Request, Board_Water_Upw_Wwt_State_Success, Board_Water_Upw_Wwt_State_Error],
      url: '/fmcs/api/water/comprehensive/board/pureAndSewageTarget',
    })
  }
}


export const Board_Water_Consumption_Request = 'Board_Water_Consumption_Request';
export const Board_Water_Consumption_Success = 'Board_Water_Consumption_Success';
export const Board_Water_Consumption_Error = 'Board_Water_Consumption_Error';

/**
 * 纯水废水 - 化学品耗量统计
 * @returns {function(*): *}
 */
export function loadWaterConsumption() {
  return (dispatch) => {
    return dispatch({
      types: [Board_Water_Consumption_Request, Board_Water_Consumption_Success, Board_Water_Consumption_Error],
      url: '/fmcs/api/water/comprehensive/board/consumptionStatistics',
    })
  }
}


export const Board_Water_RecycleRateData_Request = 'Board_Water_RecycleRateData_Request';
export const Board_Water_RecycleRateData_Success = 'Board_Water_RecycleRateData_Success';
export const Board_Water_RecycleRateData_Error = 'Board_Water_RecycleRateData_Error';

/**
 * 回收率指标
 * @returns {function(*): *}
 */
export function loadRecycleRateData() {
  return (dispatch) => {
    return dispatch({
      types: [Board_Water_RecycleRateData_Request, Board_Water_RecycleRateData_Success, Board_Water_RecycleRateData_Error],
      url: '/fmcs/api/water/comprehensive/board/getRecycleRateData',
    })
  }
}


export const Board_Water_Upw_Wwt_Consume_Request = 'Board_Water_Upw_Wwt_Consume_Request';
export const Board_Water_Upw_Wwt_Consume_Success = 'Board_Water_Upw_Wwt_Consume_Success';
export const Board_Water_Upw_Wwt_Consume_Error = 'Board_Water_Upw_Wwt_Consume_Error';
/**
 * 原水/UPW/WWT水量消耗指标
 * @returns {function(*): *}
 */
export function loadWaterUpwConsumeData() {
  return (dispatch) => {
    return dispatch({
      types: [Board_Water_Upw_Wwt_Consume_Request, Board_Water_Upw_Wwt_Consume_Success, Board_Water_Upw_Wwt_Consume_Error],
      url: '/fmcs/api/water/comprehensive/board/getWaterConsumeData',
    })
  }
}

export const Board_Water_PowerConsume_Request = 'Board_Water_PowerConsume_Request';
export const Board_Water_PowerConsume_Success = 'Board_Water_PowerConsume_Success';
export const Board_Water_PowerConsume_Error = 'Board_Water_PowerConsume_Error';
/**
 * 原水/UPW/WWT电耗指标
 * @returns {function(*): *}
 */
export function loadWaterPowerConsumeData() {
  return (dispatch) => {
    return dispatch({
      types: [Board_Water_PowerConsume_Request, Board_Water_PowerConsume_Success, Board_Water_PowerConsume_Error],
      url: '/fmcs/api/water/comprehensive/board/getPowerConsumeData',
    })
  }
}

export const Board_Water_Destroy_Clear = 'Board_Water_Destroy_Clear';
/**
 * 水课看板销毁
 * @returns {function(*): *}
 */
export function waterBoardDestroyClear(){
  return (dispatch) => {
    return dispatch({
      type: Board_Water_Destroy_Clear,
    })
  }
}

/***********************电课综合看板***************************/

export const Electricity_Board_Refresh_Rate_Request = 'Electricity_Board_Refresh_Rate_Request';
export const Electricity_Board_Refresh_Rate_Success = 'Electricity_Board_Refresh_Rate_Success';
export const Electricity_Board_Refresh_Rate_Error = 'Electricity_Board_Refresh_Rate_Error';

/**
 * 电课-获取综合看板-刷新频率
 * @returns {function(*): *}
 */
export function loadElectricityRefreshRate() {
  return (dispatch) => {
    return dispatch({
      types: [Electricity_Board_Refresh_Rate_Request, Electricity_Board_Refresh_Rate_Success, Electricity_Board_Refresh_Rate_Error],
      url: '/fmcs/api/electric/comprehensive/board/getRefreshRate',
    })
  }
}

export const Electricity_Board_Mainv_Incoming_State_Request = 'Electricity_Board_Mainv_Incoming_State_Request';
export const Electricity_Board_Mainv_Incoming_State_Success = 'Electricity_Board_Mainv_Incoming_State_Success';
export const Electricity_Board_Mainv_Incoming_State_Error = 'Electricity_Board_Mainv_Incoming_State_Error';

/**
 * 主进线状态
 * @param body
 * @returns {function(*): *}
 */
export function loadMainIncomingStatus(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Electricity_Board_Mainv_Incoming_State_Request, Electricity_Board_Mainv_Incoming_State_Success, Electricity_Board_Mainv_Incoming_State_Error],
      url: '/fmcs/api/electric/comprehensive/board/mainv/status',
    })
  }
}

export const Electricity_Board_Load_Rate_Request = 'Electricity_Board_Load_Rate_Request';
export const Electricity_Board_Load_Rate_Success = 'Electricity_Board_Load_Rate_Success';
export const Electricity_Board_Load_Rate_Error = 'Electricity_Board_Load_Rate_Error';

/**
 * 负载率
 * @param body
 * @returns {function(*): *}
 */
export function loadLoadRate(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Electricity_Board_Load_Rate_Request, Electricity_Board_Load_Rate_Success, Electricity_Board_Load_Rate_Error],
      url: '/fmcs/api/electric/comprehensive/board/switch/loadRate',
    })
  }
}

export const Electricity_Board_Pm_Tasks_Request = 'Electricity_Board_Pm_Tasks_Request';
export const Electricity_Board_Pm_Tasks_Success = 'Electricity_Board_Pm_Tasks_Success';
export const Electricity_Board_Pm_Tasks_Error = 'Electricity_Board_Pm_Tasks_Error';

/**
 * PM任务信息列表
 * @param body
 * @returns {function(*): *}
 */
export function loadPmTasks(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Electricity_Board_Pm_Tasks_Request, Electricity_Board_Pm_Tasks_Success, Electricity_Board_Pm_Tasks_Error],
      url: '/fmcs/api/electric/comprehensive/board/getPMTaskList',
      body
    })
  }
}

export const Electricity_Alarms_Info_Request = 'Electricity_Alarms_Info_Request';
export const Electricity_Alarms_Info_Success = 'Electricity_Alarms_Info_Success';
export const Electricity_Alarms_Info_Error = 'Electricity_Alarms_Info_Error';

/**
 * 报警信息列表
 * @param body
 * @returns {function(*): *}
 */
export function loadElecAlarmsInfo(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Electricity_Alarms_Info_Request, Electricity_Alarms_Info_Success, Electricity_Alarms_Info_Error],
      url: '/fmcs/api/electric/comprehensive/board/getAlarmList',
      body
    })
  }
}

/*****************************机械课综合看板***********************************************/

export const Machine_Board_Refresh_Rate_Request = 'Machine_Board_Refresh_Rate_Request';
export const Machine_Board_Refresh_Rate_Success = 'Machine_Board_Refresh_Rate_Success';
export const Machine_Board_Refresh_Rate_Error = 'Machine_Board_Refresh_Rate_Error';

/**
 * 气化课-获取综合看板-刷新频率
 * @returns {function(*): *}
 */
export function loadMachineRefreshRate() {
  return (dispatch) => {
    return dispatch({
      types: [Machine_Board_Refresh_Rate_Request, Machine_Board_Refresh_Rate_Success, Machine_Board_Refresh_Rate_Error],
      url: '/fmcs/api/gas/total/board/getRefreshRate',
    })
  }
}

export const Machine_Temperature_Humiture_Request = 'Machine_Temperature_Humiture_Request';
export const Machine_Temperature_Humiture_Success = 'Machine_Temperature_Humiture_Success';
export const Machine_Temperature_Humiture_Error = 'Machine_Temperature_Humiture_Error';

/**
 * 无尘室温湿度/Particle
 * @param body
 * @returns {function(*): *}
 */
export function loadMachineTempHumiInfo() {
  return (dispatch) => {
    return dispatch({
      types: [Machine_Temperature_Humiture_Request, Machine_Temperature_Humiture_Success, Machine_Temperature_Humiture_Error],
      url: '/fmcs/api/machinery/total/board/particle',
    })
  }
}

export const Machine_CUS_Low_Midd_Status_Request = 'Machine_CUS_Low_Midd_Status_Request';
export const Machine_CUS_Low_Midd_Status_Success = 'Machine_CUS_Low_Midd_Status_Success';
export const Machine_CUS_Low_Midd_Status_Error = 'Machine_CUS_Low_Midd_Status_Error';

/**
 * CUS 低温-中温 温度和冰机状态
 * @param body
 * @returns {function(*): *}
 */
export function loadMachineLowMiddIceStatus(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_CUS_Low_Midd_Status_Request, Machine_CUS_Low_Midd_Status_Success, Machine_CUS_Low_Midd_Status_Error],
      url: '/fmcs/api/machinery/total/board/cus/waterTemp',
    })
  }
}

export const Machine_CUS_Low_IceHotWater_Request = 'Machine_CUS_Low_IceHotWater_Request';
export const Machine_CUS_Low_IceHotWater_Success = 'Machine_CUS_Low_IceHotWater_Success';
export const Machine_CUS_Low_IceHotWater_Error = 'Machine_CUS_Low_IceHotWater_Error';

/**
 * CUS 低温-中温 冰水热水 曲线数据集合
 * @param body
 * @returns {function(*): *}
 */
export function loadMachineIceHotWater(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_CUS_Low_IceHotWater_Request, Machine_CUS_Low_IceHotWater_Success, Machine_CUS_Low_IceHotWater_Error],
      url: '/fmcs/api/machinery/total/board/cus/iceHotWater',
    })
  }
}



export const Machine_PCW_Status_Request = 'Machine_PCW_Status_Request';
export const Machine_PCW_Status_Success = 'Machine_PCW_Status_Success';
export const Machine_PCW_Status_Error = 'Machine_PCW_Status_Error';

/**
 * PCW系统 & PV系统
 * @param body
 * @returns {function(*): *}
 */
export function loadPcwStatus(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_PCW_Status_Request, Machine_PCW_Status_Success, Machine_PCW_Status_Error],
      url: '/fmcs/api/machinery/total/board/pcwAndPv',
    })
  }
}

export const Machine_PcwPv_Frequency_Request = 'Machine_PcwPv_Frequency_Request';
export const Machine_PcwPv_Frequency_Success = 'Machine_PcwPv_Frequency_Success';
export const Machine_PcwPv_Frequency_Error = 'Machine_PcwPv_Frequency_Error';

/**
 * PCW/PV系统 泵频率
 * @param body
 * @returns {function(*): *}
 */
export function loadPcwPvFrequency(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_PcwPv_Frequency_Request, Machine_PcwPv_Frequency_Success, Machine_PcwPv_Frequency_Error],
      url: '/fmcs/api/machinery/total/board/pumpFrequency',
    })
  }
}

export const Machine_Voc_Sex_Status_Request = 'Machine_Voc_Sex_Status_Request';
export const Machine_Voc_Sex_Status_Success = 'Machine_Voc_Sex_Status_Success';
export const Machine_Voc_Sex_Status_Error = 'Machine_Voc_Sex_Status_Error';

/**
 * 综合看板-VOC/SEX废弃在线检测指标
 * @param body
 * @returns {function(*): *}
 */
export function loadVocSexStatus(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_Voc_Sex_Status_Request, Machine_Voc_Sex_Status_Success, Machine_Voc_Sex_Status_Error],
      url: '/fmcs/api/machinery/total/board/discard',
    })
  }
}

export const Machine_Exhaust_Request = 'Machine_Exhaust_Request';
export const Machine_Exhaust_Success = 'Machine_Exhaust_Success';
export const Machine_Exhaust_Error = 'Machine_Exhaust_Error';

/**
 * 排气压力
 * @param body
 * @returns {function(*): *}
 */
export function loadMachineExhaust(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_Exhaust_Request, Machine_Exhaust_Success, Machine_Exhaust_Error],
      url: '/fmcs/api/machinery/total/board/exhaust',
    })
  }
}

export const Machine_House_Temperate_Request = 'Machine_House_Temperate_Request';
export const Machine_House_Temperate_Success = 'Machine_House_Temperate_Success';
export const Machine_House_Temperate_Error = 'Machine_House_Temperate_Error';

/**
 * 房间温度
 * @param body
 * @returns {function(*): *}
 */
export function loadHouseTemperate(body = {}) {
  return (dispatch) => {
    return dispatch({
      types: [Machine_House_Temperate_Request, Machine_House_Temperate_Success, Machine_House_Temperate_Error],
      url: '/fmcs/api/machinery/total/board/houseTemp',
    })
  }
}


export const Machine_Destroy_Clear = 'Machine_Destroy_Clear';

/**
 * 机械看板 销毁
 * @returns {function(*): *}
 */
export function machineDestroyClear (){
  return (dispatch)=>{
    return dispatch({
      type: Machine_Destroy_Clear,
    })
  }
}


/*******************************************厂务看板相关**********************************************/

export const FM_OverView_Task_Request = 'FM_OverView_Task_Request';
export const FM_OverView_Task_Success = 'FM_OverView_Task_Success';
export const FM_OverView_Task_Error = 'FM_OverView_Task_Error';

/**
 * 厂务概览- 本月/上月任务
 * @param body  type : 1: 本月 2: 上月
 * @returns {function(*): *}
 */
export function loadFMTask(body = {type : 1}) {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_Task_Request, FM_OverView_Task_Success, FM_OverView_Task_Error],
      url: '/fmcs/api/fm/overview/task/statistics',
      body: body
    })
  }
}

export const FM_OverView_Task_Index = 'FM_OverView_Task_Index';

/**
 * 修改task index
 * @param data
 * @returns {function(*): *}
 */
export function updateTaskIndex(data) {
  return (dispatch) => {
    return dispatch({
      type:FM_OverView_Task_Index,
      data: data
    })
  }
}

export const FM_OverView_Energy_Request = 'FM_OverView_Energy_Request';
export const FM_OverView_Energy_Success = 'FM_OverView_Energy_Success';
export const FM_OverView_Energy_Error = 'FM_OverView_Energy_Error';

/**
 *  厂务概览-本月/上月厂务能耗
 * @param body  type : 1 本月 2 上月
 * @returns {function(*): *}
 */
export function loadFMEnergy(body = {type : 1}) {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_Energy_Request, FM_OverView_Energy_Success, FM_OverView_Energy_Error],
      url: '/fmcs/api/fm/overview/energy/statistics',
      body: body
    })
  }
}

export const FM_OverView_Energy_Index = 'FM_OverView_Energy_Index';

/**
 * 修改 Energy index
 * @param data
 * @returns {function(*): *}
 */
export function updateEnergyIndex(data) {
  return (dispatch) => {
    return dispatch({
      type:FM_OverView_Energy_Index,
      data: data
    })
  }
}

export const FM_OverView_Machinery_Request = 'FM_OverView_Machinery_Request';
export const FM_OverView_Machinery_Success = 'FM_OverView_Machinery_Success';
export const FM_OverView_Machinery_Error = 'FM_OverView_Machinery_Error';

/**
 * 厂务概览-机械课运行
 * @returns {function(*): *}
 */
export function loadFMMachinery() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_Machinery_Request, FM_OverView_Machinery_Success, FM_OverView_Machinery_Error],
      url: '/fmcs/api/fm/overview/machinery/dashboard',
    })
  }
}


export const FM_OverView_PTGL_VocDiscard_Request = 'FM_OverView_PTGL_VocDiscard_Request';
export const FM_OverView_PTGL_VocDiscard_Success = 'FM_OverView_PTGL_VocDiscard_Success';
export const FM_OverView_PTGL_VocDiscard_Error = 'FM_OverView_PTGL_VocDiscard_Error';

/**
 * 厂务概览-机械课运行 -- Voc废气出/入口浓度
 * @returns {function(*): *}
 */
export function loadFMVocDiscard() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_PTGL_VocDiscard_Request, FM_OverView_PTGL_VocDiscard_Success, FM_OverView_PTGL_VocDiscard_Error],
      url: '/fmcs/api/fm/overview/ptglVocDiscard',
    })
  }
}

export const FM_OverView_PTGL_SexDiscard_Request = 'FM_OverView_PTGL_SexDiscard_Request';
export const FM_OverView_PTGL_SexDiscard_Success = 'FM_OverView_PTGL_SexDiscard_Success';
export const FM_OverView_PTGL_SexDiscard_Error = 'FM_OverView_PTGL_SexDiscard_Error';

/**
 * 厂务概览-机械课运行 -- Sex废气出/入口浓度
 * @returns {function(*): *}
 */
export function loadFMSexDiscard() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_PTGL_SexDiscard_Request, FM_OverView_PTGL_SexDiscard_Success, FM_OverView_PTGL_SexDiscard_Error],
      url: '/fmcs/api/fm/overview/ptglSexDiscard',
    })
  }
}

export const FM_OverView_MainV_Request = 'FM_OverView_MainV_Request';
export const FM_OverView_MainV_Success = 'FM_OverView_MainV_Success';
export const FM_OverView_MainV_Error = 'FM_OverView_MainV_Error';

/**
 * 厂务概览-电课运行  主进状态
 * @returns {function(*): *}
 */
export function loadFMMainV() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_MainV_Request, FM_OverView_MainV_Success, FM_OverView_MainV_Error],
      url: '/fmcs/api/fm/overview/mainv/status',
    })
  }
}


export const FM_OverView_GasOperation_Request = 'FM_OverView_GasOperation_Request';
export const FM_OverView_GasOperation_Success = 'FM_OverView_GasOperation_Success';
export const FM_OverView_GasOperation_Error = 'FM_OverView_GasOperation_Error';

/**
 * 厂务概览-气化课运行
 * @returns {function(*): *}
 */
export function loadFMGasOperation() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_GasOperation_Request, FM_OverView_GasOperation_Success, FM_OverView_GasOperation_Error],
      url: '/fmcs/api/fm/overview/gasOperation',
    })
  }
}
export const FM_OverView_Detector_Status_Request = 'FM_OverView_Detector_Status_Request';
export const FM_OverView_Detector_Status_Success = 'FM_OverView_Detector_Status_Success';
export const FM_OverView_Detector_Status_Error = 'FM_OverView_Detector_Status_Error';

/**
 * 厂务概览-气化课运行 GMS信息
 * @returns {function(*): *}
 */
export function loadFMDetectorStatus() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_Detector_Status_Request, FM_OverView_Detector_Status_Success, FM_OverView_Detector_Status_Error],
      url: '/fmcs/api/fm/overview/detector/status/statistics',
    })
  }
}

export const FM_OverView_Water_Request = 'FM_OverView_Water_Request';
export const FM_OverView_Water_Success = 'FM_OverView_Water_Success';
export const FM_OverView_Water_Error = 'FM_OverView_Water_Error';

/**
 * 厂务概览-水课运行
 * @returns {function(*): *}
 */
export function loadFMWater() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_Water_Request, FM_OverView_Water_Success, FM_OverView_Water_Error],
      url: '/fmcs/api/fm/overview/water/dashboard',
    })
  }
}



export const FM_OverView_Erc_Request = 'FM_OverView_Erc_Request';
export const FM_OverView_Erc_Success = 'FM_OverView_Erc_Success';
export const FM_OverView_Erc_Error = 'FM_OverView_Erc_Error';

/**
 * 厂务概览-ERC运行
 * @returns {function(*): *}
 */
export function loadFMErc() {
  return (dispatch) => {
    return dispatch({
      types: [FM_OverView_Erc_Request, FM_OverView_Erc_Success, FM_OverView_Erc_Error],
      url: '/fmcs/api/fm/overview/erc/statistics',
    })
  }
}

export const FM_OverView_Destroy_Clear = 'FM_OverView_Destroy_Clear';

export function fmDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: FM_OverView_Destroy_Clear,
    })
  }
}
