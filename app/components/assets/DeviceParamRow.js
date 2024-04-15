'use strict'
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import {BLACK,GRAY} from '../../styles/color';
import Icon from '../Icon.js';

export default class DeviceParamRow extends Component{
  constructor(props){
    super(props);
  }
  _getNavIcon(){
    // return null;
    var {rowData} = this.props;
    if(rowData.get('isNav')){
      return (
        <Icon type='arrow_right' size={16} color={GRAY} />
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
  render(){
    var {rowData,textStyle} = this.props;
    var title=rowData.get('title');
    var value = rowData.get('value');
    return (
      <TouchFeedback style={[{flex:1,backgroundColor:'white'},styles.rowHeight]} onPress={()=>{
          if(rowData.get('isNav')){
            this.props.onRowClick(rowData)
          }}}>
        <View style={[styles.row,styles.rowHeight]}>
          <View style={{flex:1}}>
            <Text numberOfLines={1} style={[styles.titleText,textStyle]}>
              {title}
            </Text>
          </View>
        </View>
      </TouchFeedback>
    );
  }
}


DeviceParamRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
  textStyle:PropTypes.any,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:49,
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
    flex:1,
    backgroundColor:'white',
    justifyContent:'space-between',
    paddingHorizontal:16,
  },
  titleText:{
    fontSize:17,
    color:BLACK,
    // flex:1,
    // backgroundColor:'white',
  },
  valueText:{
    flex:1,
    textAlign:'right',
    marginLeft:10,
    fontSize:17,
    color:GRAY
  }
});
