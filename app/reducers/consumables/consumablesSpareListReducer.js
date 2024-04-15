import {RequestStatus} from "../../middleware/api";
import {
    Consumables_Detail_Load_Outbound_List_Error,
    Consumables_Detail_Load_Outbound_List_Request,
    Consumables_Detail_Load_Outbound_List_Success,
    Consumables_Detail_Save_List_Input,
    Consumables_Detail_SpareList_Destroy_Clear,
    Consumables_Detail_SpareList_Save
} from "../../actions/consumables/consumablesAction";


const listInputStatus = ()=>{
    return {
        pageNum :1,
        pageSize:20,
        classroomIds:[],
        ownerShipSystemIds:[],
        isAllSystem:0,
        use:"耗材更换"
    }
}


const initialStatus = {
    loading: false,
    page: 1,
    listInput: listInputStatus(),///入参保存
    sparePartList: [],  ///备件更换列表 可选择列表
}

export default function ConsumablesSpareListReducer(state = initialStatus, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Consumables_Detail_Save_List_Input:
            nextState.listInput = action.data;
            break;

        case Consumables_Detail_Load_Outbound_List_Request:
            nextState.loading = true;
            break;
        case Consumables_Detail_Load_Outbound_List_Success:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageNum === 1) {
                dataSource = responseResult.list;
            } else {
                dataSource = nextState.sparePartList.concat(responseResult.list);
            }
            nextState.page = responseResult.pageNum;
            nextState.sparePartList = dataSource;
            break;
        case Consumables_Detail_Load_Outbound_List_Error:
            nextState.loading = false;
            break;

        case Consumables_Detail_SpareList_Save:
            nextState.sparePartList = action.data;
            break;

        case Consumables_Detail_SpareList_Destroy_Clear:
            nextState.listInput = listInputStatus();
            nextState.page = 1;
            nextState.loading = false;
            break;

    }
    return nextState || state;
}
