import {
  Receiving_Tools_Data_Data_Save,
  Repair_Basic_Message_Save,
  Repair_Detail_Destroy_Clear,
  Repair_Detail_File_List_Error,
  Repair_Detail_File_List_Request,
  Repair_Detail_File_List_Success,
  Repair_Detail_Get_Basic_Error,
  Repair_Detail_Get_Basic_Request,
  Repair_Detail_Get_Basic_Success,
  Repair_Detail_Get_RepairList_Error,
  Repair_Detail_Get_RepairList_Request,
  Repair_Detail_Get_RepairList_Success,
  Repair_Detail_Save_Repair_Input_Save,
  Repair_Detail_Save_RepairList_Error,
  Repair_Detail_Save_RepairList_Request,
  Repair_Detail_Save_RepairList_Success,
  Repair_Detail_Submit_Error,
  Repair_Detail_Submit_Request,
  Repair_Detail_Submit_Success,
  Spare_Parts_Replacement_Data_Save
} from "../../actions/repair/repairAction";
import {
  InitialBasicMsgData,
} from "../../containers/fmcs/plantOperation/repair/detail/RepairInitalStatus";
import {RequestStatus} from "../../middleware/api";

const RepairAddTaskInitialInput = () => {
  return {
    id: null,
    taskId: null,
    faultCause: '',
    faultPhenomenon: '',
    list: [],
  }
}

const initialState = {
  responseBasic: {},///维修任务基本信息 接口返回
  responseRepairList: undefined,///维修记录 接口返回

  basicMsgData: InitialBasicMsgData(),///基本执行展示数据
  sparePartsReplacementData: [],///备件更换展示数据
  receivingToolsData: [],    ///领用工具 展示数据

  addRecordsInput: RepairAddTaskInitialInput(),    ///添加维修记录 入参
  saveRepairRequestStatus: RequestStatus.initial,///保存维修记录 请求状态

  repairImages: [],    ///维修异常图片
  submitRequestStatus: RequestStatus.initial, ///提交维修详情请求状态
}

export default function RepairDetailReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///业务模型数组集合
    case Repair_Basic_Message_Save:
      nextState.basicMsgData = action.data;
      break;
    case Spare_Parts_Replacement_Data_Save:
      nextState.sparePartsReplacementData = action.data;
      break;
    case Receiving_Tools_Data_Data_Save:
      nextState.receivingToolsData = action.data;
      break;

    ///详情展示数据接口请求
    case Repair_Detail_Get_Basic_Request:
    case Repair_Detail_Get_Basic_Error:
      break;
    case Repair_Detail_Get_Basic_Success:
      nextState.responseBasic = action.response;
      break;
    ///维修详情获取维修列表
    case Repair_Detail_Get_RepairList_Request:
    case Repair_Detail_Get_RepairList_Error:
      break;
    case Repair_Detail_Get_RepairList_Success:
      nextState.responseRepairList = action.response;
      break;
    ///维修相关信息提交
    case Repair_Detail_Save_Repair_Input_Save:
      nextState.addRecordsInput = action.data;
      break;
    ///保存维修记录请求状态
    case Repair_Detail_Save_RepairList_Request:
      nextState.saveRepairRequestStatus = RequestStatus.loading;
      break;
    case Repair_Detail_Save_RepairList_Success:
      nextState.saveRepairRequestStatus = RequestStatus.success;
      break;
    case Repair_Detail_Save_RepairList_Error:
      nextState.saveRepairRequestStatus = RequestStatus.error;
      break;
    ///获取异常图片
    case Repair_Detail_File_List_Request:
      break;
    case Repair_Detail_File_List_Success:
      nextState.repairImages = action.response.imageList;
      break;
    case Repair_Detail_File_List_Error:
      break

    ///维修详情完成提交
    case Repair_Detail_Submit_Request:
      nextState.submitRequestStatus = RequestStatus.initial;
      break;
    case Repair_Detail_Submit_Success:
      nextState.submitRequestStatus = RequestStatus.success;
      break;
    case Repair_Detail_Submit_Error:
      nextState.submitRequestStatus = RequestStatus.error;
      break;

    case Repair_Detail_Destroy_Clear:
      nextState.basicMsgData = InitialBasicMsgData();
      nextState.responseBasic = {};
      nextState.responseRepairList = undefined;
      nextState.sparePartsReplacementData = [];
      nextState.receivingToolsData = [];
      nextState.saveRepairRequestStatus = RequestStatus.initial;
      nextState.addRecordsInput = RepairAddTaskInitialInput();
      nextState.submitRequestStatus = RequestStatus.initial;
      nextState.repairImages = [];
      break;

  }
  return nextState || state;
}
