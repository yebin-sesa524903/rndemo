import {
    SpareOutStore_New_DataInfo_Save, SpareOutStore_New_Destroy_Clear,
    SpareOutStore_New_Get_DeviceDictionary_Error,
    SpareOutStore_New_Get_DeviceDictionary_Request,
    SpareOutStore_New_Get_DeviceDictionary_Success,
    SpareOutStore_New_Get_TicketNo_Error,
    SpareOutStore_New_Get_TicketNo_Request,
    SpareOutStore_New_Get_TicketNo_Success,
    SpareOutStore_New_Load_SparePartList_Error,
    SpareOutStore_New_Load_SparePartList_Input,
    SpareOutStore_New_Load_SparePartList_Request,
    SpareOutStore_New_Load_SparePartList_Success,
    SpareOutStore_New_Submit_Input_Save, SpareOutStore_Select_Spare_Destroy_Clear,
    SpareOutStore_SparePartList_Save,
    SpareOutStore_Submit_Error,
    SpareOutStore_Submit_Request,
    SpareOutStore_Submit_Success,
} from "../../actions/spareOutStore/spareOutStoreAction";
import {
    InitialAddSpareOutStoreInfo,
} from "../../containers/fmcs/plantOperation/spareOutStoreHouse/new/SpareAddHelper";
import {RequestStatus} from "../../middleware/api";

const SubmitInputInitialStatus = () => {
    return {
        classroomId: null,///课室id
        ownershipSystemId: null,///所属系统
        remark: '',
        warehouseExitNo: '',///出库单号
        warehouseExitTime: '',///出库时间
        recipient: '',///领用人
        updateUser: '',///更新人
        updateTime: '',///更新时间
        deviceId: null,
        deviceName: '', ///设备名称
        id: null,
        use: '',///用途
        associatedVoucher: '',   ///关联单号
        detailList: [], ///领用列表
        warehouseExitCancelTime: '',///退库时间
    }
}


const InitialSpareInput = ()=>{
    return {
        classroomId: null,
        isAllSystem: 0,
        nameOrCode: '',
        ownershipSystemId: null,
        pageNum: 1,
        pageSize: 20,
    }
}

const initialState = {
    ///新建备件出库 业务模型数组
    newDataInfo: InitialAddSpareOutStoreInfo(),
    ticketNo: '',    ///出库编号
    use: [],    ///出库用途
    submitInput: SubmitInputInitialStatus(),///提交出库 入参
    ///完成提交出库 请求状态
    spareOutStoreSubmitRequestStatus: RequestStatus.initial,///出库完成提交 请求状态

    ///选择备件
    loading: false,
    page: 1,
    spareListInput: InitialSpareInput(),///获取列表入参
    spareList: [],   ///备件列表

}

export default function spareOutStoreNewReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);

    switch (action.type) {
        case SpareOutStore_New_DataInfo_Save:
            nextState.newDataInfo = action.data;
            break;
        ///编号
        case SpareOutStore_New_Get_TicketNo_Request:
            break;
        case SpareOutStore_New_Get_TicketNo_Success:
            nextState.ticketNo = action.response;
            break;
        case SpareOutStore_New_Get_TicketNo_Error:
            break;
        ///用途
        case SpareOutStore_New_Get_DeviceDictionary_Request:
            break;
        case SpareOutStore_New_Get_DeviceDictionary_Success:
            nextState.use = action.response;
            break;
        case SpareOutStore_New_Get_DeviceDictionary_Error:
            break;
        ///完成提交  入参保存
        case SpareOutStore_New_Submit_Input_Save:
            nextState.submitInput = action.data;
            break;

        case SpareOutStore_New_Load_SparePartList_Request:
            nextState.loading = true;
            break;
        ///选择备件列表
        case SpareOutStore_New_Load_SparePartList_Input:
            nextState.spareListInput = action.data;
            break;
        case SpareOutStore_SparePartList_Save:
            nextState.spareList = action.data;
            break
        case SpareOutStore_New_Load_SparePartList_Success:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageNum === 1) {
                dataSource = responseResult.list;
            } else {
                dataSource = nextState.spareList.concat(responseResult.list);
            }
            nextState.page = responseResult.pageNum;
            nextState.spareList = dataSource;
            break;
        case SpareOutStore_New_Load_SparePartList_Error:
            nextState.loading = false;
            break;

        ///出库完成提交
        case SpareOutStore_Submit_Request:
            nextState.spareOutStoreSubmitRequestStatus = RequestStatus.loading;
            break;
        case SpareOutStore_Submit_Success:
            nextState.spareOutStoreSubmitRequestStatus = RequestStatus.success;
            break;
        case SpareOutStore_Submit_Error:
            nextState.spareOutStoreSubmitRequestStatus = RequestStatus.error;
            break;
        ///新增出库信息销毁
        case SpareOutStore_New_Destroy_Clear:
            nextState.newDataInfo = InitialAddSpareOutStoreInfo();
            nextState.submitInput = SubmitInputInitialStatus();
            nextState.ticketNo = '';
            nextState.spareOutStoreSubmitRequestStatus = RequestStatus.initial;
            break;
        ///选择备件销毁
        case SpareOutStore_Select_Spare_Destroy_Clear:
            nextState.page = 1;
            nextState.loading = false;
            nextState.spareListInput = InitialSpareInput();
            nextState.spareList = [];
            break;
    }
    return nextState || state;
}
