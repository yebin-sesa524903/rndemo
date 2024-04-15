
'use strict';
import React,{Component} from 'react';

import {
  View,Text,SafeAreaView,Platform
} from 'react-native';
import PropTypes from 'prop-types';

import Section from '../Section.js';
import List from '../List.js';
import TicketRow from './TicketRow.js';
import Toolbar from '../Toolbar';
import TouchFeedback from '../TouchFeedback';
import {LIST_BG} from '../../styles/color'
import Icon2 from '../Icon';
import {Icon} from '@ant-design/react-native';
const MP=Platform.OS==='ios'?0:36;

export default class TicketFilterResultView extends Component{
  constructor(props){
    super(props);
  }

  _renderSection(sectionData,sectionId,sectionIndex){
    if(!sectionData||!this.props.sectionData) return null;
    var sectionTitle = this.props.sectionData.getIn([sectionId,'title']);
    let isFold=this.props.sectionData.getIn([sectionId,'isFold']);
    let count=this.props.sectionData.getIn([sectionId,'count'])
    if(!sectionTitle) return null;
    return (
      <View>
        <View style={{flexDirection:'row',alignItems:'center',flex:1,backgroundColor:LIST_BG,}}>
          <Text style={{fontSize:14,color:'#888',backgroundColor:LIST_BG,paddingVertical:10,flex:1}}>
            {`${sectionTitle}  (${count})`}
          </Text>
          <TouchFeedback onPress={()=>{
            this.props.doFolder({
              type:this.props.keyType,
              index:sectionId,
              isFold:!isFold
            })
          }}>
            <View style={{height:30,width:30,justifyContent:'center',alignItems:'center'}}>
              <Icon2 type={isFold?"icon_arrow_up": 'icon_arrow_down'} color="#888" size={13}/>
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

  render(){
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <View style={{ flex: 1 }}>
          <View style={{marginTop:MP,flex:1}}>
            <View style={{flexDirection:'row',borderBottomColor:'#e6e6e6',borderBottomWidth:1,height:44,paddingVertical:10,justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:17,color:'#333',fontWeight:'500'}}>工单筛选</Text>
              <View style={{position:'absolute',right:16}}>
                <TouchFeedback onPress={()=>{this.props.openFilter()}}>
                  <Icon name="filter" size="sm" color={'#333'} />
                </TouchFeedback>
              </View>
            </View>
            <List
              listStyle={{flex:1,backgroundColor:LIST_BG}}
              contentContainerStyle={{paddingHorizontal:16,paddingVertical:5}}
              isFetching={this.props.isFetching}
              hasFilter={true}
              renderFooter={()=>{
                if(!this.props.listData) return null;
                if(this.props.isFetching){
                  return (
                    <View style={{height:40,justifyContent:'center',alignItems:'center'}}>
                      <Text style={{color:'black'}}>加载中，请稍候...</Text>
                    </View>
                  )
                }
                return null;
              }}
              listData={this.props.listData}
              currentPage={this.props.currentPage}
              onRefresh={this.props.onRefresh}
              nextPage={this.props.nextPage}
              clearFilter={()=>{this.props.clearFilter()}}
              totalPage={this.props.totalPage}
              emptyText='没有符合筛选条件的工单'
              renderSeperator={()=>null}
              needGotoTop={true}
              renderSection={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
              renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

TicketFilterResultView.propTypes = {
  onBack:PropTypes.func,
  currentRouteId:PropTypes.string,
  user:PropTypes.object,
  currentPage:PropTypes.number,
  totalPage:PropTypes.number,
  onRowClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  sectionData:PropTypes.object,
  listData:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
  nextPage:PropTypes.func.isRequired,
}
