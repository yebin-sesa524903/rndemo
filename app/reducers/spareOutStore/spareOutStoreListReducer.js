import {
  SpareOutStore_List_DatePicker_Visible,
  SpareOutStore_List_Destroy_Clear,
  SpareOutStore_List_Input_Save,
  SpareOutStore_List_Save_Search_Text,
  SpareOutStore_Load_List_Error,
  SpareOutStore_Load_List_Request,
  SpareOutStore_Load_List_Success
} from "../../actions/spareOutStore/spareOutStoreAction";
import moment from "moment/moment";
import { TimeFormatYMD } from "../../utils/const/Consts";

const spareOutStoreInputInitial = () => {
  return {
    pageNum: 1,
    pageSize: 20,
    classroomIds: [],
    ownerShipSystemIds: [],
    isAllSystem: 1,
    qrCode: '',
    customerId: 0,
    warehouseExitNo: '',///筛选条件 备件名/备件编号.
    startTime: moment().format(TimeFormatYMD),
    endTime: moment().format(TimeFormatYMD),
  }
}

const initialState = {
  loading: false,
  page: 1,
  spareOutStoreInput: spareOutStoreInputInitial(),  ///备件列表入参
  spareOutStoreList: [],  ///接口返回的备件出库列表
  searchText: '',
  datePickerVisible: false,
}

export default function spareOutStoreListReducer(state = initialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case SpareOutStore_Load_List_Request:
      nextState.loading = true;
      break;
    case SpareOutStore_Load_List_Success:
      nextState.loading = false;
      const body = action.body;
      const responseResult = action.response;
      let dataSource = [];
      if (body.pageNum === 1) {
        dataSource = (Object.keys(responseResult).length === 0 || Object.keys(responseResult.list).length === 0) ? [] : responseResult.list;
      } else {
        dataSource = nextState.spareOutStoreList.concat(responseResult.list);
      }
      nextState.page = responseResult.pageNum;
      nextState.spareOutStoreList = dataSource;
      break;
    case SpareOutStore_Load_List_Error:
      nextState.loading = false;
      break;

    case SpareOutStore_List_Input_Save:
      nextState.spareOutStoreInput = action.data;
      break;
    case SpareOutStore_List_Save_Search_Text:
      nextState.searchText = action.data;
      break;

    case SpareOutStore_List_DatePicker_Visible:
      nextState.datePickerVisible = action.data;
      break;
    case SpareOutStore_List_Destroy_Clear:
      nextState.spareOutStoreInput = spareOutStoreInputInitial();
      nextState.page = 1;
      nextState.searchText = '';
      nextState.loading = false;
      nextState.spareOutStoreList = [];
      break;
  }
  return nextState || state;
}
