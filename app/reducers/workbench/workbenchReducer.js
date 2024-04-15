import {
  Workbench_Destroy_Clear,
  Workbench_Get_Department_Codes_Error,
  Workbench_Get_Department_Codes_Request, Workbench_Get_Department_Codes_Success,
  Workbench_Get_Recent_Module_Error,
  Workbench_Get_Recent_Module_Request,
  Workbench_Get_Recent_Module_Success,
  Workbench_Update_Module_Error,
  Workbench_Update_Module_Request,
  Workbench_Update_Module_Success
} from "../../actions/workbench/workbenchAction";
import { RequestStatus } from "../../middleware/api";


const initialState = {
  modules: [],    ///常用功能列表集合
  updateRequestStatus: RequestStatus.initial,///更新常用列表的请求状态
  ///课室codes
  departmentCodes: [],
}

export default function WorkbenchReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case Workbench_Update_Module_Request:
      nextState.updateRequestStatus = RequestStatus.loading;
      break;
    case Workbench_Update_Module_Success:
      nextState.updateRequestStatus = RequestStatus.success;
      break;
    case Workbench_Update_Module_Error:
      nextState.updateRequestStatus = RequestStatus.error;
      break;

    case Workbench_Get_Recent_Module_Request:
      break;
    case Workbench_Get_Recent_Module_Success:
      nextState.modules = action.response.data;
      break;
    case Workbench_Get_Recent_Module_Error:
      break;

    case Workbench_Get_Department_Codes_Request:
      break;
    case Workbench_Get_Department_Codes_Success:
      nextState.departmentCodes = action.response;
      break;
    case Workbench_Get_Department_Codes_Error:
      break;
    case Workbench_Destroy_Clear:
      nextState.departmentCodes = [];
      nextState.modules = [];
      nextState.updateRequestStatus = RequestStatus.initial;
      break;
  }

  return nextState || state;
}
