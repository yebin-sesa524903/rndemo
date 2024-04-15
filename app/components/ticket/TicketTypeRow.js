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

export default class TicketTypeRow extends Component{
  constructor(props){
    super(props);
  }
  _getNavIcon(isSelect){
    if(!!isSelect){
      return (
        <View style={styles.selectView}>
          <Icon type='icon_check' size={10} color='white' />
        </View>
      )
    }else {
      return (
        <View style={styles.unSelectView}>
        </View>
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
    var {rowData} = this.props;
    var value = rowData.get('value');
    if (!value || value.size!==2) {
      return null;
    }
    return (
        <View style={[styles.row,styles.rowHeight]}>
          <Text style={styles.titleText}>
            {rowData.get('title')}
          </Text>
          <View style={{flexDirection:'row',justifyContent: 'flex-end'}}>
            <TouchFeedback style={[{flex:1,justifyContent:'center',flexDirection:'row'}]} onPress={()=>{
                  this.props.onRowSelect(0,rowData)
                }}>
              <View style={{alignItems:'center',flexDirection:'row',padding:10}}>
                {this._getNavIcon(value.get(0).get('isSelect'))}
                <Text numberOfLines={1} style={[styles.valueText,{marginRight:10}]}>
                  {value.get(0).get('title')}
                </Text>
              </View>
            </TouchFeedback>
            <TouchFeedback style={[{flex:1,justifyContent:'center',flexDirection:'row'}]} onPress={()=>{
                this.props.onRowSelect(1,rowData)
              }}>
              <View style={{alignItems:'center',flexDirection:'row'}}>
                {this._getNavIcon(value.get(1).get('isSelect'))}
                <Text numberOfLines={1} style={styles.valueText}>
                  {value.get(1).get('title')}
                </Text>
              </View>
            </TouchFeedback>
          </View>
        </View>
    );
  }
}


TicketTypeRow.propTypes = {
  user:PropTypes.object,
  onRowSelect:PropTypes.func.isRequired,
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
    textAlign:'right',
    flex:1,
    marginLeft:10,
    fontSize:17,
    color:GRAY
  },
  selectView:{
    width:18,
    height:18,
    borderRadius:10,
    backgroundColor:GREEN,
    // paddingRight:10,
    justifyContent:'center',
    alignItems:'center'
  },
  unSelectView:{
    width:18,
    height:18,
    borderRadius:10,
    borderColor:GRAY,
    borderWidth:1,
    // marginRight:16,
    justifyContent:'center',
    alignItems:'center'
  },
});
