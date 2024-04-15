
export const Acid_Bucket_Input_Save = 'Acid_Bucket_Input_Save';

/**
 * 酸桶列表 入参保存更新
 * @param params
 * @returns {function(*, *): *}
 */
export function saveAcidBucketInput(params) {
    return (dispatch, getState) => {
        return dispatch({
            type: Acid_Bucket_Input_Save,
            data: params
        });
    }
}


export const Acid_Bucket_Scan_Value_Save = 'Acid_Bucket_Scan_Value_Save';
/**
 * 酸桶列表 扫码结果保存
 * @param scanText
 * @returns {function(*): *}
 */
export function saveScanResult(scanText) {
    return (dispatch) => {
        return dispatch({
            type: Acid_Bucket_Scan_Value_Save,
            data: scanText
        });
    }
}


export const Acid_Bucket_Search_Value_Save = 'Acid_Bucket_Search_Value_Save';
/**
 * 酸桶列表 扫码结果保存
 * @param searchText
 * @returns {function(*): *}
 */
export function saveSearchResult(searchText) {
    return (dispatch) => {
        return dispatch({
            type: Acid_Bucket_Search_Value_Save,
            data: searchText
        });
    }
}


export const ACID_BUCKET_LIST_REQUEST = 'ACID_BUCKET_LIST_REQUEST';
export const ACID_BUCKET_LIST_SUCCESS = 'ACID_BUCKET_LIST_SUCCESS';
export const ACID_BUCKET_LIST_FAILURE = 'ACID_BUCKET_LIST_FAILURE';

/**
 * 酸桶列表
 * @param body
 * @returns {function(*, *): *}
 */
export function loadAcidBucketList(body){
    return (dispatch, getState) => {
        return dispatch({
            types: [ACID_BUCKET_LIST_REQUEST, ACID_BUCKET_LIST_SUCCESS, ACID_BUCKET_LIST_FAILURE],
            url: '/fmcs/api/bucket/change/list',
            body
        });
    }
}

export const ACID_BUCKET_LIST_Destroy_Clear = 'ACID_BUCKET_LIST_Destroy_Clear';
export function acidBucketListDestroyClear() {
    return (dispatch, getState) => {
        return dispatch({
            type: ACID_BUCKET_LIST_Destroy_Clear,
        });
    }
}


export const BUCKET_DETAIL_REQUEST = 'BUCKET_DETAIL_REQUEST';
export const BUCKET_DETAIL_SUCCESS = 'BUCKET_DETAIL_SUCCESS';
export const BUCKET_DETAIL_FAILURE = 'BUCKET_DETAIL_FAILURE';

/**
 * 获取 酸桶详情
 * @param id
 * @returns {function(*, *): *}
 */
export function loadAcidBucketDetail(id){
    return (dispatch, getState) => {
        return dispatch({
            types: [BUCKET_DETAIL_REQUEST, BUCKET_DETAIL_SUCCESS, BUCKET_DETAIL_FAILURE],
            url: `/fmcs/api/bucket/change/detail/${id}`,
        });
    }
}

export const Bucket_Detail_Clear_Action = 'Bucket_Detail_Clear_Action'
/**
 * 清空详情信息, 避免二次进入导致数据错乱
 * @returns {function(*, *): *}
 */
export function clearAcidBucketDetail() {
    return (dispatch, getState) => {
        return dispatch({
            type: Bucket_Detail_Clear_Action,
        });
    }
}


export const Bucket_ForExecute_Edit_Request = 'Bucket_ForExecute_Edit_Request';
export const Bucket_ForExecute_Edit_Success = 'Bucket_ForExecute_Edit_Success';
export const Bucket_ForExecute_Edit_Failure = 'Bucket_ForExecute_Edit_Failure';


/**
 * 待执行  酸桶编辑
 * @param body
 * {
 * "id":14,
 * "operator":"gpkxcm",
 * "operatorId":522,
 * "confirm":"zhyvli",
 * "confirmId":289,
 * "flow":true
 * }
 * @returns {function(*, *): *}
 */
export function bucketForExecuteEdit(body) {
    return (dispatch, getState)=>{
        return dispatch({
            types:[Bucket_ForExecute_Edit_Request,Bucket_ForExecute_Edit_Success,Bucket_ForExecute_Edit_Failure],
            url: '/fmcs/api/bucket/change/edit/foreExecute',
            body,
        })
    }
}

export const Bucket_ForExecute_Detail_Info = 'Bucket_ForExecute_Detail_Info';
/**
 * 保存待执行详情数据
 * @param detail
 * @returns {function(*): *}
 */
export function saveForExecuteDetailInfo(detail){
    return (dispatch)=>{
        return dispatch({
            type: Bucket_ForExecute_Detail_Info,
            data: detail,
        })
    }
}

export const Bucket_ForExecute_Edit_Input = 'Bucket_ForExecute_Edit_Input'
/**
 * 酸桶待执行 请求入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveExecuteEditInput(input){
    return (dispatch)=>{
        return dispatch({
            type: Bucket_ForExecute_Edit_Input,
            data: input,
        })
    }
}



export const Bucket_Executing_Edit_Request = 'Bucket_Executing_Edit_Request';
export const Bucket_Executing_Edit_Success = 'Bucket_Executing_Edit_Success';
export const Bucket_Executing_Edit_Failure = 'Bucket_Executing_Edit_Failure';

/**
 * 执行中  酸桶编辑
 * @param body
 * @returns {function(*, *): *}
 */
export function bucketExecutingEdit(body) {
    return (dispatch, getState)=>{
        return dispatch({
            types:[Bucket_Executing_Edit_Request,Bucket_Executing_Edit_Success,Bucket_Executing_Edit_Failure],
            url: '/fmcs/api/bucket/change/edit/executeing',
            body,
        })
    }
}

export const Bucket_Executing_Input_Save = 'Bucket_Executing_Input_Save';

/**
 * 执行中请求入参
 * @param input
 * @returns {function(*): *}
 */
export function saveBucketExecutingInput(input) {
    return (dispatch)=>{
        return dispatch({
            type: Bucket_Executing_Input_Save,
            data: input,
        })
    }
}

export const Bucket_Executing_Detail_Info = 'Bucket_Executing_Detail_Info';
/**
 * 执行中 详情业务数据
 * @param detail
 * @returns {function(*): *}
 */
export function saveForExecutingDetailInfo(detail) {
    return (dispatch)=>{
        return dispatch({
            type: Bucket_Executing_Detail_Info,
            data: detail,
        })
    }
}
