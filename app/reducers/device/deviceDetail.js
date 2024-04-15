import {
  DEVICE_DETAIL_CLEAR, DEVICE_DETAIL_STATUS_SUCCESS,
  DEVICE_LOAD_TICKETS_FAILED,
  DEVICE_LOAD_TICKETS_REQUEST,
  DEVICE_LOAD_TICKETS_SUCCESS,
  DeviceDetail_Destroy, DeviceDetail_DeviceConfig_Failed, DeviceDetail_DeviceConfig_Request,
  DeviceDetail_DeviceConfig_Success,
  DeviceDetail_Load_AlarmList_Failed,
  DeviceDetail_Load_AlarmList_Request,
  DeviceDetail_Load_AlarmList_Success,
  DeviceDetail_Load_RealtimeData_Failed,
  DeviceDetail_Load_RealtimeData_Request,
  DeviceDetail_Load_RealtimeData_Success,
  DeviceDetail_MappingList_Success,
  DeviceDetail_QueryEquipDataApi_Success,
  DeviceDetail_QueryEquipDataApi_YWCS_Success,
  DeviceDetail_Save_Alarms_Input,
  LOAD_API_OSS_PATH_SUCCESS,
  LOAD_DEVICE_DETAIL_FAILED,
  LOAD_DEVICE_DETAIL_REQUEST,
  LOAD_DEVICE_DETAIL_SUCCESS, LOAD_DEVICE_PARAMS_FAILED,
  LOAD_DEVICE_PARAMS_SUCCESS,
} from "../../actions/device/deviceAction";

import moment from 'moment';
import { getLanguage } from "../../utils/Localizations/localization";
import { isEmptyString } from "../../utils/const/Consts";

const TIME_FORMAT = 'YYYY-MM-DD';

const initState = () => {
  return {
    isFetching: null,
    isRealTimeRefresh: null,
    isNeedLoadRealTime: false,///记录是否需要逐条更新实时数据
    alarmsInput: { deviceId: '', pageNum: 1, pageSize: 20 },
    deviceConfig: [],
    deviceStatus: {},
    tickets: {
      isFetching: true,
      filter: {
        pageNo: 1,
        pageSize: 999,
        ticketTypes: ["2", "9", "10"]
      },
      data: []
    },
    inventorys: {
      isFetching: true,
      filter: {
        pageNo: 1,
        pageSize: 999,
        ticketTypes: [12, 11],
        orderByCreatedTime: true,
        ticketStatus: []
      },
      data: []
    }
  }
}

const BASIC_KEYS = ['设备型号', '生产厂商', '采购日期', '安装日期', '采购金额', '产品描述'];
const BASIC_KEYS_EN = ['Device Model', 'Manufacturer', 'Purchase Date', 'Installation Date', 'Purchase Price', 'Description'];

function getLocalKey(index) {
  let lang = getLanguage()
  switch (lang) {
    case 'en':
      return BASIC_KEYS_EN[index];
    default:
      return BASIC_KEYS[index];

  }
}

const deviceStatus = {
  '1': '正常',
  '2': '带病运行',
  '3': '备机',
  '4': '故障',
  '5': '未上线'
}

function composeData(state, action) {
  let ret = action.response;
  state.params = []//ret.properties || []
  // let deviceInfo = [
  //     {name:'设备ID',value:ret.id},
  //     {name:'设备编号',value:ret.deviceCode},
  //     {name:'资产编号',value:ret.serialNumber},
  //     {name:'设备分类',value:`${ret.deviceClass || '--'} / ${ret.deviceType || '--'} / ${ret.deviceSpecification || '--'}`},
  //     {name:'设备状态',value:deviceStatus[ret.status]},
  //     {name:'设备厂家',value:ret.factory},
  //     {name:'出厂日期',value:(!ret.factoryDate)?'--':moment(ret.factoryDate).format(TIME_FORMAT)},
  //     {name:'设备位置',value:ret.location},
  //     {name:'设备描述',value:ret.description},
  // ];
  state.deviceInfo = []//deviceInfo;
  state.data = ret;
  //这里取一次logo值
  let logo = ret.iconKey;
  if (ret.fieldGroupEntityList) {
    ret.fieldGroupEntityList.map(item => {
      if (item.fieldGroupName === '基本信息') {
        let data = item.fieldValueEntityList;
        if (data) {
          let findIndex = data.findIndex(_ => _.name === '图片' || _.code === 'logo');
          if (data[findIndex] && data[findIndex].value) {
            logo = JSON.parse(data[findIndex].value)[0].key;
          }
        }
      }
    })
  }
  state.data.logo = logo;
  return state;
}

function loadDeviceParams(state, action) {
  let ret = action.response;
  state.params = ret.ledgerParameters || [];

  let basicInfo = BASIC_KEYS.map((item, i) => {
    let index = state.params.findIndex(p => p.valueName === item);
    let find = state.params[index];
    if (index !== -1) {
      //找到了
      state.params.splice(index, 1)
      return {
        name: getLocalKey(i), value: find.valueText[0]
      }
    } else {
      //没找到
      return {
        name: getLocalKey(i), value: '-'
      }
    }
  })
  state.params = state.params.map(p => {
    return {
      name: p.valueName, value: p.valueText[0]
    }
  })
  // let deviceInfo = [
  //     {name:'设备ID',value:ret.id},
  //     {name:'设备编号',value:ret.deviceCode},
  //     {name:'资产编号',value:ret.serialNumber},
  //     {name:'设备分类',value:`${ret.deviceClass || '--'} / ${ret.deviceType || '--'} / ${ret.deviceSpecification || '--'}`},
  //     {name:'设备状态',value:deviceStatus[ret.status]},
  //     {name:'设备厂家',value:ret.factory},
  //     {name:'出厂日期',value:(!ret.factoryDate)?'--':moment(ret.factoryDate).format(TIME_FORMAT)},
  //     {name:'设备位置',value:ret.location},
  //     {name:'设备描述',value:ret.description},
  // ];
  state.deviceInfo = basicInfo;
  return state;
}

export default function (state = initState(), action) {
  let newState = { ...state };
  switch (action.type) {
    case LOAD_DEVICE_DETAIL_REQUEST:
      newState.isFetching = true;
      return newState;
    case LOAD_DEVICE_DETAIL_SUCCESS:
      newState = composeData(newState, action)
      return newState;
    case LOAD_DEVICE_PARAMS_SUCCESS:
      newState.isFetching = false;
      loadDeviceParams(newState, action);
      return newState;
    case LOAD_DEVICE_PARAMS_FAILED:
      newState.isFetching = false;
      return newState;
    case LOAD_DEVICE_DETAIL_FAILED:
      newState.isFetching = false;
      return newState;
    case DEVICE_DETAIL_CLEAR:
      return initState();

    case DeviceDetail_MappingList_Success:
      newState.mappingList = action.response;
      return newState;
    case DeviceDetail_QueryEquipDataApi_Success:
      newState.monitorData = action.response;
      return newState;
    case DeviceDetail_QueryEquipDataApi_YWCS_Success:
      newState.maintenanceData = action.response;
      return newState;
    case LOAD_API_OSS_PATH_SUCCESS:
      newState.ossPath = action.response;
      break;
    case DeviceDetail_Load_AlarmList_Request:
      break;
    case DeviceDetail_Load_AlarmList_Success:
      const body = action.body;
      const responseResult = action.response;
      let dataSource = [];
      if (body.pageNum === 1) {
        dataSource = responseResult.list;
      } else {
        dataSource = newState.alarmList.concat(responseResult.list);
      }
      newState.page = responseResult.pageNum;
      newState.alarmList = dataSource;
      return newState;
    case DeviceDetail_Load_AlarmList_Failed:
      break;
    case DeviceDetail_Save_Alarms_Input:
      newState.alarmsInput = action.data;
      return newState;
    case DeviceDetail_Load_RealtimeData_Success:
      let deviceConfig = newState.deviceConfig;
      let data = action.response;
      console.log('de', data, deviceConfig)
      if (data != null && data.id !== undefined) {
        for (const datum of deviceConfig) {
          if (datum.deviceParameterId == data.id) {
            if (!isEmptyString(data.val)) {
              datum.val = data.val;
            } else {
              if (datum.unit == '°C') {
                datum.val = '-';
              } else {
                datum.val = '0.00';
              }
            }
            break;
          }
        }
      } else {
        for (const datum of deviceConfig) {
          if (datum.deviceParameterId == action.body.parameter) {
            if (datum.unit == '°C') {
              datum.val = '-';
            } else {
              datum.val = '0.00';
            }
            break;
          }
        }
      }
      newState.deviceConfig = deviceConfig;
      newState.isNeedLoadRealTime = false;
      break;

    case DeviceDetail_DeviceConfig_Request:
      newState.isNeedLoadRealTime = false;
      newState.isRealTimeRefresh = true;
      break;
    case DeviceDetail_DeviceConfig_Success:
      newState.isNeedLoadRealTime = true;
      newState.isRealTimeRefresh = false;
      newState.deviceConfig = action.response;
      break;
    case DeviceDetail_DeviceConfig_Failed:
      newState.isRealTimeRefresh = false;
      break;

    case DEVICE_DETAIL_STATUS_SUCCESS:
      let status = action.response;
      if (status && status.length > 0) {
        newState.deviceStatus = status[0].deviceStatus;
      }
      break;

    case DEVICE_LOAD_TICKETS_REQUEST:
      if (action.isInventory) {
        newState.inventorys.isFetching = true;
      } else {
        newState.tickets.isFetching = true;
      }

      break;
    case DEVICE_LOAD_TICKETS_SUCCESS:
      let config = action.isInventory ? newState.inventorys : newState.tickets;
      config.isFetching = false;
      config.totalPage = action.response.pageTotal;
      config.total = action.response.total;
      config.filter.pageNo = action.response.current;
      config.data = action.response.list;
      console.log('config', config, action.isInventory)
      break;
    case DEVICE_LOAD_TICKETS_FAILED:
      if (action.isInventory) {
        newState.inventorys.isFetching = false;
        newState.inventorys.data = [];
      } else {
        newState.tickets.isFetching = false;
        newState.tickets.data = [];
      }
      break;
  }

  return newState;
}
