import {
    SpareTools_Load_Tool_Items_Request,
    SpareTools_Load_Tool_Items_Success,
    SpareTools_Load_Tool_Items_Error,
    SpareTools_Load_Tool_List_Request,
    SpareTools_Load_Tool_List_Success,
    SpareTools_Load_Tool_List_Error,
    SpareTools_Load_Add_Tools_Request,
    SpareTools_Load_Add_Tools_Success,
    SpareTools_Load_Add_Tools_Error,
    SpareTools_Remove_Tools_Request,
    SpareTools_Remove_Tools_Success,
    SpareTools_Remove_Tools_Error,
    SpareTools_Load_ChangeSpare_Request,
    SpareTools_Load_ChangeSpare_Success,
    SpareTools_Load_ChangeSpare_Error,
    SpareTools_Load_Spare_ExitList_Request,
    SpareTools_Load_Spare_ExitList_Error,
    SpareTools_Load_Spare_ExitList_Success,
    SpareTools_Add_ChangeSpareItem_Request,
    SpareTools_Add_ChangeSpareItem_Success,
    SpareTools_Add_ChangeSpareItem_Error,
    SpareTools_Remove_ChangeSpareItem_Request,
    SpareTools_Remove_ChangeSpareItem_Error,
    SpareTools_Remove_ChangeSpareItem_Success,
    SpareTools_Spare_ExitList_Input_Save,
    SpareTools_Update_Spare_List,
    SpareTools_SparePart_Destroy_Clear,
    SpareTools_Update_Tool_List,
    SpareTools_Tool_List_Input_Save,
    SpareTools_Tool_Destroy_Clear
} from "../../actions/spareTools/apareToolsAction";
import {RequestStatus} from "../../middleware/api";

const InitialSpareListInput = ()=>{
    return {
        classroomIds: [],
        ownerShipSystemIds: [],
        pageNum: 1,
        pageSize: 20,
        use: '',
        warehouseExitNo:'',
    }
}

const InitialToolListInput = ()=>{
    return {
        pageItem:{
            page: 1,
            pageSize: 20,
        },
        toolName: null,
    }
}

const initialListStatus = {
    toolItems: [],  ///某个任务关联的 工具列表
    toolLoading: false,
    toolPage: 1,
    toolListInput: InitialToolListInput(),    ///领用工具列表入参
    toolList: [], ///工具列表带分页 可选择列表
    addToolRequestStatus: RequestStatus.initial,    ///添加领用工具请求结果
    removeToolRequestStatus: RequestStatus.initial, ///移除领用工具请求结果

    sparePartItems: [], ///某个任务关联的 备件更换记录
    spareListInput: InitialSpareListInput(),///获取备件更换列表入参
    spareLoading: false,
    sparePage: 1,
    sparePartList: [],  ///备件更换列表 可选择列表
    addSparePartRequestStatus: RequestStatus.initial,   ///添加备件
    removeSparePartRequestStatus: RequestStatus.initial,///移除备件
}

export default function SpareToolsReducer(state = initialListStatus, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case SpareTools_Load_Tool_Items_Request:
            break;
        case SpareTools_Load_Tool_Items_Success:
            nextState.toolItems = action.response.data;
            break;
        case SpareTools_Load_Tool_Items_Error:
            break;

        ///领用工具列表
        case SpareTools_Tool_List_Input_Save:
            nextState.toolListInput = action.data;
            break;
        case SpareTools_Load_Tool_List_Request:
            nextState.toolLoading = true;
            break;
        case SpareTools_Load_Tool_List_Success:
            nextState.toolLoading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageItem.page === 1) {
                dataSource = responseResult.data;
            } else {
                dataSource = nextState.toolList.concat(responseResult.data);
            }
            nextState.toolPage = responseResult.page;
            nextState.toolList = dataSource;
            break;
        case SpareTools_Load_Tool_List_Error:
            nextState.toolLoading = false;
            break;

        case SpareTools_Update_Tool_List:
            nextState.toolList = action.data;
            break;

            ///添加领用工具
        case SpareTools_Load_Add_Tools_Request:
            nextState.addToolRequestStatus = RequestStatus.loading;
            break;
        case SpareTools_Load_Add_Tools_Success:
            nextState.addToolRequestStatus = RequestStatus.success;
            break;
        case SpareTools_Load_Add_Tools_Error:
            nextState.addToolRequestStatus = RequestStatus.error;
            break;

            ///移除领用工具
        case SpareTools_Remove_Tools_Request:
            nextState.removeToolRequestStatus = RequestStatus.loading;
            break;
        case SpareTools_Remove_Tools_Success:
            nextState.removeToolRequestStatus = RequestStatus.success;
            break;
        case SpareTools_Remove_Tools_Error:
            nextState.removeToolRequestStatus = RequestStatus.error;
            break;

        case SpareTools_Tool_Destroy_Clear:
            nextState.addToolRequestStatus = RequestStatus.initial;
            nextState.toolListInput = InitialToolListInput();
            nextState.toolPage = 1;
            nextState.toolLoading = false;
            nextState.toolList = [];
            nextState.removeToolRequestStatus = RequestStatus.initial;
            break;

            ///备件更换相关
        case SpareTools_Load_ChangeSpare_Request:
            break;
        case SpareTools_Load_ChangeSpare_Success:
            nextState.sparePartItems = action.response.list;
            break;
        case SpareTools_Load_ChangeSpare_Error:
            break;

        case SpareTools_Spare_ExitList_Input_Save:
            nextState.spareListInput = action.data;
            break;
            ///备件更换列表
        case SpareTools_Load_Spare_ExitList_Request:
            nextState.spareLoading = true;
            break;
        case SpareTools_Load_Spare_ExitList_Success:
            nextState.spareLoading = false;
            const body2 = action.body;
            const responseResult2 = action.response;
            let dataSource2 = [];
            if (body2.pageNum === 1) {
                dataSource2 = responseResult2.list;
            } else {
                dataSource2 = nextState.sparePartList.concat(responseResult2.list);
            }
            nextState.sparePage = responseResult2.pageNum;
            nextState.sparePartList = dataSource2;
            break;
        case SpareTools_Load_Spare_ExitList_Error:
            nextState.spareLoading = false;
            break;

        case SpareTools_Update_Spare_List:
            nextState.sparePartList = action.data;
            break;
            ///添加备件
        case SpareTools_Add_ChangeSpareItem_Request:
            nextState.addSparePartRequestStatus = RequestStatus.loading;
            break;
        case SpareTools_Add_ChangeSpareItem_Success:
            nextState.addSparePartRequestStatus = RequestStatus.success;
            break;
        case SpareTools_Add_ChangeSpareItem_Error:
            nextState.addSparePartRequestStatus = RequestStatus.error;
            break;

            ///移除备件
        case SpareTools_Remove_ChangeSpareItem_Request:
            nextState.removeSparePartRequestStatus = RequestStatus.loading;
            break;
        case SpareTools_Remove_ChangeSpareItem_Success:
            nextState.removeSparePartRequestStatus = RequestStatus.success;
            break;
        case SpareTools_Remove_ChangeSpareItem_Error:
            nextState.removeSparePartRequestStatus = RequestStatus.error;
            break;

        case SpareTools_SparePart_Destroy_Clear:
            nextState.addSparePartRequestStatus = RequestStatus.initial;
            nextState.spareListInput = InitialSpareListInput();
            nextState.removeSparePartRequestStatus = RequestStatus.initial;
            nextState.sparePage = 1;
            nextState.sparePartList = [];
            break;
    }
    return nextState || state;
}
