import { combineReducers } from 'redux'
import knowledgeDetail from "./knowledgeDetailReducer";
import knowledgeList from "./knowledgeListReducer";
import KnowledgeSearchResult from "./knowledgeSearchResultReducer";


export default combineReducers({
  knowledgeList,
  knowledgeDetail,
  KnowledgeSearchResult
})
