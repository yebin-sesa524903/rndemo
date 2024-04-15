import {
    Repair_Add_Destroy_Clear,
    Repair_Add_Get_Code_Error,
    Repair_Add_Get_Code_Request,
    Repair_Add_Get_Code_Success,
    Repair_Add_Load_Device_Error,
    Repair_Add_Load_Device_Input_Save,
    Repair_Add_Load_Device_Request,
    Repair_Add_Load_Device_Save_Device,
    Repair_Add_Load_Device_Success,
    Repair_Add_Load_RelateWorkOrders_Error,
    Repair_Add_Load_RelateWorkOrders_Request,
    Repair_Add_Load_RelateWorkOrders_Success,
    Repair_Add_RelateWorkOrders_Input_Save,
    Repair_Add_RelateWorkOrders_Save,
    Repair_Add_Save_Detail_Error,
    Repair_Add_Save_Detail_Input_Save,
    Repair_Add_Save_Detail_Request,
    Repair_Add_Save_Detail_Success,
    Repair_Add_Task_Save,
    Repair_Select_Device_Destroy_Clear,
    Repair_Select_Order_Destroy_Clear
} from "../../actions/repair/repairAction";

import {RequestStatus} from "../../middleware/api";
import {
    InitialAddRepairInfo,
} from "../../containers/fmcs/plantOperation/repair/add/RepairAddHelper";

const RepairSaveDetailInputInitial = () => {
    return {
        saveType: "submit",
        id: null,
        code: "",
        name: "",
        departmentCode: null,
        systemCode: null,
        deviceId: null,
        deviceName: "",
        type: "",
        source: "",
        relateCode: "",
        remark: "",
        executorIds: [],
        copiedIds: [],
        planDate: "",
        fileAttribute: '',
    }
}

const DeviceInputInitial = () => {
    return {
        page: 1,
        size: 20,
        parentId: [],
        deviceCodeOrName: null,///设备名称筛选
    }
}
const OrderInputInitial = ()=>{
    return {
        departmentCode: null,
        systemCode: null,
        deviceId: null,
        isAllSystem: 0,
        pageNum: 1,
        pageSize: 20,
        type: '',
        filter: null,///工单号 筛选条件
    }
}

const initialState = {
    addRepairInfo: InitialAddRepairInfo(),    ///故障报修业务数组模型
    orderCode: '',///工单编码
    saveRepairInput: RepairSaveDetailInputInitial(),///保存报修单 入参
    saveRepairRequestStatus: RequestStatus.initial,///保存保修单 请求状态

    ///设备列表
    devicesLoading: false,
    devicesPage: 1,
    deviceInput: DeviceInputInitial(),
    devices: [],///关联设备
    ///关联工单
    orderLoading: false,
    orderPage: 1,
    orderInput: OrderInputInitial(),
    relateOrders: [],///关联工单
}

export default function RepairAddReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
        case Repair_Add_Task_Save:
            nextState.addRepairInfo = action.data;
            break;
        case Repair_Add_Get_Code_Request:
        case Repair_Add_Get_Code_Error:
            break;
        case Repair_Add_Get_Code_Success:
            nextState.orderCode = action.response;
            break;

        case Repair_Add_Save_Detail_Input_Save:
            nextState.saveRepairInput = action.data;
            break;
        case Repair_Add_Save_Detail_Request:
            nextState.saveRepairRequestStatus = RequestStatus.loading;
            break;
        case Repair_Add_Save_Detail_Success:
            nextState.saveRepairRequestStatus = RequestStatus.success;
            break
        case Repair_Add_Save_Detail_Error:
            nextState.saveRepairRequestStatus = RequestStatus.error;
            break;

        ///选择设备
        case Repair_Add_Load_Device_Input_Save:
            nextState.deviceInput = action.data;
            break;
        case Repair_Add_Load_Device_Request:
            nextState.devicesLoading = true;
            break;
        case Repair_Add_Load_Device_Success:
            nextState.devicesLoading = false;
            const body1 = action.body;
            const responseResult1 = action.response;
            let dataSource1 = [];
            if (body1.page === 1) {
                dataSource1 = responseResult1.list;
            } else {
                dataSource1 = nextState.devices.concat(responseResult1.list);
            }
            nextState.devicesPage = responseResult1.pageNum;
            nextState.devices = dataSource1;
            break;
        case Repair_Add_Load_Device_Error:
            nextState.devicesLoading = false;
            break;

        case Repair_Add_Load_Device_Save_Device:
            nextState.devices = action.data;
            break;

        ///选择关联工单
        case Repair_Add_RelateWorkOrders_Input_Save:
            nextState.orderInput = action.data;
            break;

        case Repair_Add_Load_RelateWorkOrders_Request:
            nextState.orderLoading = true;
            break;
        case Repair_Add_Load_RelateWorkOrders_Success:
            nextState.orderLoading = false;
            const body2 = action.body;
            const responseResult2 = action.response;
            let dataSource2 = [];
            if (body2.pageNum === 1) {
                dataSource2 = responseResult2.list;
            } else {
                dataSource2 = nextState.relateOrders.concat(responseResult2.list);
            }
            nextState.page = responseResult2.pageNum;
            nextState.relateOrders = dataSource2;
            break;
        case Repair_Add_Load_RelateWorkOrders_Error:
            nextState.orderLoading = false;
            break;

        case Repair_Add_RelateWorkOrders_Save:
            nextState.relateOrders = action.data;
            break;

        case Repair_Select_Device_Destroy_Clear:
            nextState.devicesLoading = false;
            nextState.devicesPage = 1;
            nextState.deviceInput = DeviceInputInitial();
            nextState.devices = [];///关联设备
            break;
        case Repair_Select_Order_Destroy_Clear:
            nextState.orderLoading = false;
            nextState.orderPage = 1;
            nextState.orderInput = OrderInputInitial();
            nextState.relateOrders = [];
            break;
        case Repair_Add_Destroy_Clear:
            nextState.addRepairInfo = InitialAddRepairInfo();
            nextState.orderCode = '';
            nextState.saveRepairInput = RepairSaveDetailInputInitial();
            nextState.saveRepairRequestStatus = RequestStatus.initial;
            break;
    }

    return nextState || state;
}
