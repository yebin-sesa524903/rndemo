

/***************************详情获取备件更换列表/领用工具列表及******************************/

export const SpareTools_Load_Tool_Items_Request = 'SpareTools_Load_Tool_Items_Request';
export const SpareTools_Load_Tool_Items_Success = 'SpareTools_Load_Tool_Items_Success';
export const SpareTools_Load_Tool_Items_Error = 'SpareTools_Load_Tool_Items_Error';

/**
 * 获取领用工具列表 参数传taskId
 */
export function loadToolItems(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Load_Tool_Items_Request, SpareTools_Load_Tool_Items_Success, SpareTools_Load_Tool_Items_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/getMaintenanceToolUseById',
            body: body
        })
    }
}

export const SpareTools_Tool_List_Input_Save = 'SpareTools_Tool_List_Input_Save';

/**
 * 保存 领用工具列表表入参
 * @param input
 * @returns {function(*): *}
 */
export function saveToolListInput(input){
    return (dispatch) => {
        return dispatch({
            type: SpareTools_Tool_List_Input_Save,
            data: input,
        })
    }
}

export const SpareTools_Load_Tool_List_Request = 'SpareTools_Load_Tool_List_Request';
export const SpareTools_Load_Tool_List_Success = 'SpareTools_Load_Tool_List_Success';
export const SpareTools_Load_Tool_List_Error = 'SpareTools_Load_Tool_List_Error';

/**
 * 获取领用工具列表 只传page size 不传taskId
 */
export function loadToolList(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Load_Tool_List_Request, SpareTools_Load_Tool_List_Success, SpareTools_Load_Tool_List_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/getMaintenanceToolUseById',
            body: body
        })
    }
}

export const SpareTools_Update_Tool_List = 'SpareTools_Update_Tool_List';

/**
 * 更新列表 数据
 * @param data
 * @returns {function(*): *}
 */
export function updateToolList (data){
    return (dispatch) => {
        return dispatch({
            type: SpareTools_Update_Tool_List,
            data: data,
        })
    }
}

export const SpareTools_Load_Add_Tools_Request = 'SpareTools_Load_Add_Tools_Request';
export const SpareTools_Load_Add_Tools_Success = 'SpareTools_Load_Add_Tools_Success';
export const SpareTools_Load_Add_Tools_Error = 'SpareTools_Load_Add_Tools_Error';

/**
 * 任务 添加领用工具
 */
export function addToolUseItem(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Load_Add_Tools_Request, SpareTools_Load_Add_Tools_Success, SpareTools_Load_Add_Tools_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/addToolUseItem',
            body: body
        })
    }
}

export const SpareTools_Remove_Tools_Request = 'SpareTools_Remove_Tools_Request';
export const SpareTools_Remove_Tools_Success = 'SpareTools_Remove_Tools_Success';
export const SpareTools_Remove_Tools_Error = 'SpareTools_Remove_Tools_Error';

/**
 * 移除工具领用单
 * @param body
 * @returns {function(*): *}
 */
export function removeToolUseItem(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Remove_Tools_Request, SpareTools_Remove_Tools_Success, SpareTools_Remove_Tools_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/removeToolUseItem',
            body: body
        })
    }
}

export const SpareTools_Tool_Destroy_Clear = 'SpareTools_Tool_Destroy_Clear';

/**
 * 页面销毁
 * @returns {function(*): *}
 */
export function toolDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: SpareTools_Tool_Destroy_Clear,
        })
    }
}


export const SpareTools_Load_ChangeSpare_Request = 'SpareTools_Load_ChangeSpare_Request';
export const SpareTools_Load_ChangeSpare_Success = 'SpareTools_Load_ChangeSpare_Success';
export const SpareTools_Load_ChangeSpare_Error = 'SpareTools_Load_ChangeSpare_Error';

/**
 * 获取某个保养/维修详情中的备件更换 数据
 */
export function loadChangeSparePart(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Load_ChangeSpare_Request, SpareTools_Load_ChangeSpare_Success, SpareTools_Load_ChangeSpare_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/getMaintenanceChangeSparePartById',
            body: body
        })
    }
}

export const SpareTools_Spare_ExitList_Input_Save = 'SpareTools_Spare_ExitList_Input_Save';

/**
 * 保存 备件跟换列表表入参
 * @param input
 * @returns {function(*): *}
 */
export function saveSpareListInput(input){
    return (dispatch) => {
        return dispatch({
            type: SpareTools_Spare_ExitList_Input_Save,
            data: input,
        })
    }
}

export const SpareTools_Load_Spare_ExitList_Request = 'SpareTools_Load_Spare_ExitList_Request';
export const SpareTools_Load_Spare_ExitList_Success = 'SpareTools_Load_Spare_ExitList_Success';
export const SpareTools_Load_Spare_ExitList_Error = 'SpareTools_Load_Spare_ExitList_Error';

/**
 * 获取备件更换领用列表
 */
export function getWarehouseExitList(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Load_Spare_ExitList_Request, SpareTools_Load_Spare_ExitList_Success, SpareTools_Load_Spare_ExitList_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/getWarehouseExitList',
            body: body
        })
    }
}

export const SpareTools_Update_Spare_List = 'SpareTools_Update_Spare_List';

/**
 * 更新列表 数据
 * @param data
 * @returns {function(*): *}
 */
export function updateSpareList (data){
    return (dispatch) => {
        return dispatch({
            type: SpareTools_Update_Spare_List,
            data: data,
        })
    }
}



export const SpareTools_Add_ChangeSpareItem_Request = 'SpareTools_Add_ChangeSpareItem_Request';
export const SpareTools_Add_ChangeSpareItem_Success = 'SpareTools_Add_ChangeSpareItem_Success';
export const SpareTools_Add_ChangeSpareItem_Error = 'SpareTools_Add_ChangeSpareItem_Error';

/**
 * 备件更换 添加一条记录
 * @param body
 * @returns {function(*): *}
 */
export function addSparePartItem(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Add_ChangeSpareItem_Request, SpareTools_Add_ChangeSpareItem_Success, SpareTools_Add_ChangeSpareItem_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/addSparePartItem',
            body: body
        })
    }
}


export const SpareTools_Remove_ChangeSpareItem_Request = 'SpareTools_Remove_ChangeSpareItem_Request';
export const SpareTools_Remove_ChangeSpareItem_Success = 'SpareTools_Remove_ChangeSpareItem_Success';
export const SpareTools_Remove_ChangeSpareItem_Error = 'SpareTools_Remove_ChangeSpareItem_Error';

/**
 * 备件更换移除当前备件
 * @param body
 * @returns {function(*): *}
 */
export function removeSparePartItem(body) {
    return (dispatch) => {
        return dispatch({
            types: [SpareTools_Remove_ChangeSpareItem_Request, SpareTools_Remove_ChangeSpareItem_Success, SpareTools_Remove_ChangeSpareItem_Error],
            url: '/lego-bff/bff/ledger/rest/maintenanceTask/removeSparePartItem',
            body: body
        })
    }
}

export const SpareTools_SparePart_Destroy_Clear = 'SpareTools_SparePart_Destroy_Clear';

/**
 * 页面销毁
 * @returns {function(*): *}
 */
export function sparePartDestroyClear(){
    return (dispatch) => {
        return dispatch({
            type: SpareTools_SparePart_Destroy_Clear,
        })
    }
}
