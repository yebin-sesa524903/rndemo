

export const Abnormal_List_Request = 'Abnormal_List_Request';
export const Abnormal_List_Success = 'Abnormal_List_Success';
export const Abnormal_List_Failure = 'Abnormal_List_Failure';
/**
 * 异常点检请求http://39.98.50.32:31888/lego-bff/bff/ledger/rest/pointCheck/queryData
 */
export function loadAbnormalList(body) {
    return (dispatch, getState) => {
        return dispatch({
            types: [Abnormal_List_Request, Abnormal_List_Success, Abnormal_List_Failure],
            url: '/lego-bff/bff/ledger/rest/mobile/pointCheck/queryPcList',
            body
        });
    }
}

export const Abnormal_List_Search_Save = 'Abnormal_List_Search_Save'
/**
 * 保存搜索结果
 * @param input
 * @returns {function(*): *}
 */
export function saveAbnormalSearchInput(input) {
    return (dispatch) => {
        return dispatch({
            type: Abnormal_List_Search_Save,
            data: input,
        });
    }
}

export const Abnormal_List_Input_Save = 'Abnormal_List_Input_Save';

/**
 * 点检列表 入参保存更新
 * @param params
 * @returns {function(*, *): *}
 */
export function saveAbnormalListInput(params) {
    return (dispatch) => {
        return dispatch({
            type: Abnormal_List_Input_Save,
            data: params
        });
    }
}

export const Abnormal_List_Destroy_Clear = 'Abnormal_List_Destroy_Clear';

/**
 * 异常点击列表销毁
 * @returns {function(*): *}
 */
export function abnormalListDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: Abnormal_List_Destroy_Clear,
        });
    }
}


/************异常点检详情***************/

export const Abnormal_Detail_Request = 'Abnormal_Detail_Request';
export const Abnormal_Detail_Success = 'Abnormal_Detail_Success';
export const Abnormal_Detail_Error = 'Abnormal_Detail_Error';

/**
 * 获取异常点检详情 数据
 * @param body
 * @returns {function(*): *}
 */
export function loadAbnormalDetail(body) {
    return (dispatch) => {
        return dispatch({
            types: [Abnormal_Detail_Request, Abnormal_Detail_Success, Abnormal_Detail_Error],
            url: '/lego-bff/bff/ledger/rest/pointCheck/getBaseDetail',
            body,
        });
    }
}

export const Abnormal_Detail_Data_Info_Save = 'Abnormal_Detail_Data_Info_Save';
export function saveAbnormalDetailDataInfo(data){
    return (dispatch) => {
        return dispatch({
            type: Abnormal_Detail_Data_Info_Save,
            data: data,
        });
    }
}

export const Abnormal_Detail_Task_Result_Save = 'Abnormal_Detail_Task_Result_Save';

/**
 * 点检结果保存
 * @param data
 * @returns {function(*): *}
 */
export function saveAbnormalTaskResult(data){
    return (dispatch) => {
        return dispatch({
            type: Abnormal_Detail_Task_Result_Save,
            data: data,
        });
    }
}



export const Abnormal_Record_list_Request = 'Abnormal_Record_list_Request';
export const Abnormal_Record_list_Success = 'Abnormal_Record_list_Success';
export const Abnormal_Record_list_Error = 'Abnormal_Record_list_Error';

/**
 * 获取异常点检记录
 * @param body
 * @returns {function(*): *}
 */
export function loadAbnormalRecordList(body) {
    return (dispatch) => {
        return dispatch({
            types: [Abnormal_Record_list_Request, Abnormal_Record_list_Success, Abnormal_Record_list_Error],
            url: '/lego-bff/bff/ledger/rest/pointCheck/getPointCheckList',
            body,
        });
    }
}

export const Abnormal_Save_Record_list_Request = 'Abnormal_Save_Record_list_Request';
export const Abnormal_Save_Record_list_Success = 'Abnormal_Save_Record_list_Success';
export const Abnormal_Save_Record_list_Error = 'Abnormal_Save_Record_list_Error';

/**
 * 异常点检记录提交
 * @param body
 * @returns {function(*): *}
 */
export function saveAbnormalRecordList(body) {
    return (dispatch) => {
        return dispatch({
            types: [Abnormal_Save_Record_list_Request, Abnormal_Save_Record_list_Success, Abnormal_Save_Record_list_Error],
            url: '/lego-bff/bff/ledger/rest/pointCheck/savePointCheckList',
            body,
        });
    }
}

export const Abnormal_Save_task_Request = 'Abnormal_Save_task_Request';
export const Abnormal_Save_task_Success = 'Abnormal_Save_task_Success';
export const Abnormal_Save_task_Error = 'Abnormal_Save_task_Error';

/**
 * 异常点检完成提交
 * @param body
 * @returns {function(*): *}
 */
export function saveAbnormalTask(body) {
    return (dispatch) => {
        return dispatch({
            types: [Abnormal_Save_task_Request, Abnormal_Save_task_Success, Abnormal_Save_task_Error],
            url: '/lego-bff/bff/ledger/rest/pointCheck/submitPointCheck',
            body,
        });
    }
}


export const Abnormal_Detail_Destroy_Clear = 'Abnormal_Detail_Destroy_Clear';

export function abnormalDetailDestroyClear() {
    return (dispatch) => {
        return dispatch({
            type: Abnormal_Detail_Destroy_Clear,
        });
    }
}
