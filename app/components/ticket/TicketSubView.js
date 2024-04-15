
'use strict';
import React,{Component} from 'react';

import {
  View,Text,Image,ScrollView,RefreshControl
} from 'react-native';
import PropTypes from 'prop-types';

import Section from '../Section.js';
import List from '../List.js';
import TicketRow from './TicketRow.js';
import {LIST_BG,GREEN} from '../../styles/color';
import TouchFeedback from '../TouchFeedback';
import Icon from '../Icon';

export default class TicketSubView extends Component{
  constructor(props){
    super(props);
    this._firstRender=true;
  }
  _renderSection(sectionData,sectionId,sectionIndex){
    if(!sectionData||!this.props.sectionData) return null;
    var sectionTitle = this.props.sectionData.getIn([sectionId,'title']);
    let isFold=this.props.sectionData.getIn([sectionId,'isFold']);
    let count=this.props.sectionData.getIn([sectionId,'count'])
    if(!sectionTitle) return null;
    // return (
    //   <Section text={sectionTitle} />
    // );
    return (
      <View>
        <View style={{flexDirection:'row',alignItems:'center',flex:1,backgroundColor:LIST_BG,}}>
          <Text style={{fontSize:14,color:'#888',backgroundColor:LIST_BG,paddingVertical:10,flex:1}}>
            {`${sectionTitle}  (${count})`}
          </Text>
          <TouchFeedback onPress={()=>{
            this.props.folderTicket({
              type:this.props.keyType,
              index:sectionId,
              isFold:!isFold
            })
          }}>
            <View style={{height:30,width:30,justifyContent:'center',alignItems:'center'}}>
              <Icon type={isFold?"icon_arrow_up": 'icon_arrow_down'} color="#888" size={13}/>
            </View>
          </TouchFeedback>
        </View>
      </View>
    )
  }
  _renderRow(rowData,sectionId,rowId){
    return (
      <TicketRow isService={this.props.isService} rowData={rowData} onRowClick={this.props.onRowClick} />
    );
  }

  _renderEmptyView(){
    let msg=this.props.errMsg;
    if(!msg){
      // msg=`暂无${isConnected()?'':'离线'}工单`;
      msg=`暂无工单`;
    }
    return (
      <View style={{flex:1}}>
      <ScrollView
        style={{flex:1}}
        contentContainerStyle={{flex:1}}
        removeClippedSubviews
        scrollEventThrottle={16}
        // 指定RefreshControl组件, 用于为ScrollView提供下拉刷新功能
        refreshControl={
          <RefreshControl
            refreshing={this.props.isFetching}
            onRefresh={this.props.onRefresh}
            tintColor={GREEN}
            title="加载中，请稍候..."
            colors={[GREEN]}
          />
        }
      >
        <View style={{backgroundColor:'#fff',flex:1,alignItems:'center',justifyContent:'center'}}>
          <Image style={{width:50,marginBottom:13}}
            source={require('../../images/empty_box/empty_box.png')}/>
          <Text style={{fontSize:16,color:'#888'}}>{msg}</Text>
        </View>
      </ScrollView>
      </View>
    )
  }

  render() {
    if(!this.props.isFetching&&
      (this.props.listData&&(this.props.listData.getRowCount()===0 && (!this.props.sectionData||this.props.sectionData.size===0)))) {
      return this._renderEmptyView();
    }
    if(this.props.listData)
      this._firstRender=false;

    if(!this.props.isFetching && !this.props.listData){
      return this._renderEmptyView();
    }
    return (

      <List
        listStyle={{flex:1,backgroundColor:LIST_BG}}
        contentContainerStyle={{paddingHorizontal:16,paddingVertical:5}}
        needGotoTop={true}
        isFetching={this.props.isFetching}
        hasFilter={false}
        listData={this.props.listData}
        currentPage={this.props.currentPage}
        onRefresh={this.props.onRefresh}
        nextPage={this.props.nextPage}
        totalPage={this.props.totalPage}
        renderSeperator={()=>null}
        emptyText='暂无工单'
        renderSection={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
        renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
      />

    );
  }
}

TicketSubView.propTypes = {
  user:PropTypes.object,
  currentPage:PropTypes.number,
  totalPage:PropTypes.number,
  onRowClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  sectionData:PropTypes.object,
  listData:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
  nextPage:PropTypes.func.isRequired,
  keyType:PropTypes.string,
}
