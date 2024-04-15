'use strict';

import {
  PANEL_LOAD_REQUEST,
  PANEL_LOAD_SUCCESS,
  PANEL_LOAD_FAILURE,
  PANEL_SAVE_ENV_SUCCESS,
  PANEL_SAVE_ENV_FAILURE,
  ASSET_LOGS_SUCCESS,
  ASSET_IMAGE_CHANGED,
  ASSET_IMAGE_CHANGED_COMPLETE,
  LOGBOOK_UPDATE_PANEL_SUCCESS,
  PANEL_GET_SENSORS_TEMP_SUCCESS,
  PANEL_GET_SENSORS_TEMP_FAILURE
} from '../../actions/assetsAction.js';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';

import Immutable from 'immutable';
import unit from '../../utils/unit.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import {findSectioniIndexByType} from '../commonReducer.js';
import {formatNumber} from '../commonReducer.js';

var defaultState = Immutable.fromJS({
  panelId:null,
  data:null,
  sectionData:[],
  isFetching:false,
  logCount:'',
  errorMessage:null,
  logPageData:[],
  logPageSectionData:[],
  panelType:null
});


function updateAssetDetailData(state,action) {
  var {body:{panelId},response:{Result}} = action;
  // let {url,body,types} = action;
  var res = Result;
  var panelType = [
  ];
  if (res.SerialNumber) {
    panelType.push({'title':'资产编号','value':res.SerialNumber,'isNav':false,});
  }
  if (res.PanelType) {
    panelType.push({title:'型号',value:res.PanelType,isNav:false,});
  }
  if (res.PanelComponentSettings) {
    panelType.push({title:'关键配置信息',value:'',data:res.PanelComponentSettings,isNav:true,type:'PanelComponentSettings'});
  }
  if(res.IsLogbook===1){
    panelType.push({title:'配电柜网址',actionLabel:'访问',value:res.WebUrl,isNav:true,type:'web',isWeb:true});
  }
  // if(res.Factory){
  //   panelType.push({title:'生产厂商',value:res.Factory,isNav:false,});
  // }
  let arrStatistic = [];
  if(res.StatisticData) {
    arrStatistic = res.StatisticData.BasicStatistic.
    concat(res.StatisticData.DeviceStatistic).
    map((item)=>{
      return {
        title:item.Key,
        value:(item.Value+item.Unit),
        isNav:false,
      }
    });
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

  var busTemperature = (res.EnvData && res.EnvData.BusLineTemperature!==null)? res.EnvData.BusLineTemperature : null,
      temperature = (res.EnvData && res.EnvData.InpanelTemperature!==null) ? res.EnvData.InpanelTemperature : null,
      humidity = (res.EnvData && res.EnvData.InpanelHumidity!==null) ? res.EnvData.InpanelHumidity : null,
      dust = (res.EnvData && res.EnvData.InpanelDustDegree!==null) ? res.EnvData.InpanelDustDegree : null;

      busTemperature=formatNumber(busTemperature,0);
      temperature=formatNumber(temperature,0);
      humidity=formatNumber(humidity,0);
      dust=formatNumber(dust,1,true);

  var envNav = true;
  if(!privilegeHelper.hasAuth('AssetEditPrivilegeCode')){
    envNav = false;
  }

  let busTemp = [];
  if(res.ThermalSensorInfo && res.ThermalSensorInfo.length > 0) {
    res.ThermalSensorInfo.forEach(d => {
      if(d.MonitorParameters && d.MonitorParameters.length > 0) {
        d.MonitorParameters.forEach(p => {
          let math = '';
          if(p.EdgeFormula === 'Max') {
            math = '(最大值)';
          }
          if(p.EdgeFormula === 'Min') {
            math = '(最小值)';
          }
          busTemp.push({
            title:`${d.DeviceName}-${p.Name}${math}`,
            sensorName:p.Name,
            deviceName:d.DeviceName,
            math,
            unit:p.Unit||'',
            uid:p.UniqueId,
            did:p.DeviceId,
            value:p.Unit||''
          });
        });
      }
    });
  }

  var arrEnvDatas = [
    {title:'柜内温度',value: unit.combineUnit(temperature,'temperature'),rvalue:[temperature,unit.get('temperature')],isNav:envNav,type:'temperature',secType:'envSection'},
    {title:'柜内湿度','value': unit.combineUnit(humidity,'humidity'),rvalue:[humidity,unit.get('humidity')],isNav:envNav,type:'humidity',secType:'envSection'},
    {title:'柜内粉尘浓度',value:unit.combineUnit(dust,'dust'),rvalue:[dust,unit.get('dust')],isNav:envNav,type:'dust',secType:'envSection'},
  ];

  if(busTemp.length === 0) {
    arrEnvDatas.unshift(
      {title:'母排温度',value: unit.combineUnit(busTemperature,'temperature'),rvalue:[busTemperature,unit.get('temperature')],isNav:envNav,type:'busTemperature',secType:'envSection'},
    )
  }

  var envObj = {
    BusLineTemperature:busTemperature,
    InpanelTemperature:temperature,
    InpanelHumidity:humidity,
    InpanelDustDegree:dust,
    PanelId:panelId
  };

  if (res.SubType===10||res.SubType===30) {
     arrEnvDatas.splice(0,1);
     delete envObj['BusLineTemperature'];
   }

  var logCount = res.SceneLogs.length;
  var tendingCount=res.HistoryTicketsCount;
  var ticketsCount=res.RunningTicketsCount;
  var singleLineCount= res.SingleLineDiagrams.length;
  var runningCount=res.RunningPlanCount;
  var allElements=[
    [{title:'',value:res.LogoKey}],
    panelType,
    [{title:'资产文档',value:singleLineCount,isNav:true,type:'singleLine'}],
    arrEnvDatas,
  ];
  var allSecTitle=[
    '',
    '',
    ' ',
    '环境数据',
  ];
  if(busTemp.length > 0){
    allSecTitle.splice(3,0,{title:'母排温度',sensorHistory:true});
    allElements.splice(3,0,busTemp);
  }

  // if(groups.length>0){
  //   groups.forEach(item=>{
  //     allElements.push(item.subRow);
  //     allSecTitle.push(item.title);
  //   })
  // }


  //给维护日志tab组装数据
  let logPageData=[
    //[{title:'现场日志',value:logCount,isNav:true,type:'log'}],
    // [{title:'进行中计划',value:runningCount,isNav:true,type:'planning'}],
    [{title:'未完成工单',value:ticketsCount,isNav:true,type:'ticketing'}],
    [{title:'已完成工单',value:tendingCount,isNav:true,type:'tending'}]
  ];
  let logPageSection=['','','',''];

  //missing log
  if (arrStatistic.length>0) {
    allSecTitle.splice(3,0,'设备统计信息');
    allElements.splice(3,0,arrStatistic);
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

  var arrSinglePhotos=res.SingleLineDiagrams;
  arrSinglePhotos.forEach((item,index)=>{
    if(item.FileType) {
      //item.FileName = item.ImageId + '.' + item.FileType;
      item.PictureId = item.ImageId;
    }
  });

  return Immutable.fromJS({
    data:Immutable.fromJS(allElements),
    logPageData:Immutable.fromJS(logPageData),
    logPageSectionData:Immutable.fromJS(logPageSection),
    envObj:Immutable.fromJS(envObj),
    sectionData:Immutable.fromJS(allSecTitle),
    isFetching:false,
    logCount,
    panelType:res.PanelType,
    panelId,
    detail:res,
    busTemp:busTemp,
    isLookbook:res.IsLogbook==1,
    arrSinglePhotos:Immutable.fromJS(arrSinglePhotos),
    parent
  });
}

function setSensorTempData(state,action){
  let data = action.response.Result;
  if(data && data.length > 0) {
    let busTemp = state.getIn(['data',4]);
    if(busTemp && busTemp.size > 0) {
      data.forEach(p => {
        let index = busTemp.findIndex(t => t.get('uid') === p.Id);
        if (index >= 0) {
          let unit = busTemp.getIn([index,'unit']) || '';
          busTemp = busTemp.setIn([index,'value'],`${p.Val}${unit}`)
        }
      });
      state=state.setIn(['data',4],busTemp);
    }
  }
  return state;
}

function envChanged(state,action) {
  var {response:{Result}} = action;
  var newState = state.set('envObj',Immutable.Map(Result));
  var envIndex=findSectioniIndexByType(newState.get('data'),'envSection');
  return newState.set('data',newState.get('data').update(envIndex,(item)=>{
    var res = Result;
    var busTemperature = res.BusLineTemperature ? res.BusLineTemperature : null,
        temperature = res.InpanelTemperature ? res.InpanelTemperature : null,
        humidity = res.InpanelHumidity ? res.InpanelHumidity : null,
        dust = res.InpanelDustDegree ? res.InpanelDustDegree : null;

        busTemperature=formatNumber(busTemperature,0);
        temperature=formatNumber(temperature,0);
        humidity=formatNumber(humidity,0);
        dust=formatNumber(dust,1,true);

    if (item.size===4) {
      return item.setIn([0,'value'],unit.combineUnit(busTemperature,'temperature')).
                  setIn([0,'rvalue'],Immutable.fromJS([busTemperature,unit.get('temperature')])).
                  setIn([1,'value'],unit.combineUnit(temperature,'temperature')).
                  setIn([1,'rvalue'],Immutable.fromJS([temperature,unit.get('temperature')])).
                  setIn([2,'value'],unit.combineUnit(humidity,'humidity')).
                  setIn([2,'rvalue'],Immutable.fromJS([humidity,unit.get('humidity')])).
                  setIn([3,'value'],unit.combineUnit(dust,'dust')).
                  setIn([3,'rvalue'],Immutable.fromJS([dust,unit.get('dust')]));
    }else if (item.size===3) {
      return item.setIn([0,'value'],unit.combineUnit(temperature,'temperature')).
                  setIn([0,'rvalue'],Immutable.fromJS([temperature,unit.get('temperature')])).
                  setIn([1,'value'],unit.combineUnit(humidity,'humidity')).
                  setIn([1,'rvalue'],Immutable.fromJS([humidity,unit.get('humidity')])).
                  setIn([2,'value'],unit.combineUnit(dust,'dust')).
                  setIn([2,'rvalue'],Immutable.fromJS([dust,unit.get('dust')]));
    }
    }));
}

function addLogsCount(state,action) {
  var {hierarchyId,response:{Result}} = action;
  if(state.get('panelId') === hierarchyId){
    if(!Result){
      Result = [];
    }
    var len = Result.length;
    if(state.get('logCount') !== len){
      var newState = state.set('logCount',len);
      var indexSec=findSectioniIndexByType(newState.get('data'),'logSection');
      var data = newState.get('data');
      data = data.setIn([indexSec,0,'value'],len);
      return newState.set('data',data);
    }

  }
  return state;
}



function imageChanged(state,action) {
  let {data,hierarchyType} = action;
  if(hierarchyType !== 'panel') return state;
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

function handleError(state,action) {
  var {Error} = action.error;
  // console.warn('handleError',Error);
  var strError=null;
  switch (Error) {
    case '040001307022':
      strError = '您没有这一项的操作权限，请联系系统管理员';
      action.error=null;
      break;
    case '040000307009':
      strError = '无查看资产权限，联系管理员';
      action.error=null;
      break;
  }
  if (action.error==='403') {
    action.error=Error;
    strError='';
  }
  return state.set('isFetching',false).set('errorMessage',strError);
}


export default function(state=defaultState,action){
  switch (action.type) {
    case PANEL_LOAD_REQUEST:
      return state.set('isFetching',true);
    case PANEL_LOAD_SUCCESS:
      return updateAssetDetailData(state,action);
    case PANEL_LOAD_FAILURE:
    case PANEL_SAVE_ENV_FAILURE:
      return handleError(state,action);
    case PANEL_SAVE_ENV_SUCCESS:
      return envChanged(state,action);
    case ASSET_LOGS_SUCCESS:
      return addLogsCount(state,action);
    case ASSET_IMAGE_CHANGED:
      return imageChanged(state,action);
    case ASSET_IMAGE_CHANGED_COMPLETE:
      return imageChangedComplete(state,action);
    case LOGBOOK_UPDATE_PANEL_SUCCESS:
      let newState=state.set('panelType',action.body.PanelType);
      action.body.panelId=action.body.Id;
      return updateAssetDetailData(newState,action);
    case PANEL_GET_SENSORS_TEMP_SUCCESS:
      return setSensorTempData(state,action);
    case PANEL_GET_SENSORS_TEMP_FAILURE:
      action.error = null;//实时点位获取失败，不提示错误
      return state;
    case LOGOUT_SUCCESS:
      return defaultState;
    default:

  }
  return state;
}
