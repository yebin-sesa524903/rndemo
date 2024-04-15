
'use strict';
import React,{Component} from 'react';
import {
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import List from '../List.js';
import SelectRow from './AssetSelectRow.js';
import SectionTouch from '../SectionTouch.js';

import {GREEN,GRAY,LIST_BG} from '../../styles/color';
import {isPhoneX} from '../../utils';
import Button from '../Button';
import Bottom from '../Bottom';
import Toast from 'react-native-root-toast';

export default class AssetsSelectView extends Component{
  constructor(props){
    super(props);
  }
  _renderSection(sectionData,sectionId,sectionIndex){
    var secData = this.props.sectionData.get(sectionId);
    if(!secData) return null;
    return (
      <SectionTouch rowData={secData} onSectionClick={this.props.onSectionClick}/>
    );
  }
  _renderRow(rowData,sectionId,rowId){
    return (
      <SelectRow selKey='Name' rowData={rowData} sectionId={sectionId} rowId={rowId} onRowClick={this.props.onRowClick} />
    );
  }

  _getBottomButton() {
    return(
      <Bottom height={isPhoneX()?54+34:54} backgroundColor={'#fff'} borderColor={'#f2f2f2'}>
        <Button
          style={{
            height:40,
            flex:1,
            marginHorizontal:16,
            borderRadius:2,
            marginBottom:isPhoneX()?34:0,
            backgroundColor:GREEN,
          }}
          disabledStyle={{
            backgroundColor:GRAY,
          }}
          textStyle={{
            fontSize:16,
            color:'#ffffff'
          }}
          disabled={false}
          text={this.props.btnTitle} onClick={()=>{
          var disable = !this.props.data || !this.props.selectAssets || this.props.selectAssets.size===0;
          if(disable){
            Toast.show('请选择资产范围', {
              duration: Toast.durations.LONG,
              position: isPhoneX()?-20-34:-20,
            });
            return;
          }
          this.props.onSave();
        }} />
      </Bottom>
    );
  }

  render() {
    // console.warn('AssetsSelectView...',this.props.isFetching);
    var disable = !this.props.data || !this.props.selectAssets || this.props.selectAssets.size===0;
    var actions = [];//[{title:'完成',show:'always',disable}];
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar title={this.props.title}
          navIcon="back"
          actions={actions}
          onIconClicked={()=>this.props.onBack()}
          onActionSelected={[()=>{
            this.props.onSave();
          }]}
        />

        <View style={{flex:1,marginBottom:isPhoneX()?54+34:54}}>
        <List
          isFetching={this.props.isFetching}
          listData={this.props.data}
          hasFilter={false}
          currentPage={1}
          totalPage={1}
          emptyText='没有资产'
          onRefresh={this.props.onRefresh}
          renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
          renderSectionHeader={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
        />
        </View>
        {this._getBottomButton()}
      </View>
    );
  }
}

AssetsSelectView.propTypes = {
  navigator:PropTypes.object,
  title:PropTypes.string,
  onBack:PropTypes.func.isRequired,
  onSave:PropTypes.func.isRequired,
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  onSectionClick:PropTypes.func.isRequired,
  isFetching:PropTypes.bool.isRequired,
  data:PropTypes.object,
  sectionData:PropTypes.object,
  onRefresh:PropTypes.func.isRequired,
  selectAssets:PropTypes.object,
}
