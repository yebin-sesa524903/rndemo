import {
  Maintain_DatePicker_Visible, Maintain_Detail_Action_Sheet_Visible, Maintain_Detail_NFC_Sheet_Visible,
  Maintain_List_Destroy_Clear,
  Maintain_List_Input_Save,
  Maintain_Load_Task_List_Error,
  Maintain_Load_Task_List_Request,
  Maintain_Load_Task_List_Success,
  Maintain_Load_Task_Results_Save,
  Maintain_Search_Text_Save
} from "../../actions/maintain/maintainAction";
import moment from "moment";
import {TimeFormatYMD} from "../../utils/const/Consts";

const InitialInput = () => {
  return {
    pageNum: 1,
    pageSize: 20,
    filter: "",
    status: ['未开始'],
    departmentCodes: [],
    systemCodes: [],
    customerId: '',
    operatorId: null,
    qrCode: '',
    startTime: moment().format(TimeFormatYMD),
    endTime: moment().format(TimeFormatYMD),
  }
};

const initialListStatus = {
  maintainTasks: [],  ///保养列表 数据集合
  loading: false,
  page: 1,
  maintainInput: InitialInput(),///保养列表请求入参,
  searchText: '',
  datePickerVisible: false,

  actionSheet: {visible: false, data: {}},
  NFCSheet: {visible: false, data: {}},
}

export default function MaintainListReducer(state = initialListStatus, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case Maintain_List_Input_Save:
      nextState.maintainInput = action.data;
      break;
    case Maintain_Load_Task_List_Request:
      nextState.loading = true;
      break;
    case Maintain_Load_Task_List_Success:
      nextState.loading = false;
      const body = action.body;
      const responseResult = action.response;
      let dataSource = [];
      if (body.pageNum === 1) {
        dataSource = responseResult.list;
      } else {
        dataSource = nextState.maintainTasks.concat(responseResult.list);
      }
      nextState.page = responseResult.pageNum;
      nextState.maintainTasks = dataSource;
      break;
    case Maintain_Load_Task_List_Error:
      nextState.loading = false;
      break;
    case Maintain_Load_Task_Results_Save:
      nextState.maintainTasks = action.data;
      break;

    case Maintain_Search_Text_Save:
      nextState.searchText = action.data;
      break;

    case Maintain_DatePicker_Visible:
      nextState.datePickerVisible = action.data;
      break;
    case Maintain_Detail_Action_Sheet_Visible:
      nextState.actionSheet = action.data;
      break;
    case Maintain_Detail_NFC_Sheet_Visible:
      nextState.NFCSheet = action.data;
      break;

    case Maintain_List_Destroy_Clear:
      nextState.maintainInput = InitialInput();
      nextState.page = 1;
      nextState.loading = false;
      nextState.searchText = '';
      nextState.maintainTasks = [];
      break;

  }

  return nextState || state;
}
