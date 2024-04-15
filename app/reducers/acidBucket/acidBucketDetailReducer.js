import {
    Bucket_Detail_Clear_Action,
    BUCKET_DETAIL_FAILURE,
    BUCKET_DETAIL_REQUEST,
    BUCKET_DETAIL_SUCCESS,
    Bucket_Executing_Detail_Info,
    Bucket_Executing_Edit_Failure,
    Bucket_Executing_Edit_Request,
    Bucket_Executing_Edit_Success,
    Bucket_Executing_Input_Save,
    Bucket_ForExecute_Detail_Info,
    Bucket_ForExecute_Edit_Failure,
    Bucket_ForExecute_Edit_Input,
    Bucket_ForExecute_Edit_Request,
    Bucket_ForExecute_Edit_Success,
} from "../../actions/acidBucket/acidBucketAction";
import {RequestStatus} from "../../middleware/api";
import {
    AcidBucketDetailToDoData,
    AcidBucketDoingDetail,
} from "../../containers/fmcs/gasClass/acidBucket/detail/AcidBucketHelper";

/**
 * 待执行入参 初始值
 * @type {{confirm: string, confirmId: undefined, id: undefined, operatorId: undefined, operator: string, flow: boolean}}
 */
const ForExecuteInputInitial = ()=>{
    return {
        id: undefined,
        operator: '',
        operatorId: undefined,
        confirm: '',
        confirmId: undefined,
        flow: undefined,
        timeDate: undefined,
    }
}

/**
 * 执行中 入参初始值
 * @type {{actualStartTime: string, actualEndTime: string, remark: string, id: undefined, flow: undefined, serialNo: string}}
 */
const ExecutingInputInitial = ()=>{
    return {
        id: undefined,
        actualStartTime: '',
        actualEndTime: '',
        serialNo: '',
        remark: '',
        flow: undefined,
        timeDate: undefined,
    }
}

const initialState = {
    loading: false,
    detail: {},
    ///编辑待执行的请求状态
    forExecuteRequestStatus: RequestStatus.initial,
    ///编辑待执行的请求入参
    forExecuteInput: ForExecuteInputInitial(),
    ///待执行详情 业务模型数据
    forExecuteDetail: AcidBucketDetailToDoData(),

    ///编辑执行中请求状态
    executingRequestStatus: RequestStatus.initial,
    executingInput: ExecutingInputInitial(),
    ///编辑执行中详情 业务模型数据
    executingDetail: AcidBucketDoingDetail()
}

export default function AcidBucketDetailReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case BUCKET_DETAIL_REQUEST:
            nextState.loading = true;
            break;
        case BUCKET_DETAIL_SUCCESS:
            nextState.loading = false;
            let response = action.response;
            nextState.detail = response;
            break;
        case BUCKET_DETAIL_FAILURE:
            nextState.loading = false;
            break;
        ///清除详情
        case Bucket_Detail_Clear_Action:
            nextState.detail = {};
            nextState.forExecuteRequestStatus = RequestStatus.initial;
            nextState.executingRequestStatus = RequestStatus.initial;
            nextState.forExecuteInput = ForExecuteInputInitial();
            nextState.executingInput = ExecutingInputInitial();
            nextState.forExecuteDetail = AcidBucketDetailToDoData();
            nextState.executingDetail = AcidBucketDoingDetail();
            break;
        ///待执行 请求
        case Bucket_ForExecute_Detail_Info:
            ///转换详情数据
            nextState.forExecuteDetail = action.data;
            break;
        case Bucket_ForExecute_Edit_Input:
            ///更新编辑待执行 请求入参
            nextState.forExecuteInput = action.data;
            break;
            ///编辑待执行 请求结果
        case Bucket_ForExecute_Edit_Request:
            nextState.forExecuteRequestStatus = RequestStatus.loading;
            break;
        case Bucket_ForExecute_Edit_Success:
            nextState.forExecuteRequestStatus = RequestStatus.success;
            break;
        case Bucket_ForExecute_Edit_Failure:
            nextState.forExecuteRequestStatus = RequestStatus.error;
            break;
        ///执行中 请求
        case Bucket_Executing_Input_Save:
            nextState.executingInput = action.data;
            break;
        case Bucket_Executing_Detail_Info:
            nextState.executingDetail = action.data;
            break;
        case Bucket_Executing_Edit_Request:
            nextState.executingRequestStatus = RequestStatus.loading;
            break;
        case Bucket_Executing_Edit_Success:
            nextState.executingRequestStatus = RequestStatus.success;
            break;
        case Bucket_Executing_Edit_Failure:
            nextState.executingRequestStatus = RequestStatus.error;
            break;
    }
    return nextState || state;
}
