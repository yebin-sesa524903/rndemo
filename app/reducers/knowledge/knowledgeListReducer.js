import {
  Knowledge_List_Destroy_Clear,
  Knowledge_List_Error,
  Knowledge_List_Input_Save,
  Knowledge_List_Request,
  Knowledge_List_Success,
  Knowledge_Type_Data_Save,
  Knowledge_Type_List_Error,
  Knowledge_Type_List_Request,
  Knowledge_Type_List_Success
} from "../../actions/callin/knowledgeAction";

/**
 * @type {{pageItem: {pageSize: number, page: number}, status: string}}
 */
const listInitialInput = () => {
  return {
    page: 1,
    pagesize: 20,
    search_EQ_delFlag: false,
    search_EQ_typeChildId: null,
    titleKeywords:'',
  }
}

const initStatus = {
  knowledgeType: [],  ///知识库分类接口返回
  typesData: [],  ///知识库分类 业务模型数组

  loading: false,///加载指示
  page: 1,///当前页码
  results: [],    ///列表数据集合
  ///获取列表请求入参
  listInput: listInitialInput(),
}

export default function KnowledgeListReducer(state = initStatus, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {
    ///知识库分类列表
    case Knowledge_Type_List_Request:
      break;
    case Knowledge_Type_List_Success:
      nextState.knowledgeType = action.response;
      break;
    case Knowledge_Type_List_Error:
      break;

    case Knowledge_Type_Data_Save:
      nextState.typesData = action.data;
      break;

    ///知识库某个分类下 知识库列表数据
    case Knowledge_List_Request:
      nextState.loading = true;
      break;
    case Knowledge_List_Success:
      nextState.loading = false;
      const responseResult = action.response;
      let dataSource = [];
      if (responseResult.pageNum === 1) {
        dataSource = responseResult.list;
      } else {
        dataSource = nextState.results.concat(responseResult.list);
      }
      nextState.page = responseResult.pageNum
      nextState.results = dataSource;
      break;
    case Knowledge_List_Error:
      nextState.loading = false;
      break;

    case Knowledge_List_Input_Save:
      nextState.listInput = action.data;
      break;
    case Knowledge_List_Destroy_Clear:
      nextState.knowledgeType = [];
      nextState.typesData = [];
      nextState.loading = false;
      nextState.page = 1;
      nextState.results = [];
      nextState.listInput = listInitialInput();
      break;
  }
  return nextState || state;
}
