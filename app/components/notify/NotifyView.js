
'use strict';
import React,{Component} from 'react';
import {
  View,Text,
  Image,Platform,ScrollView,RefreshControl
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import List from '../List.js';
import NotifyRow from './NotifyRow.js';
import Section from '../Section.js';
import PagerBar from '../PagerBar.js';
import TouchFeedback from "../TouchFeedback";
import {isPhoneX} from '../../utils';
import {GREEN, LINE, LIST_BG} from "../../styles/color";
import Icon from '../Icon';
import {Icon as Icon2} from '@ant-design/react-native';
let MarginTop=isPhoneX()?20:0;
if(Platform.OS==='android'){
  MarginTop=24;
}

export default class NotifyView extends Component{
  constructor(props){
    super(props);
  }
  _renderRow(rowData,sectionId,rowId){
    return (
      <NotifyRow rowData={rowData} onRowClick={this.props.onRowClick} />
    );
  }

  _getToolbar(){
    let toolbar=(
      <Toolbar title='通知'
       navIcon={'task'}
       numberOfCount={this.props.taskCount}
       actions={[]}
       onIconClicked={()=>{
         this.props.onTasksIconClick();
       }}
       onActionSelected={[this.props.onFilterClick]} />
    );
    return toolbar;
  }

  _getTopLine(){
    if(!this.props.hasFilter && this.props.currentIndex===0 &&
      this.props.listData && this.props.listData.getRowCount()>0){
      return 8;
    }
    return 0;
  }

  _renderEmptyView(){
    let emptyText='暂无通知';

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
            <Text style={{fontSize:16,color:'#888'}}>{emptyText}</Text>
          </View>
        </ScrollView>
      </View>
    )
  }

  render() {
    let emptyText='暂无通知';
    let showEmpty=(!this.props.hasFilter&&this.props.listData&&this.props.listData.getRowCount()===0);
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
          {this._getToolbar()}
        {showEmpty?(this._renderEmptyView()):<List
            needGotoTop={true}
            isFetching={this.props.isFetching}
            listData={this.props.listData}
            hasFilter={this.props.hasFilter}
            currentPage={this.props.currentPage}
            nextPage={this.props.nextPage}
            onRefresh={this.props.onRefresh}
            totalPage={this.props.totalPage}
            clearFilter={this.props.clearFilter}
            onFilterClick={this.props.onFilterClick}
            renderRow={(rowData,rowId)=>this._renderRow(rowData,rowId)}
            emptyText={emptyText}
          />}
      </View>

    );
  }
}

NotifyView.propTypes = {
  user:PropTypes.object,
  currentPage:PropTypes.number,
  totalPage:PropTypes.number,
  hasFilter:PropTypes.bool,
  onRowClick:PropTypes.func.isRequired,
  onFilterClick:PropTypes.func,
  clearFilter:PropTypes.func,
  isFetching:PropTypes.bool.isRequired,
  listData:PropTypes.object,
  sectionData:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
  nextPage:PropTypes.func.isRequired,
}
