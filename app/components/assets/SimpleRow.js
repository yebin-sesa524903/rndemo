'use strict'
import React,{Component} from 'react';
import {
  View,
  StyleSheet, Linking,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import {BLACK,GRAY} from '../../styles/color';
import Icon from '../Icon.js';

export default class SimpleRow extends Component{
  constructor(props){
    super(props);
  }
  _getNavIcon(){
    // return null;
    var {rowData} = this.props;
    if(rowData.get('isNav')){
      return (
        <Icon style={{alignSelf:'center',marginLeft:4}} type='arrow_right' size={16} color={GRAY} />
      )
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.rowData.get('value') === this.props.rowData.get('value')
        && nextProps.rowData.get('title') === this.props.rowData.get('title')){
      return false;
    }
    return true;
  }

  _renderFormula(){
    let type= this.props.rowData.get('type');
    let formula=this.props.rowData.get('formula');
    if(type==='historydata' && formula){
      if(formula){
        return (
          <Text style={{color:'#888',fontSize:15}}>{formula}</Text>
        )
      }
    }
    return null;
  }

  render(){
    var {rowData,textStyle} = this.props;
    var title=rowData.get('title');
    var value = rowData.get('value');
    let isWeb=rowData.get('isWeb');
    let webStyle={};
    let onPress=null;
    if(isWeb){
      value=rowData.get('actionLabel');
      webStyle={color:'#284e98'};
      let webUrl=rowData.get('value');
      onPress=()=>{
        console.warn('open url',webUrl);
        if(webUrl)
          Linking.openURL(webUrl);
      }
    }
    if(rowData.get('gotoParent')){
      value=rowData.get('value');
      webStyle={color:'#284e98'};
      onPress=()=>{
        this.props.onRowClick(rowData);
      }
    }
    return (
      <TouchFeedback style={[{flex:1,backgroundColor:'white'},styles.rowHeight]} onPress={()=>{
          if(rowData.get('isNav') && !isWeb){
            this.props.onRowClick(rowData)
          }}}>
        <View style={[styles.row,styles.rowHeight]}>
          <View style={{flex:1}}>
            <Text style={[styles.titleText,textStyle,{textAlignVertical:'center'}]}>
              {title}
              {this._renderFormula()}
            </Text>

          </View>
          <View style={{
              maxWidth:225,
              // flex:1,
            //minWidth:90,
              // backgroundColor:'#ff1d',
            justifyContent:'flex-end',
               flexDirection:'row'}}>
            <Text style={[styles.valueText,webStyle]} onPress={onPress}>
              {value}
            </Text>
            {this._getNavIcon()}
          </View>

        </View>
      </TouchFeedback>
    );
  }
}


SimpleRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
  textStyle:PropTypes.any,
}

var styles = StyleSheet.create({
  rowHeight:{
    // minHeight:49,
  },
  row:{
    flexDirection:'row',
    // alignItems:'center',
    flex:1,
    backgroundColor:'white',
    justifyContent:'space-between',
    paddingHorizontal:16,
    paddingVertical:16,
  },
  titleText:{
    fontSize:17,
    color:BLACK,
    // flex:1,
    // backgroundColor:'white',
  },
  valueText:{
    // flex:1,
    // textAlign:'right',
    marginLeft:16,
    fontSize:17,
    color:'#888'
  }
});
