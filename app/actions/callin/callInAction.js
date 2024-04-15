
export const Call_In_Get_Hierarchy_Request = 'Call_In_Get_Hierarchy_Request';
export const Call_In_Get_Hierarchy_Success = 'Call_In_Get_Hierarchy_Success';
export const Call_In_Get_Hierarchy_Error = 'Call_In_Get_Hierarchy_Error';
export function getHierarchyList(id) {
  return (dispatch) => {
    return dispatch({
      types: [Call_In_Get_Hierarchy_Request, Call_In_Get_Hierarchy_Success, Call_In_Get_Hierarchy_Error],
      url: `/lego-bff/bff/xiot/rest/getHierarchyListById?id=${id}&type=orghc`,
    });
  }
}



export const Call_In_Ticket_List_Request = 'Call_In_Ticket_List_Request';
export const Call_In_Ticket_List_Success = 'Call_In_Ticket_List_Success';
export const Call_In_Ticket_List_Error = 'Call_In_Ticket_List_Error';

/**
 * 话务工单列表
 * @param body
 * @returns {function(*): *}
 */
export function loadCallInTickets(body) {
  return (dispatch) => {
    return dispatch({
      types: [Call_In_Ticket_List_Request, Call_In_Ticket_List_Success, Call_In_Ticket_List_Error],
      url: `/inf/api/order/getOrderList`,
      body: body,
    });
  }
}

export const Call_In_Ticket_List_Input_Save = 'Call_In_Ticket_List_Input_Save';

/**
 * 保存入参信息
 * @param input
 * @returns {function(*): *}
 */
export function saveTicketListInput(input) {
  return (dispatch) => {
    return dispatch({
      type: Call_In_Ticket_List_Input_Save,
      data: input
    })
  }
}

export const Call_In_Ticket_OrderAccept_Request = 'Call_In_Ticket_OrderAccept_Request';
export const Call_In_Ticket_OrderAccept_Success = 'Call_In_Ticket_OrderAccept_Success';
export const Call_In_Ticket_OrderAccept_Error = 'Call_In_Ticket_OrderAccept_Error';

/**
 * 话务工单列表
 * @param body
 * @returns {function(*): *} orderId subOrderId
 */
export function orderAccept(body) {
  return (dispatch) => {
    return dispatch({
      types: [Call_In_Ticket_OrderAccept_Request, Call_In_Ticket_OrderAccept_Success, Call_In_Ticket_OrderAccept_Error],
      url: `/inf/api/order/orderAccept`,
      body: body,
    });
  }
}

export const Call_In_Ticket_List_Destroy_Clear = 'Call_In_Ticket_List_Destroy_Clear';

/**
 * 保存入参信息
 * @returns {function(*): *}
 */
export function callInListDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Call_In_Ticket_List_Destroy_Clear,
    })
  }
}


/********************************************************详情相关**************************************************************/

export const CallIn_Load_Detail_Request = 'CallIn_Load_Detail_Request';
export const CallIn_Load_Detail_Success = 'CallIn_Load_Detail_Success';
export const CallIn_Load_Detail_Error = 'CallIn_Load_Detail_Error';

/**
 * 获取工单详情  orderId
 * @param body
 * @returns {function(*): *}
 */
export function loadTicketDetail(body) {
  return (dispatch) => {
    return dispatch({
      types: [CallIn_Load_Detail_Request, CallIn_Load_Detail_Success, CallIn_Load_Detail_Error],
      url: `/inf/api/order/getOrderDetail`,
      body: body,
    });
  }
}

export const CallIn_Device_Detail_Request = 'CallIn_Device_Detail_Request';
export const CallIn_Device_Detail_Success = 'CallIn_Device_Detail_Success';
export const CallIn_Device_Detail_Error = 'CallIn_Device_Detail_Error';

/**
 * 获取设备详情  deviceId
 * @param deviceId
 * @returns {function(*): *}
 */
export function loadDeviceDetail(deviceId) {
  return (dispatch) => {
    return dispatch({
      types: [CallIn_Device_Detail_Request, CallIn_Device_Detail_Success, CallIn_Device_Detail_Error],
      url: `/lego-bff/bff/ledger/rest/hierarchyInstantiationDetail?objectId=${deviceId}`,
    });
  }
}


export const CallIn_Detail_DataInfo_Save = 'CallIn_Detail_DataInfo_Save';

/**
 * 页面模型数组保存, 刷新
 */
export function saveDetailDataInfo(data) {
  return (dispatch) => {
    return dispatch({
      type: CallIn_Detail_DataInfo_Save,
      data: data,
    })
  }
}

export const Call_Alarm_Detail_DataInfo_Save = 'Call_Alarm_Detail_DataInfo_Save';

/**
 * 页面模型数组保存, 刷新
 */
export function saveAlarmDetailDataInfo(data) {
  return (dispatch) => {
    return dispatch({
      type: Call_Alarm_Detail_DataInfo_Save,
      data: data,
    })
  }
}


export const CallIn_Order_Save_Input = 'CallIn_Order_Save_Input';

/**
 * 工单保存 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function callInOrderSaveInput(input) {
  return (dispatch) => {
    return dispatch({
      type: CallIn_Order_Save_Input,
      data: input,
    })
  }
}

export const CallIn_Order_Save_Request = 'CallIn_Order_Save_Request';
export const CallIn_Order_Save_Success = 'CallIn_Order_Save_Success';
export const CallIn_Order_Save_Error = 'CallIn_Order_Save_Error';

/**
 * 获取工单详情  orderId
 * orderId  subOrderId content isSave
 * @param body
 * @returns {function(*): *}
 */
export function orderSave(body) {
  return (dispatch) => {
    return dispatch({
      types: [CallIn_Order_Save_Request, CallIn_Order_Save_Success, CallIn_Order_Save_Error],
      url: `/inf/api/order/orderSave`,
      body: body,
    });
  }
}


export const CallIn_Detail_Image_Review = 'CallIn_Detail_Image_Review';

/**
 * 图品预览
 * @param info
 * @returns {function(*): *}
 */
export function imageReviewInfoSave(info){
  return (dispatch) => {
    return dispatch({
      type: CallIn_Detail_Image_Review,
      data: info
    })
  }
}

export const CallIn_Detail_Destroy_Clear = 'CallIn_Detail_Destroy_Clear';

/**
 * 详情页销毁
 * @returns {function(*): *}
 */
export function callInDetailDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: CallIn_Detail_Destroy_Clear,
    })
  }
}
