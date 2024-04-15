import {
    SpareRepertory_List_DatePicker_Visible,
    SpareRepertory_List_Destroy_Clear,
    SpareRepertory_List_Input_Save,
    SpareRepertory_List_Save_Search_Text,
    SpareRepertory_Load_List_Error,
    SpareRepertory_Load_List_Request,
    SpareRepertory_Load_List_Success
} from "../../actions/spareRepertory/spareRepertoryAction";
import moment from "moment";
import {TimeFormatYMD} from "../../utils/const/Consts";

const spareRepertoryInputInitial = () => {
    return {
        pageNo: 1,
        pageSize: 20,
        classroomIds: [],
        ownerShipSystemIds: [],
        status: ['NOT_STARTED'],
        qrCode: '',
        inventoryName: '',///筛选条件.
        isAllSystem: 1,
        startTime: moment().format(TimeFormatYMD) + ' 00:00:00',
        endTime: moment().format(TimeFormatYMD) + ' 23:59:59',
    }
}

const initialState = {
    loading: false,
    page: 1,
    spareRepertoryInput: spareRepertoryInputInitial(),  ///备件列表入参
    spareRepertoryList: [],  ///接口返回的备件出库列表
    searchText: '',
    datePickerVisible: false,
}

export default function spareRepertoryListReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case SpareRepertory_Load_List_Request:
            nextState.loading = true;
            break;
        case SpareRepertory_Load_List_Success:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageNo === 1) {
                dataSource = responseResult.list;
            } else {
                dataSource = nextState.spareRepertoryList.concat(responseResult.list);
            }
            nextState.page = responseResult.pageNum;
            nextState.spareRepertoryList = dataSource;
            break;
        case SpareRepertory_Load_List_Error:
            nextState.loading = false;
            break;

        case SpareRepertory_List_Input_Save:
            nextState.spareRepertoryInput = action.data;
            break;
        case SpareRepertory_List_Save_Search_Text:
            nextState.searchText = action.data;
            break;

        case SpareRepertory_List_DatePicker_Visible:
            nextState.datePickerVisible = action.data;
            break;
        case SpareRepertory_List_Destroy_Clear:
            nextState.spareRepertoryInput = spareRepertoryInputInitial();
            nextState.searchText = '';
            nextState.datePickerVisible = false;
            nextState.spareRepertoryList = [];
            break;
    }
    return nextState || state;
}
