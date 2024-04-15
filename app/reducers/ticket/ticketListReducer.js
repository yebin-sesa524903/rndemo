'use strict';


import {
  TICKET_LOAD_REQUEST,
  TICKET_LOAD_SUCCESS,
  TICKET_LOAD_FAILURE,
  TICKET_NEXTPAGE,
  TICKET_EXECUTE_SUCCESS,
  TICKET_FINISH_SUCCESS,
  TICKET_FINISH_FAILURE,
  TICKET_EXECUTE_FAILURE,
  TICKET_LOG_DELETE_FAILURE,
  TICKET_DELETE_SUCCESS,
  TICKET_COUNT_LOAD_SUCCESS,TICKET_COUNT_LOAD_REQUEST,
  TICKET_CHANGED_SEARCH_DATE,
  TICKET_DOWNLOAD_REQUEST,
  TICKET_DOWNLOAD_SUCCESS,
  TICKET_DOWNLOAD_FAILURE,
  DOWNLOAD_TICKET_IMAGES,
  OFFLINE_TICKETS, TICKET_CHACHE_COUNT_LOAD, TICKET_FOLD,
  TICKET_REJECT_SUCCESS,
  SERVICE_TICKET_LOAD_REQUEST,
  SERVICE_TICKET_LOAD_SUCCESS,
  SERVICE_TICKET_LOAD_FAILURE,
  TICKET_LOAD_BYID_SUCCESS, TICKET_COUNT_LOAD_FAILURE
} from '../../actions/ticketAction';

// import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import {commonReducer} from '../commonReducer.js';
import Immutable from 'immutable';
import moment from 'moment';
import storage from '../../utils/storage';
import {cacheDownloadTickets,cacheDownloadServiceTickets} from '../../utils/sqliteHelper.js';
import {CHANGE_PARTNER_SUCCESS} from '../../actions/loginAction'
import {downloadDocs} from '../../utils/fileHelper';

let today=moment().format('YYYY-MM-DD');

var defaultState = Immutable.fromJS({
  downloadPosting:0,
  service:{
    data:null,//source datas
    allDatas:null,//category datas
    sectionData:[],
    pageCount:0,
    isFetching:false,
    filter:{
      CurrentPage:1,
      ItemsPerPage:20,
      StartTime:today,
      EndTime:today,
      SearchDate:today
    }
  },
  todayData:{
    data:null,//source datas
    allDatas:null,//category datas
    sectionData:[],
    pageCount:0,
    isFetching:false,
    filter:{
      TicketTaskType:1,
      CurrentPage:1,
      ItemsPerPage:20,
      SearchDate:today
    }
  },
  lastData:{
    data:null,
    allDatas:null,
    sectionData:[],
    pageCount:0,
    isFetching:false,
    filter:{
      TicketTaskType:3,
      // TicketTaskType:1,
      CurrentPage:1,
      ItemsPerPage:20
    }
  },
  futureData:{
    data:null,
    allDatas:null,
    sectionData:[],
    pageCount:0,
    isFetching:false,
    filter:{
      TicketTaskType:2,
      CurrentPage:1,
      ItemsPerPage:20
    }
  },
});

function startRequest(state,action) {
  var {typeTicketTask} = action;
  var oneData = state.get(typeTicketTask);
  var searchDate=action.body.SearchDate;
  if(searchDate !== oneData.getIn(['filter','SearchDate'])) return state;
  oneData=oneData.set('isFetching',true).set('totalCount',0);
  return state.set(typeTicketTask,oneData).set('errMsg',null);
}

function mergeData(state,action) {
  var {typeTicketTask,offline} = action;
  var response = action.response.Result;

  var searchDate=action.body.SearchDate;
  var newState = state;
  var page = action.body.CurrentPage;
  var oneData = newState.get(typeTicketTask);
  //如果查询慢，可能先查询后出结果，避免这种情况
  if(searchDate !== oneData.getIn(['filter','SearchDate'])) return state;
  if (response&&response.Items) {
    response.Items.forEach((item)=>{
      if(item.TicketType===6&&item.Content){
        item.InspectionContent=JSON.parse(item.Content);
      }
      item.isFutureTask=typeTicketTask==='futureData';
    });
  }
  if(page === 1){
    oneData = oneData.set('data',Immutable.fromJS(response.Items));

    let doDelete=false;
    let hasData = true;
    if(!response.Items||response.Items.length===0){
      //说明这一天没有数据，不显示绿点
      doDelete=false;
      hasData = false;
    }
    if(!offline) {
      let ticketCount = newState.get('ticketCount') || [];
      let index = ticketCount.findIndex(item2 => item2 === searchDate);
      if (index >= 0) {
        if (doDelete)
          ticketCount.splice(index, 1);
      } else {
        if (hasData && searchDate) {
          ticketCount.push(searchDate);
          ticketCount = [].concat(ticketCount);
        }
      }
      newState = newState.set('ticketCount', ticketCount);
    }

    newState = newState.set(typeTicketTask,oneData);
    // console.warn('1mergeData...Items...',newState.get('lastData'));//typeTicketTask,newState.get(['lastData','data']));
  }
  else {
    var oldData = oneData.get('data')||Immutable.fromJS([]);
    // console.warn('0 mergeData...Items...',typeTicketTask,page,oldData.size);
    var newList = Immutable.fromJS(response.Items);
    newList = oldData.push(...newList.toArray());
    oneData = oneData.set('data',newList);
    // console.warn('1 mergeData...Items...',typeTicketTask,page,newList.size);
    newState = newState.set(typeTicketTask,oneData);
  }
  // console.warn('CurrentPage',page,response.PageCount,newState.get('data').size,);
  oneData=oneData.set('pageCount',typeTicketTask === 'service' ? response.TotalPages : response.PageCount).set('isFetching',false);
  oneData=oneData.set('totalCount',typeTicketTask === 'service' ? response.TotalItems : response.TotalItemsCount);
  oneData=oneData.set('hasPatrolTicket',response.ExistsInspectionTickets);
  newState = newState.set(typeTicketTask,oneData);
  newState = categoryAllDatas(typeTicketTask,newState).set('errMsg',null);
  return newState;
}

function foldTickets(state,action) {
  let {type,index,isFold} = action.data;
  let newData=state;
  let oneData=newData.get(type);
  let sectionData=oneData.get('sectionData');
  sectionData=sectionData.setIn([index,'isFold'],isFold);
  let realDatas=oneData.get('realDatas');
  let allDatas=oneData.get('allDatas');
  if(isFold){
    allDatas=allDatas.set(index,Immutable.fromJS([]));
  }else{
    allDatas=allDatas.set(index,realDatas.get(index));
  }
  oneData=oneData.set('sectionData',sectionData).set('allDatas',allDatas);
  newData=newData.set(type,oneData);
  return newData;
}

function categoryAllDatas(typeTicketTask,state)
{
  var newState = state;
  var oneData = newState.get(typeTicketTask);
  var Items = oneData.get('data');
//region 分组过程
  var listStatus1 = [];
  var listStatus2 = [];
  var listStatus3 = [];
  var listStatus4 = [];
  var listStatus5 = [];
  var listStatus6 = [];//待接单分组
  let listStatus7 = [];//已驳回
  Items.forEach((item)=>{
    //如果有IsDJD=true，表示待接单工单，单独置顶显示
    if(item.get('IsDJD')){
      listStatus6.push(item);
      return;
    }
    if (item.get('Status')===1) {
      listStatus1.push(item);
    }else if (item.get('Status')===2) {
      listStatus2.push(item);
    }else if (item.get('Status')===4) {
      listStatus3.push(item);
    }else if (item.get('Status')===3) {
      listStatus4.push(item);
    }else if (item.get('Status')===5) {
      listStatus5.push(item);
    }else if(item.get('Status') === 9) {
      listStatus7.push(item);
    }
  });
  var sectionTitle = [];
  var allDatas = [];
  var trace={pending:0,doing:0,submitted:0,finish:0}
  if(typeTicketTask === 'service') {
    //region 服务工单分组
    if (listStatus1.length > 0) {
      allDatas.push(listStatus1);
      sectionTitle.push({title: '未开始', isFold: false, count: listStatus1.length});
      trace.pending = listStatus1.length;
    }
    if (listStatus2.length > 0) {
      allDatas.push(listStatus2);
      sectionTitle.push({title: '执行中', isFold: false, count: listStatus2.length});
      trace.doing = listStatus2.length;
    }
    if (listStatus4.length > 0) {
      allDatas.push(listStatus4);
      sectionTitle.push({title: '已提交', isFold: false, count: listStatus4.length});
      trace.submitted = listStatus4.length;
    }
    if (listStatus3.length > 0) {
      allDatas.push(listStatus3);
      sectionTitle.push({title: '已驳回', isFold: false, count: listStatus3.length});

    }
    if (listStatus5.length > 0) {
      allDatas.push(listStatus5);
      sectionTitle.push({title: '已关闭', isFold: false, count: listStatus5.length});
      trace.finish = listStatus5.length;
    }
    //endregion
  } else {
    //region 非服务工单分组
    if (listStatus6.length > 0) {
      allDatas.push(listStatus6);
      sectionTitle.push({title: '待接单', isFold: false, count: listStatus6.length, IsDJD: true});
    }
    if (listStatus5.length > 0) {
      allDatas.push(listStatus5);
      sectionTitle.push({title: '待派工', isFold: false, count: listStatus5.length});
    }
    if (listStatus1.length > 0) {
      allDatas.push(listStatus1);
      sectionTitle.push({title: '未开始', isFold: false, count: listStatus1.length});
      trace.pending = listStatus1.length;
    }
    if (listStatus2.length > 0) {
      allDatas.push(listStatus2);
      sectionTitle.push({title: '执行中', isFold: false, count: listStatus2.length});
      trace.doing = listStatus2.length;
    }
    if (listStatus3.length > 0) {
      allDatas.push(listStatus3);
      sectionTitle.push({title: '已提交', isFold: false, count: listStatus3.length});
      trace.submitted = listStatus3.length;
    }
    if(listStatus7.length > 0) {
      allDatas.push(listStatus7);
      sectionTitle.push({title: '已驳回', isFold: false, count: listStatus7.length});
      trace.reject = listStatus7.length;
    }
    if (listStatus4.length > 0) {
      allDatas.push(listStatus4);
      sectionTitle.push({title: '已关闭', isFold: false, count: listStatus4.length});
      trace.finish = listStatus4.length;
    }
    //endregion
  }
  //endregion
  let realDatas=[].concat(allDatas);
  // console.warn('categoryAllDatas',allDatas);
  oneData=oneData.set('sectionData',Immutable.fromJS(sectionTitle)).set('allDatas',Immutable.fromJS(allDatas))
    .set('trace',Immutable.fromJS(trace)).set('realDatas',Immutable.fromJS(realDatas));
  newState = newState.set(typeTicketTask,oneData);
  return newState;
}

function nextPage(state,action) {
  var {data:{typeTicketTask,isFirstPage}} = action;
  var oneData = state.get(typeTicketTask);
  var filter = oneData.get('filter');
  if (isFirstPage) {
    filter = filter.set('CurrentPage',null).set('CurrentPage',1);
  }else {
    filter = filter.set('CurrentPage',filter.get('CurrentPage')+1);
  }
  oneData=oneData.set('filter',filter);//.set('isFetching',true);

  // console.warn('nextPagenextPage...',typeTicketTask,isFirstPage,filter);
  return state.set(typeTicketTask,oneData);
}

function changeSearchDate(state,action) {
  let {data:{typeTicketTask,searchDate}} = action;
  let oneData = state.get(typeTicketTask);
  oneData=oneData.set('data',null).set('allDatas',null).set('isFetching',true)
    .set('sectionData',Immutable.fromJS(null)).set('pageCount',0).set('totalCount',0);
  let filter = oneData.get('filter');
  filter=filter.set('CurrentPage',1).set('SearchDate',searchDate).set('StartTime',searchDate)
    .set('EndTime',searchDate);
  oneData=oneData.set('filter',filter);
  let other = typeTicketTask === 'service' ? 'todayData' : 'service';
  let otherData = state.get(other);
  otherData=otherData.merge(oneData);
  return state.set(typeTicketTask,oneData).set(other,otherData);
}

function handleError(state,action) {
  var {Error} = action.error;
var {typeTicketTask}=action;
  //设置isFetching字段
  state=state.setIn([typeTicketTask,'isFetching'],false);
  switch (Error) {
    case '050001251405':
      action.error = '工单已经开始执行，请刷新查看';
      break;
    case '040001307022':
      action.error = '';//'您没有这一项的操作权限，请联系系统管理员';
      state=state.set('errMsg','您没有这一项的操作权限，请联系系统管理员');
      state=state.setIn([typeTicketTask,'data'],null)
      .setIn([typeTicketTask,'allDatas'],Immutable.fromJS([]))
      .setIn([typeTicketTask,'isFetching'],false);
      break;
    case '050001251409':
      action.error = '您不是该工单的执行人，请联系系统管理员';
      break;
  }
  return state;
}

function execute(state,action) {
  // console.warn('ticket list execute...',action);
  var {body:{ticketId},response:{Result:{ActualStartTime,Status}}} = action;

  var dataTypes=['lastData','todayData','futureData'];
  for (var i = 0; i < dataTypes.length; i++) {
    var oneData=state.get(dataTypes[i]);
    if (!oneData.get('data')) {
      continue;
    }
    var index = oneData.get('data').findIndex((item) => item.get('Id') === ticketId);
    // console.warn('execute...',index);
    if (index!==-1) {
      oneData=oneData.set('data',oneData.get('data').update(index,(item) =>{
        return item.set('ActualStartTime',ActualStartTime).set('Status',Status);
      }));
      state=state.set(dataTypes[i],oneData);
      state = categoryAllDatas(dataTypes[i],state);
      return state;
    }
  }
  return state;
}

function finish(state,action) {
  // console.warn('ticket list finish...',action);
  var {body:{ticketId},response:{Result:{ActualEndTime,Status}}} = action;

  var dataTypes=['lastData','todayData','futureData'];
  for (var i = 0; i < dataTypes.length; i++) {
    var oneData=state.get(dataTypes[i]);
    if (!oneData.get('data')) {
      continue;
    }
    var index = oneData.get('data').findIndex((item) => item.get('Id') === ticketId);
    if (index!==-1) {
      oneData=oneData.set('data',oneData.get('data').update(index,(item) =>{
        return item.set('ActualEndTime',ActualEndTime).set('Status',Status);
      }));
      state=state.set(dataTypes[i],oneData);
      state = categoryAllDatas(dataTypes[i],state);
      return state;
    }
  }
  return state;
}

function deleteTicket(state,action) {
  var {body:{ticketId}} = action;
  var dataTypes=['lastData','todayData','futureData'];
  for (var i = 0; i < dataTypes.length; i++) {
    var oneData=state.get(dataTypes[i]);
    if (!oneData.get('data')) {
      continue;
    }
    var index = oneData.get('data').findIndex((item) => item.get('Id') === ticketId);
    if (index!==-1) {
      var oneData=oneData.set('data',oneData.get('data').delete(index));
      state=state.set(dataTypes[i],oneData);
      state = categoryAllDatas(dataTypes[i],state);
      return state;
    }
  }
  return state;
}

function updateTicketCount(state,action) {
  let newState=state;
  let ticketCount=newState.get('ticketCount')||[];
  if(action.response.Result){
    action.response.Result.forEach(item=>{
      let date=moment(item.Date).format('YYYY-MM-DD');
      let index=ticketCount.findIndex(item2=>item2===date);
      if(index<0){
        ticketCount.push(date);
      }
    });
    newState=newState.set('ticketCount',[].concat(ticketCount))
      .set('beginDate',moment(action.body.BeginDate).format('YYYY-MM-DD'))
      .set('endDate',moment(action.body.EndDate).format('YYYY-MM-DD'))
      .set('ticketCountFetching',false);
  }
  return newState;
}

function downloadServiceTickets(state,action) {
  state=state.set('downloadPosting',0);
  let  res=action.response.Result;
  let  arrTickets=[];
  if (res && res.length > 0) {
    //结构体有变，需要进行整合
    res.forEach(item => {
      let ticket = item.TicketInfo;
      ticket.HierarchyList = item.HierarchyList;
      arrTickets.push(ticket);
    });
    //收集服务报告任务日志里面的图片，用于后面的统一下载图片
    state=findNeedDownloadImages(state,arrTickets);
  }
  state=state.set('nCurrCacheTicketsCount',arrTickets.length);
  //缓存下载的服务工单
  cacheDownloadServiceTickets(action.body.SearchDate,arrTickets);
  return state;
}

function downloadTickets(state,action) {
  state=state.set('downloadPosting',0);
  // storage.setItem(action.body.SearchDate,JSON.stringify(action.response));
  var res=action.response.Result;
  var arrTickets=[];
  if (res && res.Items) {
    arrTickets=res.Items;
    state=findNeedDownloadImages(state,arrTickets);
  }
  state=state.set('nCurrCacheTicketsCount',arrTickets.length);
  //找出需要下载的图片id,然后存在，供后面接着下载图片用
  cacheDownloadTickets(action.body.SearchDate,arrTickets);
  return state;
}

function findNeedDownloadImages(state,items) {
  let imgs=[];
  let docs=[];
  items.forEach(item=>{
    //做判断
    if(item.InspectionContent&&item.InspectionContent.length>0){
      item.InspectionContent[0].MainItems.forEach(mainItem=>{
        mainItem.SubItems.forEach(subItem=>{
          if(subItem.Pictures&&subItem.Pictures.length>0){
            imgs=imgs.concat(subItem.Pictures.map(img=>{return {pid:img.PictureId}}));
          }
        });
      });
    }
    //还有判断日志里面的图片
    if(item.Logs&&item.Logs.length>0){
      item.Logs.forEach(log=>{
        if(log.Pictures&&log.Pictures.length>0){
          imgs=imgs.concat(log.Pictures.map(img=>{return {pid:img.PictureId,isLogImage:true}}));
        }
      });
    }
    //如果有文档，则需要下载文档
    if(item.Documents&&item.Documents.length>0){
      docs=docs.concat(item.Documents);
    }

    //判断签名文件
    if(item.SignFilePath){
      imgs.push({pid:item.SignFilePath,isSign:true})
    }
    //处理服务工单(为了判断是否是服务工单）
    if(item.Content && item.ReportId && !item.TicketType) {
      //查找执行人里面的图片
      if(item.ExecuteUsers && item.ExecuteUsers.length > 0) {
        item.ExecuteUsers.forEach(user => {
          console.warn('user photo',typeof user.Photo)
          if(user.Photo && typeof user.Photo === 'string') {
            imgs.push({pid:user.Photo})
          }
        })
      }
      for(let key in item.Content) {
        let task = item.Content[key];
        if(task.ItemInfo.InspectionInfoList && task.ItemInfo.InspectionInfoList.length > 0) {
          //非保护定值 日志图片
          task.ItemInfo.InspectionInfoList.forEach(log => {
            if (log.Images && log.Images.Value && log.Images.Value.length> 0) {
              log.Images.Value.forEach(img => {
                if(img && typeof img ==='string') {
                  imgs.push({pid:img})
                }
              })
            }
          });
        }
        //保护定值日志图片
        if(task.ItemInfo && task.ItemInfo.LowVoltageConstantValueInfo
          && task.ItemInfo.LowVoltageConstantValueInfo.Images
          && task.ItemInfo.LowVoltageConstantValueInfo.Images.Value){
          let optImages = task.ItemInfo.LowVoltageConstantValueInfo.Images.Value;
          for(let imgKey in optImages) {
            let img = optImages[imgKey];
            if(img && typeof img === 'string') {
              imgs.push({pid:img})
            }
          }
        }
      }
    }
  });



  if(imgs.length>0||docs.length>0){
    state=state.set('needDownloadImages',imgs);
    console.warn('need to download imgs',imgs);
    state=state.set('needDownloadDocs',docs);
    state=state.set('downloadPosting',4);//表示需要下载图片
  }
  return state;
}

function rejectTicket(state,action) {
  //根据工单ID，从待接单分组中去掉此工单
  let newState=state;//todayData
  let oneData=newState.get('todayData');
  let sectionData=oneData.get('sectionData');
  let realDatas=oneData.get('realDatas');
  let allDatas=oneData.get('allDatas');
  if(sectionData.size>0 && sectionData.getIn([0,'IsDJD'])){
    //说明有
    let index=realDatas.get(0).findIndex(item=>item.get('Id')===action.body.ticketId);
    if(index>=0){
      let oneGroup=sectionData.get(0);
      oneGroup=oneGroup.set('count',oneGroup.get('count')-1);
      sectionData=sectionData.set(0,oneGroup);
      //如果一条也没有，那么不显示此条目
      let count=oneGroup.get('count');
      if(count<=0){
        sectionData=sectionData.delete(0);
        allDatas=allDatas.delete(0);
      }else{
        realDatas=realDatas.set(0,realDatas.get(0).delete(index));
        if(allDatas.get(0).size>0){
          allDatas=allDatas.set(0,allDatas.get(0).delete(index));
        }
      }

      oneData=oneData.set('sectionData',sectionData).set('allDatas',allDatas)
        .set('realDatas',realDatas);
      newState=newState.set('todayData',oneData);
    }
  }
  return newState;
}

function downloadCacheTicketCount(state,action) {
  let newState=state;
  let ticketCount=newState.get('offlineTicketCount')||[];
  if(action.data){
    action.data.forEach(item=>{
      let date=moment(item).format('YYYY-MM-DD');
      let index=ticketCount.findIndex(item2=>item2===date);
      if(index<0){
        ticketCount.push(date);
      }
    });
    // console.warn('ticketcount',ticketCount,action);
    newState=newState.set('offlineTicketCount',[].concat(ticketCount));
  }
  return newState;
}

export default commonReducer((state,action)=>{

  switch (action.type) {
    // case TICKET_LOAD_BYID_SUCCESS:
    //   return testDo(state,action);
    case TICKET_LOAD_REQUEST:
    case SERVICE_TICKET_LOAD_REQUEST:
      return startRequest(state,action);
    case TICKET_LOAD_SUCCESS:
    case OFFLINE_TICKETS:
    case SERVICE_TICKET_LOAD_SUCCESS:
      return mergeData(state,action);
    case TICKET_NEXTPAGE:
      return nextPage(state,action);
    case TICKET_CHANGED_SEARCH_DATE:
      return changeSearchDate(state,action);
    case TICKET_EXECUTE_SUCCESS:
      return execute(state,action);
    case TICKET_FINISH_SUCCESS:
      return finish(state,action);
    case TICKET_DELETE_SUCCESS:
      return deleteTicket(state,action);
    case TICKET_COUNT_LOAD_REQUEST:
      return state.set('ticketCountFetching',true)
    case TICKET_COUNT_LOAD_FAILURE:
      return state.set('ticketCountFetching',false)
    case TICKET_COUNT_LOAD_SUCCESS:
      return updateTicketCount(state,action);
    case TICKET_COUNT_LOAD_FAILURE:
      handleError(state,action);
      return state;
    case TICKET_DOWNLOAD_REQUEST:
      return state.set('downloadPosting',1);
    case TICKET_DOWNLOAD_SUCCESS:
      if(action.isService) return downloadServiceTickets(state,action);
      return downloadTickets(state,action);
    case TICKET_DOWNLOAD_FAILURE:
      handleError(state,action);
      return state.set('downloadPosting',2);
    case DOWNLOAD_TICKET_IMAGES:
      return state.set('downloadPosting',0);
    case TICKET_CHACHE_COUNT_LOAD:
      return downloadCacheTicketCount(state,action);
    case TICKET_FOLD:
      return foldTickets(state,action);
    case TICKET_REJECT_SUCCESS:
      return rejectTicket(state,action);
    case TICKET_LOAD_FAILURE:
    case SERVICE_TICKET_LOAD_FAILURE:
    case TICKET_FINISH_FAILURE:
    case TICKET_EXECUTE_FAILURE:
    case TICKET_LOG_DELETE_FAILURE:
      return handleError(state,action);

    case CHANGE_PARTNER_SUCCESS:
      return defaultState;
    default:

  }
  return state;
},defaultState);
