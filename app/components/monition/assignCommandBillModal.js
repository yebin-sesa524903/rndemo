import React,{Component} from "react";
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import {View, Text} from 'react-native';
import s from "../../styles/commonStyle";
import TouchFeedback from "../TouchFeedback";
import List from "../List";
import moment from "moment";

const DATE = 'YYYY-MM-DD';

export default class AssignCommandBillModal extends Component{
  constructor(props) {
    super(props)
  }

  _renderTitle() {
    return (
      <View style={[s.center,{marginTop:16}]}>
        <Text style={[s.f18]}>{this.props.title || '关联命令票'}</Text>
      </View>
    )
  }

  _renderHLine() {
    return (
      <View style={{height:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _renderItems = (item,gid,rid) => {
    return (
      <TouchFeedback onPress={()=>this.props.onItemClick(item.id)}>
        <View style={[s.m16,s.r,s.ac,{padding:16,backgroundColor:'#fff',borderRadius:3,marginBottom:0,marginTop:10}]}>
          <View style={{marginLeft:-16,width:54,height:28,backgroundColor:item.operationType === 1? '#284e98':'#fbb325',borderTopRightRadius:28,
            borderBottomRightRadius:28,fontSize:14,justifyContent:'center',paddingLeft:8}}>
            <Text style={{color:'#fff'}}>{item.operationType === 1 ? '送电' : '停电'}</Text>
          </View>
          <View style={[s.f,{marginLeft:12}]}>
            <View style={[s.r,s.ac]}>
              <Text style={{flex:1,fontSize:15,color:'#333'}}>{`${item.circuitName}（${item.circuitSerialNumber}）-${item.code}`}</Text>
              <Text style={{fontSize:13,color:'#888'}}>{moment(item.createdTime).format(DATE)}</Text>
            </View>
          </View>
        </View>
      </TouchFeedback>

    )
  }

  componentDidMount() {
    this._onRefresh();
  }

  _nextPage = () => {
    this.props.loadUnbindBill({
      "pageIndex": this.props.unbound.get('currentPage')+1,
      "pageSize": 10,
      workTicketId:this.props.workTicketId
    })
  }

  _onRefresh = () => {
    this.props.loadUnbindBill({
      "pageIndex": 1,
      "pageSize": 10,
      workTicketId:this.props.workTicketId
    })
  }

  render() {
    if(this.props.show) {
      return (
        <CommonActionSheet modalVisible={this.props.show} onCancel={this.props.onCancel}>
          <View style={[{backgroundColor:'#f2f2f2',height:400}]}>
            {this._renderTitle()}
            <List
              isFetching={this.props.unbound.get('isFetching')}
              listData={this.props.listData}
              currentPage={this.props.unbound.get('currentPage')}
              nextPage={this._nextPage}
              onRefresh={this._onRefresh}
              totalPage={this.props.unbound.get('pageCount')}
              renderSeperator={()=>null}
              renderRow={(rowData,sectionId,rowId)=>this._renderItems(rowData,sectionId,rowId)}
              emptyText={'无未关联命令票'}
            />

          </View>
        </CommonActionSheet>
      )
    }
    return null;
  }
}
