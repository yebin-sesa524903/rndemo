export const Maintain_Load_Task_List_Request = 'Maintain_Load_Task_List_Request';
export const Maintain_Load_Task_List_Success = 'Maintain_Load_Task_List_Success';
export const Maintain_Load_Task_List_Error = 'Maintain_Load_Task_List_Error';

/**
 * 根据任务查询保养任务列表
 */
export function loadMaintainTaskList(body) {
    return (dispatch) => {
        return dispatch({
            types: [Maintain_Load_Task_List_Request, Maintain_Load_Task_List_Success, Maintain_Load_Task_List_Error],
            url: `/lego-bff/bff/ledger/rest/maintenanceTask/getMaintenanceTask`,
            body
        })
    }
}

export const Maintain_Load_Task_Results_Save = 'Maintain_Load_Task_Results_Save';

/**
 * 刷新保养列表数据
 * @param tasks
 * @returns {function(*): *}
 */
export function maintainTasksUpdate(tasks) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Load_Task_Results_Save,
            data: tasks,
        })
    }
}

export const Maintain_List_Input_Save = 'Maintain_List_Input_Save';

/**
 * 保存保养列表请求入参
 * @param data
 * @returns {function(*): *}
 */
export function saveMaintainInput(data) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_List_Input_Save,
            data: data,
        })
    }
}

export const Maintain_Search_Text_Save = 'Maintain_Search_Text_Save';

/**
 * 保养列表 搜索文字输入变化
 * @param text
 * @returns {function(*): *}
 */
export function saveMaintainSearchText(text) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Search_Text_Save,
            data: text,
        })
    }
}

export const Maintain_DatePicker_Visible = 'Maintain_DatePicker_Visible';

/**
 * 日期选择 是否可见
 * @param visible
 * @returns {function(*): *}
 */
export function maintainDatePickerVisible(visible) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_DatePicker_Visible,
            data: visible,
        })
    }
}

export const Maintain_List_Destroy_Clear = 'Maintain_List_Destroy_Clear';

/**
 * 保养列表 销毁清除
 * @returns {function(*): *}
 */
export function maintainListDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: Maintain_List_Destroy_Clear,
        })
    }
}



///保养详情
export const Maintain_Load_Basic_Msg_Request = 'Maintain_Load_Basic_Msg_Request';
export const Maintain_Load_Basic_Msg_Success = 'Maintain_Load_Basic_Msg_Success';
export const Maintain_Load_Basic_Msg_Error = 'Maintain_Load_Basic_Msg_Error';

/**
 * 查询保养任务基本信息
 * taskId customerId userId
 * @returns {function(*): *}
 */
export function loadMaintainBasicMsg(body) {
    return (dispatch) => {
        return dispatch({
            types: [Maintain_Load_Basic_Msg_Request, Maintain_Load_Basic_Msg_Success, Maintain_Load_Basic_Msg_Error],
            url: `/lego-bff/bff/ledger/rest/maintenanceTask/getTaskBasicInfo`,
            body
        })
    }
}

export const Maintain_Load_Task_Request = 'Maintain_Load_Task_Request';
export const Maintain_Load_Task_Success = 'Maintain_Load_Task_Success';
export const Maintain_Load_Task_Error = 'Maintain_Load_Task_Error';

/**
 * 查询保养任务项目列表
 * @param taskId
 * @returns {function(*): *}
 */
export function loadMaintainTasks(taskId) {
    return (dispatch) => {
        return dispatch({
            types: [Maintain_Load_Task_Request, Maintain_Load_Task_Success, Maintain_Load_Task_Error],
            url: `/lego-bff/bff/ledger/rest/maintenanceTask/getMaintenanceTaskNormalById`,
            body: {taskId: taskId}
        })
    }
}


export const Maintain_Update_Execute_Input_Save = 'Maintain_Update_Execute_Input_Save';

/**
 * 更新保养项 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveTaskUpdateInput(input) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Update_Execute_Input_Save,
            data: input,
        })
    }
}

export const Maintain_Update_Execute_Request = 'Maintain_Update_Execute_Request';
export const Maintain_Update_Execute_Success = 'Maintain_Update_Execute_Success';
export const Maintain_Update_Execute_Error = 'Maintain_Update_Execute_Error';

/**
 * 更新任务保养项目执行状态
 * @param body
 * @returns {function(*): *}
 */
export function updateMaintainTask(body) {
    return (dispatch) => {
        return dispatch({
            types: [Maintain_Update_Execute_Request, Maintain_Update_Execute_Success, Maintain_Update_Execute_Error],
            url: `/lego-bff/bff/ledger/rest/maintenanceTask/updateProject`,
            body: body
        })
    }
}


export const Maintain_TaskData_Input_Save = 'Maintain_TaskData_Input_Save';

/**
 * 保养任务详情提交 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveMaintainTaskDataInput(input) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_TaskData_Input_Save,
            data: input,
        })
    }
}

export const Maintain_Save_TaskData_Request = 'Maintain_Save_TaskData_Request';
export const Maintain_Save_TaskData_Success = 'Maintain_Save_TaskData_Success';
export const Maintain_Save_TaskData_Error = 'Maintain_Save_TaskData_Error';

/**
 * 保养任务执行 保存基本信息
 * @param body
 * @returns {function(*): *}
 */
export function maintainSaveTaskData(body) {
    return (dispatch) => {
        return dispatch({
            types: [Maintain_Save_TaskData_Request, Maintain_Save_TaskData_Success, Maintain_Save_TaskData_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/saveTaskData',
            body: body
        })
    }
}


export const Maintain_Save_Basic_Msg = 'Maintain_Save_Basic_Msg';

/**
 * 保存 保养任务基本信息 业务模型数组
 * @param msg
 * @returns {function(*): *}
 */
export function saveMaintainBasicMsg(msg) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Save_Basic_Msg,
            data: msg,
        })
    }
}


export const Maintain_Destroy_Clear = 'Maintain_Destroy_Clear';

/**
 * 保养详情销毁清除 一些状态
 * @returns {function(*): *}
 */
export function maintainDestroyClear() {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Destroy_Clear,
            data: '',
        })
    }
}


export const Maintain_Save_Spare_Parts_Replacement = 'Maintain_Save_Spare_Parts_Replacement';

/**
 * 保存 备件更换 业务模型数组
 * @param data
 * @returns {function(*): *}
 */
export function saveSparePartsReplacement(data) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Save_Spare_Parts_Replacement,
            data: data,
        })
    }
}


export const Maintain_Detail_Action_Sheet_Visible = 'Maintain_Detail_Action_Sheet_Visible';

/**
 * 方式actionSheet visible
 * @param data
 * @returns {function(*): *}
 */
export function maintainActionSheet(data) {
  return (dispatch)=>{
    return dispatch({
      type: Maintain_Detail_Action_Sheet_Visible,
      data: data
    })
  }
}

export const Maintain_Detail_NFC_Sheet_Visible = 'Maintain_Detail_NFC_Sheet_Visible';

/**
 * NFC actionSheet visible
 * @param data
 * @returns {function(*): *}
 */
export function maintainNFCSheet(data) {
  return (dispatch)=>{
    return dispatch({
      type: Maintain_Detail_NFC_Sheet_Visible,
      data: data
    })
  }
}



export const Maintain_Save_Receiving_Tools = 'Maintain_Save_Receiving_Tools';

/**
 * 保存领用工具 业务模型数组
 * @param data
 * @returns {function(*): *}
 */
export function saveReceivingTools(data) {
    return (dispatch) => {
        return dispatch({
            type: Maintain_Save_Receiving_Tools,
            data: data,
        })
    }
}
