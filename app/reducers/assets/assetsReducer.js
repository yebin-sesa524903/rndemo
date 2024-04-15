'use strict';

import {
  ASSET_ME_LOAD_REQUEST,
  ASSET_ME_LOAD_SUCCESS,
  ASSET_ME_LOAD_FAILURE,
  ASSET_ME_CHANGE_EXPAND,
  CREATE_BUILDING_REQUEST,CREATE_BUILDING_SUCCESS,CREATE_BUILDING_FAILURE,
  DELETE_BUILDING_REQUEST,DELETE_BUILDING_SUCCESS,DELETE_BUILDING_FAILURE,
  UPDATE_BUILDING_REQUEST,UPDATE_BUILDING_FAILURE,UPDATE_BUILDING_SUCCESS,
  ASSET_FILTER_BY_KEY_WORD
} from '../../actions/assetsAction.js';
import {commonReducer} from '../commonReducer.js';
import {CHANGE_PARTNER_SUCCESS} from '../../actions/loginAction'

import Immutable,{List} from 'immutable';
import trackApi from "../../utils/trackApi";

var defaultState = Immutable.fromJS({
  data:null,
  section:null,
  isFetching:false,
  filter:{
    AssetTaskType:1,
    CurrentPage:1,
  },
  groupData:null,
  isAddBuildingPosting:0,//1请求中，2请求失败，0成
  isDeleteBuildingPosting:0,
  isUpdateBuildingPosting:0,
  keyword:''
});

function updateData(state,action) {
  var response = action.response.Result;
  var newState = state;

  let cts=[],filter=[];
  if(response && response.length>0){

    /***使用sectionlist方案 **/
    let count=response.length;
    // let myGroups=new Map();
    let myMap={};
    for(let i=0;i<count;i++) {
      let item = response[i];
      item.isFolder = false;
      if (myMap[item.CustomerId]) {
        myMap[item.CustomerId].push(item);
      } else {
        cts.push({
          customerId: item.CustomerId,
          customerName: item.CustomerName,
          isFolder: false,
          isHeader: true,
        });
        myMap[item.CustomerId] = [item];
      }
    }
    cts.forEach((item1,index)=>{
      key:item1.customerId;
      item1.rowIndex=index;
      item1.data=myMap[item1.customerId];
      // filter.push({
      //   customerId: item1.customerId,
      //   customerName: item1.customerName,
      //   rowIndex:index,
      //   isFolder: false,
      //   isHeader: true,
      //   data:myMap[item1.customerId]
      // });
      filter.push([].concat(myMap[item1.customerId]));
    });
    myMap=null;
  }

  let list=cts;//=List(data);

  newState = newState.set('data',list).set('realData',[].concat(filter));
  newState = newState.set('isFetching',false);
  return newState;
}

function deleteBuilding(state,action) {
  let newState=state;
  newState=newState.set('isDeleteBuildingPosting',0);
  let data=newState.get('data');
  let realData=newState.get('realData');
  let {rowId,sid}=action.index;
  let findRowIndex=data[sid].data.findIndex(item=>item.Id===rowId);
  data[sid].data.splice(findRowIndex,1);
  realData[sid]=[].concat(data[sid].data);
  newState=newState.set('realData',[].concat(realData));
  return doFilter(newState);
}

function updateBuilding(state,action) {
  let newState=state;
  newState=newState.set('isUpdateBuildingPosting',0);
  let {rowId,sid}=action.index;

  let data=newState.get('data');
  let readData=newState.get('realData');
  let findRowIndex=data[sid].data.findIndex(item=>item.Id===rowId);
  data[sid].data[findRowIndex]=action.response.Result;
  // let item=data[sid].data[findRowIndex];
  // item.Name=action.body.Name;
  // let location=item.Location;
  // if(location){
  //   location.Province=action.body.Location;
  // }else{
  //   item.Location={Province:action.body.Location};
  // }
  readData[sid]=[].concat(data[sid].data);
  newState=newState.set('realData',[].concat(readData));
  return doFilter(newState);
}

function traceAddLogbook(res,customerName) {
  trackApi.onTrackEvent('App_LogbookAdd',{
    asset_type:'建筑',
    // asset_name:res.Name,
    customer_id:String(res.CustomerId||''),
    customer_name:customerName,
    building_id:String(res.Id||''),
    building_name:res.Name
  });
}

function addBuilding(state,action) {
  traceAddLogbook(action.response.Result,action.body.CustomerName);
  let newState=state;
  newState=newState.set('isAddBuildingPosting',0);
  let item = action.response.Result;
  if(!item.CustomerName){
    item.CustomerName=action.body.CustomerName;
  }
  let data=newState.get('data');
  let sid=action.sid;
  data[sid].data.push(item);
  let scrollToIndex=data[sid].data.length-1;
  if(scrollToIndex<0) scrollToIndex=0;
  data[sid].isFolder=false;
  let readData=newState.get('realData');
  // readData[sid].isFolder=false;
  readData[sid]=[].concat(data[sid].data);
  newState=newState.set('scrollToIndex',scrollToIndex)
    .set('realData',[].concat(readData)).set('data',[].concat(data));
  return doFilter(newState,sid);
}

function changeAssetFolder(state,action) {
  let {data:{index,isFolder}} = action;
  index=Number.parseInt(index);
  // console.warn('action',action);
  let newState=state;
  let realData=newState.get('realData');
  let allData=newState.get('data');
  if(isFolder){
    realData[index]=[];
  }else{
    realData[index]=[].concat(allData[index].data);
  }
  allData[index].isFolder=isFolder;
  newState=newState.set('realData',[].concat(realData))
    .set('data',[].concat(allData));

  return doFilter(newState);
}

function doFilterByKeyWord(state,action) {
  let newState=state;
  let keyword=action.data;
  newState=newState.set('keyword',keyword);
  if(!(keyword&&keyword.trim().length>0)){
    let realData=[];
    let allData=newState.get('data')||[];
    allData.forEach(item=>{
      if(item.isFolder){
        realData.push([]);
      }else{
        realData.push([].concat(item.data));
      }
    });
    newState=newState.set('realData',[].concat(realData));
  }
  return doFilter(newState,null,true);
}

function doFilter(state,sid,wordChanged) {
  let newState=state;
  let keyword=newState.get('keyword');
  if(keyword&&keyword.trim().length>0){
    let realData=newState.get('realData');
    let allData=newState.get('data');
    let filterSection=[];
    let filterData=[];
    if(allData) {
      allData.forEach((item, index) => {
        if (String(item.customerName || '').toLowerCase().indexOf(keyword.toLowerCase()) >= 0) {
          filterSection.push(allData[index]);
          if (wordChanged)
            item.isFolder = true;
          filterData.push(item.isFolder ? [] : [].concat(item.data));
        } else {
          let search = item.data.filter(item2 =>
            String(item2.Name || '').toLowerCase().indexOf(keyword.toLowerCase()) >= 0);
          if (search && search.length > 0) {
            filterSection.push(allData[index]);
            if (wordChanged)
              item.isFolder = false;
            filterData.push(item.isFolder ? [] : search);
          }
        }
        if (!(sid === null || sid === undefined) && allData[sid].customerId === item.customerId) {
          //需要更新
          let scrollToIndex = filterData[filterData.length - 1].length - 1;
          if (scrollToIndex < 0) scrollToIndex = 0;
          newState = newState.set('scrollToIndex', scrollToIndex);
        }
      });
    }

    newState=newState.set('filterRealData',filterData)
      .set('filterSection',filterSection);
  }
  return newState;
}

function handleError(state,action) {
  var {Error} = action.error;
  // console.warn('handleError',action);

  //截取后三位给出对应的错误提示
  let code=Error?Error.substr(-3,3):'';
  let errorText=null;
  switch (Error) {
    case '040001307022':
      action.error = '您没有这一项的操作权限，请联系系统管理员';
      state=state.set('data',Immutable.fromJS([]));
      break;
  }

  switch(code){
    case '005':
    errorText='建筑名称重复';
    break;
    case '006':
      errorText='建筑数量达到上限';
      break;
    case '007':
      errorText='请移除所有子节点后重试';
      break;
    case '009':
      errorText='您没有这一项的数据权限，请联系系统管理员';
      break;
  }
  if(errorText){
    console.warn('errText',errorText);
    action.error=errorText;
  }

  return state.set('isFetching',false);
}

export default commonReducer((state,action)=>{

  switch (action.type) {
    case ASSET_ME_LOAD_REQUEST:
      return state.set('isFetching',true);
    case ASSET_ME_LOAD_SUCCESS:
      return updateData(state,action);
    case ASSET_ME_LOAD_FAILURE:
      return handleError(state,action);
    case ASSET_ME_CHANGE_EXPAND:
      return changeAssetFolder(state,action);

    case CREATE_BUILDING_REQUEST:
      return state.set('isAddBuildingPosting',1);
    case CREATE_BUILDING_SUCCESS:
      return addBuilding(state,action);
    case CREATE_BUILDING_FAILURE:
      handleError(state,action);
      return state.set('isAddBuildingPosting',2);

    case DELETE_BUILDING_REQUEST:
      return state.set('isDeleteBuildingPosting',1);
    case DELETE_BUILDING_SUCCESS:
      return deleteBuilding(state,action);
    case DELETE_BUILDING_FAILURE:
      //Error	String	050001201012
      if(action.error.Error==='050001201012'){
        action.error = `建筑"${action.name}"在云能效中已经被关联能耗相关数据，无法删除`;
      }else {
        handleError(state, action);
      }
      return state.set('isDeleteBuildingPosting',2);

    case UPDATE_BUILDING_REQUEST:
      return state.set('isUpdateBuildingPosting',1);
    case UPDATE_BUILDING_SUCCESS:
      return updateBuilding(state,action);
    case ASSET_FILTER_BY_KEY_WORD:
      return doFilterByKeyWord(state,action);
    case UPDATE_BUILDING_FAILURE:
      handleError(state,action);
      return state.set('isUpdateBuildingPosting',2);

    case CHANGE_PARTNER_SUCCESS:
      return defaultState;
    default:

  }
  return state;
},defaultState);
