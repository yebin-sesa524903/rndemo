export const SpareRepertory_Load_List_Request = 'SpareRepertory_Load_List_Request'
export const SpareRepertory_Load_List_Success = 'SpareRepertory_Load_List_Success'
export const SpareRepertory_Load_List_Error = 'SpareRepertory_Load_List_Error'

/**
 * 获取盘点单列表
 * @param body
 * @returns {function(*): *}
 */
export function loadSpareRepertoryList(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareRepertory_Load_List_Request, SpareRepertory_Load_List_Success, SpareRepertory_Load_List_Error],
            url: '/lego-bff/bff/ledger/rest/mobile/inventoryManagement/queryInventoryList',
            body: body
        })
    }
}

export const SpareRepertory_List_Input_Save = 'SpareRepertory_List_Input_Save';

/**
 * 备件盘点列表入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveSpareRepertoryListInput(input) {
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_List_Input_Save,
            data: input,
        })
    }
}

export const SpareRepertory_List_Save_Search_Text = 'SpareRepertory_List_Save_Search_Text';

/**
 * 保存搜索文字
 * @param text
 * @returns {function(*): *}
 */
export function spareRepertorySaveSearchText(text) {
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_List_Save_Search_Text,
            data: text,
        })
    }
}

export const SpareRepertory_List_DatePicker_Visible = 'SpareRepertory_List_DatePicker_Visible';
export function saveDatePickerVisible(visible) {
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_List_DatePicker_Visible,
            data: visible,
        })
    }
}




export const SpareRepertory_List_Destroy_Clear = 'SpareRepertory_List_Destroy_Clear';

/**
 * 销毁
 * @returns {function(*): *}
 */
export function spareRepertoryListDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_List_Destroy_Clear,
        })
    }
}


/*****************详情相关************************/

export const SpareRepertory_Detail_Load_Request = 'SpareRepertory_Detail_Load_Request';
export const SpareRepertory_Detail_Load_Success = 'SpareRepertory_Detail_Load_Success';
export const SpareRepertory_Detail_Load_Error = 'SpareRepertory_Detail_Load_Error';

/**
 * 获取出库单详情
 * @param body
 * @returns {function(*): *}
 */
export function loadSpareRepertoryDetail(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareRepertory_Detail_Load_Request, SpareRepertory_Detail_Load_Success, SpareRepertory_Detail_Load_Error],
            url: '/lego-bff/bff/ledger/rest/inventoryManagement/detail',
            body: body
        })
    }
}


export const SpareRepertory_Detail_ViewData_Save = 'SpareRepertory_Detail_ViewData_Save';

/**
 * 详情业务模型展示数据
 * @returns {function(*): *}
 */
export function spareRepertoryDetailInfoDataSave(data){
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_Detail_ViewData_Save,
            data: data,
        })
    }
}

export const SpareRepertory_Detail_inventoryStatus = 'SpareRepertory_Detail_inventoryStatus';

/**
 * 更新盘点状态
 * @param status
 * @returns {function(*): *}
 */
export function updateInventoryStatus(status) {
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_Detail_inventoryStatus,
            data: status,
        })
    }
}

export const SpareRepertory_Detail_Start_Execute_Request = 'SpareRepertory_Detail_Start_Execute_Request';
export const SpareRepertory_Detail_Start_Execute_Success = 'SpareRepertory_Detail_Start_Execute_Success';
export const SpareRepertory_Detail_Start_Execute_Error = 'SpareRepertory_Detail_Start_Execute_Error';

/**
 * 未执行 开始盘点
 * @param body
 * @returns {function(*): *}
 */
export function startExecute(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareRepertory_Detail_Start_Execute_Request, SpareRepertory_Detail_Start_Execute_Success, SpareRepertory_Detail_Start_Execute_Error],
            url: '/lego-bff/bff/ledger/rest/inventoryManagement/execute',
            body: body
        })
    }
}


export const SpareRepertory_Detail_SaveDraft_Request = 'SpareRepertory_Detail_SaveDraft_Request';
export const SpareRepertory_Detail_SaveDraft_Success = 'SpareRepertory_Detail_SaveDraft_Success';
export const SpareRepertory_Detail_SaveDraft_Error = 'SpareRepertory_Detail_SaveDraft_Error';
///盘点存草稿
export function saveDraft(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareRepertory_Detail_SaveDraft_Request, SpareRepertory_Detail_SaveDraft_Success, SpareRepertory_Detail_SaveDraft_Error],
            url: '/lego-bff/bff/ledger/rest/inventoryManagement/saveDraft',
            body: body
        })
    }
}


export const SpareRepertory_Detail_Inventory_Submit_Request = 'SpareRepertory_Detail_Inventory_Submit_Request';
export const SpareRepertory_Detail_Inventory_Submit_Success = 'SpareRepertory_Detail_Inventory_Submit_Success';
export const SpareRepertory_Detail_Inventory_Submit_Error = 'SpareRepertory_Detail_Inventory_Submit_Error';

/**
 * 盘点完成提交
 * @param body
 * @returns {function(*): *}
 */
export function inventorySubmit(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareRepertory_Detail_Inventory_Submit_Request, SpareRepertory_Detail_Inventory_Submit_Success, SpareRepertory_Detail_Inventory_Submit_Error],
            url: '/lego-bff/bff/ledger/rest/inventoryManagement/submit',
            body: body
        })
    }
}


export const SpareRepertory_Detail_InventoryIndex_Save = 'SpareRepertory_Detail_InventoryIndex_Save';

/**
 * 待盘点/已完成
 * @returns {function(*): *}
 */
export function saveInventoryIndex(index){
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_Detail_InventoryIndex_Save,
            data: index,
        })
    }
}



export const SpareRepertory_Detail_Destroy_Clear = 'SpareRepertory_Detail_Destroy_Clear';

/**
 * 销毁
 * @returns {function(*): *}
 */
export function spareRepertoryDetailDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: SpareRepertory_Detail_Destroy_Clear,
        })
    }
}
