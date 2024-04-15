export const Consumables_Load_List_Request = 'Consumables_Load_List_Request';
export const Consumables_Load_List_Success = 'Consumables_Load_List_Success';
export const Consumables_Load_List_Error = 'Consumables_Load_List_Error';

/**
 * 获取耗材更换列表
 * @param body
 * @returns {function(*): *}
 */
export function loadConsumablesList(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Load_List_Request, Consumables_Load_List_Success, Consumables_Load_List_Error],
            url: '/lego-bff/bff/ledger/rest/mobile/consumeTicket/queryConsumeTicketList',
            body
        })
    }
}

export const Consumables_Load_List_Results_Save = 'Consumables_Load_List_Results_Save';

/**
 * 刷新维修列表数据
 * @param tasks
 * @returns {function(*): *}
 */
export function consumablesTasksUpdate(tasks) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Load_List_Results_Save,
            data: tasks,
        })
    }
}


export const Consumables_List_Input_Save = 'Consumables_List_Input_Save';

/**
 * 保存耗材更换 请求入参
 * @param input
 * @returns {function(*): *}
 */
export function saveConsumablesInput(input) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_List_Input_Save,
            data: input,
        })
    }
}

export const Consumables_List_SearchText = 'Consumables_List_SearchText';

/**
 * 耗材列表 搜索结果保存
 * @param text
 * @returns {function(*): *}
 */
export function saveSearchText(text) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_List_SearchText,
            data: text,
        })
    }
}

export const Consumables_DatePicker_Visible = 'Consumables_DatePicker_Visible';

/**
 * 日期选择picker是否可见
 * @param visible
 * @returns {function(*): *}
 */
export function consumablesDatePickerVisible(visible) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_DatePicker_Visible,
            data: visible,
        })
    }
}

export const Consumables_List_Destroy_Clear = 'Consumables_List_Destroy_Clear';

/**
 * 页面销毁 清除一些数据
 * @returns {function(*): *}
 */
export function consumablesListDestroyClear() {
    return (dispatch) => {
        return dispatch({
            type: Consumables_List_Destroy_Clear,
        })
    }
}


/*********************************************耗材更换详情相关*******************************************/

export const Consumables_Detail_Info_Save = 'Consumables_Detail_Info_Save';

/**
 * 保存 耗材更换详情业务模型数组
 * @param data
 * @returns {function(*): *}
 */
export function consumablesDetailInfoSave(data) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_Info_Save,
            data: data,
        })
    }
}

export const Consumables_Detail_Info_Request = 'Consumables_Detail_Info_Request';
export const Consumables_Detail_Info_Success = 'Consumables_Detail_Info_Success';
export const Consumables_Detail_Info_Error = 'Consumables_Detail_Info_Error';

/**
 * 耗材详情请求
 * @param body
 * @returns {function(*): *}
 */
export function loadConsumablesDetailInfo(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Detail_Info_Request, Consumables_Detail_Info_Success, Consumables_Detail_Info_Error],
            url: '/lego-bff/bff/ledger/rest/consumeTicket/detail',
            body
        })
    }
}

export const Consumables_Save_Consumables_List = 'Consumables_Save_Consumables_List';

/**
 * 保存耗材更换清单
 */
export function saveConsumablesList(data){
    return (dispatch) => {
        return dispatch({
            type: Consumables_Save_Consumables_List,
            data: data,
        })
    }
}


export const Consumables_Get_TicketNo_Request = 'Consumables_Get_TicketNo_Request';
export const Consumables_Get_TicketNo_Success = 'Consumables_Get_TicketNo_Success';
export const Consumables_Get_TicketNo_Error = 'Consumables_Get_TicketNo_Error';

/**
 * 获取出库编号
 * @param body  //{type:1}
 * @returns {function(*): *}
 */
export function consumablesGetWarehouseTicketNo(body = {type: 1}) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Get_TicketNo_Request, Consumables_Get_TicketNo_Success, Consumables_Get_TicketNo_Error],
            url: '/lego-bff/bff/ledger/rest/getWarehouseTicketNo',
            body: body
        })
    }
}

export const Consumables_Save_WarehouseExit_Request = 'Consumables_Save_WarehouseExit_Request';
export const Consumables_Save_WarehouseExit_Success = 'Consumables_Save_WarehouseExit_Success';
export const Consumables_Save_WarehouseExit_Error = 'Consumables_Save_WarehouseExit_Error';

/**
 * 生成备件出库单
 * @returns {function(*): *}
 *
 {
    "detailList": [
        {
            "assetEntryId": 122,
            "warehouseExitQuantity": 2
        },
        {
            "assetEntryId": 53,
            "warehouseExitQuantity": 5
        },
        {
            "assetEntryId": 133,
            "warehouseExitQuantity": 1
        },
        {
            "assetEntryId": 132,
            "warehouseExitQuantity": 2
        }
    ],
    "deviceId": 1307710,
    "deviceName": "断流器7",
    "classroomId": "4053",
    "ownershipSystemId": "4581",
    "warehouseExitTime": "2023-02-21 14:18:37",
    "use": "耗材更换",
    "associatedVoucher": "CW202302190019",
    "recipient": "testmobile",
    "warehouseExitNo": "CK202302210765"
}
 */
export function generateWarehouseExitOrder(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Save_WarehouseExit_Request, Consumables_Save_WarehouseExit_Success, Consumables_Save_WarehouseExit_Error],
            url: '/lego-bff/bff/ledger/rest/saveWarehouseExit',
            body: body
        })
    }
}


export const Consumables_Detail_Load_UnbindTask_Request = 'Consumables_Detail_Load_UnbindTask_Request';
export const Consumables_Detail_Load_UnbindTask_Success = 'Consumables_Detail_Load_UnbindTask_Success';
export const Consumables_Detail_Load_UnbindTask_Error = 'Consumables_Detail_Load_UnbindTask_Error';

/**
 * 备件出库单 移除出某个库单
 * @param body
 * @returns {function(*): *} {"code":"CW202302190020","use":"耗材更换","warehouseExitIds":[227]}
 */
export function unbindTask(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Detail_Load_UnbindTask_Request, Consumables_Detail_Load_UnbindTask_Success, Consumables_Detail_Load_UnbindTask_Error],
            url: '/lego-bff/bff/ledger/rest/unbindTask',
            body
        })
    }
}

export const Consumables_Detail_Update_UnbindTask_Status = 'Consumables_Detail_Update_UnbindTask_Status';

/**
 * 更新移除备件请求状态
 * @param status
 * @returns {function(*): *}
 */
export function updateUnbindTaskStatus(status) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_Update_UnbindTask_Status,
            data: status,
        })
    }
}


export const Consumables_Detail_BindTask_Request = 'Consumables_Detail_BindTask_Request';
export const Consumables_Detail_BindTask_Success = 'Consumables_Detail_BindTask_Success';
export const Consumables_Detail_BindTask_Error = 'Consumables_Detail_BindTask_Error';

/**
 * 备件出库单 绑定出某个库单
 * @param body
 * @returns {function(*): *} {"code":"CW202302190019","deviceId":1307710,"use":"耗材更换","warehouseExitIds":[231]}
 */
export function bindTask(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Detail_BindTask_Request, Consumables_Detail_BindTask_Success, Consumables_Detail_BindTask_Error],
            url: '/lego-bff/bff/ledger/rest/bindTask',
            body
        })
    }
}

export const Consumables_Detail_BindTask_Status = 'Consumables_Detail_BindTask_Status';

/**
 * 更新绑定备件请求状态
 * @param status
 * @returns {function(*): *}
 */
export function updateBindTaskStatus(status) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_BindTask_Status,
            data: status,
        })
    }
}

export const Consumables_Detail_Save_List_Input = 'Consumables_Detail_Save_List_Input'

/**
 * 备件出库列表入参保存
 * @param input
 * @returns {function(*): *}
 */
export function spareListInputSave(input) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_Save_List_Input,
            data: input,
        })
    }
}


export const Consumables_Detail_Load_Outbound_List_Request = 'Consumables_Detail_Load_Outbound_List_Request';
export const Consumables_Detail_Load_Outbound_List_Success = 'Consumables_Detail_Load_Outbound_List_Success';
export const Consumables_Detail_Load_Outbound_List_Error = 'Consumables_Detail_Load_Outbound_List_Error';

/**
 * 获取 关联的备件出库 列表
 * {"pageNum":1,"pageSize":20,"classroomIds":["4053"],"ownerShipSystemIds":["4581"],"isAllSystem":0,"use":"耗材更换"}
 */
export function loadOutboundList(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Detail_Load_Outbound_List_Request, Consumables_Detail_Load_Outbound_List_Success, Consumables_Detail_Load_Outbound_List_Error],
            url: '/lego-bff/bff/ledger/rest/getBindableWarehouseExitList',
            body
        })
    }
}

export const Consumables_Detail_SpareList_Save = 'Consumables_Detail_SpareList_Save';

/**
 * 为刷新列表  保存备件
 * @param list
 * @returns {function(*): *}
 */
export function updateConsumablesSpareList(list) {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_SpareList_Save,
            data: list
        })
    }
}

export const Consumables_Detail_SpareList_Destroy_Clear = 'Consumables_Detail_SpareList_Destroy_Clear';
export function spareListDestroyClear() {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_SpareList_Destroy_Clear,
        })
    }
}

export const Consumables_Detail_Update_Request = 'Consumables_Detail_Update_Request';
export const Consumables_Detail_Update_Success = 'Consumables_Detail_Update_Success';
export const Consumables_Detail_Update_Error = 'Consumables_Detail_Update_Error';

/**
 * 更新耗材清单
 * @param body
 * @returns {function(*): *}
 */
export function submitConsumablesDetail(body) {
    return (dispatch) => {
        return dispatch({
            types: [Consumables_Detail_Update_Request, Consumables_Detail_Update_Success, Consumables_Detail_Update_Error],
            url: '/lego-bff/bff/ledger/rest/consumeTicket/submit',
            body
        })
    }
}


export const Consumables_Detail_Destroy_Clear = 'Consumables_Detail_Destroy_Clear';

/**
 * 耗材更换详情销毁
 * @returns {function(*): *}
 */
export function consumablesDetailDestroyClear() {
    return (dispatch) => {
        return dispatch({
            type: Consumables_Detail_Destroy_Clear,
        })
    }
}
