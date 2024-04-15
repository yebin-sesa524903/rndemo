import {
  Call_In_Get_Hierarchy_Error,
  Call_In_Get_Hierarchy_Request, Call_In_Get_Hierarchy_Success,
  Call_In_Ticket_List_Destroy_Clear,
  Call_In_Ticket_List_Error,
  Call_In_Ticket_List_Input_Save,
  Call_In_Ticket_List_Request,
  Call_In_Ticket_List_Success, Call_In_Ticket_OrderAccept_Error,
  Call_In_Ticket_OrderAccept_Request,
  Call_In_Ticket_OrderAccept_Success
} from "../../actions/callin/callInAction";
import {RequestStatus} from "../../middleware/api";

const listInput = () => {
  return {
    page: 1,
    limit: 20,
    stateStr: 'pending',    ///processing/solved
    token: '',
  }
}

const initialStates = {
  page: 1,
  loading: false,
  input: listInput(),
  tickets: [],
  orderAcceptRequestStatus: RequestStatus.initial,
  departments: [],
}

export default function CallInListReducer(state = initialStates, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///课室信息
    case Call_In_Get_Hierarchy_Request:
      break;
    case Call_In_Get_Hierarchy_Success:
      nextState.departments = action.response.datas;
      break;
    case Call_In_Get_Hierarchy_Error:
      break;
      ///call in工单列表
    case Call_In_Ticket_List_Request:
      nextState.loading = true;
      break;
    case Call_In_Ticket_List_Success:
      nextState.loading = false;
      const body = action.body;
      const responseResult = action.response;
      let dataSource = [];
      if (body.page === 1) {
        dataSource = responseResult.rows;
      } else {
        dataSource = nextState.tickets.concat(responseResult.rows);
      }
      nextState.page = responseResult.page;
      nextState.tickets = dataSource;
      break;
    case Call_In_Ticket_List_Error:
      nextState.loading = false;
      break;

    case Call_In_Ticket_List_Input_Save:
      nextState.input = action.data;
      break;

    case Call_In_Ticket_OrderAccept_Request:
      nextState.orderAcceptRequestStatus = RequestStatus.loading;
      break;
    case Call_In_Ticket_OrderAccept_Success:
      nextState.orderAcceptRequestStatus = RequestStatus.success;
      break;
    case Call_In_Ticket_OrderAccept_Error:
      nextState.orderAcceptRequestStatus = RequestStatus.error;
      break;
    case Call_In_Ticket_List_Destroy_Clear:
      nextState.input = listInput();
      nextState.page = 1;
      nextState.loading = false;
      nextState.tickets = [];
      nextState.orderAcceptRequestStatus = RequestStatus.initial;
      nextState.departments = [];
      break;
  }
  return nextState || state;
}
