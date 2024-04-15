
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
import {GRAY,ALARM_HIGH,ALARM_MIDDLE,ALARM_LOW,BLACK,GREEN} from '../../styles/color';

import List from '../List.js';
import LogRow from './TicketMsgRow.js';
import RowDelete from '../RowDelete.js'
import ListSeperator from '../ListSeperator';
import Text from '../Text';

export default class LogsView extends Component{
  constructor(props){
    super(props);
  }
  _renderRow(rowData,sectionId,rowId,closeRow){
    // console.warn('rowData',rowId);
    return (
      <LogRow
        key={rowId}
        rowData={rowData}
        onRowLongPress={this.props.onRowLongPress}
        onRowClick={(rowData)=>{
          closeRow();
          this.props.onRowClick(rowData)
        }} />
    );
  }
  _renderSeperator(sectionId,rowId){
    var isLastRow=false;
    var secRowCounts=this.props.logs.getSectionLengths();
    // console.warn('bb',sectionId,secRowCounts[sectionId],rowId,secRowCounts);
    if (secRowCounts[0]===Number(rowId)+1)
      isLastRow=true;
    if(isLastRow) return null;
    // console.warn('aa',isLastRow,rowId,this.props.logs.getSectionLengths(),this.props.logs.getRowCount());
    return (
      <ListSeperator key={sectionId+rowId} marginWithLeft={isLastRow?0:16}/>
    );
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

  render() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <List
          disableLeftSwipe={!this.props.showAdd}
          isFetching={this.props.isFetching}
          onRefresh={this.props.onRefresh}
          listData={this.props.logs}
          currentPage={null}
          totalPage={null}
          swipable={this.props.swipable}
          emptyText={this.props.emptyText}
          renderSeperator={(sectionId,rowId)=>this._renderSeperator(sectionId,rowId)}
          renderHiddenRow={(rowData,sectionId,rowId,rowMap)=>this._renderHiddenRow(rowData,sectionId,rowId,rowMap)}
          getRowAuth={(rowData,sectionId,rowId,rowMap)=>this._getRowAuth(rowData,sectionId,rowId,rowMap)}
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
