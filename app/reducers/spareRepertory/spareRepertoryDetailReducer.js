import {
    SpareRepertory_Detail_Destroy_Clear, SpareRepertory_Detail_Inventory_Submit_Error,
    SpareRepertory_Detail_Inventory_Submit_Request, SpareRepertory_Detail_Inventory_Submit_Success,
    SpareRepertory_Detail_InventoryIndex_Save,
    SpareRepertory_Detail_inventoryStatus,
    SpareRepertory_Detail_Load_Error,
    SpareRepertory_Detail_Load_Request,
    SpareRepertory_Detail_Load_Success,
    SpareRepertory_Detail_SaveDraft_Error,
    SpareRepertory_Detail_SaveDraft_Request,
    SpareRepertory_Detail_SaveDraft_Success,
    SpareRepertory_Detail_Start_Execute_Error,
    SpareRepertory_Detail_Start_Execute_Request,
    SpareRepertory_Detail_Start_Execute_Success,
    SpareRepertory_Detail_ViewData_Save
} from "../../actions/spareRepertory/spareRepertoryAction";
import {
    InitialSpareRepertoryDetailInfo,
} from "../../containers/fmcs/plantOperation/spareRepertory/detail/SpareRepertoryHelper";
import {InventoryStatus} from "../../components/fmcs/plantOperation/defined/ConstDefined";
import {RequestStatus} from "../../middleware/api";


const initialState = {
    spareRepertoryDataInfo: InitialSpareRepertoryDetailInfo(),
    spareRepertoryDetail: {},
    inventoryIndex: 0,///待盘点/已完成
    inventoryStatus: InventoryStatus.initial,///盘点状态  未开始/开始盘点/盘点中
    inventoryRequestStatus: RequestStatus.initial,  ///盘点 调用接口请求状态
    inventorySubmitRequestStatus: RequestStatus.initial,    ///完成提交 请求状态
}

export default function spareRepertoryDetailReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case SpareRepertory_Detail_Load_Request:
            break;
        case SpareRepertory_Detail_Load_Success:
            nextState.spareRepertoryDetail = action.response;
            break;
        case SpareRepertory_Detail_Load_Error:
            break;
        case SpareRepertory_Detail_ViewData_Save:
            nextState.spareRepertoryDataInfo = action.data;
            break;
        case SpareRepertory_Detail_inventoryStatus:
            nextState.inventoryStatus = action.data;
            break;
            ///待盘点/已完成
        case SpareRepertory_Detail_InventoryIndex_Save:
            nextState.inventoryIndex = action.data;
            break;
        ///开始盘点 请求状态
        case SpareRepertory_Detail_Start_Execute_Request:
            nextState.inventoryStatus = InventoryStatus.initial;
            break;
        case SpareRepertory_Detail_Start_Execute_Success:
            nextState.inventoryStatus = InventoryStatus.inventorying;
            break;
        case SpareRepertory_Detail_Start_Execute_Error:
            nextState.inventoryStatus = InventoryStatus.initial;
            break;
///盘点保存草稿 请求状态
        case SpareRepertory_Detail_SaveDraft_Request:
            nextState.inventoryRequestStatus = RequestStatus.loading;
            break;
        case SpareRepertory_Detail_SaveDraft_Success:
            nextState.inventoryRequestStatus = RequestStatus.success;
            break;
        case SpareRepertory_Detail_SaveDraft_Error:
            nextState.inventoryRequestStatus = RequestStatus.error;
            break;
            ///盘点完成提交
        case SpareRepertory_Detail_Inventory_Submit_Request:
            nextState.inventorySubmitRequestStatus = RequestStatus.loading;
            break;
        case SpareRepertory_Detail_Inventory_Submit_Success:
            nextState.inventorySubmitRequestStatus = RequestStatus.success;
            break;
        case SpareRepertory_Detail_Inventory_Submit_Error:
            nextState.inventorySubmitRequestStatus = RequestStatus.error;
            break;

        case SpareRepertory_Detail_Destroy_Clear:
            nextState.spareRepertoryDataInfo = InitialSpareRepertoryDetailInfo()
            nextState.spareRepertoryDetail = {};
            nextState.inventoryStatus = InventoryStatus.initial;
            nextState.inventoryRequestStatus = RequestStatus.initial;
            nextState.inventorySubmitRequestStatus = RequestStatus.initial;
            nextState.inventoryIndex = 0;
            break;
    }
    return nextState || state;
}
