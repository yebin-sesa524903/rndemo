import {
    Acid_Bucket_Input_Save,
    ACID_BUCKET_LIST_Destroy_Clear,
    ACID_BUCKET_LIST_FAILURE,
    ACID_BUCKET_LIST_REQUEST,
    ACID_BUCKET_LIST_SUCCESS,
    Acid_Bucket_Scan_Value_Save,
    Acid_Bucket_Search_Value_Save
} from "../../actions/acidBucket/acidBucketAction";

/**
 * 酸桶列表请求入参 初始值
 * @type {{pageItem: {pageSize: number, page: number}, status: string}}
 */
const listInitialInput = ()=>{
    return {
        pageItem: {
            page: 1,
            pageSize: 20,
            order: [
                {
                    field: 'planChangeTime',
                    order: "ASC"
                }
            ],
        },
        qrCode: '',
        status: 'FORE_EXECUTE',
    }
}

const initStatus = {
    loading: false,///加载指示
    page: 1,///当前页码
    results: [],    ///列表数据集合
    scanResult: '',///扫码结果
    searchText: '',///输入框输入结果
    ///获取列表请求入参
    listInput: listInitialInput(),
}

export default function AcidBucketListReducer(state = initStatus, action){
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Acid_Bucket_Input_Save:
            nextState.listInput = action.data;
            break;
        case Acid_Bucket_Scan_Value_Save:
            nextState.scanResult = action.data;
            break;
        case Acid_Bucket_Search_Value_Save:
            nextState.searchText = action.data;
            break;

        case ACID_BUCKET_LIST_REQUEST:
            nextState.loading = true;
            break
        case ACID_BUCKET_LIST_SUCCESS:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageItem.page === 1){
                dataSource = responseResult.data;
            }else{
                dataSource = nextState.results.concat(responseResult.data);
            }
            nextState.page = responseResult.page
            nextState.results = dataSource;
            break
        case ACID_BUCKET_LIST_FAILURE:
            nextState.loading = false;
            break
        case ACID_BUCKET_LIST_Destroy_Clear:
            nextState.listInput = listInitialInput();
            nextState.searchText = '';
            nextState.loading = false;
            nextState.page = 1;
            nextState.results = [];
            break;
    }
    return nextState || state;
}
