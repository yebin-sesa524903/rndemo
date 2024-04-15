import {
  ALARM_CODES_SUCCESS,
  ALARM_COUNT_SUCCESS,
  ALARM_DETAIL_RESET,
  ALARM_INFO_FAILURE,
  ALARM_INFO_REQUEST,
  ALARM_INFO_SUCCESS,
  ALARM_LIST_FAILURE,
  ALARM_LIST_REQUEST,
  ALARM_LIST_SUCCESS,
  ALARM_RESOLVE_FAILURE,
  ALARM_RESOLVE_REQUEST,
  ALARM_RESOLVE_SUCCESS,
  ALARM_TICKET_FAILURE,
  ALARM_TICKET_REQUEST,
  ALARM_TICKET_SUCCESS, HIERARCHY_LIST_FAILURE, HIERARCHY_LIST_REQUEST, HIERARCHY_LIST_SUCCESS,
} from "./actions";
import { RequestStatus } from "../../middleware/api";
import moment from "moment";

const initialState = {
  ywCount: 0,///业务报警个数
  ywAlarm: {
    loading: false,
    alarm: [],
    page: 1,
  },

  txCount: 0,///通讯报警个数
  txAlarm: {
    loading: false,
    alarm: [],
    page: 1,
  },
  ticketLoadStatus: RequestStatus.initial,
  alarmCodes: [],
  hierarchyList: [],
  hierarchyListFetching: false,
}

export function alarmList(state = initialState, action) {
  let nextState = Object.assign({}, state);
  ///默认1通讯类报警,业务报警2
  switch (action.type) {
    case ALARM_COUNT_SUCCESS:
      let count = action.response;
      if (action.body.alarmType === '2') {
        nextState.ywCount = count;
      } else if (action.body.alarmType === '1') {
        nextState.txCount = count;
      }
      break;
    case ALARM_LIST_REQUEST:
      if (action.body.businessType === 2) {
        nextState.ywAlarm.loading = true;
      } else if (action.body.businessType === 1) {
        nextState.txAlarm.loading = true;
      }
      break;
    case ALARM_LIST_SUCCESS:
      if (action.body.businessType === 2) {
        nextState.ywAlarm.loading = false;
        let dataSource = [];
        if (action.response.pageIndex === 1) {
          if ( action.response.list){
            dataSource = action.response.list;
          }
        } else {
          dataSource = nextState.ywAlarm.alarm.concat(action.response.list);
        }
        nextState.ywAlarm.page = action.response.pageIndex
        if (dataSource && dataSource?.length > 0) {
          dataSource.forEach((item) => item.businessStatus = action.body.businessStatus)
        }
        nextState.ywAlarm.alarm = dataSource;
      } else if (action.body.businessType === 1) {
        nextState.txAlarm.loading = false;
        let dataSource2 = [];
        if (action.response.pageIndex === 1) {
          if ( action.response.list){
            dataSource2 = action.response.list;
          }
        } else {
          dataSource2 = nextState.txAlarm.alarm.concat(action.response.list);
        }
        nextState.txAlarm.page = action.response.pageIndex
        if (dataSource2 && dataSource2?.length > 0) {
          dataSource2.forEach((item) => item.businessStatus = action.body.businessStatus)
        }
        nextState.txAlarm.alarm = dataSource2;
      }
      nextState.ticketLoadStatus = RequestStatus.initial;
      break;
    case ALARM_LIST_FAILURE:
      if (action.body.businessType === 2) {
        nextState.ywAlarm.loading = false;
      } else if (action.body.businessType === 1) {
        nextState.txAlarm.loading = false;
      }
      break;
    case ALARM_TICKET_REQUEST:
      nextState.ticketLoadStatus = RequestStatus.loading;
      break;
    case ALARM_TICKET_SUCCESS:
      ///获取工单集合;
      let tickets = action.response.list;
      let dataSource1 = [...nextState.ywAlarm.alarm];
      let dataSource2 = [...nextState.txAlarm.alarm];
      if (action.body.alarmType === 2) {
        ///业务报警
        for (let obj1 of dataSource1) {
          let founded = false;
          let ticketId = undefined;
          let createUserName = undefined;
          let createTime = undefined;
          for (const ticket of tickets) {
            if (ticket.ownerId === obj1.businessKey) {
              founded = true;
              ticketId = ticket.id;
              createUserName = ticket.createUserName;
              createTime = moment(ticket.createTime).unix();
              break;
            }
          }
          obj1.hasTicket = founded;
          obj1.ticketId = ticketId;
          obj1.createTime = createTime;
          obj1.createUserName = createUserName;
        }

      } else if (action.body.alarmType === 1) {
        ///通讯报警
        for (let obj2 of dataSource2) {
          let founded = false;
          let ticketId = undefined;
          let createUserName = undefined;
          let createTime = undefined;
          for (const ticket of tickets) {
            if (ticket.ownerId === obj2.businessKey) {
              founded = true;
              ticketId = ticket.id;
              createUserName = ticket.createUserName;
              createTime = moment(ticket.createTime).unix();
              break;
            }
          }
          obj2.hasTicket = founded;
          obj2.ticketId = ticketId;
          obj2.createTime = createTime;
          obj2.createUserName = createUserName;
        }
      }

      if (action.body.alarmType === 2) {
        nextState.ywAlarm.alarm = dataSource1;
      } else {
        nextState.txAlarm.alarm = dataSource2;
      }
      nextState.ticketLoadStatus = RequestStatus.success;
      break;
    case ALARM_TICKET_FAILURE:
      nextState.ticketLoadStatus = RequestStatus.error;
      break;
    case ALARM_CODES_SUCCESS:
      nextState.alarmCodes = action.response;
      break;
    case HIERARCHY_LIST_REQUEST:
      nextState.hierarchyListLoading = true;
      break;
    case HIERARCHY_LIST_SUCCESS:
      nextState.hierarchyList = action.response;
      nextState.hierarchyListLoading = false;
      break;
    case HIERARCHY_LIST_FAILURE:
      nextState.hierarchyListLoading = false;
      break;
  }
  return nextState || state;
}


const detailInitialState = {
  loading: false,
  alarmInfo: undefined,
  alarmResolveStatue: RequestStatus.initial,
}
export function alarmDetail(state = detailInitialState, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    case ALARM_INFO_REQUEST:
      nextState.loading = true;
      break;
    case ALARM_INFO_SUCCESS:
      nextState.loading = false;
      nextState.alarmInfo = action.response;
      break;
    case ALARM_INFO_FAILURE:
      nextState.loading = false;
      break;
    case ALARM_DETAIL_RESET:
      nextState.alarmInfo = action.data;
      nextState.alarmResolveStatue = RequestStatus.initial;
      break;
    case ALARM_RESOLVE_REQUEST:
      nextState.alarmResolveStatue = RequestStatus.loading;
      break;
    case ALARM_RESOLVE_SUCCESS:
      nextState.alarmResolveStatue = RequestStatus.success;
      break;
    case ALARM_RESOLVE_FAILURE:
      nextState.alarmResolveStatue = RequestStatus.error;
      break;
  }
  return nextState || state;
}
