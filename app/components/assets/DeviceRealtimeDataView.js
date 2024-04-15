'use strict'

import React,{Component} from 'react';
import PropTypes from 'prop-types';
// import Icon from '../Icon.js';
// import {BLACK,GRAY,GREEN} from '../../styles/color';
import List from '../List.js';
import SimpleRow from './SimpleRow.js';
import Section from '../Section.js';
import Text from "../Text";
import Icon from "../Icon";
import {View} from 'react-native';

export default class DeviceRuntimeSettingView extends Component{
  constructor(props){
    super(props);
  }
  _renderSection(sectionData,sectionId,sectionIndex){
    if(!this.props.sectionData || !this.props.sectionData.get(sectionId)){
      return null
    }
    return (
      <Section text={this.props.sectionData.get(sectionId)} />
    );
  }
  _renderRow(rowData){
    return (
      <SimpleRow rowData={rowData} onRowClick={this.props.onRowClick} />
    )
  }

  _renderFlowTip(){
    let flowType=this.props.flowType;
    if(flowType){
      let tipText=flowType===2?'高流量：5秒刷新1次数据':'低流量：15分钟刷新1次数据';
      return (
        <View style={{paddingHorizontal:16,paddingVertical:6,backgroundColor:'#FEF4E6'}}>
          <Text style={{fontSize:14,lineHeight:21,color:'#888'}}>
            <Icon type={'icon_info'} color={'#fbb325'} size={14} />
            <Text>  {tipText}</Text>
          </Text>
        </View>
      );
    }
    return null;
  }

  render(){
    return (
      <View style={{flex:1}}>
        {this._renderFlowTip()}
        <List
          isFetching={this.props.isFetching}
          listData={this.props.data}
          hasFilter={false}
          currentPage={1}
          totalPage={1}
          emptyText={this.props.emptyText}
          onRefresh={this.props.onRefresh}
          renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
          renderSectionHeader={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
        />
      </View>
    );
  }
}

DeviceRuntimeSettingView.propTypes = {
  isFetching:PropTypes.bool.isRequired,
  sectionData:PropTypes.object.isRequired,
  onRefresh:PropTypes.func.isRequired,
  data:PropTypes.object,
  onRowClick:PropTypes.func,
  emptyText:PropTypes.string,
}
