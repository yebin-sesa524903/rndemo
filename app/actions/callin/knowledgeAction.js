export const Knowledge_Type_List_Request = 'Knowledge_Type_List_Request';
export const Knowledge_Type_List_Success = 'Knowledge_Type_List_Success';
export const Knowledge_Type_List_Error = 'Knowledge_Type_List_Error';

/**
 * 知识库左侧 分类列表
 * @returns {function(*): *}
 */
export function loadKnowledgeTypeList() {
  return (dispatch) => {
    return dispatch({
      types: [Knowledge_Type_List_Request, Knowledge_Type_List_Success, Knowledge_Type_List_Error],
      url: `/sgai-certificate/admin/knowlType/queryKnowlTypeList`,
    });
  }
}

export const Knowledge_Type_Data_Save = 'Knowledge_Type_Data_Save';

/**
 * 知识库分类信息保存, 用于刷新列表
 * @param data
 * @returns {function(*): *}
 */
export function knowledgeTypeSave(data) {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_Type_Data_Save,
      data: data
    })
  }
}


export const Knowledge_List_Request = 'Knowledge_List_Request';
export const Knowledge_List_Success = 'Knowledge_List_Success';
export const Knowledge_List_Error = 'Knowledge_List_Error';

/**
 * 根据分类信息获取 知识库列表
 * @returns {function(*): *} page pageSize search_EQ_delFlag  search_EQ_typeChildId titleKeywords
 */
export function loadKnowledgeList(body) {
  return (dispatch) => {
    return dispatch({
      types: [Knowledge_List_Request, Knowledge_List_Success, Knowledge_List_Error],
      url: `/sgai-certificate/admin/knowl/queryKnowlList?page=${body.page}&pagesize=${body.pagesize}&search_EQ_delFlag=${body.search_EQ_delFlag}&search_EQ_typeChildId=${body.search_EQ_typeChildId}&titleKeywords=${body.titleKeywords}`,
    });
  }
}

export const Knowledge_List_Input_Save = 'Knowledge_List_Input_Save';
/**
 * 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function knowledgeInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_List_Input_Save,
      data: input
    })
  }
}

/**
 * 列表销毁
 * @type {string}
 */
export const Knowledge_List_Destroy_Clear = 'Knowledge_List_Destroy_Clear';
export function knowledgeListDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_List_Destroy_Clear,
    })
  }
}

/**************************************知识库搜索结果页******************************/

export const Knowledge_Search_Result_Request = 'Knowledge_Search_Result_Request';
export const Knowledge_Search_Result_Success = 'Knowledge_Search_Result_Success';
export const Knowledge_Search_Result_Error = 'Knowledge_Search_Result_Error';

/**
 * 根据分类信息获取 知识库列表
 * @returns {function(*): *} page pageSize search_EQ_delFlag  search_EQ_typeChildId titleKeywords
 */
export function loadKnowledgeSearchResultList(body) {
  return (dispatch) => {
    return dispatch({
      types: [Knowledge_Search_Result_Request, Knowledge_Search_Result_Success, Knowledge_Search_Result_Error],
      url: `/sgai-certificate/admin/knowl/queryKnowlList?page=${body.page}&pagesize=${body.pagesize}&search_EQ_delFlag=${body.search_EQ_delFlag}&search_EQ_typeChildId=${body.search_EQ_typeChildId ?? ''}&titleKeywords=${body.titleKeywords}`,
    });
  }
}

export const Knowledge_Search_Result_Input_Save = 'Knowledge_Search_Result_Input_Save';
/**
 * 入参保存
 * @param input
 * @returns {function(*): *}
 */
export function knowledgeSearchResultInputSave(input) {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_Search_Result_Input_Save,
      data: input
    })
  }
}

export const Knowledge_Search_Result_Destroy_Clear = 'Knowledge_Search_Result_Destroy_Clear'
export function knowledgeSearchDestroyClear() {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_Search_Result_Destroy_Clear,
    })
  }
}

export const Knowledge_Search_Result_Keywords = 'Knowledge_Search_Result_Keywords';
export function knowledgeSearchKeywords(keyword) {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_Search_Result_Keywords,
      data: keyword
    })
  }
}


/**************************************知识库详情页*****************************/


export const Knowledge_Detail_Data_Info_Save = 'Knowledge_Detail_Data_Info_Save';

/**
 * 保存业务模型数组
 * @returns {function(*): *}
 */
export function saveKnowledgeDetailDataInfo(info) {
  return (dispatch) => {
    return dispatch({
      type: Knowledge_Detail_Data_Info_Save,
      data: info,
    })
  }
}
