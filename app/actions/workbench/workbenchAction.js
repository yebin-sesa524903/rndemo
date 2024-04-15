
export const Workbench_Update_Module_Request = 'Workbench_Update_Module_Request';
export const Workbench_Update_Module_Success = 'Workbench_Update_Module_Success';
export const Workbench_Update_Module_Error = 'Workbench_Update_Module_Success';

/**
 * 修改 功能  进入到应用 调用
 * @param body
 * @returns {function(*): *}
 */
export function updateUseModule(body) {
    return (dispatch)=>{
        return dispatch({
            types:[Workbench_Update_Module_Request, Workbench_Update_Module_Success, Workbench_Update_Module_Error],
            url:'/fmcs/api/common/updateUseModule',
            body
        })
    }
}


export const Workbench_Get_Recent_Module_Request = 'Workbench_Get_Recent_Module_Request';
export const Workbench_Get_Recent_Module_Success = 'Workbench_Get_Recent_Module_Success';
export const Workbench_Get_Recent_Module_Error = 'Workbench_Get_Recent_Module_Error';

/**
 * 修改 功能  进入到应用 调用
 * @param body
 * @returns {function(*): *}
 */
export function getRecentUseModules(body) {
    return (dispatch)=>{
        return dispatch({
            types:[Workbench_Get_Recent_Module_Request, Workbench_Get_Recent_Module_Success, Workbench_Get_Recent_Module_Error],
            url:'/fmcs/api/common/getRecentUseModules',
            body
        })
    }
}


export const Workbench_Get_Department_Codes_Request = 'Workbench_Get_Department_Codes_Request';
export const Workbench_Get_Department_Codes_Success = 'Workbench_Get_Department_Codes_Success';
export const Workbench_Get_Department_Codes_Error = 'Workbench_Get_Department_Codes_Error';
/**
 * 获取课室codes
 * @param body
 * @returns {function(*): *}
 */
export const loadDepartmentCodes = (body) => {
  return (dispatch) => {
    return dispatch({
      types: [Workbench_Get_Department_Codes_Request, Workbench_Get_Department_Codes_Success, Workbench_Get_Department_Codes_Error],
      url: '/lego-bff/bff/ledger/rest/common/getUserhierarchy',
      body
    });
  }
}

export const Workbench_Destroy_Clear = 'Workbench_Destroy_Clear';

/**
 * 工作台 销毁
 * @returns {function(*): *}
 */
export function workbenchDestroyClear (){
  return (dispatch)=>{
    return dispatch({
      type: Workbench_Destroy_Clear,
    })
  }
}
