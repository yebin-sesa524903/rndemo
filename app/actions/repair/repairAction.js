
export const Repair_List_Request = 'Repair_List_Request';
export const Repair_List_Success = 'Repair_List_Success';
export const Repair_List_Error = 'Repair_List_Error';

/**
 * 获取维修列表
 * @param body
 * @returns {function(*, *): *}
 */
export function loadRepairList(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_List_Request, Repair_List_Success, Repair_List_Error],
      url: '/lego-bff/bff/ledger/rest/mobile/repairTask/queryData',
      body
    });
  }
}

export const Repair_List_Results_Save = 'Repair_List_Results_Save';

/**
 * 刷新维修列表数据
 * @param tasks
 * @returns {function(*): *}
 */
export function repairTasksUpdate(tasks) {
  return (dispatch) => {
    return dispatch({
      type: Repair_List_Results_Save,
      data: tasks,
    })
  }
}

export const Repair_List_Input_Save = 'Repair_List_Input_Save';
/**
 * 保存维修列表入参 信息
 * @param input
 * @returns {function(*): *}
 */
export function saveRepairListInput(input) {
  return (dispatch) => {
    return dispatch({
      type: Repair_List_Input_Save,
      data: input,
    });
  }
}

export const Repair_Search_Text_Save = 'Repair_Search_Text_Save';

/**
 * 保存维修列表 搜索文字
 * @param text
 * @returns {function(*): *}
 */
export function saveRepairSearchText(text) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Search_Text_Save,
      data: text,
    });
  }
}
export const Repair_DatePicker_Visible = 'Repair_DatePicker_Visible';

/**
 * 设置维修日期选择可见/不可见
 * @param visible
 * @returns {function(*): *}
 */
export function repairDatePickerVisible(visible) {
  return (dispatch) => {
    return dispatch({
      type: Repair_DatePicker_Visible,
      data: visible,
    });
  }
}

export const Repair_List_Destroy_Clear = 'Repair_List_Destroy_Clear';

/**
 * 维修详情 销毁清除 一些数据
 * @returns {function(*): *}
 */
export function repairListDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Repair_List_Destroy_Clear,
    });
  }
}


/*********************维修详情相关action*****************************/

export const Repair_Detail_Get_Basic_Request = 'Repair_Detail_Get_Basic_Request';
export const Repair_Detail_Get_Basic_Success = 'Repair_Detail_Get_Basic_Success';
export const Repair_Detail_Get_Basic_Error = 'Repair_Detail_Get_Basic_Error';

/**
 * 维修详情 基本信息
 * @param body
 * @returns {function(*): *}
 */
export function loadRepairBasicDetail(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Detail_Get_Basic_Request, Repair_Detail_Get_Basic_Success, Repair_Detail_Get_Basic_Error],
      url: '/lego-bff/bff/ledger/rest/repairTask/getBaseDetail',
      body,
    });
  }
}


export const Repair_Detail_Get_RepairList_Request = 'Repair_Detail_Get_RepairList_Request';
export const Repair_Detail_Get_RepairList_Success = 'Repair_Detail_Get_RepairList_Success';
export const Repair_Detail_Get_RepairList_Error = 'Repair_Detail_Get_RepairList_Error';

/**
 * 维修详情 查询维修工单记录
 * @param body
 * @returns {function(*): *}
 */
export function loadDetailRepairList(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Detail_Get_RepairList_Request, Repair_Detail_Get_RepairList_Success, Repair_Detail_Get_RepairList_Error],
      url: '/lego-bff/bff/ledger/rest/repairTask/getRepairList',
      body,
    });
  }
}

export const Repair_Detail_File_List_Request = 'Repair_Detail_File_List_Request';
export const Repair_Detail_File_List_Success = 'Repair_Detail_File_List_Success';
export const Repair_Detail_File_List_Error = 'Repair_Detail_File_List_Error';

/**
 * 获取维修异常图片
 * @param deviceId
 * @returns {function(*, *): *}
 */
export function loadRepairImages(deviceId) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Detail_File_List_Request, Repair_Detail_File_List_Success, Repair_Detail_File_List_Error],
      url: `/lego-bff/bff/ledger/rest/getDeviceFileList`,
      body: { deviceId: deviceId }
    });
  }
}


export const Repair_Detail_Save_Repair_Input_Save = 'Repair_Detail_Save_Repair_Input_Save';

/**
 * 维修详情  维修记录栏  新增/保存维修记录 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveRepairDetailSaveRepairListInput(input) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Detail_Save_Repair_Input_Save,
      data: input,
    });
  }
}

export const Repair_Detail_Save_RepairList_Request = 'Repair_Detail_Save_RepairList_Request';
export const Repair_Detail_Save_RepairList_Success = 'Repair_Detail_Save_RepairList_Success';
export const Repair_Detail_Save_RepairList_Error = 'Repair_Detail_Save_RepairList_Error';

/**
 * 维修详情 维修记录保存
 * @param body
 * @returns {function(*): *}
 */
export function saveTaskRepairList(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Detail_Save_RepairList_Request, Repair_Detail_Save_RepairList_Success, Repair_Detail_Save_RepairList_Error],
      url: '/lego-bff/bff/ledger/rest/repairTask/saveRepairList',
      body,
    });
  }
}


export const Repair_Detail_Submit_Request = 'Repair_Detail_Submit_Request';
export const Repair_Detail_Submit_Success = 'Repair_Detail_Submit_Success';
export const Repair_Detail_Submit_Error = 'Repair_Detail_Submit_Error';

/**
 * 维修详情完成提交 保存
 * @returns {function(*): *}  {"taskId":"143"}
 */
export function repairDetailSubmit(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Detail_Submit_Request, Repair_Detail_Submit_Success, Repair_Detail_Submit_Error],
      url: '/lego-bff/bff/ledger/rest/repairTask/submitWorkOrder',
      body,
    });
  }
}

export const Repair_Detail_Destroy_Clear = 'Repair_Detail_Destroy_Clear';

/**
 * 维修详情 销毁清除 一些数据
 * @returns {function(*): *}
 */
export function repairDetailDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Repair_Detail_Destroy_Clear,
      data: '',
    });
  }
}


export const Repair_Basic_Message_Save = 'Repair_Basic_Message_Save';

/**
 * 保存基本执行 显示数据
 * @param msg
 * @returns {function(*): *}
 */
export function saveRepairBasicMsg(msg) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Basic_Message_Save,
      data: msg,
    });
  }
}


export const Spare_Parts_Replacement_Data_Save = 'Spare_Parts_Replacement_Data_Save';

/**
 * 备件更换 列表业务数据保存
 * @param data
 * @returns {function(*): *}
 */
export function saveSparePartsReplacementData(data) {
  return (dispatch) => {
    return dispatch({
      type: Spare_Parts_Replacement_Data_Save,
      data: data,
    });
  }
}


export const Receiving_Tools_Data_Data_Save = 'Receiving_Tools_Data_Data_Save';

/**
 * 领用工具 列表业务数据保存
 * @param data
 * @returns {function(*): *}
 */
export function saveReceivingToolsData(data) {
  return (dispatch) => {
    return dispatch({
      type: Receiving_Tools_Data_Data_Save,
      data: data,
    });
  }
}

/*************************故障报修*******************************/

export const Repair_Add_Get_Code_Request = 'Repair_Add_Get_Code_Request';
export const Repair_Add_Get_Code_Success = 'Repair_Add_Get_Code_Success';
export const Repair_Add_Get_Code_Error = 'Repair_Add_Get_Code_Error';

/**
 * 获取随机编码
 * @param body
 * @returns {function(*): *}
 */
export function getCodeByEnum(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Add_Get_Code_Request, Repair_Add_Get_Code_Success, Repair_Add_Get_Code_Error],
      url: '/lego-bff/bff/ledger/rest/common/getCodeByEnum',
      body,
    });
  }
}


export const Repair_Add_Save_Detail_Input_Save = 'Repair_Add_Save_Detail_Input_Save'

/**
 * 保存维修 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function repairSaveDetailInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_Save_Detail_Input_Save,
      data: input,
    });
  }
}

export const Repair_Add_Load_Device_Input_Save = 'Repair_Add_Load_Device_Input_Save';

/**
 * 关联设备入参保存
 * @param input
 * @returns {function(*): *}
 */
export function relateDeviceInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_Load_Device_Input_Save,
      data: input,
    });
  }
}

export const Repair_Add_Load_Device_Request = 'Repair_Add_Load_Device_Request';
export const Repair_Add_Load_Device_Success = 'Repair_Add_Load_Device_Success';
export const Repair_Add_Load_Device_Error = 'Repair_Add_Load_Device_Error';

/**
 * 获取系统下的设备列表
 * @param body
 * @returns {function(*): *}
 */
export function getBoundedDevice(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Add_Load_Device_Request, Repair_Add_Load_Device_Success, Repair_Add_Load_Device_Error],
      url: '/lego-bff/bff/ledger/rest/getBoundedDevice',
      body,
    });
  }
}

export const Repair_Add_Load_Device_Save_Device = 'Repair_Add_Load_Device_Save_Device';

/**
 * 更新关联设备列表
 * @param data
 * @returns {function(*): *}
 */
export function saveRelateDevice(data) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_Load_Device_Save_Device,
      data: data,
    });
  }
}


export const Repair_Add_RelateWorkOrders_Input_Save = 'Repair_Add_RelateWorkOrders_Input_Save';

/**
 * 关联工单入参保存
 * @param input
 * @returns {function(*): *}
 */
export function relateWorkOrdersInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_RelateWorkOrders_Input_Save,
      data: input,
    });
  }
}


export const Repair_Add_Load_RelateWorkOrders_Request = 'Repair_Add_Load_RelateWorkOrders_Request';
export const Repair_Add_Load_RelateWorkOrders_Success = 'Repair_Add_Load_RelateWorkOrders_Success';
export const Repair_Add_Load_RelateWorkOrders_Error = 'Repair_Add_Load_RelateWorkOrders_Error';

/**
 * 获取系统下的设备列表
 * @param body
 * @returns {function(*): *}
 */
export function getRelateWorkOrders(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Add_Load_RelateWorkOrders_Request, Repair_Add_Load_RelateWorkOrders_Success, Repair_Add_Load_RelateWorkOrders_Error],
      url: '/lego-bff/bff/ledger/rest/repairTask/getRelateWorkOrders',
      body,
    });
  }
}

export const Repair_Add_RelateWorkOrders_Save = 'Repair_Add_RelateWorkOrders_Save';

/**
 * 更新关联设备列表
 * @param data
 * @returns {function(*): *}
 */
export function saveRelateWorkOrders(data) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_RelateWorkOrders_Save,
      data: data,
    });
  }
}


export const Repair_Add_Task_Save = 'Repair_Add_Task_Save';

/**
 * 新增 故障报修 业务模型
 */
export function saveRepairAddTaskInfo(data) {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_Task_Save,
      data: data,
    });
  }
}


export const Repair_Add_Save_Detail_Request = 'Repair_Add_Save_Detail_Request';
export const Repair_Add_Save_Detail_Success = 'Repair_Add_Save_Detail_Success';
export const Repair_Add_Save_Detail_Error = 'Repair_Add_Save_Detail_Error';

/**
 * 维修详情完成提交 保存
 * @returns {function(*): *}
 */
export function repairSaveBaseDetail(body) {
  return (dispatch) => {
    return dispatch({
      types: [Repair_Add_Save_Detail_Request, Repair_Add_Save_Detail_Success, Repair_Add_Save_Detail_Error],
      url: '/lego-bff/bff/ledger/rest/repairTask/saveBaseDetail',
      body,
    });
  }
}

export const Repair_Add_Destroy_Clear = 'Repair_Add_Destroy_Clear';

/**
 * 故障报修 销毁
 * @returns {function(*): *}
 */
export function repairAddDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Repair_Add_Destroy_Clear,
    });
  }
}



export const Repair_Select_Device_Destroy_Clear = 'Repair_Select_Device_Destroy_Clear';
export function repairSelectDeviceDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Repair_Select_Device_Destroy_Clear,
    });
  }
}

export const Repair_Select_Order_Destroy_Clear = 'Repair_Select_Order_Destroy_Clear';
export function repairSelectOrderDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Repair_Select_Order_Destroy_Clear,
    });
  }
}
