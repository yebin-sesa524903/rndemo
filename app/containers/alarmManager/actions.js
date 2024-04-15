
export const ALARM_COUNT_REQUEST = 'ALARM_COUNT_REQUEST';
export const ALARM_COUNT_SUCCESS = 'ALARM_COUNT_SUCCESS';
export const ALARM_COUNT_FAILURE = 'ALARM_COUNT_FAILURE';

/**
 * 报警个数
 * @param alarmType // {customerId:1,alarmType:"2"}
 * @param customerId
 * @returns {function(*, *): *}
 */
export function loadAlarmCount(alarmType, customerId){
    return (dispatch, getState) => {
        return dispatch({
            types: [ALARM_COUNT_REQUEST, ALARM_COUNT_SUCCESS, ALARM_COUNT_FAILURE],
            url: '/bff/eh/rest/alarmCount',
            body: {customerId: customerId, alarmType}
        });
    }
}


export const ALARM_LIST_REQUEST = 'ALARM_LIST_REQUEST';
export const ALARM_LIST_SUCCESS = 'ALARM_LIST_SUCCESS';
export const ALARM_LIST_FAILURE = 'ALARM_LIST_FAILURE';

/**
 * 报警列表
 * @param body
 * @returns {function(*, *): *}
 */
export function loadAlarmList(body){
    return (dispatch, getState) => {
        return dispatch({
            types: [ALARM_LIST_REQUEST, ALARM_LIST_SUCCESS, ALARM_LIST_FAILURE],
            url: '/bff/eh/rest/getAlarmList',
            body
        });
    }
}

export const ALARM_TICKET_REQUEST = 'ALARM_TICKET_REQUEST';
export const ALARM_TICKET_SUCCESS = 'ALARM_TICKET_SUCCESS';
export const ALARM_TICKET_FAILURE = 'ALARM_TICKET_FAILURE';

/**
 * 获取所有工单, 和报警列表匹配看是否有报警记录创建了报警工单
 * @param owners
 * @param alarmType
 * @returns {function(*): *}
 */
export function loadAllTickets(owners, alarmType){
    return (dispatch) => {
        return dispatch({
            types: [ALARM_TICKET_REQUEST, ALARM_TICKET_SUCCESS, ALARM_TICKET_FAILURE],
            url: '/bff/eh/rest/ticket/pageList',
            body: {
                owners,
                alarmType,
                pageNo: 1,
                pageSize: 9999,
            }
        });
    }
}



export const ALARM_CODES_REQUEST = 'ALARM_CODES_REQUEST';
export const ALARM_CODES_SUCCESS = 'ALARM_CODES_SUCCESS';
export const ALARM_CODES_FAILURE = 'ALARM_CODES_FAILURE';

/**
 * 查看报警类型
 * @returns {function(*): *}
 */
export function loadAlarmCodes(){
    return (dispatch) => {
        return dispatch({
            types: [ALARM_CODES_REQUEST, ALARM_CODES_SUCCESS, ALARM_CODES_FAILURE],
            url: '/bff/eh/rest/getAlarmCodes',
        });
    }
}



export const ALARM_INFO_REQUEST = 'ALARM_INFO_REQUEST';
export const ALARM_INFO_SUCCESS = 'ALARM_INFO_SUCCESS';
export const ALARM_INFO_FAILURE = 'ALARM_INFO_FAILURE';

/**
 * 查看 已解除报警详情信息
 * @returns {function(*): *}
 */
export function getAlarmInfo(body){
    return (dispatch) => {
        return dispatch({
            types: [ALARM_INFO_REQUEST, ALARM_INFO_SUCCESS, ALARM_INFO_FAILURE],
            url: '/bff/eh/rest/getAlarmInfo',
            body
        });
    }
}




export const ALARM_RESOLVE_REQUEST = 'ALARM_RESOLVE_REQUEST';
export const ALARM_RESOLVE_SUCCESS = 'ALARM_RESOLVE_SUCCESS';
export const ALARM_RESOLVE_FAILURE = 'ALARM_RESOLVE_FAILURE';

/**
 * 查看 已解除报警详情信息
 * @returns {function(*): *}
 */
export function resolveAlarm(body){
    return (dispatch) => {
        return dispatch({
            types: [ALARM_RESOLVE_REQUEST, ALARM_RESOLVE_SUCCESS, ALARM_RESOLVE_FAILURE],
            url: '/bff/eh/rest/resolveAlarm',
            body
        });
    }
}


export const HIERARCHY_LIST_REQUEST = 'HIERARCHY_LIST_REQUEST';
export const HIERARCHY_LIST_SUCCESS = 'HIERARCHY_LIST_SUCCESS';
export const HIERARCHY_LIST_FAILURE = 'HIERARCHY_LIST_FAILURE';

/**
 *  customerId: 1,treeType: 'fmhc',type: '1'
 * @param body
 * @returns {function(*): *}
 */
export function loadHierarchyList(body) {
    return (dispatch) => {
        return dispatch({
            types: [HIERARCHY_LIST_REQUEST, HIERARCHY_LIST_SUCCESS, HIERARCHY_LIST_FAILURE],
            url: '/bff/eh/rest/common/hierarchyList',
            body: body,
        });
    }
}



export const ALARM_DETAIL_RESET = 'ALARM_DETAIL_RESET';
export function destroyAlarmDetail(data){
    return (dispatch)=>{
        return dispatch({
            type:ALARM_DETAIL_RESET,
            data
        });
    }
}
