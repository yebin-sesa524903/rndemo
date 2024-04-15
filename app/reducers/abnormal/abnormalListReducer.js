import {
    Abnormal_List_Request,
    Abnormal_List_Success,
    Abnormal_List_Failure,
    Abnormal_List_Search_Save,
    Abnormal_List_Input_Save, Abnormal_List_Destroy_Clear,
} from "../../actions/abnormal/abnormalAction";
import moment from "moment";
import {TimeFormatYMD} from "../../utils/const/Consts";

const initialInput = ()=>{
  return {
      filter: '', ///搜索
      status: ['4'], /// 状态 默认进来待执行
      source: null,
      executorId: null,
      startTime: moment().format(TimeFormatYMD),
      endTime: moment().format(TimeFormatYMD),
      pageNum: 1,
      pageSize: 20,
      userId: '',
      customerId: '',
      qrCode: '',
  }
}

const initialData = {
    abnormalInput: initialInput(),
    loading: false,///加载指示
    page: 1,
    results: [],    ///列表数据集合
    searchText: '',///输入框输入结果
}

export default function AbnormalListReducer(state = initialData, action) {
    let nextState = Object.assign({}, state)
    switch (action.type) {
        case Abnormal_List_Request:
            nextState.loading = true;
            break;
        case Abnormal_List_Success:
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
        case Abnormal_List_Failure:
            nextState.loading = false;
            break;
        case Abnormal_List_Search_Save:
            nextState.searchText = action.data;
            break;
        case Abnormal_List_Input_Save:
            nextState.abnormalInput = action.data;
            break;
        case Abnormal_List_Destroy_Clear:
            nextState.abnormalInput = initialInput();
            nextState.searchText = '';
            nextState.page = 1;
            nextState.results = [];
            break;

        default:
            break;
    }
    return nextState || state
}
