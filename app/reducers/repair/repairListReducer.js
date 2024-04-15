import {
    Repair_DatePicker_Visible,
    Repair_List_Destroy_Clear,
    Repair_List_Error,
    Repair_List_Input_Save,
    Repair_List_Request, Repair_List_Results_Save,
    Repair_List_Success,
    Repair_Search_Text_Save
} from "../../actions/repair/repairAction";
import moment from "moment/moment";
import {TimeFormatYMD} from "../../utils/const/Consts";

const InitialListInput = ()=>{
    return {
        pageNum: 1,
        pageSize: 20,
        filter: '',
        status: ['4'],
        source: null,
        executorId: null,
        startTime: moment().format(TimeFormatYMD),
        endTime: moment().format(TimeFormatYMD),
        customerId: '',
        qrCode: '',
    }
};

const initialStatus = {
    loading: false,
    page: 1,
    results: [],
    repairInput: InitialListInput(),
    searchText:'',
    datePickerVisible: false,
}

export default function RepairListReducer(state = initialStatus, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Repair_List_Request:
            nextState.loading = true;
            break;
        case Repair_List_Success:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageNum === 1) {
                dataSource = responseResult.list;
            } else {
                dataSource = nextState.results.concat(responseResult.list);
            }
            nextState.page = responseResult.pageNum;
            nextState.results = dataSource;
            break;
        case Repair_List_Error:
            nextState.loading = false;
            break;
        case Repair_List_Results_Save:
            nextState.results = action.data;
            break;

        case Repair_List_Input_Save:
            nextState.repairInput = action.data;
            break;
        case Repair_Search_Text_Save:
            nextState.searchText = action.data;
            break;
        case Repair_DatePicker_Visible:
            nextState.datePickerVisible = action.data;
            break;

        case Repair_List_Destroy_Clear:
            nextState.repairInput = InitialListInput();
            nextState.searchText = '';
            nextState.loading = false;
            nextState.page = 1;
            nextState.results = [];
            break;

    }
    return nextState || state;
}
