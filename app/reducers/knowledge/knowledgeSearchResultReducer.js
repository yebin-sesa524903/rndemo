import {
  Knowledge_Search_Result_Destroy_Clear,
  Knowledge_Search_Result_Error, Knowledge_Search_Result_Input_Save, Knowledge_Search_Result_Keywords,
  Knowledge_Search_Result_Request, Knowledge_Search_Result_Success

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
    titleKeywords: '',
  }
}

const initStatus = {
  loading: false,///加载指示
  page: 1,///当前页码
  results: [],    ///列表数据集合
  ///获取列表请求入参
  listInput: listInitialInput(),
  keywords: '',
}

export default function KnowledgeSearchResultReducer(state = initStatus, action) {
  let nextState = Object.assign({}, state);
  switch (action.type) {

    ///知识库某个分类下 知识库列表数据
    case Knowledge_Search_Result_Request:
      nextState.loading = true;
      break;
    case Knowledge_Search_Result_Success:
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
    case Knowledge_Search_Result_Error:
      nextState.loading = false;
      break;

    case Knowledge_Search_Result_Input_Save:
      nextState.listInput = action.data;
      break;

      case Knowledge_Search_Result_Keywords:
        nextState.keywords = action.data;
        break;

    case Knowledge_Search_Result_Destroy_Clear:
      nextState.loading = false;///加载指示
      nextState.page = 1;///当前页码
      nextState.results = [];    ///列表数据集合
      nextState.listInput = listInitialInput();
      nextState.keywords = '';
      break;
  }
  return nextState || state;
}
