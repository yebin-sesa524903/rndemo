import {
    Maintain_Load_Basic_Msg_Request,
    Maintain_Load_Basic_Msg_Success,
    Maintain_Load_Basic_Msg_Error,
    Maintain_Save_Basic_Msg,
    Maintain_Load_Task_Request,
    Maintain_Load_Task_Success,
    Maintain_Load_Task_Error,
    Maintain_Save_Spare_Parts_Replacement,
    Maintain_Save_Receiving_Tools,
    Maintain_Update_Execute_Request,
    Maintain_Update_Execute_Success,
    Maintain_Update_Execute_Error,
    Maintain_Save_TaskData_Request,
    Maintain_Save_TaskData_Success,
    Maintain_Save_TaskData_Error,
    Maintain_Update_Execute_Input_Save,
    Maintain_TaskData_Input_Save,
    Maintain_Destroy_Clear
} from "../../actions/maintain/maintainAction";
import {
    InitialBasicMsg,
} from "../../containers/fmcs/plantOperation/maintain/detail/MaintainStateHelper";
import {RequestStatus} from "../../middleware/api";

export const InitialUpdateInput = ()=>{
    return {
        id: '',
        executeResult: '',
        remark: '',
        executorId: '',
        executorName: '',
      executorType: 1,
    }
}

export const InitialTaskInput = ()=>{
    return {
        exceptionSummary: '',
        operationSummary: '',
        taskId: '',
        userId: '',
        userName: '',
        isFinished: true,
        executionMethod: "App执行",
    }
}

const initialListStatus = {
    responseBasic: {},///保养任务基本信息 接口返回
    responseTask: undefined,///保养任务项目 接口返回
    basicMsgData: InitialBasicMsg(),   ///保养任务详情 基本信息 业务模型数组
    sparePartsReplacementData: [],  ///备件 更换
    receivingToolsData: [], ///领用工具

    updateTaskInput: InitialUpdateInput(),
    updateTaskStatus: RequestStatus.initial,///更新任务保养项目执行状态 的请求结果
    saveTaskInput: InitialTaskInput(),
    saveTaskDataStatus: RequestStatus.initial,  ///更新保养任务 编辑异常总结/设备运行等数据
}

export default function MaintainDetailReducer(state = initialListStatus, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        /// 查询保养任务基本信
        case Maintain_Load_Basic_Msg_Request:
            break;
        case Maintain_Load_Basic_Msg_Success:
            nextState.responseBasic = action.response;
            break;
        case Maintain_Load_Basic_Msg_Error:
            break;
        ////查询保养任务项目列表
        case Maintain_Load_Task_Request:
            break;
        case Maintain_Load_Task_Success:
            nextState.responseTask = action.response;
            break;
        case Maintain_Load_Task_Error:
            break;
        ///保养任务基本信息业务数据保存
        case Maintain_Save_Basic_Msg:
            nextState.basicMsgData = action.data;
            break;
        ///备件更换业务数据保存
        case Maintain_Save_Spare_Parts_Replacement:
            nextState.sparePartsReplacementData = action.data;
            break;
        ///领用工具业务数据保存
        case Maintain_Save_Receiving_Tools:
            nextState.receivingToolsData = action.data;
            break;
        ///更新保养项目执行状态 请求
        case Maintain_Update_Execute_Input_Save:
            nextState.updateTaskInput = action.data;
            break;
        case Maintain_Update_Execute_Request:
            nextState.updateTaskStatus = RequestStatus.loading;
            break;
        case Maintain_Update_Execute_Success:
            nextState.updateTaskStatus = RequestStatus.success;
            break;
        case Maintain_Update_Execute_Error:
            nextState.updateTaskStatus = RequestStatus.error;
            break;
        ///任务执行信息更新
        case Maintain_TaskData_Input_Save:
            nextState.saveTaskInput = action.data;
            break;
        case Maintain_Save_TaskData_Request:
            nextState.saveTaskDataStatus = RequestStatus.loading;
            break;
        case Maintain_Save_TaskData_Success:
            nextState.saveTaskDataStatus = RequestStatus.success;
            break;
        case Maintain_Save_TaskData_Error:
            nextState.saveTaskDataStatus = RequestStatus.error;
            break;
        ///页面销毁 还原一些数值
        case Maintain_Destroy_Clear:
            nextState.responseBasic = {};
            nextState.responseTask = undefined;
            nextState.updateTaskStatus = RequestStatus.initial;
            nextState.saveTaskDataStatus = RequestStatus.initial;
            nextState.basicMsgData = InitialBasicMsg();
            nextState.updateTaskInput = InitialUpdateInput();
            nextState.saveTaskInput = InitialTaskInput();
            break;
    }

    return nextState || state;
}
