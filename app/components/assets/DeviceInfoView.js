
'use strict';
import React,{Component} from 'react';
import {
  // View,
  // Platform,
  Dimensions,
} from 'react-native';

// import Toolbar from '../Toolbar';
import List from '../List.js';
import SimpleRow from './SimpleRow';
import NetworkImage from '../NetworkImage.js';
import Section from '../Section.js';

export default class DeviceInfoView extends Component{
  constructor(props){
    super(props);
    var {width} = Dimensions.get('window');
    var height = parseInt(width*2/3);
    this.state = {imgWidth:width,imgHeight:height};
  }
  _renderSection(sectionData,sectionId,sectionIndex){
    var sectionTitle = this.props.sectionData.get(sectionId);
    if(!sectionTitle) return null;
    return (
      <Section text={sectionTitle} />
    );
  }
  _renderRow(rowData,sectionId,rowId){
    // console.warn('renderRow',rowData);
    if(sectionId === '0'){
      return (
        <NetworkImage
          resizeMode='contain'
          width={this.state.imgWidth}
          height={this.state.imgHeight}
          name={rowData.get('value')}
           />
      );
    }
    return (
      <SimpleRow rowData={rowData} onRowClick={this.props.onRowClick} />
    );
  }
  render() {
    return (
      <List
        isFetching={this.props.isFetching}
        listData={this.props.data}
        hasFilter={false}
        currentPage={1}
        totalPage={1}
        emptyText='该建筑下无配电室和设备'
        onRefresh={this.props.onRefresh}
        renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
        renderSectionHeader={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
      />
    );
  }
}

DeviceInfoView.propTypes = {
  navigator:PropTypes.object,
  sectionData:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  data:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
}
