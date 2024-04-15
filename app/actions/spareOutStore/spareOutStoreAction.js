export const SpareOutStore_Load_List_Request = 'SpareOutStore_Load_List_Request'
export const SpareOutStore_Load_List_Success = 'SpareOutStore_Load_List_Success'
export const SpareOutStore_Load_List_Error = 'SpareOutStore_Load_List_Error'

/**
 * 获取出库单列表
 * @param body
 * @returns {function(*): *}
 */
export function loadSpareOutStoreList(body) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_Load_List_Request, SpareOutStore_Load_List_Success, SpareOutStore_Load_List_Error],
      url: '/lego-bff/bff/ledger/rest/mobile/sparePart/queryWarehouseExitList',
      body: body
    })
  }
}

export const SpareOutStore_List_Input_Save = 'SpareOutStore_List_Input_Save';

/**
 * 备件出库列表入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveSpareOutStoreListInput(input) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_List_Input_Save,
      data: input,
    })
  }
}

export const SpareOutStore_List_Save_Search_Text = 'SpareOutStore_List_Save_Search_Text';

/**
 * 保存搜索文字
 * @param text
 * @returns {function(*): *}
 */
export function spareOutStoreSaveSearchText(text) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_List_Save_Search_Text,
      data: text,
    })
  }
}

export const SpareOutStore_List_DatePicker_Visible = 'SpareOutStore_List_DatePicker_Visible';

export function saveDatePickerVisible(visible) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_List_DatePicker_Visible,
      data: visible,
    })
  }
}


export const SpareOutStore_List_Destroy_Clear = 'SpareOutStore_List_Destroy_Clear';

/**
 * 销毁
 * @returns {function(*): *}
 */
export function spareOutStoreListDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_List_Destroy_Clear,
    })
  }
}


/**********************************备件出库详情相关**************************************/

export const SpareOutStore_Load_Detail_Request = 'SpareOutStore_Load_Detail_Request';
export const SpareOutStore_Load_Detail_Success = 'SpareOutStore_Load_Detail_Success';
export const SpareOutStore_Load_Detail_Error = 'SpareOutStore_Load_Detail_Error';

/**
 * 获取出库详情信息
 * @param body
 * @returns {function(*): *}
 */
export function loadDetailInfo(body) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_Load_Detail_Request, SpareOutStore_Load_Detail_Success, SpareOutStore_Load_Detail_Error],
      url: '/lego-bff/bff/ledger/rest/getWarehouseExitDetail',
      body: body
    })
  }
}

export const SpareOutStore_DetailInfo_Save = 'SpareOutStore_DetailInfo_Save';

/**
 * 备件出库详情 业务模型保存
 * @returns {function(*): *}
 */
export function spareOutStoreDataInfoSave(data) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_DetailInfo_Save,
      data: data,
    })
  }
}



export const SpareOutStore_WarehouseExit_Input_Save = 'SpareOutStore_WarehouseExit_Input_Save';
/**
 * 退库入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveWarehouseExitInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_WarehouseExit_Input_Save,
      data: input,
    })
  }
}

export const SpareOutStore_Save_WarehouseExit_Request = 'SpareOutStore_Save_WarehouseExit_Request';
export const SpareOutStore_Save_WarehouseExit_Success = 'SpareOutStore_Save_WarehouseExit_Success';
export const SpareOutStore_Save_WarehouseExit_Error = 'SpareOutStore_Save_WarehouseExit_Error';

/**
 * 退库点击 保存库存信息
 * @returns {function(*): *}
 */
export function saveWarehouseExit(body) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_Save_WarehouseExit_Request, SpareOutStore_Save_WarehouseExit_Success, SpareOutStore_Save_WarehouseExit_Error],
      url: '/lego-bff/bff/ledger/rest/saveWarehouseExit',
      body: body
    })
  }
}


export const SpareOutStore_Submit_Request = 'SpareOutStore_Submit_Request';
export const SpareOutStore_Submit_Success = 'SpareOutStore_Submit_Success';
export const SpareOutStore_Submit_Error = 'SpareOutStore_Submit_Error';

/**
 * 提交出库点击
 * @param body
 */
export function submitSpareOutStore(body) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_Submit_Request, SpareOutStore_Submit_Success, SpareOutStore_Submit_Error],
      url: '/lego-bff/bff/ledger/rest/saveWarehouseExit',
      body: body
    })
  }
}

export const SpareOutStore_Destroy_Clear = 'SpareOutStore_Destroy_Clear';

/**
 * 备件详情 销毁处理
 * @returns {function(*): *}
 */
export function spareOutStoreDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_Destroy_Clear,
    })
  }
}


/**********************************************新建备件出库单*******************************************/

export const SpareOutStore_New_DataInfo_Save = 'SpareOutStore_New_DataInfo_Save';

/**
 * 保存新增出库信息 构建业务模型数组
 * @param data
 * @returns {function(*): *}
 */
export function saveNewPareOutStoreDataInfo(data) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_New_DataInfo_Save,
      data: data,
    })
  }
}


export const SpareOutStore_New_Get_TicketNo_Request = 'SpareOutStore_New_Get_TicketNo_Request';
export const SpareOutStore_New_Get_TicketNo_Success = 'SpareOutStore_New_Get_TicketNo_Success';
export const SpareOutStore_New_Get_TicketNo_Error = 'SpareOutStore_New_Get_TicketNo_Error';

/**
 * 获取出库编号
 * @param body  //{type:1}
 * @returns {function(*): *}
 */
export function getWarehouseTicketNo(body = { type: 1 }) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_New_Get_TicketNo_Request, SpareOutStore_New_Get_TicketNo_Success, SpareOutStore_New_Get_TicketNo_Error],
      url: '/lego-bff/bff/ledger/rest/getWarehouseTicketNo',
      body: body
    })
  }
}

export const SpareOutStore_New_Get_DeviceDictionary_Request = 'SpareOutStore_New_Get_DeviceDictionary_Request';
export const SpareOutStore_New_Get_DeviceDictionary_Success = 'SpareOutStore_New_Get_DeviceDictionary_Success';
export const SpareOutStore_New_Get_DeviceDictionary_Error = 'SpareOutStore_New_Get_DeviceDictionary_Error';

/**
 * 获取出库 用途
 * @param body  {typeCode:"COMP_SPAREPART_Purpose",status:1}
 * @returns {function(*): *}
 */
export function getDeviceDictionary(body = { typeCode: "COMP_SPAREPART_Purpose", status: 1 }) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_New_Get_DeviceDictionary_Request, SpareOutStore_New_Get_DeviceDictionary_Success, SpareOutStore_New_Get_DeviceDictionary_Error],
      url: '/lego-bff/bff/ledger/rest/common/getDeviceDictionary',
      body: body
    })
  }
}


export const SpareOutStore_New_Submit_Input_Save = 'SpareOutStore_New_Submit_Input_Save';

/**
 * 提交入库 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function submitInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_New_Submit_Input_Save,
      data: input,
    })
  }
}

export const SpareOutStore_New_Load_SparePartList_Request = 'SpareOutStore_New_Load_SparePartList_Request';
export const SpareOutStore_New_Load_SparePartList_Success = 'SpareOutStore_New_Load_SparePartList_Success';
export const SpareOutStore_New_Load_SparePartList_Error = 'SpareOutStore_New_Load_SparePartList_Error';

/**
 * 选择备件
 * @param body
 * @returns {function(*): *}
 */
export function loadChooseSparePartList(body) {
  return (dispatch) => {
    return dispatch({
      types: [SpareOutStore_New_Load_SparePartList_Request, SpareOutStore_New_Load_SparePartList_Success, SpareOutStore_New_Load_SparePartList_Error],
      url: '/lego-bff/bff/ledger/rest/getChooseSparepartList',
      body: body
    })
  }
}

export const SpareOutStore_SparePartList_Save = 'SpareOutStore_SparePartList_Save';
/**
 * 保存备件列表 数组 用于选择后刷新选中行
 * @param data
 * @returns {function(*): *}
 */
export function saveSparePartListData(data) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_SparePartList_Save,
      data: data,
    })
  }
}

export const SpareOutStore_New_Load_SparePartList_Input = 'SpareOutStore_New_Load_SparePartList_Input';

/**
 * 获取备件列表入参保存
 * @param input
 * @returns {function(*): *}
 */
export function saveLoadSparePartListInput(input) {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_New_Load_SparePartList_Input,
      data: input,
    })
  }
}

export const SpareOutStore_New_Destroy_Clear = 'SpareOutStore_New_Destroy_Clear';

/**
 * 添加出库  页面销毁
 * @returns {function(*): *}
 */
export function spareOutStoreAddDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_New_Destroy_Clear,
    })
  }
}


export const SpareOutStore_Select_Spare_Destroy_Clear = 'SpareOutStore_Select_Spare_Destroy_Clear';

/**
 * 选择备件 列表销毁
 * @returns {function(*): *}
 */
export function selectSpareDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: SpareOutStore_Select_Spare_Destroy_Clear,
    })
  }
}
