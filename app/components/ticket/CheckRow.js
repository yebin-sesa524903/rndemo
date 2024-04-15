'use strict'
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import {BLACK,GRAY,GREEN} from '../../styles/color';
import Icon from '../Icon.js';

export default class CheckRow extends Component{
  constructor(props){
    super(props);
  }
  _getNavIcon(){
    var {rowData} = this.props;
    if(!!rowData.get('isCheck')){
      return (
        <Icon type='icon_check' size={16} color={GREEN} />
      )
    }
  }
  render(){
    var {rowData} = this.props;
    var value = rowData.get('value');
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <TouchFeedback style={{flex:1}} onPress={()=>{
              this.props.onRowClick(rowData);
            }}>
          <View style={[styles.row,styles.rowHeight]}>
            <Text numberOfLines={1} style={styles.titleText}>
              {rowData.get('title')}
            </Text>
            <View style={{flex:1,justifyContent:'center',paddingLeft:10,alignItems:'flex-end'}}>
              <Text numberOfLines={1} style={styles.valueText}>
                {value}
              </Text>
            </View>
            {this._getNavIcon()}
          </View>
        </TouchFeedback>
      </View>
    );
  }
}


CheckRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:49,
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
    flex:1,
    // backgroundColor:'red',
    // justifyContent:'space-between',
    paddingHorizontal:16,
  },
  titleText:{
    fontSize:17,
    color:BLACK,
    // flex:1,
    // backgroundColor:'white',
  },
  valueText:{
    fontSize:17,
    color:GRAY
  }
});
