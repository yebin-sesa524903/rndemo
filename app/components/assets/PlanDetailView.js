
'use strict';
import React,{Component} from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import Toolbar from '../Toolbar';
import Text from '../Text';
import {GRAY,BLACK,TAB,TAB_BORDER,GREEN,TICKET_STATUS,LINE,LIST_BG} from '../../styles/color';
import moment from 'moment';
import ListSeperator from '../ListSeperator';
import MoreContent from '../ticket/MoreContent';
import LabelValue from '../ticket/LabelValue';
import Icon from '../Icon.js';
import Loading from '../Loading';
import privilegeHelper from '../../utils/privilegeHelper';

moment.locale('zh-cn');

export default class PlanDetailView extends Component{
  constructor(props){
    super(props);
    this.state = {toolbarOpacity:0,showToolbar:false,forceStoped:false};
  }

  _getAssetView(){
    var {rowData} = this.props;
    var content = rowData.get('AssetNames').join('、');
    var startTime = moment(rowData.get('StartDateTime')).format('YYYY-MM-DD');
    var endTime='';
    if(rowData.get('EndDateTime')) {
      endTime = ' 至 '+moment(rowData.get('EndDateTime')).format('YYYY-MM-DD');
    }
    return (
      <View style={{paddingBottom:14,backgroundColor:'white'}}>
        <View style={{paddingTop:15,paddingBottom:12,paddingLeft:16,
          flexDirection:'row',alignItems:'center'
        }}>
          <Text style={{fontSize:17,color:'black',fontWeight:'bold'}}>{'资产范围'}</Text>
        </View>
        <MoreContent style={styles.moreContent}
                     titleStyle={{color:'#333',fontSize:16,}} title="" content={content}  maxLine={3}/>

        <View style={{paddingHorizontal:16,backgroundColor:''}}>
          <View style={{flexDirection:'row'}}>
            <View style={{minWidth:115,flexDirection:'row',alignItems:'center'}}>
              <Icon type={'icon_date'} size={13} color={'#999'} />
              <View style={{marginLeft:4,}}>
                <Text numberOfLines={1} style={[{fontSize:13,color:'#999'}]}>{`${startTime}${endTime} ${rowData.get('Intervals')}`}</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',marginLeft:30,alignItems:'center'}}>
              <Icon type={'icon_administration'} size={13} color={'#999'} />
              <View style={{marginLeft:4,}}>
                <Text numberOfLines={1} style={[{color:'#999',fontSize:13}]}>{rowData.get('SysClass')}</Text>
              </View>
            </View>
          </View>
          <View style={{flex:1,flexDirection:'row',marginLeft:0,marginTop:8,alignItems:'center'}}>
            <View style={{marginTop:0,}}>
              <Icon type={'arrow_location'} size={13} color={'#999'} />
            </View>
            <View style={{flex:1,marginLeft:4,}}>
              <Text numberOfLines={1} style={[{color:'#999',fontSize:13}]}>{rowData.get('BuildingNames').join('、')}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  _getTaskView(){
    var {rowData} = this.props;
    if(rowData.get('Content')) {
      return (
        <View style={{paddingBottom: 0, backgroundColor: 'white'}}>
          <View style={{
            paddingTop: 16, paddingBottom: 12, paddingLeft: 16,
            flexDirection: 'row', alignItems: 'center'
          }}>
            <Text style={{fontSize: 17, color: 'black', fontWeight: 'bold'}}>{'维护内容'}</Text>
          </View>
          <MoreContent style={styles.moreContent} content={rowData.get('Content')} maxLine={5}/>
        </View>
      );
    }else return null;
  }
  _getDocumentsView(){
    var {rowData} = this.props;
    var startTime = moment(rowData.get('StartTime')).format('YYYY-MM-DD'),
      endTime = moment(rowData.get('EndTime')).format('YYYY-MM-DD');
    var documents = rowData.get('Documents').map((item)=> {return {name:item.get('DocumentName'),id:item.get('OssKey')?item.get('OssKey'):item.get('DocumentId'),size:item.get('Size'),ossKey:item.get('OssKey')}}).toArray();
    var content = [
      {label:'作业文档',value:documents}
    ];
    var style={marginHorizontal:16,marginBottom:16};
    if (Platform.OS === 'ios') {
      style={marginHorizontal:16,marginBottom:8,marginTop:8};
    }
    if (!documents||documents.length===0) {
      return ;
    }
    return (
      <View style={{backgroundColor:'white'}}>
        <View style={{paddingBottom:15,paddingHorizontal:16,}}>
          <View style={{paddingTop:16,paddingBottom:11,
            flexDirection:'row',alignItems:'center',
          }}>
            <Text style={{fontSize:17,color:'black',fontWeight:'bold'}}>{'作业文档'}</Text>
          </View>
          {
            content.map((item,index) => {
              return (
                <LabelValue key={index} style={{marginBottom:0,}} label={item.label} value={item.value} forceStoped={this.state.forceStoped}/>
              )
            })
          }
        </View>
        <ListSeperator marginWithLeft={16}/>
      </View>
    )
  }
  _getCreaterView(){
    var {rowData} = this.props;
    var strId='';//rowData.get('TicketNum');
    var createTime=moment(rowData.get('CreateDateTime')).format('YYYY-MM-DD HH:mm:ss ');
    return (
      <View style={{paddingBottom:15,paddingTop:10,paddingLeft:16,paddingRight:16,backgroundColor:LIST_BG,marginTop:-2,
        }}>
        <Text style={{fontSize:13,color:'#999'}}>
          {`${createTime} ${rowData.get('CreateUserName')}创建的${rowData.get('PlanType')}`}
        </Text>
      </View>

    )
  }

  _getToolbar(data){
    var actions = null;
    return (
      <Toolbar
        title={data?data.get('Title'):''}
        navIcon="back"
        onIconClicked={()=>this.props.onBack()}
      />
    );
  }

  _renderTasks(){
    let tasks=this.props.rowData.get('MaintainTasks');
    let hasCreatePermission=privilegeHelper.hasAuth('TicketEditPrivilegeCode');
    if(tasks&&tasks.size>0) {
      let taskRows=tasks.map((item,index)=>{
        let time=moment(item.get('PlanDateTime')).format('YYYY-MM-DD');
        let btnText=item.get('TicketId')?'查看工单':(hasCreatePermission?'创建工单':'');
        return(
          <View key={index} style={{paddingRight:16,borderColor:LINE,borderTopWidth:1,alignItems:'center',
            flexDirection:'row',height:56}}>
            <Text style={{fontSize:17,color:'#888'}}>{time}</Text>
            <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
              <View style={{backgroundColor:item.get('Finish')?GREEN:'#ff4d4d',width:6,height:6,borderRadius:3,marginRight:6}}/>
              <Text style={{fontSize:17,color:'#888'}}>{item.get('Finish')?'已完成':'未完成'}</Text>
            </View>
            <Text onPress={()=>{
              //判断是查看还是创建
              if(item.get('TicketId')){
                this.props.gotoTicket(item.get('TicketId'));
              }else{
                if(hasCreatePermission)
                  this.props.createTicket(item);
              }
            }} style={{fontSize:17,width:80,color:GREEN}}>{btnText}</Text>
          </View>
        );
      });
      return (
        <View style={{
          backgroundColor: 'white', paddingLeft: 16, paddingTop: 16
        }}>
          <Text style={{marginBottom:16,fontSize:17,color:'black',fontWeight:'bold'}}>{'维护任务'}</Text>
          {taskRows}
        </View>
      )
    }
  }
  render() {
    if(!this.props.isFetching && this.props.errorMessage){
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {this._getToolbar(this.props.rowData)}
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize:17,color:GRAY}}>{this.props.errorMessage}</Text>
          </View>
        </View>
      )
    }
    if(this.props.isFetching || !this.props.rowData){
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {this._getToolbar(this.props.rowData)}
          <Loading />
        </View>
      )
    }

    var marginBottom = {marginBottom:bottomHeight};
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}}>
        {this._getToolbar(this.props.rowData)}
        <ScrollView style={[styles.wrapper]}>
          {this._getAssetView()}
          <ListSeperator marginWithLeft={16}/>
          {this._getTaskView()}
          <ListSeperator marginWithLeft={16}/>

          {this._getDocumentsView()}
          {this._getCreaterView()}
          {this._renderTasks()}
        </ScrollView>
      </View>
    );
  }
}

var bottomHeight = 54;

var styles = StyleSheet.create({
  statusRow:{
    height:69,
    flexDirection:'row',
    alignItems:'center',
    paddingHorizontal:16,
    backgroundColor:TICKET_STATUS
  },
  statusText:{
    fontSize:17,
    color:BLACK
  },
  moreContent:{
    margin:16,
    marginTop:0,
    marginBottom:13,
    backgroundColor:'white'
  },
  bottom:{
    position:'absolute',
    left:0,
    right:0,
    bottom:0,
    flex:1,
    height:bottomHeight,
    // borderTopWidth:1,
    // borderColor:TAB_BORDER,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    // backgroundColor:TAB
  },
  button:{
    // marginTop:20,
    height:40,
    flex:1,
    marginHorizontal:16,
    borderRadius:2,

  },
  wrapper:{
    flex:1,
    backgroundColor:'transparent',
  },
});

