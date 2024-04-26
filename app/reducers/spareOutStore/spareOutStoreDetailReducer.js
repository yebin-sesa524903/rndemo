import {
  SpareOutStore_Destroy_Clear,
  SpareOutStore_DetailInfo_Save,
  SpareOutStore_Load_Detail_Error,
  SpareOutStore_Load_Detail_Request,
  SpareOutStore_Load_Detail_Success,
  SpareOutStore_Save_WarehouseExit_Error,
  SpareOutStore_Save_WarehouseExit_Request,
  SpareOutStore_Save_WarehouseExit_Success,
  SpareOutStore_WarehouseExit_Input_Save,
} from "../../actions/spareOutStore/spareOutStoreAction";
import {
  InitialSpareOutStoreData
} from "../../containers/fmcs/plantOperation/spareOutStoreHouse/detail/SpareOutStoreHelper";
import { RequestStatus } from "../../middleware/api";

const InitialInput = () => {
  return {
    id: null,
    warehouseExitNo: "",
    use: "",///用途
    associatedVoucher: "",///关联单号
    recipient: "",///领用人
    warehouseExitTime: "",
    remark: "",
    classroomId: null,
    ownershipSystemId: null,
    updateTime: "",
    deviceId: '',
    deviceName: '',
    updateUser: "",
    detailList: [
    ]
  }
}

const initialState = {
  responseDetail: {},///备件出库详情接口返回
  spareOutStoreDataInfo: InitialSpareOutStoreData(),
  exitSaveInput: InitialInput(),    ///退库保存入参
  saveWarehouseExitRequestStatus: RequestStatus.initial,///退库保存 请求状态
}

function handleError(state, action) {
  let newState = state;// .set()
  return newState;
}

export default function spareOutStoreDetailReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case SpareOutStore_Load_Detail_Request:
      break;
    case SpareOutStore_Load_Detail_Success:
      nextState.responseDetail = action.response;
      break;
    case SpareOutStore_Load_Detail_Error:
      break;

    case SpareOutStore_DetailInfo_Save:
      nextState.spareOutStoreDataInfo = action.data;
      break;

    ///退库保存

    case SpareOutStore_WarehouseExit_Input_Save:
      nextState.exitSaveInput = action.data;
      break
    case SpareOutStore_Save_WarehouseExit_Request:
      nextState.saveWarehouseExitRequestStatus = RequestStatus.loading;
      break;
    case SpareOutStore_Save_WarehouseExit_Success:
      nextState.saveWarehouseExitRequestStatus = RequestStatus.success;
      break;
    case SpareOutStore_Save_WarehouseExit_Error:
      {
        nextState.saveWarehouseExitRequestStatus = RequestStatus.error;
        // return handleError(state, action);
        break;
      }

    case SpareOutStore_Destroy_Clear:
      nextState.responseDetail = {};
      nextState.exitSaveInput = InitialInput();
      nextState.spareOutStoreDataInfo = InitialSpareOutStoreData();
      nextState.saveWarehouseExitRequestStatus = RequestStatus.initial;
      break;
  }
  return nextState || state;
}
