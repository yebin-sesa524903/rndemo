// export const Get_Department_Codes_Request = 'Get_Department_Codes_Request';
// export const Get_Department_Codes_Success = 'Get_Department_Codes_Success';
// export const Get_Department_Codes_Error = 'Get_Department_Codes_Error';
// /**
//  * 获取课室codes
//  * @param body
//  * @returns {function(*): *}
//  */
// export const loadDepartmentCodes = (body) => {
//     return (dispatch) => {
//         return dispatch({
//             types: [Get_Department_Codes_Request, Get_Department_Codes_Success, Get_Department_Codes_Error],
//             url: '/lego-bff/bff/ledger/rest/common/getUserhierarchy',
//             body
//         });
//     }
// }

// export const Get_System_Codes_Request = 'Get_System_Codes_Request';
// export const Get_System_Codes_Success = 'Get_System_Codes_Success';
// export const Get_System_Codes_Error = 'Get_System_Codes_Error';
// /**
//  * 获取系统code
//  * @returns {function(*): *}
//  */
// export const loadSystemCodes = () => {
//     return (dispatch) => {
//         return dispatch({
//             types: [Get_System_Codes_Request, Get_System_Codes_Success, Get_System_Codes_Error],
//             url: '/fmcs/api/select/system',
//         });
//     }
// }


export const Inspection_List_Request = 'Inspection_List_Request';
export const Inspection_List_Success = 'Inspection_List_Success';
export const Inspection_List_Failure = 'Inspection_List_Failure';

/**
 * 巡检列表请求
 * @returns {function(*, *): *}
 */
export function loadInspectionList(body) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_List_Request, Inspection_List_Success, Inspection_List_Failure],
            url: '/lego-bff/bff/ledger/rest/mobile/patrol/getInspectionTaskList',
            body
        });
    }
}

export const Inspection_List_Input_Save = 'Inspection_List_Input_Save'

/**
 * 保存请求巡检列表入参
 * @param input
 * @returns {function(*): *}
 */
export function saveInspectionInput(input) {
    return (dispatch) => {
        return dispatch({
            type: Inspection_List_Input_Save,
            data: input,
        });
    }
}

export const Inspection_Search_Text_Save = 'Inspection_Search_Text_Save';

/**
 * 保存巡检任务列表搜索条件
 * @param searchText
 * @returns {function(*): *}
 */
export function saveInspectionSearchText(searchText) {
    return (dispatch) => {
        return dispatch({
            type: Inspection_Search_Text_Save,
            data: searchText,
        });
    }
}

export const Inspection_DatePicker_Visible = 'Inspection_DatePicker_Visible';

/**
 * 设置巡检 date picker 可见/不可见
 * @param visible
 * @returns {function(*): *}
 */
export function inspectDatePickerVisible(visible) {
    return (dispatch) => {
        return dispatch({
            type: Inspection_DatePicker_Visible,
            data: visible,
        });
    }
}


export const InspectList_Destroy_Clear = 'InspectList_Destroy_Clear';

/**
 * 巡检列表销毁清空
 * @returns {function(*): *}
 */
export function inspectListDestroyClear (){
    return (dispatch) => {
        return dispatch({
            type: InspectList_Destroy_Clear,
        });
    }
}

/************巡检详情***************/

export const Inspection_Detail_Request = 'Inspection_Detail_Request';
export const Inspection_Detail_Success = 'Inspection_Detail_Success';
export const Inspection_Detail_Error = 'Inspection_Detail_Error';

/**
 * 获取巡检详情 数据
 * @param body
 * @returns {function(*): *}
 */
export function loadInspectDetail(body) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_Detail_Request, Inspection_Detail_Success, Inspection_Detail_Error],
            url: '/lego-bff/bff/ledger/rest/inspectionTask/getTaskBasicInfo',
            body,
        });
    }
}


export const Inspection_Range_Request = 'Inspection_Range_Request';
export const Inspection_Range_Success = 'Inspection_Range_Success';
export const Inspection_Range_Error = 'Inspection_Range_Error';

/**
 * 查询巡检范围
 * @param body
 * @returns {function(*): *}
 */
export function loadInspectRange(body) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_Range_Request, Inspection_Range_Success, Inspection_Range_Error],
            url: '/lego-bff/bff/ledger/rest/inspectionTask/getDeviceDetailByID',
            body,
        });
    }
}

export const Inspection_Task_Request = 'Inspection_Task_Request'
export const Inspection_Task_Success = 'Inspection_Task_Success'
export const Inspection_Task_Error = 'Inspection_Task_Error'

/**
 * 查询巡检作业
 * @returns {function(*): *}
 */
export function loadInspectionTask(taskId) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_Task_Request, Inspection_Task_Success, Inspection_Task_Error],
            url: `/lego-bff/bff/ledger/rest/inspectionTask/getInspectionTaskNormalById`,
            body: {taskId: taskId}
        });
    }
}


export const Inspection_Task_Info_Save = 'Inspection_Task_Info_Save';

/**
 * 保存巡检详情 巡检作业展示数据
 * @param data
 * @returns {function(*): *}
 */
export function saveInspectionTaskInfo(data) {
  return (dispatch)=>{
    return dispatch({
      type: Inspection_Task_Info_Save,
      data: data
    })
  }
}

export const Inspection_Detail_Auto_ChaoBiao_Request = 'Inspection_Detail_Auto_ChaoBiao_Request';
export const Inspection_Detail_Auto_ChaoBiao_Success = 'Inspection_Detail_Auto_ChaoBiao_Success';
export const Inspection_Detail_Auto_ChaoBiao_Error = 'Inspection_Detail_Auto_ChaoBiao_Error';

/**
 * 开启自动抄表
 * @param body
 * @returns {function(*): *}
 */
export function autoCaoBiao(body) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_Detail_Auto_ChaoBiao_Request, Inspection_Detail_Auto_ChaoBiao_Success, Inspection_Detail_Auto_ChaoBiao_Error],
            url: `/lego-bff/bff/ledger/rest/equipment/queryDataPointByAbbreviationList`,
            body
        });
    }
}

export const Inspection_Task_Detail_Info_Save = 'Inspection_Task_Detail_Info_Save';

/**
 * 保存巡检详情展示的 模型数组
 * @param data
 * @returns {function(*): *}
 */
export function saveInspectionDetailInfo(data) {
    return (dispatch)=>{
        return dispatch({
            type: Inspection_Task_Detail_Info_Save,
            data: data
        })
    }
}


export const Inspection_Detail_Update_Project_Request = 'Inspection_Detail_Update_Project_Request';
export const Inspection_Detail_Update_Project_Success = 'Inspection_Detail_Update_Project_Success';
export const Inspection_Detail_Update_Project_Error = 'Inspection_Detail_Update_Project_Error';

/**
 * 更新巡检作业内容结果
 * @param body
 * @returns {function(*): *}
 */
export function taskUpdateProject(body) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_Detail_Update_Project_Request, Inspection_Detail_Update_Project_Success, Inspection_Detail_Update_Project_Error],
            url: `/lego-bff/bff/ledger/rest/inspectionTask/updateProject`,
            body
        });
    }
}

export const Inspection_Detail_Save_Task_Input_Save = 'Inspection_Detail_Save_Task_Input_Save';

/**
 * 保存执行任务 入参
 * @param input
 * @returns {function(*): *}
 */
export function saveTaskDetailInput(input){
    return (dispatch)=>{
        return dispatch({
            type: Inspection_Detail_Save_Task_Input_Save,
            data: input,
        })
    }
}

export const Inspection_Detail_Save_Task_Request = 'Inspection_Detail_Save_Task_Request';
export const Inspection_Detail_Save_Task_Success = 'Inspection_Detail_Save_Task_Success';
export const Inspection_Detail_Save_Task_Error = 'Inspection_Detail_Save_Task_Error';

/**
 * 保存巡检任务
 * @returns {function(*): *}
 */
export function inspectionDetailSaveTask(body) {
    return (dispatch) => {
        return dispatch({
            types: [Inspection_Detail_Save_Task_Request, Inspection_Detail_Save_Task_Success, Inspection_Detail_Save_Task_Error],
            url: `/lego-bff/bff/ledger/rest/inspectionTask/saveTaskData`,
            body
        });
    }
}

export const Inspection_Detail_Inspect_Sheet_Visible = 'Inspection_Detail_Inspect_Sheet_Visible';

/**
 * 巡检方式actionSheet visible
 * @param data
 * @returns {function(*): *}
 */
export function inspectionDetailInspectSheet(data) {
  return (dispatch)=>{
    return dispatch({
      type: Inspection_Detail_Inspect_Sheet_Visible,
      data: data
    })
  }
}

export const Inspection_Detail_NFC_Sheet_Visible = 'Inspection_Detail_NFC_Sheet_Visible';

/**
 * NFC actionSheet visible
 * @param data
 * @returns {function(*): *}
 */
export function inspectionDetailNFCSheet(data) {
  return (dispatch)=>{
    return dispatch({
      type: Inspection_Detail_NFC_Sheet_Visible,
      data: data
    })
  }
}


export const Inspection_Detail_Destroy_Clear = 'Inspection_Detail_Destroy_Clear';

/**
 * 巡检详情 销毁
 * @returns {function(*): *}
 */
export function inspectionDetailDestroyClear (){
    return (dispatch)=>{
        return dispatch({
            type: Inspection_Detail_Destroy_Clear,
        })
    }
}



export const Inspection_Task_Destroy_Clear = 'Inspection_Task_Destroy_Clear';

/**
 * 巡检作业 销毁
 * @returns {function(*): *}
 */
export function inspectionTaskDestroyClear (){
  return (dispatch)=>{
    return dispatch({
      type: Inspection_Task_Destroy_Clear,
    })
  }
}
