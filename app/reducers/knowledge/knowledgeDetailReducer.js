import {Knowledge_Detail_Data_Info_Save} from "../../actions/callin/knowledgeAction";

const initialState = {
  detailDataInfo: []
}

export default function KnowledgeDetailReducer(state = initialState, action) {
    let nextState = Object.assign({}, state);
    switch (action.type) {
      case Knowledge_Detail_Data_Info_Save:
        nextState.detailDataInfo = action.data;
        break;
    }
    return nextState || state;
}
