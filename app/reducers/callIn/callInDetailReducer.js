import {
  Call_Alarm_Detail_DataInfo_Save,
  CallIn_Detail_DataInfo_Save,
  CallIn_Detail_Destroy_Clear, CallIn_Detail_Image_Review,
  CallIn_Load_Detail_Error,
  CallIn_Load_Detail_Request,
  CallIn_Load_Detail_Success,
  CallIn_Device_Detail_Success,
  CallIn_Order_Save_Error, CallIn_Order_Save_Input,
  CallIn_Order_Save_Request,
  CallIn_Order_Save_Success
} from "../../actions/callin/callInAction";
import {
  CallAlarmInitialDataInfo,
  CallInInitialDataInfo
} from "../../containers/fmcs/callin/callTicket/detail/CallInHelper";
import { RequestStatus } from "../../middleware/api";


const OrderSaveInputInitial = () => {
  return {
    orderId: '',
    subOrderId: '',
    content: '',
    files: [],
    isSave: false,
  }
}

const ImageReviewData = () => {
  return {
    visible: false,
    index: 0,
    images: [],
  }
}

const initialStates = {
  responseDetail: {},
  responseDeviceDetail: {},
  callInDataInfo: CallInInitialDataInfo(),
  callAlarmDataInfo: CallAlarmInitialDataInfo(),
  ///工单保存入参
  orderSaveInput: OrderSaveInputInitial(),

  imageReview: ImageReviewData(),
  ///工单保存请求状态
  orderSaveRequestStatus: RequestStatus.initial,
}

export default function CallInDetailReducer(state = initialStates, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///callIn工单详情数据
    case CallIn_Load_Detail_Request:
      break;
    case CallIn_Load_Detail_Success:
      nextState.responseDetail = action.response;
      break;
    case CallIn_Device_Detail_Success:
      // nextState.responseDetail["deviceName"] = action.response.DeviceName;
      nextState.responseDeviceDetail = action.response;
    case CallIn_Load_Detail_Error:
      break;
    ///工单详情业务模型数组
    case CallIn_Detail_DataInfo_Save:
      nextState.callInDataInfo = action.data;
      break;
    ///报警工单详情 业务模型数组
    case Call_Alarm_Detail_DataInfo_Save:
      nextState.callAlarmDataInfo = action.data;
      break;

    case CallIn_Order_Save_Input:
      nextState.orderSaveInput = action.data;
      break;
    ///工单保存 结果
    case CallIn_Order_Save_Request:
      nextState.orderSaveRequestStatus = RequestStatus.loading;
      break;
    case CallIn_Order_Save_Success:
      nextState.orderSaveRequestStatus = RequestStatus.success;
      break;
    case CallIn_Order_Save_Error:
      nextState.orderSaveRequestStatus = RequestStatus.error;
      break
    ///图片预览
    case CallIn_Detail_Image_Review:
      nextState.imageReview = action.data;
      break;

    case CallIn_Detail_Destroy_Clear:
      nextState.callInDataInfo = CallInInitialDataInfo();
      nextState.callAlarmDataInfo = CallAlarmInitialDataInfo();
      nextState.responseDetail = {};
      nextState.responseDeviceDetail = {};
      nextState.orderSaveInput = OrderSaveInputInitial();
      nextState.orderSaveRequestStatus = RequestStatus.initial;
      nextState.imageReview = ImageReviewData();
      break;
  }
  return nextState || state;
}
