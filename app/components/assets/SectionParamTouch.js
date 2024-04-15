'use strict'
import React,{Component} from 'react';

import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import {BLACK,GRAY,LIST_BG} from '../../styles/color.js';
import Icon from '../Icon.js';

export default class SectionParamTouch extends Component{
  constructor(props){
    super(props);
  }
  render(){
    var {rowData} = this.props;
    var isExpanded = rowData.get('isExpanded');
    var arrow = null;
    if(isExpanded){
      arrow = (
        <Icon type="icon_arrow_up" color={GRAY} size={16} />
      )
    }
    else {
      arrow = (
        <Icon type="icon_arrow_down" color={GRAY} size={16} />
      )
    }
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}}>
        <TouchFeedback style={{flex:1}} onPress={()=>{
              this.props.onSectionClick(rowData);
            }}>
          <View style={[styles.row,styles.rowHeight]}>
            <View style={{flex:1,marginRight:10,flexDirection:'row'}}>
              <View style={{flex:1}}>
                <Text numberOfLines={1} style={styles.titleText}>
                  {rowData.get('title')}
                </Text>
              </View>
                {arrow}
            </View>
          </View>
        </TouchFeedback>
      </View>
    );
  }
}

SectionParamTouch.propTypes = {
  onSectionClick:PropTypes.func.isRequired,
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
    justifyContent:'space-between',
    paddingHorizontal:16,
    paddingTop:19,
    paddingBottom:10,
  },
  titleText:{
    fontSize:14,
    color:GRAY,
    // flex:1,
    // backgroundColor:'white',
  },
  valueText:{
    textAlign:'right',
    flex:1,
    marginLeft:10,
    fontSize:14,
    color:GRAY
  }
});
