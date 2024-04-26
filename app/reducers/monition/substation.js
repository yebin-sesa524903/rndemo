import immutable from 'immutable'
import { SUBSTATION_LIST_REQUEST, SUBSTATION_LIST_SUCCESS, SUBSTATION_LIST_FAILURE } from '../../actions/monitionAction'

let defaultState = immutable.fromJS({
  isFetching: false,
  data: null
})


function loadSubstation(state, action) {
  let list = action.response.Result;
  //list && list.forEach(item => item.title=item.name)
  return state.set('isFetching', false).set('data', immutable.fromJS(list))
}

function handleError(state, action) {
  return state.set('isFetching', false)
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case SUBSTATION_LIST_REQUEST:
      return state.set('isFetching', true).set('data', null);
    case SUBSTATION_LIST_SUCCESS:
      return loadSubstation(state, action);
    case SUBSTATION_LIST_FAILURE:
      return handleError(state, action);
  }
  return state;
}
