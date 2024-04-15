'use strict';

import {
  DEVICE_LOAD_REQUEST,
  DEVICE_LOAD_SUCCESS,
  DEVICE_LOAD_FAILURE,
  ASSET_LOGS_SUCCESS,
  ASSET_IMAGE_CHANGED,
  ASSET_IMAGE_CHANGED_COMPLETE,
  DEVICE_EXIT,
  DEVICE_SAVE_ENV_REQUEST, DEVICE_SAVE_ENV_SUCCESS, DEVICE_SAVE_ENV_FAILURE,
  LOGBOOK_DEVICE_REQUEST,LOGBOOK_DEVICE_SUCCESS,LOGBOOK_DEVICE_FAILURE
} from '../../actions/assetsAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import {findSectioniIndexByType} from '../commonReducer.js';
import Immutable from 'immutable';
import {formatNumber} from '../commonReducer.js';
import unit from '../../utils/unit.js';
import privilegeHelper from '../../utils/privilegeHelper.js';

const SHOW_TYPES=['框架断路器及负荷开关','Masterpact MTZ框架断路器','塑壳断路器及负荷开关'];

var defaultState = Immutable.fromJS({
  deviceId:null,
  data:null,
  envIndex:0,
  sectionData:[],
  arrCanCalcuDash:[],
  hasRuntime:false,
  hasRealtime:false,
  isFetching:false,
  logCount:'',
  strTkdyly:null,
  classType:null,
  joinType:1,
  errorMessage:null,
  isSmartHVX:false,
  logbook:{
    isLogTab:true,
    isLogbook:false,
    errorMessage:null,
    isFetching:false,
    baseInfo:null,
    log:null,
    history:null,
    data:[[],[],[],[],[]],
    sectionData:[]
  }
});

function updateAssetDetailData(state,action) {
  var {body:{deviceId},response:{Result}} = action;
  // let {url,body,types} = action;
  var res = Result;
  var joinType=res.JoinType;
  var isLogbookDevice=res.JoinType===4||res.JoinType===7 ||res.JoinType === 9;
  var deviceDescption = [
    {'title':'设备总称','value':res.Class,'isNav':false,},
    {'title':'设备类型','value':res.DeviceType,'isNav':false,},
  ];
  let isLogbook=(res.JoinType===4||res.JoinType==7);
  if (res.Description&&!isLogbook) {
    deviceDescption.splice(0,0,
      {'title':'产品描述','value':res.Description,'isNav':false,},
    );
  }
  let showWarranty=false;
  if(isLogbook) {
    deviceDescption=[
      {title: '产品描述',offset:16, value: res.ProductDescription},
      {title: '产品序列号(SN)',offset:16, value: res.SN},
      {title: '订货号(CR)',offset:16, value: res.CR},
      {title: '设备网址',offset:16, value: res.WebUrl, isWeb: true, actionLabel: '访问',isNav:true},
    ].concat(deviceDescption);
    //判断是否显示延保信息
    showWarranty=SHOW_TYPES.indexOf(res.Class)>=0;
  }

  if (res.Factory) {
    deviceDescption.splice(0,0,
      {'title':'设备厂家','value':res.Factory,'isNav':false,},
    );
  }
  if (res.SerialNumber) {
    deviceDescption.splice(0,0,
      {'title':'资产编号','value':res.SerialNumber,'isNav':false,}
    );
  }
  if(res.Specification){
    deviceDescption.push({
      'title':'设备型号','value':res.Specification,'isNav':false,
    })
  }
  //判断是否是中压设备
  if(res.Specification==='Smart HVX'){
    state=state.set('isSmartHVX',true);
  }else{
    state=state.set('isSmartHVX',false);
  }
  //显示PropertyGroups，里面包括了安装信息，可能还会有其他信息
  let groups=[];
  if(res.PropertyGroups&&res.PropertyGroups.length>0){
    res.PropertyGroups.forEach(item=>{
      let subRow=[];
      item.Properties.forEach(row=>{
        subRow.push({title:row.Name,value:row.Value,isNav:false,})
      });
      groups.push({
        title:item.Name,
        subRow
      })
    })
  }
  var strTkdyly=null;
  var classType=res.Class;
  var parameters = res.LedgerParameters.
                        map((item)=>{
                          if(item.Values.length > 1){
                            return {
                              title:item.Name,
                              value:'',
                              data:item.Values.map((item)=>{
                                return Immutable.Map({title:item,value:'',isNav:false})
                              }),
                              empty:'',
                              isNav:true,
                              type:'parameter'
                            }
                          }
                          else {
                            if (item.Name==='脱扣单元类型') {
                              strTkdyly=item.Values.join('');
                            }
                            return {
                              'title':item.Name,
                              'value':item.Values.join(''),
                              'isNav':false,
                            }
                          }

                        });

  //这里插入产品描述类型
  if(res.ProductDescription&!isLogbook){
    if(!parameters) parameters=[];
    parameters.unshift({
      'title':'产品描述',
      'value':res.ProductDescription,
      'isNav':false,
    })
  }

  var runtimeSetting = res.RuntimeSettingParameter;
  if((runtimeSetting.MaintenanceParameters && runtimeSetting.MaintenanceParameters.length > 0)
      || (runtimeSetting.SettingParameters && runtimeSetting.SettingParameters.length > 0)){
    runtimeSetting = [{title:'运维参数',value:'',isNav:true,type:'runtimeSetting'}];
  }
  else {
    runtimeSetting = null;
  }
  // var arrLogPhoto = [
  //   {'title':'现场照片','value':'','isNav':false,},
  //   {'title':'现场日志','value':'','isNav':false,},
  // ];
  var logCount = res.SceneLogs.length;
  var tendingCount=res.HistoryTicketsCount;
  var ticketsCount=res.RunningTicketsCount;
  var runningPlanCount=res.RunningPlanCount;

  var temperature1 = (res.EnvData && res.EnvData.Temperature1!==null)? res.EnvData.Temperature1 : null,
      temperature2 = (res.EnvData && res.EnvData.Temperature2!==null) ? res.EnvData.Temperature2 : null,
      temperature3 = (res.EnvData && res.EnvData.Temperature3!==null) ? res.EnvData.Temperature3 : null;

  temperature1=formatNumber((temperature1),0);
  temperature2=formatNumber((temperature2),0);
  temperature3=formatNumber((temperature3),0);

  var envNav = true;
  var envIndex=3;
  if(!privilegeHelper.hasAuth('AssetEditPrivilegeCode')){
    envNav = false;
  }

  var arrEnvDatas = [
    {title:'位置1温度',value: unit.combineUnit(temperature1,'temperature'),rvalue:[temperature1,unit.get('temperature')],isNav:envNav,type:'temperature1',secType:'envSection'},
    {title:'位置2温度',value: unit.combineUnit(temperature2,'temperature'),rvalue:[temperature2,unit.get('temperature')],isNav:envNav,type:'temperature2',secType:'envSection'},
    {title:'位置3温度','value': unit.combineUnit(temperature3,'humidity'),rvalue:[temperature3,unit.get('temperature')],isNav:envNav,type:'temperature3',secType:'envSection'},
  ];
  var envObj = {
    Temperature1:temperature1,
    Temperature2:temperature2,
    Temperature3:temperature3,
    DeviceId:deviceId
  };

  var allElements=[
    [{title:'',value:res.LogoKey}],
    deviceDescption,
    parameters,
    arrEnvDatas,
    // [{title:'现场日志',value:logCount,isNav:true,type:'log',secType:'logSection'}],
    // [{title:'维护历史',value:tendingCount,isNav:true,type:'tending'}]
  ];


  let logbook=state.get('logbook');
  let logbookData=[];//logbook.get('data');


  //如果是logbook设备，就有这些信息
  /*if(res.JoinType===4||res.JoinType==7) {
    logbook = logbook.set('isLogbook', true);
    // logbook=logbook.set('isFetching',false);
    logbookData.push([
      {title: '产品描述',offset:16, value: res.ProductDescription},
      {title: '产品序列号(SN)号',offset:16, value: res.SN},
      {title: '订货号(CR)',offset:16, value: res.CR},
      {title: '设备网址',offset:16, value: res.WebUrl, isWeb: true, actionLabel: '访问',isNav:true},
    ]);
    let logbookDataSection = logbook.get('sectionData');
    //判断是否显示延保信息
    let showWarranty=SHOW_TYPES.indexOf(res.Class)>=0;
    logbookDataSection = logbookDataSection.set(0, Immutable.fromJS({showWarranty: showWarranty}));
    logbook=logbook.set('sectionData',logbookDataSection);
  }*/

  //logbookData.push([{title:'现场日志',value:logCount,isNav:true,type:'log',secType:'logSection'}]);
  // logbookData.push([{title:'进行中计划',value:runningPlanCount,isNav:true,type:'planning',secType:'logSection'}]);
  logbookData.push([{title:'未完成工单',value:ticketsCount,isNav:true,type:'ticketing'}]);
  logbookData.push([{title:'已完成工单',value:tendingCount,isNav:true,type:'tending'}]);
  logbook=logbook.set('data',Immutable.fromJS(logbookData)).set('isFetching',false);
  state=state.set('logbook',logbook);

  var allSecTitle=[
    '',
    '',
    '配置参数',
    '设备温度',
    // ' ',
    // ' '
  ];
  if (!parameters||parameters.length===0) {
    allElements.splice(2,1);
    allSecTitle.splice(2,1);
    envIndex=2;
  }
  if(showWarranty){
    allSecTitle.push({showWarranty:true});
    allElements.push([{hidden:true}])
  }

  //添加父节点分组
  allSecTitle.push(' ');
  allElements.push([{title:'父节点',value:res.ParentName,gotoParent:true}]);
  let parent={
    Id:res.ParentId,
    Name:res.ParentName,
    parentType:res.ParentType,
    parentSubType:res.ParentSubType
  }

  // if(groups.length>0){
  //   groups.forEach(item=>{
  //     allElements.push(item.subRow);
  //     allSecTitle.push(item.title);
  //   })
  // }

  var hasRuntime = false,hasRealtime=false;
  if(runtimeSetting){
    hasRuntime = true;
  }

  if(res.MonitorParameterGroups && res.MonitorParameterGroups.length > 0){
    var groupItem=res.MonitorParameterGroups[0];
    // if (groupItem.Name&&groupItem.Name.length>0) {
      hasRealtime = true;
    // }
  }
  var arrCanCalcu=[];
  if(res.ParameterCanCalculates && res.ParameterCanCalculates.length > 0){
    res.ParameterCanCalculates.forEach((item)=>{
      if (item.DisplayInstrument) {
        arrCanCalcu.push(item);
      }
    });
  }

  return Immutable.fromJS({
    data:Immutable.fromJS(allElements),
    envObj:Immutable.fromJS(envObj),
    envIndex,
    sectionData:Immutable.fromJS(allSecTitle),
    arrCanCalcuDash:Immutable.fromJS(arrCanCalcu),
    isFetching:false,
    hasRuntime,
    hasRealtime,
    logCount,
    deviceId,
    strTkdyly,
    classType,
    joinType,
    isLogbookDevice,
    logbook:state.get('logbook'),
    isSmartHVX:state.get('isSmartHVX'),
    parentId:res.ParentId,
    parent,detail:res,
    flowType:res.NetworkType
  });

}

function addLogsCount(state,action) {
  var {hierarchyId,response:{Result}} = action;
  if(state.get('deviceId') === hierarchyId){
    if(!Result){
      Result = [];
    }
    var len = Result.length;
    if(state.get('logCount') !== len){
      let logbook=state.get('logbook');
      let logbookData=logbook.get('data');
      logbookData=logbookData.set(1,Immutable.fromJS([{title:'现场日志',value:len,isNav:true,type:'log',secType:'logSection'}]));
      logbook=logbook.set('data',logbookData);
      state=state.set('logbook',logbook);

      // var newState = state.set('logCount',len);
      // var indexSec=findSectioniIndexByType(newState.get('data'),'logSection');
      // var data = newState.get('data');
      // data = data.setIn([indexSec,0,'value'],len);
      // return newState.set('data',data);
    }
  }
  return state;
}



function imageChanged(state,action) {
  let {data,hierarchyType} = action;
  if(hierarchyType !== 'device') return state;
  if(data.length > 0){
    let image = data[0];
    // console.warn('imageChanged',image.uri);
    // console.warn('state',state);
    var newState = state.setIn(['data',0,0,'pendingImageUri'],image.uri);
    // console.warn('newState',newState);
    return newState;
  }

  return state;

}

function imageChangedComplete(state,action) {
  let {data} = action;
  let newState = state;
  // newState = newState.set('pendingImageUri','');
  newState = newState.setIn(['data',0,0,'value'],data);

  return newState;
}

function envChanged(state,action) {
  var {response:{Result}} = action;
  var newState = state.set('envObj',Immutable.Map(Result));
  var envIndex=state.get('envIndex');
  return newState.set('data',newState.get('data').update(envIndex,(item)=>{
    var res = Result;

    var temperature1 = (res && res.Temperature1!==null)? res.Temperature1 : null,
        temperature2 = (res && res.Temperature2!==null) ? res.Temperature2 : null,
        temperature3 = (res && res.Temperature3!==null) ? res.Temperature3 : null;

    temperature1=formatNumber((temperature1),0);
    temperature2=formatNumber((temperature2),0);
    temperature3=formatNumber((temperature3),0);

    return item.setIn([0,'value'],unit.combineUnit(temperature1,'temperature')).
                setIn([0,'rvalue'],Immutable.fromJS([temperature1,unit.get('temperature')])).
                setIn([1,'value'],unit.combineUnit(temperature2,'temperature')).
                setIn([1,'rvalue'],Immutable.fromJS([temperature2,unit.get('temperature')])).
                setIn([2,'value'],unit.combineUnit(temperature3,'temperature')).
                setIn([2,'rvalue'],Immutable.fromJS([temperature3,unit.get('temperature')]));
  }))
}

function handleError(state,action) {
  var {Error} = action.error;
  var strError=null;
  switch (Error) {
    case '050001207024':
      strError = '您目前还没有查看该资产的权限，\n请联系系统管理员给您授权';
      if (action.error!=='403') {
        action.error=null;
      }
      break;
    case '050001251009':
    {
      strError = '无查看资产权限，联系管理员';
      if (action.error!=='403') {
        action.error=null;
      }
      break;
    }
  }
  return state.set('isFetching',false).set('errorMessage',strError);
}

function updateLogbookInfo(state,action) {
  let result=action.response.Result;
  let logbook=state.get('logbook');
  logbook=logbook.set('isFetching',false);
  logbook=logbook.set('isLogbook',true);
  if(result){
    let logbookData=logbook.get('data');
    logbookData=logbookData.set(0,Immutable.fromJS([
      {title:'产品描述',value:'字段还未确定，先占位'},
      {title:'订货号(CR)',value:result.CR},
      {title:'产品序列号(SN)号',value:result.SN},
      {title:'设备网址',value:result.WebUrl,isWeb:true,actionLabel:'访问'},
    ]));
    let logbookDataSection=logbook.get('sectionData');
    logbookDataSection=logbookDataSection.set(0,Immutable.fromJS({showWarranty:true}))
    // logbookData=logbookData.set(1,Immutable.fromJS([
    //   {title:'产品序列号(SN)号',value:result.SN},
    //   {title:'订货号(CR)',value:result.CR},
    //   {title:'产品描述',value:'字段还未确定，先占位'},
    //   // {title:'设备应用',value:result.Apps},
    //   // {title:'固件版本号',value:result.FirmwareVersion},
    //   // {title:'制造工厂',value:result.Factory},
    //   // {title:'尺寸(mm)',value:result.Size},
    //   // {title:'符合标准',value:result.Criterion},
    // ]));
    logbook=logbook.set('data',logbookData).set('sectionData',logbookDataSection);
  }
  state=state.set('logbook',logbook);
  return state;
}

export default function(state=defaultState,action){
  switch (action.type) {
    case DEVICE_LOAD_REQUEST:
      let logbookData=state.get('logbook');
      logbookData=logbookData.set('isFetching',true);
      logbookData=logbookData.set('isLogbook',true);
      state=state.set('logbook',logbookData);
      return state.set('isFetching',true);
    case DEVICE_LOAD_SUCCESS:
      return updateAssetDetailData(state,action);
    case DEVICE_LOAD_FAILURE:
    case DEVICE_SAVE_ENV_FAILURE:
      var newState = state.set('isFetching',false);
      return handleError(newState,action);
    case DEVICE_SAVE_ENV_SUCCESS:
      return envChanged(state,action);
    case ASSET_LOGS_SUCCESS:
      return addLogsCount(state,action);
    case ASSET_IMAGE_CHANGED:
      return imageChanged(state,action);
    case ASSET_IMAGE_CHANGED_COMPLETE:
      return imageChangedComplete(state,action);

    case LOGBOOK_DEVICE_REQUEST:
      let newData=state.get('logbook');
      newData=newData.set('isFetching',true);
      newData=newData.set('isLogbook',true);
      state=state.set('logbook',newData);
      break;
    case LOGBOOK_DEVICE_SUCCESS:
      return updateLogbookInfo(state,action);

    case LOGBOOK_DEVICE_FAILURE:
      let data=state.get('logbook');
      data=data.set('isFetching',false);
      data=data.set('isLogbook',true);
      data=data.set('errorMessage','获取信息失败');
      state=state.set('logbook',data);
      return state;

    case DEVICE_EXIT:
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
