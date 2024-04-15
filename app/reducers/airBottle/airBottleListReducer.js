import {
    Air_Bottle_Destroy_Clear,
    Air_Bottle_List_Failure, Air_Bottle_List_Input_Save,
    Air_Bottle_List_Request,
    Air_Bottle_List_Success, Air_Bottle_Scan_Value_Save, Air_Bottle_Search_Value_Save
} from "../../actions/airBottle/airBottleAction";

/**
 * 酸桶列表请求入参 初始值
 * @type {{pageItem: {pageSize: number, page: number}, status: string}}
 */
const AirBottleInitialInput = ()=>{
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
        deviceName:'',
        qrCode: '',
        status: 'FORE_BLOW',
    }
}


const initialBottle = {
    loading: false,
    page: 1,
    results: [],///气瓶列表集合
    airBottleListInput: AirBottleInitialInput(),///气瓶列表请求入参
    scanResult: '',///扫码结果
    searchText: '',///输入框输入结果
}

export default function AirBottleListReducer(state = initialBottle, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {

        case Air_Bottle_List_Input_Save:
            nextState.airBottleListInput = action.data;
            break;
        case Air_Bottle_Scan_Value_Save:
            nextState.scanResult = action.data;
            break;
        case Air_Bottle_Search_Value_Save:
            nextState.searchText = action.data;
            break;

        case Air_Bottle_List_Request:
            nextState.loading = true;
            break;
        case Air_Bottle_List_Success:
            nextState.loading = false;
            const body = action.body;
            const responseResult = action.response;
            let dataSource = [];
            if (body.pageItem.page === 1) {
                dataSource = responseResult.data;
            } else {
                dataSource = nextState.results.concat(responseResult.data);
            }
            nextState.page = responseResult.page
            nextState.results = dataSource;
            break;
        case Air_Bottle_List_Failure:
            nextState.loading = false;
            break;
        case Air_Bottle_Destroy_Clear:
            nextState.scanResult = '';
            nextState.searchText = '';
            nextState.airBottleListInput = AirBottleInitialInput();
            nextState.results = []
            break;
    }
    return nextState || state;
}
