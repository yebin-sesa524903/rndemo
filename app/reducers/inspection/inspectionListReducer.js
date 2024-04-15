import {
    Inspection_List_Request,
    Inspection_List_Success,
    Inspection_List_Failure,
    Inspection_List_Input_Save,
    Inspection_Search_Text_Save,
    Inspection_DatePicker_Visible,
    InspectList_Destroy_Clear
} from "../../actions/inspection/inspectionAction";
import moment from "moment";
import {TimeFormatYMD} from "../../utils/const/Consts";

const InitialInput = () => {
    return {
        pageNum: 1,
        pageSize: 20,
        isAllSystem: 1,
        executeStatus: ['3'],
        departmentCodes: [],
        systemCodes: [],
        codeOrName: '',
        qrCode: '',
        planBeginDate: moment().format(TimeFormatYMD),
        planEndDate: moment().format(TimeFormatYMD),
    }
}

const initialData = {
    ///请求列表入参
    inspectionInput: InitialInput(),
    loading: false,
    page: 1,
    ///巡检列表结果
    results: [],
    ///搜索条件
    searchText: '',
    datePickerVisible: false,
}

export default function InspectionListReducer(state = initialData, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Inspection_List_Input_Save:
            nextState.inspectionInput = action.data;
            break;
        case Inspection_List_Request:
            nextState.loading = true;
            break;
        case Inspection_List_Success:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageNum === 1) {
                dataSource = responseResult.list;
            } else {
                dataSource = nextState.results.concat(responseResult.list);
            }
            nextState.page = responseResult.pageNum
            nextState.results = dataSource;
            break;
        case Inspection_List_Failure:
            nextState.loading = false;
            break;
        case Inspection_Search_Text_Save:
            nextState.searchText = action.data;
            break;
        case Inspection_DatePicker_Visible:
            nextState.datePickerVisible = action.data;
            break;
        case InspectList_Destroy_Clear:
            nextState.inspectionInput = InitialInput();
            nextState.loading = false;
            nextState.page = 1;
            nextState.searchText = '';
            nextState.results = [];
            break;
    }
    return nextState || state
}

