'use strict';

import {
  TICKET_FILTER_CHANGED,
  TICKET_FILTER_NEXTPAGE,
  TICKET_FILTER_BUILDING_REQUEST,
  TICKET_FILTER_BUILDING_SUCCESS,
  TICKET_FILTER_BUILDING_FAILURE,
  TICKET_FILTER_CLOSED,
  TICKET_FILTER_RESETRESULT,
  TICKET_FILTER_SEARCH,
  TICKET_FILTER_REQUEST,
  TICKET_FILTER_SUCCESS,
  TICKET_FILTER_FAILURE,
  TICKET_FILTER_RESET,TICKET_FILTER_FOLDER,
  TICKET_FILTER_SET_TYPE,
  SERVICE_TICKET_FILTER_LOAD_REQUEST,
  SERVICE_TICKET_FILTER_LOAD_SUCCESS,
  SERVICE_TICKET_FILTER_LOAD_FAILURE
} from '../../actions/ticketAction';

import {LOGOUT_SUCCESS} from '../../actions/loginAction.js';
import pinyin from 'pinyin';

import Immutable from 'immutable';
import moment from 'moment';
moment.locale('zh-cn');

var today = moment().format('YYYY-MM-DD');
var lastMonth=moment(today).subtract(1,'M').format('YYYY-MM-DD');
var nextMonth=moment(today).subtract(-1,'M').format('YYYY-MM-DD');

var defaultState = Immutable.fromJS({
    isFetching:true,
    isFilterFetching:false,
	  buildingsData:[],
    arrBuildsName:[],
    selectDatas:{
      ticketStartTime:today,
      ticketEndTime:nextMonth,
    	ticketStrId:'',
    	ticketStatus:[],
    	ticketTypes:[],
    	selectBuilds:[],
    },
    reqParams:null,
    data:null,
    allDatas:null,
    sectionData:[],
    pageCount:0,
    filter:{
      CurrentPage:1,
      ItemsPerPage:20,
    },
});

function ticketFilterChange(state,action){
  var {data:{type,value}} = action;
  if (type==='ticketStrId') {
    state=state.setIn(['selectDatas','ticketStrId'],value);
  }else if (type==='StartTime') {
    var startTime = moment(value).format('YYYY-MM-DD');
    state=state.setIn(['selectDatas','ticketStartTime'],startTime);
  }else if (type==='EndTime') {
    var endTime = moment(value).format('YYYY-MM-DD');
    state=state.setIn(['selectDatas','ticketEndTime'],endTime);
  }else if (type==='status') {
    var arrStatus=state.getIn(['selectDatas','ticketStatus']);
    var index = arrStatus.findIndex((item)=> item === value);
    if (index===-1) {
      arrStatus=arrStatus.push(value);
    }else {
      arrStatus=arrStatus.remove(index);
    }
    state=state.setIn(['selectDatas','ticketStatus'],arrStatus);
  }else if (type==='types') {
    var arrStatus=state.getIn(['selectDatas','ticketTypes']);
    var index = arrStatus.findIndex((item)=> item === value);
    if (index===-1) {
      arrStatus=arrStatus.push(value);
    }else {
      arrStatus=arrStatus.remove(index);
    }
    state=state.setIn(['selectDatas','ticketTypes'],arrStatus);
  }else if (type==='building') {
    var arrStatus=state.getIn(['selectDatas','selectBuilds']);
    var index = arrStatus.findIndex((item)=> item === value);
    if (index===-1) {
      arrStatus=arrStatus.push(value);
    }else {
      arrStatus=arrStatus.remove(index);
    }
    state=state.setIn(['selectDatas','selectBuilds'],arrStatus);
  }

  return state;
}

function nextPage(state,action) {
  var {data:{isFirstPage}} = action;
  var filter = state.get('filter');
  if (isFirstPage) {
    filter = filter.set('CurrentPage',null).set('CurrentPage',1);
  }else {
    filter = filter.set('CurrentPage',filter.get('CurrentPage')+1);
  }
  return state.set('filter',filter);
}

function filterClosed(state,action) {
  return defaultState;
}

function filterParamReset(state,action) {
  var arr=Immutable.fromJS([]);
  state=state.setIn(['selectDatas','ticketStrId'],Immutable.fromJS(''));
  state=state.setIn(['selectDatas','ticketStartTime'],today);
  state=state.setIn(['selectDatas','ticketEndTime'],nextMonth);
  state=state.setIn(['selectDatas','ticketStatus'],arr);
  state=state.setIn(['selectDatas','ticketTypes'],arr);
  state=state.setIn(['selectDatas','selectBuilds'],arr);
  return state;
}

function mergeTicketData(state,action) {
  var response = action.response.Result;
  var page = action.body.CurrentPage;

  if (response&&response.Items) {
    response.Items.forEach((item)=>{
      item.isFutureTask=false;
    });
  }
  // console.warn('000000',response.Items.length);
  if(page === 1){
    state = state.set('data',Immutable.fromJS(response.Items));
  }
  else {
    var oldData = state.get('data');
    // console.warn('0 mergeData...Items...',typeTicketTask,page,oldData.size);
    var newList = Immutable.fromJS(response.Items);
    newList = oldData.push(...newList.toArray());
    state = state.set('data',newList);
  }
  console.warn('CurrentPage',page,response.PageCount,state.get('data').size);
  state=state.set('pageCount',state.get('isService') ? response.TotalPages :response.PageCount).set('isFilterFetching',false);
  state=categoryAllDatas(state);
  return state;
}

function isNotLetter(value) {
  let letters='abcdefghijklmnopqrstuvwxyz';
  return letters.indexOf(String(value).toLocaleLowerCase())<0;
}

function mergeTicketBuilding(state,action) {
  var result = action.response.Result;
  result = result.map((item)=>{
    return {
      Id:item.Id,
      Name:item.Name
    }
  });

  //这里根据建筑名称，按照字母表顺序排序
  result.sort((a,b)=>{
    return pinyin.compare(a.Name,b.Name);
  });

  let builds=[];
  result.forEach(item=>{
    let py=pinyin(item.Name,{style:pinyin.STYLE_NORMAL});
    let key=(py[0][0][0]).toUpperCase();
    if(isNotLetter(key)){
      key='#'
    }
    let index=builds.findIndex(item=>{
      return item.Name===key;
    });
    if(index>=0){
      builds[index].Children.push(item);
    }else{
      builds.push({
        Name:key,
        Children:[item]
      })
    }
  });

  builds.sort((a,b)=>{
    return a.Name.localeCompare(b.Name);
  });


  var newState = state.set('buildingsData',Immutable.fromJS(builds));
  // result.unshift({id:-1,name:'全部楼宇'});
  // newState = newState.set('arrBuildsName',
  //         Immutable.fromJS(result.map((item)=>{
  //           return item.Name
  //         })));

  return newState.set('isFetching',false);
}

function mergeServiceSearchParam(state,action) {

  let ticketId=state.getIn(['selectDatas','ticketStrId']);
  if(ticketId !== null && ticketId !== undefined) ticketId = ticketId.trim()
  let StartTime=state.getIn(['selectDatas','ticketStartTime']);
  let EndTime=state.getIn(['selectDatas','ticketEndTime']);
  let cSelects=state.getIn(['selectDatas','selectBuilds']).toJS();
  let arrStatus=state.getIn(['selectDatas','ticketStatus']);
  arrStatus = arrStatus.map((item)=>{
    return item + 1
  }).toArray();
  let body = {
    "name": ticketId,
    "startTime": StartTime,
    "endTime": EndTime,
    "status": arrStatus,
    "customerIds": cSelects,
  }

  return state.set('reqParams',body).set('hasFilter',true).setIn(['filter','CurrentPage'],1);
}

function mergeAllSearchParam(state,action)
{
  if(state.get('isService')) {
    //如果是服务报告筛选，则走此处理逻辑
    return mergeServiceSearchParam(state,action);
  }
  var TicketId=state.getIn(['selectDatas','ticketStrId']);
  var TicketStatus=[];
  var TicketTypes=[];
  var Hierarchies=[];
  var arrSelects=state.getIn(['selectDatas','ticketStatus']);
  var IsDJD=false;
  arrSelects.forEach((item)=>{
    switch (item) {
      case 0://待接单
        // TicketStatus.push(0);
        IsDJD=true;
        break;
      case 1:
        TicketStatus.push(1);
        break;
      case 2:
        TicketStatus.push(2);
        break;
      case 3:
        TicketStatus.push(4);
        break;
      case 4:
        TicketStatus.push(9);
        break;
      case 5:
        TicketStatus.push(3);
        break;
      default:
    }
  });

  //如果isdjd不是true,如果ticketstatus不为空
  if(!IsDJD){
    if(TicketStatus.length>0){
      IsDJD=false;
    }else{
      IsDJD=true;
      TicketStatus=[1,2,3,4];
    }
  }

  var arrSelects=state.getIn(['selectDatas','ticketTypes']);
  arrSelects.forEach((item)=>{
    //现在只保留 巡检，计划，现场
    switch (item) {
      case 0:
        TicketTypes.push(6);//巡检
        break;
      case 1:
        TicketTypes.push(1);//计划
        break;
      case 2:
        TicketTypes.push(4);//报警
        break;
      default:
    }

    // switch (item) {
    //   case 0:
    //     TicketTypes.push(6);//巡检
    //     break;
    //   case 1:
    //     TicketTypes.push(1);//计划
    //     break;
    //   case 2:
    //     TicketTypes.push(2);//报警
    //     break;
    //   case 3:
    //     TicketTypes.push(4);//现场
    //     break;
    //   case 4:
    //     TicketTypes.push(7);//抢修
    //     break;
    //   case 5:
    //     TicketTypes.push(5);//方案
    //     break;
    //   default:
    // }
  });

  let StartTime=state.getIn(['selectDatas','ticketStartTime']);
  let EndTime=state.getIn(['selectDatas','ticketEndTime']);

  var arrSelects=state.getIn(['selectDatas','selectBuilds']);
  var buildingsData=state.get('buildingsData');
  arrSelects.forEach((item)=>{
    // var build=buildingsData.get(item);
    // console.warn('buildingsData..',build);
    Hierarchies.push(item);
  });
  TicketId = TicketId.replace(/(^\s*)|(\s*$)/g, "");
  var reqParams={TicketId,TicketStatus,TicketTypes,Hierarchies,StartTime,EndTime,IsDJD};
  // console.warn('Hierarchies',reqParams);
  return state.set('reqParams',reqParams).set('hasFilter',true).setIn(['filter','CurrentPage'],1);
}

function categoryAllDatas(state)
{

  var newState = state;
  // var Items = newState.get(typeTicketTask,'data');
  // var oneData = newState.get('data');
  var Items = newState.get('data');

  var listStatus1 = [];
  var listStatus2 = [];
  var listStatus3 = [];
  var listStatus4 = [];
  var listStatus5 = [];
  var listStatus6 = [];//待接单分组
  let listStatus7 = [];
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
    }else if(item.get('Status')===9) {
      listStatus7.push(item);
    }
  });
  var sectionTitle = [];
  var allDatas = [];
  let realDatas =[];
  let oldSection=state.get('sectionData');
  var trace={pending:0,doing:0,submitted:0,finish:0}
  if(state.get('isService')) {
    //region 服务工单 处理
    if (listStatus1.length>0) {
      allDatas.push(listStatus1);
      let type='not-begin'
      let folder=isFolder(oldSection,type)
      if(folder){
        realDatas.push([]);
      }else{
        realDatas.push(listStatus1);
      }
      sectionTitle.push({type,title:'未开始',isFold:folder,count:listStatus1.length});
      trace.pending=listStatus1.length;
    }
    if (listStatus2.length>0) {
      allDatas.push(listStatus2);
      let type='doing'
      let folder=isFolder(oldSection,type)
      if(folder){
        realDatas.push([]);
      }else{
        realDatas.push(listStatus2);
      }
      sectionTitle.push({type,title:'执行中',isFold:folder,count:listStatus2.length});
      trace.doing=listStatus2.length;
    }
    if (listStatus4.length>0) {
      allDatas.push(listStatus4);
      let type='close';
      let folder=isFolder(oldSection,type)
      if(folder){
        realDatas.push([]);
      }else{
        realDatas.push(listStatus4);
      }
      sectionTitle.push({type,title:'已提交',isFold:folder,count:listStatus4.length});

      trace.submitted=listStatus3.length;
    }

    if (listStatus3.length>0) {
      allDatas.push(listStatus3);
      let type='submit'
      let folder=isFolder(oldSection,type)
      if(folder){
        realDatas.push([]);
      }else{
        realDatas.push(listStatus3);
      }
      sectionTitle.push({type,title:'已驳回',isFold:folder,count:listStatus3.length});
      trace.submitted=listStatus3.length;
    }

    if (listStatus5.length>0) {
      let type='assign';
      allDatas.push(listStatus5);
      let folder=isFolder(oldSection,type)
      if(folder){
        realDatas.push([]);
      }else{
        realDatas.push(listStatus5);
      }
      sectionTitle.push({type,title:'关闭',isFold:folder,count:listStatus5.length});
      trace.finish=listStatus4.length;
    }
    //endregion
  } else {
    //region 非服务工单 处理
    if (listStatus6.length > 0) {
      allDatas.push(listStatus6);
      let type = 'accept';
      let folder = isFolder(oldSection, type)
      if (folder) {
        realDatas.push([]);
      } else {
        realDatas.push(listStatus6);
      }
      sectionTitle.push({type, title: '待接单', isFold: folder, count: listStatus6.length, IsDJD: true});
    }
    if (listStatus5.length > 0) {
      let type = 'assign';
      allDatas.push(listStatus5);
      let folder = isFolder(oldSection, type)
      if (folder) {
        realDatas.push([]);
      } else {
        realDatas.push(listStatus5);
      }
      sectionTitle.push({type, title: '待派工', isFold: folder, count: listStatus5.length});
    }
    if (listStatus1.length > 0) {
      allDatas.push(listStatus1);
      let type = 'not-begin'
      let folder = isFolder(oldSection, type)
      if (folder) {
        realDatas.push([]);
      } else {
        realDatas.push(listStatus1);
      }
      sectionTitle.push({type, title: '未开始', isFold: folder, count: listStatus1.length});
      trace.pending = listStatus1.length;
    }
    if (listStatus2.length > 0) {
      allDatas.push(listStatus2);
      let type = 'doing'
      let folder = isFolder(oldSection, type)
      if (folder) {
        realDatas.push([]);
      } else {
        realDatas.push(listStatus2);
      }
      sectionTitle.push({type, title: '执行中', isFold: folder, count: listStatus2.length});
      trace.doing = listStatus2.length;
    }
    if (listStatus3.length > 0) {
      allDatas.push(listStatus3);
      let type = 'submit'
      let folder = isFolder(oldSection, type)
      if (folder) {
        realDatas.push([]);
      } else {
        realDatas.push(listStatus3);
      }
      sectionTitle.push({type, title: '已提交', isFold: folder, count: listStatus3.length});
      trace.submitted = listStatus3.length;
    }

    /*************************/
    if (listStatus7.length>0) {
      allDatas.push(listStatus7);
      let type='close';
      let folder=isFolder(oldSection,type)
      if(folder){
        realDatas.push([]);
      }else{
        realDatas.push(listStatus7);
      }
      sectionTitle.push({type,title:'已驳回',isFold:folder,count:listStatus7.length});

      trace.submitted=listStatus7.length;
    }

    if (listStatus4.length > 0) {
      allDatas.push(listStatus4);
      let type = 'close';
      let folder = isFolder(oldSection, type)
      if (folder) {
        realDatas.push([]);
      } else {
        realDatas.push(listStatus4);
      }
      sectionTitle.push({type, title: '已关闭', isFold: folder, count: listStatus4.length});
      trace.finish = listStatus4.length;
    }
    //endregion
  }
  // let realDatas=[].concat(allDatas);

  newState=newState.set('sectionData',Immutable.fromJS(sectionTitle)).set('allDatas',Immutable.fromJS(realDatas))
    .set('realDatas',Immutable.fromJS(allDatas));
  return newState;
}

function isFolder(section,type) {
  let index=section.findIndex(item=>item.get('type')===type);
  if(index>=0){
    return section.getIn([index,'isFold'])
  }
  return false;
}

function foldTickets(state,action) {
  let {type,index,isFold} = action.data;
  let newData=state;
  type='data';
  let oneData=newData;//.get(type);
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
  newData=oneData;//newData.set(type,oneData);
  return newData;
}

function resetFilterResult(state,action) {
  state=state.setIn(['filter','CurrentPage'],1);
  state=state.setIn(['filter','ItemsPerPage'],20);
  return state.set('data',null).set('allDatas',null).set('pageCount',0);
}

function handleErrorBuildFailure(state,action) {
  var {Error} = action.error;
  switch (Error) {
    case '040001307022':
      action.error = null;// '您没有这一项的操作权限，请联系系统管理员';
      break;
  }
  return state.set('isFetching',false).set('data',null).set('allDatas',null);
}

function handleErrorFilterFailure(state,action) {
  var {Error} = action.error;
  switch (Error) {
    case '040001307022':
      action.error = null;// '您没有这一项的操作权限，请联系系统管理员';
      break;
  }
  return state.set('isFilterFetching',false)
  .set('data',Immutable.fromJS([]))
  .set('allDatas',Immutable.fromJS([]))
  .set('sectionData',Immutable.fromJS([]));
}


export default function(state=defaultState,action){
  switch (action.type) {
    case TICKET_FILTER_CHANGED:
      return ticketFilterChange(state,action);
    case TICKET_FILTER_NEXTPAGE:
      return nextPage(state,action);
    case TICKET_FILTER_CLOSED:
      return filterClosed(state,action);
    case TICKET_FILTER_RESET:
      return filterParamReset(state,action);
    case TICKET_FILTER_BUILDING_REQUEST:
      return state.set('isFetching',true);
    case TICKET_FILTER_BUILDING_SUCCESS:
      return mergeTicketBuilding(state,action);
    case TICKET_FILTER_BUILDING_FAILURE:
      return handleErrorBuildFailure(state,action);
    case TICKET_FILTER_FAILURE:
    case SERVICE_TICKET_FILTER_LOAD_FAILURE:
      return handleErrorFilterFailure(state,action);
    case TICKET_FILTER_SEARCH:
      return mergeAllSearchParam(state,action);
    case TICKET_FILTER_RESETRESULT:
      return resetFilterResult(state,action);
    case TICKET_FILTER_REQUEST:
    case SERVICE_TICKET_FILTER_LOAD_REQUEST:
      return state.set('isFilterFetching',true);
    case TICKET_FILTER_SUCCESS:
    case SERVICE_TICKET_FILTER_LOAD_SUCCESS:
      return mergeTicketData(state,action);
    case TICKET_FILTER_FOLDER:
      return foldTickets(state,action);
    case TICKET_FILTER_SET_TYPE:
      return state.set('isService',action.isService);
    case LOGOUT_SUCCESS:
      return defaultState;
    default:
  }
  return state;
}
