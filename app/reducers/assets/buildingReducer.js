'use strict';

import {
  LOAD_BUILDING_REQUEST,LOAD_BUILDING_SUCCESS,LOAD_BUILDING_FAILURE,
  LOAD_INDUSTRY_REQUEST,LOAD_INDUSTRY_SUCCESS,LOAD_INDUSTRY_FAILURE,
  ASSET_IMAGE_CHANGED,ASSET_IMAGE_CHANGED_COMPLETE,CLEAR_HIERARCHY_CACHE
} from '../../actions/assetsAction.js';

import Immutable from 'immutable';
import {Map} from 'immutable';

var defaultState = Immutable.fromJS({
  data:null,//定义为数组，是为了方面后面如果配电室，配电柜，设备也要显示负责人使用
  industry:null,
  isFetching:false
});

function loadRequest(state,action) {
  state=state.set('data',null).set('isFetching',true);
  return state;
}

function updateData(state,action) {
  let res=action.response.Result;

  let arrPosi=[];
  if(res.IndustryId){
    let value=null;
    if(state.get('industry')){
      state.get('industry').findIndex(item=>{
        let index=item.get('ChildrenIndustries').findIndex(item2=>{
          if(item2.get('IndustryId')===res.IndustryId){
            value=item2.get('IndustryName');
            return true;
          }
          return false;
        });
        return index>=0;
      });
    }
    arrPosi.push({title:'所属行业',industryId:res.IndustryId,value,isNav:false,});
  }

  if(res.Location){
    let address=res.Location.Districts.join(' ')+'  '+res.Location.Province;
    arrPosi.push({title:'地址',value:address,isNav:false,});
  }
  var singleLineCount= res.SingleLineDiagrams.length;
  var arrSinglePhotos=res.SingleLineDiagrams;
  arrSinglePhotos.forEach((item,index)=>{
    if(item.FileType) {
      //item.FileName = item.ImageId + '.' + item.FileType;
      item.PictureId = item.ImageId;
    }
  });
  var allElements=[
    [{title:'',value:res.EncryptLogoKey,pendingImageUri:'',isEncryptLogo:!!res.EncryptLogoKey}],
    arrPosi,
    [{title:'资产文档',value:singleLineCount,isNav:true,type:'singleLine'}],
  ];
  var allSecTitle=[
    '',
    '',
    ' ',
  ];
  var arrAdmins = res.Administrators.map((item)=>{
    return {id:item.Id,title:item.Title,name:item.Name,email:item.Email,phone:item.Telephone,
      isNav:true,type:'buildingAdmin'};
  });
  if(arrAdmins.length > 0){
    allElements.push(arrAdmins);
    allSecTitle.push('维护负责人');
  }

  state=state.set('data',Immutable.fromJS(res)).set('isFetching',false)
    .set('arrPhotos',Immutable.fromJS(arrSinglePhotos))
    .set('section',Immutable.fromJS(allSecTitle))
    .set('listData',Immutable.fromJS(allElements));
  return state;
}

function imageChanged(state,action) {
  let {data,hierarchyType} = action;
  if(hierarchyType !== 'building') return state;
  if(data.length > 0){
    let image = data[0];
    // console.warn('imageChanged',image.uri);
    // console.warn('state',state);
    var newState = state.setIn(['listData',0,0,'pendingImageUri'],image.uri);
    // console.warn('newState',newState);
    return newState;
  }
  return state;
}

function imageChangedComplete(state,action) {
  let {data} = action;
  let newState = state;
  // newState = newState.set('pendingImageUri','');
  newState = newState.setIn(['listData',0,0,'value'],data);
  return newState;
}

function updateIndustry(state,action) {
  state=state.set('industry',Immutable.fromJS(action.response.Result));
  //更新建筑行业信息
  if(state.get('data')){//确保建筑详情已经获取到了
    let value=null;
    state.get('industry').findIndex(item=>{
      let index=item.get('ChildrenIndustries').findIndex(item2=>{
        if(item2.get('IndustryId')===state.getIn(['data','IndustryId'])){
          value=item2.get('IndustryName');
          return true;
        }
        return false;
      });
      return index>=0;
    });
    if(value){
      state=state.setIn(['listData',1,0,'value'],value);
    }
  }

  return state;
}

function handleError(state,action) {
  return state;
}

export default function(state=defaultState,action){

  switch (action.type) {
    case LOAD_BUILDING_REQUEST:
      // return state.set('isFetching',true);
      return loadRequest(state,action);
    case LOAD_BUILDING_SUCCESS:
      return updateData(state,action);
    case LOAD_BUILDING_FAILURE:
    case LOAD_INDUSTRY_FAILURE:
      return handleError(state,action);
    case LOAD_INDUSTRY_SUCCESS:
      return updateIndustry(state,action);
    case ASSET_IMAGE_CHANGED:
      return imageChanged(state,action);
    case ASSET_IMAGE_CHANGED_COMPLETE:
      return imageChangedComplete(state,action);
    case CLEAR_HIERARCHY_CACHE:
      return state.set('data',null).set('listData',null).set('section',null).set('arrPhotos',null);
    default:
  }
  return state;
}
