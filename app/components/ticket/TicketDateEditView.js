
'use strict';
import React,{Component} from 'react';

import {
  View,

} from 'react-native';
import PropTypes from 'prop-types';
import ListView from 'deprecated-react-native-listview';
import List from '../List.js';
import TicketDateRow from './TicketDateRow.js';
import Toolbar from '../Toolbar';

export default class TicketDateEditView extends Component{
  constructor(props){
    super(props);
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {currentRow:'', dataSource:this.ds.cloneWithRows(props.data)};
  }
  _renderRow(rowData,sectionId,rowId){
    //rowId is string type '0' or '1'
    return (
      <TicketDateRow
        rowData={rowData}
        openDatePicker={rowId === this.state.currentRow}
        onDateChanged={(date)=>{
          var type = rowData.get('type');
          this.props.onDateChanged(type,date);
        }}
        onRowClick={(rowData)=>{
          this.setState({currentRow:rowId,dataSource:this.ds.cloneWithRows(this.props.data)});
        }}
      />
    )
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data){
      this.setState({dataSource:this.ds.cloneWithRows(nextProps.data)})
    }
  }
  render() {
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar
          title="执行时间"
          navIcon="back"
          onIconClicked={this.props.onBack} />
        <List
          isFetching={false}
          listData={this.state.dataSource}
          hasFilter={false}
          currentPage={1}
          totalPage={1}
          emptyText=''
          renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
        />
      </View>
    );
  }
}

TicketDateEditView.propTypes = {
  navigator:PropTypes.object,
  title:PropTypes.string,
  onBack:PropTypes.func.isRequired,
  onDateChanged:PropTypes.func.isRequired,
  data:PropTypes.array,
}
