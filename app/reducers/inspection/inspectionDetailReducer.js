import {
  Inspection_Detail_Destroy_Clear,
  Inspection_Detail_Error,
  Inspection_Detail_Request,
  Inspection_Detail_Save_Task_Error,
  Inspection_Detail_Save_Task_Request,
  Inspection_Detail_Save_Task_Success,
  Inspection_Detail_Success,
  Inspection_Detail_Update_Project_Error,
  Inspection_Detail_Update_Project_Request,
  Inspection_Detail_Update_Project_Success,
  Inspection_Range_Error,
  Inspection_Range_Request,
  Inspection_Range_Success,
  Inspection_Task_Detail_Info_Save,
  Inspection_Task_Error,
  Inspection_Task_Request,
  Inspection_Task_Success,
  Inspection_Detail_Auto_ChaoBiao_Request,
  Inspection_Detail_Auto_ChaoBiao_Success,
  Inspection_Detail_Auto_ChaoBiao_Error,
  Inspection_Detail_Inspect_Sheet_Visible,
  Inspection_Detail_NFC_Sheet_Visible, Inspection_Task_Info_Save, Inspection_Task_Destroy_Clear
} from "../../actions/inspection/inspectionAction";
import { InitialDetailInfo } from "../../containers/fmcs/plantOperation/inspection/detail/InspectionStateHelper";
import { RequestStatus } from "../../middleware/api";

const InitialInput = () => {
  return {
    taskId: '',
    operatorId: '',
    isNormally: undefined,
    executeTime: '',
    remark: '',
    summary: '',
  }
}

const initialStats = {
  responseDetail: {}, ///巡检详情基本信息
  responseRange: {},///巡检范围 接口返回

  responseTask: {},///巡检作业 接口返回
  taskInfo:[],  ///巡检task
  responseAbbreviation: {},
  autoCBRequestStatus: RequestStatus.initial,///自动抄表请求状态
  inspectionDetailInfo: InitialDetailInfo(),///巡检详情 初始数据    数组深拷贝 进入详情修改了数组,下次进入保存了原来的修改

  projectTaskInfo: {}, ///更新巡检作业时的入参
  updateProjectRequestStatus: RequestStatus.initial,///更新巡检作业内容请求状态

  inspectSheet: {visible:false, data:{}},
  NFCSheet: {visible:false},

  saveTaskInput: InitialInput(),///保存巡检任务入参
  saveTaskRequestStatus: RequestStatus.initial,///保存巡检任务请求状态
}

export default function InspectionDetailReducer(state = initialStats, action) {
  let nextStatus = Object.assign({}, state);
  switch (action.type) {
    ///巡检详情
    case Inspection_Detail_Request:
      break;
    case Inspection_Detail_Success:
      nextStatus.responseDetail = action.response;
      break;
    case Inspection_Detail_Error:
      break;
    ///巡检范围
    case Inspection_Range_Request:
      break;
    case Inspection_Range_Success:
      nextStatus.responseRange = action.response;
      break;
    case Inspection_Range_Error:
      break;
    ///巡检作业
    case Inspection_Task_Request:
      break;
    case Inspection_Task_Success:
      nextStatus.responseTask = action.response;
      break;
    case Inspection_Task_Error:
      break;
      ///巡检作业页面展示数据模型数组
    case Inspection_Task_Info_Save:
      nextStatus.taskInfo = action.data;
      break;

    ///保存巡检详情基本信息业务模型数组
    case Inspection_Task_Detail_Info_Save:
      nextStatus.inspectionDetailInfo = action.data;
      break;

    case Inspection_Detail_Update_Project_Request:
      nextStatus.updateProjectRequestStatus = RequestStatus.loading;
      break;
    case Inspection_Detail_Update_Project_Success:
      nextStatus.updateProjectRequestStatus = RequestStatus.success;
      nextStatus.projectTaskInfo = action.body[0];
      break;
    case Inspection_Detail_Update_Project_Error:
      nextStatus.updateProjectRequestStatus = RequestStatus.error;
      break;

    case Inspection_Detail_Save_Task_Request:
      nextStatus.saveTaskRequestStatus = RequestStatus.loading;
      break;
    case Inspection_Detail_Save_Task_Success:
      nextStatus.saveTaskRequestStatus = RequestStatus.success;
      break;
    case Inspection_Detail_Save_Task_Error:
      nextStatus.saveTaskRequestStatus = RequestStatus.error;
      break;
    case Inspection_Detail_Inspect_Sheet_Visible:
      nextStatus.inspectSheet = action.data;
      break;
    case Inspection_Detail_NFC_Sheet_Visible:
      nextStatus.NFCSheet = action.data;
      break;

    case Inspection_Detail_Destroy_Clear:
      nextStatus.saveTaskRequestStatus = RequestStatus.initial;
      nextStatus.inspectionDetailInfo = InitialDetailInfo();
      nextStatus.saveTaskInput = InitialInput();
      nextStatus.projectTaskInfo = {};
      nextStatus.responseDetail = null;
      nextStatus.responseRange = null;
      nextStatus.inspectSheet = {visible:false, data:{}};
      nextStatus.NFCSheet = {visible:false};
      break;
    case Inspection_Detail_Auto_ChaoBiao_Request:
      nextStatus.autoCBRequestStatus = RequestStatus.loading;
      break;
    case Inspection_Detail_Auto_ChaoBiao_Success:
      nextStatus.autoCBRequestStatus = RequestStatus.success;
      nextStatus.responseAbbreviation = action.response;
      break;
    case Inspection_Detail_Auto_ChaoBiao_Error:
      nextStatus.autoCBRequestStatus = RequestStatus.error;
      break;
    case Inspection_Task_Destroy_Clear:
      nextStatus.responseTask = null;
      nextStatus.updateProjectRequestStatus = RequestStatus.initial;
      nextStatus.responseTask = null;
      nextStatus.taskInfo = [];
      nextStatus.autoCBRequestStatus = RequestStatus.initial;
      nextStatus.responseAbbreviation = {};
      break;
  }
  return nextStatus || state;
}
