import {
  Air_Bottle_Blowing_Change_GetState,
  Air_Bottle_Blowing_Edit_Failure,
  Air_Bottle_Blowing_Edit_Request,
  Air_Bottle_Blowing_Edit_Success,
  Air_Bottle_Blowing_GetState_Failure,
  Air_Bottle_Blowing_GetState_Request,
  Air_Bottle_Blowing_GetState_Success,
  Air_Bottle_Changing_Edit_Failure,
  Air_Bottle_Changing_Edit_Request,
  Air_Bottle_Changing_Edit_Success,
  Air_Bottle_Clear_Detail,
  Air_Bottle_Detail_Failure,
  Air_Bottle_Detail_Loading_Status_Update,
  Air_Bottle_Detail_Request,
  Air_Bottle_Detail_Success, Air_Bottle_In_Standby_Change_GetState,
  Air_Bottle_In_Standby_GetState_Failure,
  Air_Bottle_In_Standby_GetState_Request,
  Air_Bottle_In_Standby_GetState_Success,
  Air_Bottle_Standby_Edit_Failure,
  Air_Bottle_Standby_Edit_Request,
  Air_Bottle_Standby_Edit_Success,
  Air_Bottle_Users_Failure,
  Air_Bottle_Users_Request,
  Air_Bottle_Users_Success,
  Air_Bottle_Wait_Blow_Edit_Failure,
  Air_Bottle_Wait_Blow_Edit_Request,
  Air_Bottle_Wait_Blow_Edit_Success,
  Air_Bottle_Wait_Change_Edit_Failure,
  Air_Bottle_Wait_Change_Edit_Request,
  Air_Bottle_Wait_Change_Edit_Success,
  Air_Bottle_WaitStandby_Edit_Failure,
  Air_Bottle_WaitStandby_Edit_Request,
  Air_Bottle_WaitStandby_Edit_Success,
} from "../../actions/airBottle/airBottleAction";
import {RequestStatus} from "../../middleware/api";

const initialState = {
  loadingStatus: RequestStatus.initial,
  detail: {},
  users: [],
  waitBlowRequestStatus: RequestStatus.initial,
  blowingRequestStatus: RequestStatus.initial,
  ///待前吹 完成前气瓶状态检查 false 当前气瓶状态已不是已前吹; ture 是已前吹,可正常前吹完成
  airBottleBlowingState: -1,

  waitChangeRequestStatus: RequestStatus.initial,
  changingRequestStatus: RequestStatus.initial,
  waitStandbyRequestStatus: RequestStatus.initial,
  standbyRequestStatus: RequestStatus.initial,
  airBottleStandByState: -1,
}

export default function AirBottleDetailReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case Air_Bottle_Detail_Request:
      nextState.loadingStatus = RequestStatus.loading;
      break;
    case Air_Bottle_Detail_Success:
      nextState.loadingStatus = RequestStatus.success;
      let response = action.response;
      nextState.detail = response;
      break;
    case Air_Bottle_Detail_Failure:
      nextState.loadingStatus = RequestStatus.error;
      break;
    case Air_Bottle_Users_Request:
      break;
    case Air_Bottle_Users_Success:
      nextState.users = action.response;
      break;
    case Air_Bottle_Users_Failure:
      nextState.users = [];
      break;

    case Air_Bottle_Detail_Loading_Status_Update:
      nextState.loadingStatus = RequestStatus.initial;
      break;

    case Air_Bottle_Clear_Detail:
      nextState.detail = {};
      nextState.users = [];
      nextState.waitBlowRequestStatus = RequestStatus.initial;
      nextState.blowingRequestStatus = RequestStatus.initial;
      nextState.waitChangeRequestStatus = RequestStatus.initial;
      nextState.changingRequestStatus = RequestStatus.initial;
      nextState.waitStandbyRequestStatus = RequestStatus.initial;
      nextState.standbyRequestStatus = RequestStatus.initial;

      nextState.airBottleBlowingState = -1;

      nextState.airBottleStandByState = -1;
      break;
    ///待前吹
    case Air_Bottle_Wait_Blow_Edit_Request:
      nextState.waitBlowRequestStatus = RequestStatus.loading;
      break;
    case Air_Bottle_Wait_Blow_Edit_Success:
      nextState.waitBlowRequestStatus = RequestStatus.success;
      break;
    case Air_Bottle_Wait_Blow_Edit_Failure:
      nextState.waitBlowRequestStatus = RequestStatus.error;
      break;
    ///前吹中
    case Air_Bottle_Blowing_Edit_Request:
      nextState.blowingRequestStatus = RequestStatus.loading;
      break;
    case Air_Bottle_Blowing_Edit_Success:
      nextState.blowingRequestStatus = RequestStatus.success;
      break;
    case Air_Bottle_Blowing_Edit_Failure:
      nextState.blowingRequestStatus = RequestStatus.error;
      break;

    case Air_Bottle_Blowing_GetState_Request:
      break;
    case Air_Bottle_Blowing_GetState_Success:
      nextState.airBottleBlowingState = action.response;
      break;
    case Air_Bottle_Blowing_GetState_Failure:
      break;
    case Air_Bottle_Blowing_Change_GetState:
      nextState.airBottleBlowingState = action.data;
      break;

    ///待更换
    case Air_Bottle_Wait_Change_Edit_Request:
      nextState.waitChangeRequestStatus = RequestStatus.loading;
      break;
    case Air_Bottle_Wait_Change_Edit_Success:
      nextState.waitChangeRequestStatus = RequestStatus.success;
      break;
    case Air_Bottle_Wait_Change_Edit_Failure:
      nextState.waitChangeRequestStatus = RequestStatus.error;
      break;
    ///更换中
    case Air_Bottle_Changing_Edit_Request:
      nextState.changingRequestStatus = RequestStatus.loading;
      break;
    case Air_Bottle_Changing_Edit_Success:
      nextState.changingRequestStatus = RequestStatus.success;
      break;
    case Air_Bottle_Changing_Edit_Failure:
      nextState.changingRequestStatus = RequestStatus.error;
      break;
    ///待Standby
    case Air_Bottle_WaitStandby_Edit_Request:
      nextState.waitStandbyRequestStatus = RequestStatus.loading;
      break;
    case Air_Bottle_WaitStandby_Edit_Success:
      nextState.waitStandbyRequestStatus = RequestStatus.success;
      break;
    case Air_Bottle_WaitStandby_Edit_Failure:
      nextState.waitStandbyRequestStatus = RequestStatus.error;
      break;
    ///Standby中
    case Air_Bottle_Standby_Edit_Request:
      nextState.standbyRequestStatus = RequestStatus.loading;
      break;
    case Air_Bottle_Standby_Edit_Success:
      nextState.standbyRequestStatus = RequestStatus.success;
      break;
    case Air_Bottle_Standby_Edit_Failure:
      nextState.standbyRequestStatus = RequestStatus.error;
      break;

    case Air_Bottle_In_Standby_GetState_Request:
      break;
    case Air_Bottle_In_Standby_GetState_Success:
      nextState.airBottleStandByState = action.response;
      break;
    case Air_Bottle_In_Standby_GetState_Failure:
      break;
    case Air_Bottle_In_Standby_Change_GetState:
      nextState.airBottleStandByState = action.data;
      break
  }
  return nextState || state;
}
