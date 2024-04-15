import {
    Consumables_DatePicker_Visible,
    Consumables_List_Destroy_Clear,
    Consumables_List_Input_Save,
    Consumables_List_SearchText,
    Consumables_Load_List_Error,
    Consumables_Load_List_Request, Consumables_Load_List_Results_Save,
    Consumables_Load_List_Success
} from "../../actions/consumables/consumablesAction";
import moment from "moment";
import {TimeFormatYMD} from "../../utils/const/Consts";

const initialInput = () => {
    return {
        pageNum: 1,
        pageSize: 20,
        departmentCodes: [],
        systemCodes: [],
        status: '3',
        filter: '',
        qrCode: '',
        startTime: moment().format(TimeFormatYMD),
        endTime: moment().format(TimeFormatYMD),
      customerId: '',
    }
}

const initialState = {
    loading: false,
    page: 1,
    results: [],
    consumablesInput: initialInput(),
    searchText: '',///搜索文字变化
    datePickerVisible: false,   ///日期选择是否可见
}

export default function ConsumablesListReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Consumables_Load_List_Request:
            nextState.loading = true;
            break;
        case Consumables_Load_List_Success:
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
        case Consumables_Load_List_Error:
            nextState.loading = false;
            break;
        case Consumables_Load_List_Results_Save:
            nextState.results = action.data;
            break;


        case Consumables_List_Input_Save:
            nextState.consumablesInput = action.data;
            break;

        case Consumables_List_SearchText:
            nextState.searchText = action.data;
            break;

        case Consumables_DatePicker_Visible:
            nextState.datePickerVisible = action.data;
            break;
        case Consumables_List_Destroy_Clear:
            nextState.consumablesInput = initialInput();
            nextState.searchText = '';
            nextState.loading = false;
            nextState.datePickerVisible = false;
            nextState.results = [];
            break;
    }
    return nextState || state;
}
