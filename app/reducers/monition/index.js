'use strict';

import monitionList from './monitionListReducer';
import monition from './monitionReducer';
import { combineReducers } from 'redux';
import command from './commandReducer';
import operate from './operateReducer'
import substation from "./substation";
import job from './jobReducer'

export default combineReducers({
  monition,monitionList,command,substation,operate,job
})
