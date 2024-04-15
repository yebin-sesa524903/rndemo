'use strict';


export const MONITION_LOAD_REQUEST = 'MONITION_LOAD_REQUEST';
export const MONITION_LOAD_SUCCESS = 'MONITION_LOAD_SUCCESS';
export const MONITION_LOAD_FAILURE = 'MONITION_LOAD_FAILURE';

const BILL_LIST_URL = [
  '/ticketapi/v1/ticket/list/commandticket',
  '/ticketapi/v1/ticket/list/operationticket',
  '/ticketapi/v1/work/list'
]

export function loadMonitions(body,billType){
  return (dispatch, getState) => {
    return dispatch({
      types: [MONITION_LOAD_REQUEST, MONITION_LOAD_SUCCESS, MONITION_LOAD_FAILURE],
      url: BILL_LIST_URL[billType],
      body
    });

  }
}

export const MONITION_CHANGE_TAB = 'MONITION_CHANGE_TAB';

export function monitionChangeTab(data){
  return (dispatch, getState) => {
    return dispatch({
      type: MONITION_CHANGE_TAB,
      data
    });

  }
}

export const MONITION_LOAD_BYID_REQUEST = 'MONITION_LOAD_BYID_REQUEST';
export const MONITION_LOAD_BYID_SUCCESS = 'MONITION_LOAD_BYID_SUCCESS';
export const MONITION_LOAD_BYID_FAILURE = 'MONITION_LOAD_BYID_FAILURE';

export function loadAlarmById(alarmId,isHex){
  return (dispatch, getState) => {
    return dispatch({
        types: [MONITION_LOAD_BYID_REQUEST, MONITION_LOAD_BYID_SUCCESS, MONITION_LOAD_BYID_FAILURE],
        url: isHex?`/popapi/api/alarm/${alarmId}`:`/popapi/api/alarm/detail/${alarmId}`,
        data:{alarmId}
    });

  }
}

export const MONITION_RESET = 'MONITION_RESET';
export function resetAlarm(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_RESET,
      data
    });
  }
}

export const MONITION_FILTER_CHANGED = 'MONITION_FILTER_CHANGED';

export function filterChanged(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FILTER_CHANGED,
      data
    });
  }
}

export const MONITION_BUILDING_FOLDER = 'MONITION_BUILDING_FOLDER';

export function alarmBuldingFolder(cid){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_BUILDING_FOLDER,
      cid
    });
  }
}

export const MONITION_FILTER_REMOVE_BUILDING_DATA = 'MONITION_FILTER_REMOVE_BUILDING_DATA';

export function clearBuildingsData(){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FILTER_REMOVE_BUILDING_DATA,
    });
  }
}

export const MONITION_FILTER_PARAM_RESET = 'MONITION_FILTER_PARAM_RESET';

export function resetCurrentAlarmFilterParam(){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FILTER_PARAM_RESET,
    });
  }
}

export const MONITION_FILTER_CLOSED = 'MONITION_FILTER_CLOSED';

export function filterClosed(){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FILTER_CLOSED,
    });
  }
}

export const MONITION_FILTER_DIDCHANGED = 'MONITION_FILTER_DIDCHANGED';
export function filterDidChanged(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FILTER_DIDCHANGED,
      data
    });
  }
}

export const MONITION_FIRSTPAGE = 'MONITION_FIRSTPAGE';
export function firstPage(){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FIRSTPAGE,
    });
  }
}

export const MONITION_NEXT_PAGE = 'MONITION_NEXT_PAGE';
export function nextPage(){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_NEXT_PAGE,
    });
  }
}

export const MONITION_FILTER_CLEAR_RESULT = 'MONITION_FILTER_CLEAR_RESULT';
export function clearFilterResult(){
  return (dispatch,getState)=>{
    return dispatch({
      type:MONITION_FILTER_CLEAR_RESULT,
    });
  }
}

export const MONITION_CODE_REQUEST = 'MONITION_CODE_REQUEST';
export const MONITION_CODE_SUCCESS = 'MONITION_CODE_SUCCESS';
export const MONITION_CODE_FAILURE = 'MONITION_CODE_FAILURE';
export function loadAlarmCode(body={}){
  return (dispatch,getState)=>{
    return dispatch({
        types: [MONITION_CODE_REQUEST, MONITION_CODE_SUCCESS, MONITION_CODE_FAILURE],
        url: '/popapi/api/alarm/codes',
        body
    });
  }
}


export const MONITION_BUILDING_REQUEST = 'MONITION_BUILDING_REQUEST';
export const MONITION_BUILDING_SUCCESS = 'MONITION_BUILDING_SUCCESS';
export const MONITION_BUILDING_FAILURE = 'MONITION_BUILDING_FAILURE';
export function loadAlarmBuildings(){
  return (dispatch,getState)=>{
    return dispatch({
        types: [MONITION_BUILDING_REQUEST, MONITION_BUILDING_SUCCESS, MONITION_BUILDING_FAILURE],
        url: '/popapi/api/building/myBuildings',
        body:{
          //orderByName:true
        }
    });
  }
}

export const SUBSTATION_LIST_REQUEST = 'SUBSTATION_LIST_REQUEST';
export const SUBSTATION_LIST_SUCCESS = 'SUBSTATION_LIST_SUCCESS';
export const SUBSTATION_LIST_FAILURE = 'SUBSTATION_LIST_FAILURE';
export function getSubstationList(){
  return (dispatch,getState)=>{
    return dispatch({
      types: [SUBSTATION_LIST_REQUEST, SUBSTATION_LIST_SUCCESS, SUBSTATION_LIST_FAILURE],
      url: `/ticketapi/v1/hierarchy/listSubstationHierarchy`,
      body:{}
    });
  }
}

export const COMMAND_BILL_BY_ID_REQUEST = 'COMMAND_BILL_BY_ID_REQUEST';
export const COMMAND_BILL_BY_ID_SUCCESS = 'COMMAND_BILL_BY_ID_SUCCESS';
export const COMMAND_BILL_BY_ID_FAILURE = 'COMMAND_BILL_BY_ID_FAILURE';
export function getCommandBillById(id){
  return (dispatch,getState)=>{
    return dispatch({
      types: [COMMAND_BILL_BY_ID_REQUEST, COMMAND_BILL_BY_ID_SUCCESS, COMMAND_BILL_BY_ID_FAILURE],
      url: `/ticketapi/v1/commandticket/view/${id}`,
    });
  }
}

export const COMMAND_BILL_SAVE_REQUEST = 'COMMAND_BILL_SAVE_REQUEST';
export const COMMAND_BILL_SAVE_SUCCESS = 'COMMAND_BILL_SAVE_SUCCESS';
export const COMMAND_BILL_SAVE_FAILURE = 'COMMAND_BILL_SAVE_FAILURE';
export function saveCommandBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [COMMAND_BILL_SAVE_REQUEST, COMMAND_BILL_SAVE_SUCCESS, COMMAND_BILL_SAVE_FAILURE],
      url: `/ticketapi/v1/commandticket/save`,
      body:data
    });
  }
}

export const COMMAND_BILL_GENERATE_OPERATE_BILL_REQUEST = 'COMMAND_BILL_GENERATE_OPERATE_BILL_REQUEST';
export const COMMAND_BILL_GENERATE_OPERATE_BILL_SUCCESS = 'COMMAND_BILL_GENERATE_OPERATE_BILL_SUCCESS';
export const COMMAND_BILL_GENERATE_OPERATE_BILL_FAILURE = 'COMMAND_BILL_GENERATE_OPERATE_BILL_FAILURE';
export function generateOperateBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [COMMAND_BILL_GENERATE_OPERATE_BILL_REQUEST, COMMAND_BILL_GENERATE_OPERATE_BILL_SUCCESS, COMMAND_BILL_GENERATE_OPERATE_BILL_FAILURE],
      url: `/ticketapi/v1/commandticket/generateoperate/${id}`,
      body:data
    });
  }
}

export const COMMAND_BILL_GENERATE_JOB_BILL_REQUEST = 'COMMAND_BILL_GENERATE_JOB_BILL_REQUEST';
export const COMMAND_BILL_GENERATE_JOB_BILL_SUCCESS = 'COMMAND_BILL_GENERATE_JOB_BILL_SUCCESS';
export const COMMAND_BILL_GENERATE_JOB_BILL_FAILURE = 'COMMAND_BILL_GENERATE_JOB_BILL_FAILURE';
export function generateJobBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [COMMAND_BILL_GENERATE_JOB_BILL_REQUEST, COMMAND_BILL_GENERATE_JOB_BILL_SUCCESS, COMMAND_BILL_GENERATE_JOB_BILL_FAILURE],
      url: `/ticketapi/v1/commandticket/generatejob/${id}`,
      body:data
    });
  }
}

export const COMMAND_BILL_Fill_REQUEST = 'COMMAND_BILL_Fill_REQUEST';
export const COMMAND_BILL_Fill_SUCCESS = 'COMMAND_BILL_Fill_SUCCESS';
export const COMMAND_BILL_Fill_FAILURE = 'COMMAND_BILL_Fill_FAILURE';
export function fillCommandBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [COMMAND_BILL_Fill_REQUEST, COMMAND_BILL_Fill_SUCCESS, COMMAND_BILL_Fill_FAILURE],
      url: `/ticketapi/v1/commandticket/supplement`,
      body:data
    });
  }
}

export const PERSON_DATA_LOAD_REQUEST = 'PERSON_DATA_LOAD_REQUEST';
export const PERSON_DATA_LOAD_SUCCESS = 'PERSON_DATA_LOAD_SUCCESS';
export const PERSON_DATA_LOAD_FAILURE = 'PERSON_DATA_LOAD_FAILURE';
export function loadPersonData(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [PERSON_DATA_LOAD_REQUEST, PERSON_DATA_LOAD_SUCCESS, PERSON_DATA_LOAD_FAILURE],
      url: `/ticketapi/v1/template/listPersonnel/${data.hierarchyId}`,
      body:data
    });
  }
}

export const SUBSTATION_ASSETS_LOAD_REQUEST = 'SUBSTATION_ASSETS_LOAD_REQUEST';
export const SUBSTATION_ASSETS_LOAD_SUCCESS = 'SUBSTATION_ASSETS_LOAD_SUCCESS';
export const SUBSTATION_ASSETS_LOAD_FAILURE = 'SUBSTATION_ASSETS_LOAD_FAILURE';
export function loadSubstationAsset(data,fromJob){
  return (dispatch,getState)=>{
    return dispatch({
      types: [SUBSTATION_ASSETS_LOAD_REQUEST, SUBSTATION_ASSETS_LOAD_SUCCESS, SUBSTATION_ASSETS_LOAD_FAILURE],
      url: `/ticketapi/v1/hierarchy/listRoomAndCircuitHierarchy`,
      fromJob,
      body:data
    });
  }
}

export const COMMAND_INIT = 'COMMAND_INIT';
export function initCommand(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:COMMAND_INIT,
      initData:data
    });
  }
}

export const OPERATE_INIT = 'OPERATE_INIT';
export function initOperate(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:OPERATE_INIT,
      initData:data
    });
  }
}

export const OPERATE_BILL_TPL_REQUEST = 'OPERATE_BILL_TPL_REQUEST';
export const OPERATE_BILL_TPL_SUCCESS = 'OPERATE_BILL_TPL_SUCCESS';
export const OPERATE_BILL_TPL_FAILURE = 'OPERATE_BILL_TPL_FAILURE';
export function loadOperateBillTemplates(cid){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_TPL_REQUEST, OPERATE_BILL_TPL_SUCCESS, OPERATE_BILL_TPL_FAILURE],
      url: `/ticketapi/v1/template/listTicketTemplateByType/${cid}/1`,
      body:{}
    });
  }
}

export const OPERATE_BILL_STEPS_REQUEST = 'OPERATE_BILL_STEPS_REQUEST';
export const OPERATE_BILL_STEPS_SUCCESS = 'OPERATE_BILL_STEPS_SUCCESS';
export const OPERATE_BILL_STEPS_FAILURE = 'OPERATE_BILL_STEPS_FAILURE';
export function loadOperateBillSteps(tid){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_STEPS_REQUEST, OPERATE_BILL_STEPS_SUCCESS, OPERATE_BILL_STEPS_FAILURE],
      url: `/ticketapi/v1/template/operationTemplateInfo/${tid}`,
      body:{}
    });
  }
}

export const OPERATE_BILL_LOAD_BY_ID_REQUEST = 'OPERATE_BILL_LOAD_BY_ID_REQUEST';
export const OPERATE_BILL_LOAD_BY_ID_SUCCESS = 'OPERATE_BILL_LOAD_BY_ID_SUCCESS';
export const OPERATE_BILL_LOAD_BY_ID_FAILURE = 'OPERATE_BILL_LOAD_BY_ID_FAILURE';
export function loadOperateBillById(id){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_LOAD_BY_ID_REQUEST, OPERATE_BILL_LOAD_BY_ID_SUCCESS, OPERATE_BILL_LOAD_BY_ID_FAILURE],
      url: `/ticketapi/v1/operationticket/view/${id}`,
    });
  }
}

export const OPERATE_BILL_SAVE_REQUEST = 'OPERATE_BILL_SAVE_REQUEST';
export const OPERATE_BILL_SAVE_SUCCESS = 'OPERATE_BILL_SAVE_SUCCESS';
export const OPERATE_BILL_SAVE_FAILURE = 'OPERATE_BILL_SAVE_FAILURE';
export function saveOperateBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_SAVE_REQUEST, OPERATE_BILL_SAVE_SUCCESS, OPERATE_BILL_SAVE_FAILURE],
      url: `/ticketapi/v1/operationticket/save`,
      body:data
    });
  }
}

export const OPERATE_BILL_FINISH_REQUEST = 'OPERATE_BILL_FINISH_REQUEST';
export const OPERATE_BILL_FINISH_SUCCESS = 'OPERATE_BILL_FINISH_SUCCESS';
export const OPERATE_BILL_FINISH_FAILURE = 'OPERATE_BILL_FINISH_FAILURE';
export function finishOperateBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_FINISH_REQUEST, OPERATE_BILL_FINISH_SUCCESS, OPERATE_BILL_FINISH_FAILURE],
      url: `/ticketapi/v1/operationticket/finish`,
      body:data
    });
  }
}

export const OPERATE_BILL_REJECT_REQUEST = 'OPERATE_BILL_REJECT_REQUEST';
export const OPERATE_BILL_REJECT_SUCCESS = 'OPERATE_BILL_REJECT_SUCCESS';
export const OPERATE_BILL_REJECT_FAILURE = 'OPERATE_BILL_REJECT_FAILURE';
export function rejectOperateBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_REJECT_REQUEST, OPERATE_BILL_REJECT_SUCCESS, OPERATE_BILL_REJECT_FAILURE],
      url: `/ticketapi/v1/operationticket/void`,
      body:data
    });
  }
}

export const OPERATE_BILL_SIGN_REQUEST = 'OPERATE_BILL_SIGN_REQUEST';
export const OPERATE_BILL_SIGN_SUCCESS = 'OPERATE_BILL_SIGN_SUCCESS';
export const OPERATE_BILL_SIGN_FAILURE = 'OPERATE_BILL_SIGN_FAILURE';
export function signOperateBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [OPERATE_BILL_SIGN_REQUEST, OPERATE_BILL_SIGN_SUCCESS, OPERATE_BILL_SIGN_FAILURE],
      url: `/ticketapi/v1/operationticket/sign`,
      body:data
    });
  }
}

export const JOB_BILL_CREATE_REQUEST = 'JOB_BILL_CREATE_REQUEST';
export const JOB_BILL_CREATE_SUCCESS = 'JOB_BILL_CREATE_SUCCESS';
export const JOB_BILL_CREATE_FAILURE = 'JOB_BILL_CREATE_FAILURE';
export function createJobBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_CREATE_REQUEST, JOB_BILL_CREATE_SUCCESS, JOB_BILL_CREATE_FAILURE],
      url: `/ticketapi/v1/work/create`,
      body:data
    });
  }
}

export const JOB_BILL_GET_BY_ID_REQUEST = 'JOB_BILL_GET_BY_ID_REQUEST';
export const JOB_BILL_GET_BY_ID_SUCCESS = 'JOB_BILL_GET_BY_ID_SUCCESS';
export const JOB_BILL_GET_BY_ID_FAILURE = 'JOB_BILL_GET_BY_ID_FAILURE';
export function getJobBillById(bid){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_GET_BY_ID_REQUEST, JOB_BILL_GET_BY_ID_SUCCESS, JOB_BILL_GET_BY_ID_FAILURE],
      url: `/ticketapi/v1/work/info/${bid}`,
    });
  }
}

export const JOB_BILL_EDIT_REQUEST = 'JOB_BILL_EDIT_REQUEST';
export const JOB_BILL_EDIT_SUCCESS = 'JOB_BILL_EDIT_SUCCESS';
export const JOB_BILL_EDIT_FAILURE = 'JOB_BILL_EDIT_FAILURE';
export function editJobBill(data,bkg){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_EDIT_REQUEST, JOB_BILL_EDIT_SUCCESS, JOB_BILL_EDIT_FAILURE],
      url: `/ticketapi/v1/work/updateTicketMeasure`,
      bkg,
      body:data
    });
  }
}

export const JOB_BILL_SIGN_REQUEST = 'JOB_BILL_SIGN_REQUEST';
export const JOB_BILL_SIGN_SUCCESS = 'JOB_BILL_SIGN_SUCCESS';
export const JOB_BILL_SIGN_FAILURE = 'JOB_BILL_SIGN_FAILURE';
export function signJobBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_SIGN_REQUEST, JOB_BILL_SIGN_SUCCESS, JOB_BILL_SIGN_FAILURE],
      url: `/ticketapi/v1/work/updateTicketSign`,
      body:data
    });
  }
}

export const JOB_BILL_FINISH_TASK_REQUEST = 'JOB_BILL_FINISH_TASK_REQUEST';
export const JOB_BILL_FINISH_TASK_SUCCESS = 'JOB_BILL_FINISH_TASK_SUCCESS';
export const JOB_BILL_FINISH_TASK_FAILURE = 'JOB_BILL_FINISH_TASK_FAILURE';
export function finishJobBillTask(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_FINISH_TASK_REQUEST, JOB_BILL_FINISH_TASK_SUCCESS, JOB_BILL_FINISH_TASK_FAILURE],
      url: `/ticketapi/v1/work/completeTicketMeasure`,
      body:data
    });
  }
}

export const JOB_BILL_UPDATE_ORDER_REQUEST = 'JOB_BILL_UPDATE_ORDER_REQUEST';
export const JOB_BILL_UPDATE_ORDER_SUCCESS = 'JOB_BILL_UPDATE_ORDER_SUCCESS';
export const JOB_BILL_UPDATE_ORDER_FAILURE = 'JOB_BILL_UPDATE_ORDER_FAILURE';
export function updateJobBillOrder(data,bak){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_UPDATE_ORDER_REQUEST, JOB_BILL_UPDATE_ORDER_SUCCESS, JOB_BILL_UPDATE_ORDER_FAILURE],
      url: `/ticketapi/v1/work/updateTicketOrder`,
      bak,
      body:data
    });
  }
}

export const JOB_BILL_UPDATE_ORDER_DUTY_REQUEST = 'JOB_BILL_UPDATE_ORDER_DUTY_REQUEST';
export const JOB_BILL_UPDATE_ORDER_DUTY_SUCCESS = 'JOB_BILL_UPDATE_ORDER_DUTY_SUCCESS';
export const JOB_BILL_UPDATE_ORDER_DUTY_FAILURE = 'JOB_BILL_UPDATE_ORDER_DUTY_FAILURE';
export function updateJobBillOrderDuty(data,bak){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_UPDATE_ORDER_DUTY_REQUEST, JOB_BILL_UPDATE_ORDER_DUTY_SUCCESS, JOB_BILL_UPDATE_ORDER_DUTY_FAILURE],
      url: `/ticketapi/v1/work/updateDutyUser`,
      bak,
      body:data
    });
  }
}

export const JOB_BILL_BIND_REQUEST = 'JOB_BILL_BIND_REQUEST';
export const JOB_BILL_BIND_SUCCESS = 'JOB_BILL_BIND_SUCCESS';
export const JOB_BILL_BIND_FAILURE = 'JOB_BILL_BIND_FAILURE';
export function bindJobBillToCommandBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_BIND_REQUEST, JOB_BILL_BIND_SUCCESS, JOB_BILL_BIND_FAILURE],
      url: `/ticketapi/v1/work/updateCommandTicketRelation`,
      body:data
    });
  }
}

export const JOB_BILL_RECYCLE_REQUEST = 'JOB_BILL_RECYCLE_REQUEST';
export const JOB_BILL_RECYCLE_SUCCESS = 'JOB_BILL_RECYCLE_SUCCESS';
export const JOB_BILL_RECYCLE_FAILURE = 'JOB_BILL_RECYCLE_FAILURE';
export function recycleJobBill(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_RECYCLE_REQUEST, JOB_BILL_RECYCLE_SUCCESS, JOB_BILL_RECYCLE_FAILURE],
      url: `/ticketapi/v1/work/updateTicketCompleted`,
      body:data
    });
  }
}

export const BILL_SIGN_UPLOAD_REQUEST = 'BILL_SIGN_UPLOAD_REQUEST';
export const BILL_SIGN_UPLOAD_SUCCESS = 'BILL_SIGN_UPLOAD_SUCCESS';
export const BILL_SIGN_UPLOAD_FAILURE = 'BILL_SIGN_UPLOAD_FAILURE';
export function uploadBillSign(data){
  return (dispatch,getState)=>{
    return dispatch({
      types: [BILL_SIGN_UPLOAD_REQUEST, BILL_SIGN_UPLOAD_SUCCESS, BILL_SIGN_UPLOAD_FAILURE],
      url: `/ticketapi/v1/template/upload`,
      body:data
    });
  }
}

export const JOB_INIT = 'JOB_INIT';
export function initJob(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:JOB_INIT,
      initData:data
    });
  }
}

export const BILL_RESTORE_INIT = 'BILL_RESTORE_INIT';
export function restoreBillInit(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:BILL_RESTORE_INIT,
      initData:data
    });
  }
}

export const JOB_BILL_CHANGE_SUBSTATION = 'JOB_BILL_CHANGE_SUBSTATION';
export function changeJobBillSubstation(data){
  return (dispatch,getState)=>{
    return dispatch({
      type:JOB_BILL_CHANGE_SUBSTATION,
      data
    });
  }
}

export const JOB_BILL_TPL_LIST_REQUEST = 'JOB_BILL_TPL_LIST_REQUEST';
export const JOB_BILL_TPL_LIST_SUCCESS = 'JOB_BILL_TPL_LIST_SUCCESS';
export const JOB_BILL_TPL_LIST_FAILURE = 'JOB_BILL_TPL_LIST_FAILURE';
export function listJobBillTplList(id){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_TPL_LIST_REQUEST, JOB_BILL_TPL_LIST_SUCCESS, JOB_BILL_TPL_LIST_FAILURE],
      url: `/ticketapi/v1/template/listTicketTemplateByType/${id}/2`,
      body:{}
    });
  }
}

export const JOB_BILL_TPL_INFO_REQUEST = 'JOB_BILL_TPL_INFO_REQUEST';
export const JOB_BILL_TPL_INFO_SUCCESS = 'JOB_BILL_TPL_INFO_SUCCESS';
export const JOB_BILL_TPL_INFO_FAILURE = 'JOB_BILL_TPL_INFO_FAILURE';
export function getJobBillTplInfo(id){
  return (dispatch,getState)=>{
    return dispatch({
      types: [JOB_BILL_TPL_INFO_REQUEST, JOB_BILL_TPL_INFO_SUCCESS, JOB_BILL_TPL_INFO_FAILURE],
      url: `/ticketapi/v1/template/workTemplateInfo/${id}`,
      body:{}
    });
  }
}

export const UNBIND_BILL_LOAD_REQUEST = 'UNBIND_BILL_LOAD_REQUEST';
export const UNBIND_BILL_LOAD_SUCCESS = 'UNBIND_BILL_LOAD_SUCCESS';
export const UNBIND_BILL_LOAD_FAILURE = 'UNBIND_BILL_LOAD_FAILURE';
export function loadUnbindBill(filter){
  return (dispatch,getState)=>{
    return dispatch({
      types: [UNBIND_BILL_LOAD_REQUEST, UNBIND_BILL_LOAD_SUCCESS, UNBIND_BILL_LOAD_FAILURE],
      url: `/ticketapi/v1/ticket/list/commandticket/unbindworkticket`,
      body:filter
    });
  }
}

export const UNBIND_ASSETS_LOAD_REQUEST = 'UNBIND_ASSETS_LOAD_REQUEST';
export const UNBIND_ASSETS_LOAD_SUCCESS = 'UNBIND_ASSETS_LOAD_SUCCESS';
export const UNBIND_ASSETS_LOAD_FAILURE = 'UNBIND_ASSETS_LOAD_FAILURE';
export function loadUnbindAssets(workId){
  return (dispatch,getState)=>{
    return dispatch({
      types: [UNBIND_ASSETS_LOAD_REQUEST, UNBIND_ASSETS_LOAD_SUCCESS, UNBIND_ASSETS_LOAD_FAILURE],
      url: `/ticketapi/v1/work/listUnboundHierarchyId`,
      body:{id:workId},
      workId
    });
  }
}

