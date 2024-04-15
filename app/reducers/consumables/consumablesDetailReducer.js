import {InitialDetailInfo} from "../../containers/fmcs/plantOperation/consumables/detail/ConsumablesStateHelper";
import {
    Consumables_Detail_Info_Error,
    Consumables_Detail_Info_Request,
    Consumables_Detail_Info_Save,
    Consumables_Detail_Info_Success,
    Consumables_Detail_Destroy_Clear,
    Consumables_Get_TicketNo_Request,
    Consumables_Get_TicketNo_Success,
    Consumables_Get_TicketNo_Error,
    Consumables_Detail_Load_UnbindTask_Request,
    Consumables_Detail_Load_UnbindTask_Success,
    Consumables_Detail_Load_UnbindTask_Error,
    Consumables_Detail_Update_UnbindTask_Status,
    Consumables_Detail_BindTask_Request,
    Consumables_Detail_BindTask_Success,
    Consumables_Detail_BindTask_Error,
    Consumables_Detail_BindTask_Status,
    Consumables_Save_Consumables_List,
    Consumables_Save_WarehouseExit_Success,
    Consumables_Save_WarehouseExit_Error,
    Consumables_Save_WarehouseExit_Request,
    Consumables_Detail_Update_Success,
    Consumables_Detail_Update_Request,
    Consumables_Detail_Update_Error
} from "../../actions/consumables/consumablesAction";
import {RequestStatus} from "../../middleware/api";

const initialState = {
    responseDetail: {},///接口返回 详情数据
    detailInfo: InitialDetailInfo(),  /// 页面对应的 业务模型数组
    consumablesList: [],///耗材更换清单保存
    ticketNo: '',///获取出库编号
    generateRequestStatus: RequestStatus.initial,   ///生成备件出库 请求状态
    removeSparePartRequestStatus: RequestStatus.initial,    ///移除备件请求状态

    bindSparePartRequestStatus: RequestStatus.initial,///绑定备件请求状态
    saveConsumablesRequestStatus: RequestStatus.initial,///保存耗材更换请求状态
}

export default function ConsumablesDetailReducer(state = initialState, action){
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Consumables_Detail_Info_Save:
            nextState.detailInfo = action.data;
            break;
            ///获取耗材详情
        case Consumables_Detail_Info_Request:
            break;
        case Consumables_Detail_Info_Success:
            nextState.responseDetail = action.response;
            break;
        case Consumables_Detail_Info_Error:
            break;
            ///耗材更换清单保存
        case Consumables_Save_Consumables_List:
            nextState.consumablesList = action.data;
            break;

        ///生成备件出库单前的请求
        case Consumables_Get_TicketNo_Request:
            break;
        case Consumables_Get_TicketNo_Success:
            nextState.ticketNo = action.response;
            break;
        case Consumables_Get_TicketNo_Error:
            break;
            ///生成备件出库单
        case Consumables_Save_WarehouseExit_Request:
            nextState.generateRequestStatus = RequestStatus.loading;
            break;
        case Consumables_Save_WarehouseExit_Success:
            nextState.generateRequestStatus = RequestStatus.success;
            break;
        case Consumables_Save_WarehouseExit_Error:
            nextState.generateRequestStatus = RequestStatus.error;
            break;

            ///移除备件
        case Consumables_Detail_Load_UnbindTask_Request:
            nextState.removeSparePartRequestStatus = RequestStatus.loading;
            break;
        case Consumables_Detail_Load_UnbindTask_Success:
            nextState.removeSparePartRequestStatus = RequestStatus.success;
            break;
        case Consumables_Detail_Load_UnbindTask_Error:
            nextState.removeSparePartRequestStatus = RequestStatus.error;
            break;
        ///修改移除备件请求状态
        case Consumables_Detail_Update_UnbindTask_Status:
            nextState.removeSparePartRequestStatus = action.data;
            break;
            ///绑定备件
        case Consumables_Detail_BindTask_Request:
            nextState.bindSparePartRequestStatus = RequestStatus.loading;
            break;
        case Consumables_Detail_BindTask_Success:
            nextState.bindSparePartRequestStatus = RequestStatus.success;
            break;
        case Consumables_Detail_BindTask_Error:
            nextState.bindSparePartRequestStatus = RequestStatus.error;
            break;
            ///修改绑定备件请求状态
        case Consumables_Detail_BindTask_Status:
            nextState.bindSparePartRequestStatus = action.data;
            break;

            ///完成移交 耗材更换
        case Consumables_Detail_Update_Request:
            nextState.saveConsumablesRequestStatus = RequestStatus.loading;
            break;
        case Consumables_Detail_Update_Success:
            nextState.saveConsumablesRequestStatus = RequestStatus.success;
            break;
        case Consumables_Detail_Update_Error:
            nextState.saveConsumablesRequestStatus = RequestStatus.error;
            break;

        case Consumables_Detail_Destroy_Clear:
            nextState.responseDetail = {};
            nextState.detailInfo = InitialDetailInfo();
            nextState.ticketNo = '';
            nextState.consumablesList = [];
            nextState.generateRequestStatus = RequestStatus.initial;
            nextState.removeSparePartRequestStatus = RequestStatus.initial;
            nextState.saveConsumablesRequestStatus = RequestStatus.initial;
            nextState.bindSparePartRequestStatus = RequestStatus.initial;
            break;
    }
    return nextState || state;
}
