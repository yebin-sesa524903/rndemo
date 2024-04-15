import {
    Abnormal_Detail_Success,
    Abnormal_Detail_Request,
    Abnormal_Detail_Error,
    Abnormal_Record_list_Request,
    Abnormal_Record_list_Success,
    Abnormal_Record_list_Error,
    Abnormal_Save_Record_list_Request,
    Abnormal_Save_Record_list_Success,
    Abnormal_Save_Record_list_Error,
    Abnormal_Save_task_Request,
    Abnormal_Save_task_Success,
    Abnormal_Save_task_Error,
    Abnormal_Detail_Data_Info_Save,
    Abnormal_Detail_Task_Result_Save,
    Abnormal_Detail_Destroy_Clear
} from "../../actions/abnormal/abnormalAction";
import {InitialAbnormalData} from "../../containers/fmcs/plantOperation/abnormal/detail/AbnormalHelper";
import {RequestStatus} from "../../middleware/api";

const initialState = {
    responseBasic: {},///基本信息接口返回
    responseRecords: undefined,///点检记录接口返回
    abnormalDataInfo: InitialAbnormalData(),///构建的模型数组
    saveRecordRequestStatus: RequestStatus.initial, ///保存记录请求状态
    saveTaskRequestStatus: RequestStatus.initial,///保存点检任务请求状态

    taskResult: '', ///巡检结果
}


export default function AbnormalDetailReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Abnormal_Detail_Request:
            break;
        case Abnormal_Detail_Success:
            nextState.responseBasic = action.response
            break;
        case Abnormal_Detail_Error:
            break;
        case Abnormal_Detail_Data_Info_Save:
            nextState.abnormalDataInfo = action.data;
            break;


        case Abnormal_Record_list_Request:
            break;
        case Abnormal_Record_list_Success:
            nextState.responseRecords = action.response
            break;
        case Abnormal_Record_list_Error:
            break;

        case Abnormal_Save_Record_list_Request:
            nextState.saveRecordRequestStatus = RequestStatus.loading;
            break;
        case Abnormal_Save_Record_list_Success:
            nextState.saveRecordRequestStatus = RequestStatus.success;
            break;
        case Abnormal_Save_Record_list_Error:
            nextState.saveRecordRequestStatus = RequestStatus.error;
            break;

        case Abnormal_Detail_Task_Result_Save:
            nextState.taskResult = action.data;
            break;

        case Abnormal_Save_task_Request:
            nextState.saveTaskRequestStatus = RequestStatus.loading;
            break;
        case Abnormal_Save_task_Success:
            nextState.saveTaskRequestStatus = RequestStatus.success;
            break;
        case Abnormal_Save_task_Error:
            nextState.saveTaskRequestStatus = RequestStatus.error;
            break;

        case Abnormal_Detail_Destroy_Clear:
          nextState.responseBasic = {};
          nextState.responseRecords = undefined;
            nextState.abnormalDataInfo = InitialAbnormalData();
            nextState.recordComment = '';
            nextState.taskResult = '';
            nextState.saveRecordRequestStatus = RequestStatus.initial;
            nextState.saveTaskRequestStatus = RequestStatus.initial;
            break;
        default:
            break;
    }
    return nextState || state
}
