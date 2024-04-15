
'use strict';
import React,{Component} from 'react';

import {
  View,
  //
  // InteractionManager,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import TouchFeedback from '../TouchFeedback';
import {GRAY, ALARM_HIGH, ALARM_MIDDLE, ALARM_LOW, BLACK, GREEN, LINE} from '../../styles/color';

import List from '../List.js';
import LogRow from './TicketLogRow.js';
import RowDelete from '../RowDelete.js'
import ListSeperator from '../ListSeperator';
import Text from '../Text';
import {checkFileNameIsImage} from '../../utils/fileHelper.js';
import Immutable from 'immutable';

export default class LogsView extends Component{
  constructor(props){
    super(props);
    this.state={enableShowAdd:true,canScroll:true};
  }

  _goToDetail(items,itemObj){
    var arrImages=[];
    items.map((item,index)=>{
      if(checkFileNameIsImage(item.get('FileName'))) {
        arrImages.push(item);
      }
    });
    var newIndex = arrImages.findIndex((item)=> item === itemObj);
    this.props.gotoDetail(Immutable.fromJS(arrImages),newIndex,{width:this.state.imageWidth-2,height:this.state.imageHeight-2});
  }

  _renderRow(rowData,sectionId,rowId,closeRow){
    // console.warn('rowData',rowId);
    return (
      <LogRow
        key={rowId}
        showAllImages={this.props.fromTicketDetail}
        rowData={rowData}
        onRowLongPress={this.props.onRowLongPress}
        imageClick={item=>this._goToDetail(rowData.get('Pictures'),item)}
        onRowClick={(rowData)=>{
          closeRow();
          this.props.onRowClick(rowData)
        }} />
    );
  }
  _renderHeader()
  {
    if (!this.state.enableShowAdd||!this.props.showAdd) {
      return;
    }
    return (
      <View style={{height:74,backgroundColor:'white',}}>
        <TouchFeedback style={{flex:1,}} onPress={()=>{
            this.props.createLog();
          }}>
          <View style={{flex:1,paddingHorizontal:30,paddingVertical:15,}}>
            <View style={{flex:1,borderWidth:1,borderColor:GREEN,borderRadius:4,
              justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:18,color:GREEN}}>
                {'+  添加工单日志'}
              </Text>
            </View>
          </View>
        </TouchFeedback>
        <ListSeperator/>
      </View>
    )
  }
  _getRowAuth(rowData,sectionId,rowId,closeRow){
    var hasAuth=true;
    return this.props.onRowDeleteAuth(rowData);
  }
  _renderHiddenRow(rowData,sectionId,rowId,closeRow){
    // console.warn('_renderHiddenRow');
    return (
      <RowDelete onPress={()=>{
          closeRow();
          this.props.onRowLongPress(rowData)}} />
    )
  }
  _getToolbar(){
    if(this.props.fromTicketDetail) return;
    var actions = [{
      title:'添加',
      iconType:'add',
      code:this.props.privilegeCode,
      show:'always'}];
    if (!this.state.enableShowAdd||!this.props.showAdd) {
      actions = null;
    }
    return (
      <Toolbar
        title={this.props.title}
        navIcon="back"
        actions={actions}
        onIconClicked={this.props.onBack}
        onActionSelected={[this.props.createLog]} />
    );
  }
  _onScroll(e){
    const {x, y} = e.nativeEvent.contentOffset;
    var lastVisible=this.state.enableShowAdd;
    var visible=e.nativeEvent.contentOffset.y<2;
    this.setState({enableShowAdd:visible,canScroll:lastVisible!==visible},()=>{
      this.setState({canScroll:true});
    });
  }

  _ticektDetailLogEmpty(){
    return (
      <View style={{height:104,justifyContent:'center',alignItems:'center'}}>
        <Text style={{fontSize:15,color:'#888'}}>暂无日志</Text>
      </View>
    )
  }

  _renderSeperator(sectionId,rowId){
    let ml=0;
    if(this.props.fromTicketDetail){
      var isLastRow=false;
      var secRowCounts=this.props.logs.getSectionLengths();
      // console.warn('bb',sectionId,secRowCounts[sectionId],rowId,secRowCounts);
      if (secRowCounts[0]===Number(rowId)+1)
        isLastRow=true;
      if(isLastRow) return null;
      return (
        <View style={{height:1,backgroundColor:'#fff',flex:1}}>
          <View style={{height:1,backgroundColor:LINE,marginLeft:16}}/>
        </View>
      );
    }
    return (
      <View style={{height:1,backgroundColor:LINE,marginLeft:ml}}/>
    )
  }

  render() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        {this._getToolbar()}
        <List
          onScroll={(e)=>this._onScroll(e)}
          scrollEnabled={this.state.canScroll}
          disableLeftSwipe={!this.props.showAdd}
          isFetching={this.props.isFetching}
          // onRefresh={this.props.onRefresh}
          listData={this.props.logs}
          currentPage={null}
          renderSeperator={(sectionId,rowId)=>this._renderSeperator(sectionId,rowId)}
          totalPage={null}
          swipable={this.props.fromTicketDetail?false:true}
          emptyText={this.props.emptyText}
          getRowAuth={(rowData,sectionId,rowId,rowMap)=>this._getRowAuth(rowData,sectionId,rowId,rowMap)}
          renderHiddenRow={(rowData,sectionId,rowId,rowMap)=>this._renderHiddenRow(rowData,sectionId,rowId,rowMap)}
          renderRow={(rowData,sectionId,rowId,rowMap)=>this._renderRow(rowData,sectionId,rowId,rowMap)}
        />
      </View>

    );
  }
}

LogsView.propTypes = {
  user:PropTypes.object,
  isFetching:PropTypes.bool,
  showAdd:PropTypes.bool,
  onRowClick:PropTypes.func.isRequired,
  onRefresh:PropTypes.func.isRequired,
  privilegeCode:PropTypes.string.isRequired,
  onRowLongPress:PropTypes.func.isRequired,
  onRowDeleteAuth:PropTypes.func.isRequired,
  logs:PropTypes.object,
  emptyText:PropTypes.string.isRequired,
  createLog:PropTypes.func.isRequired,
  onBack:PropTypes.func.isRequired,
  title:PropTypes.string.isRequired,
}
