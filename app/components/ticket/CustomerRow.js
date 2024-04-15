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

export default class CustomerRow extends Component{
  constructor(props){
    super(props);
  }
  _getCustomer(data){
    return (
      <View style={{flex:1}}>
        <Text numberOfLines={1} style={styles.titleText}>{data.get('CustomerName')}</Text>
      </View>
    )
  }
  render(){
    var {rowData} = this.props;
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <TouchFeedback style={{flex:1,backgroundColor:'white'}} onPress={()=>this.props.onRowClick(rowData)}>
          <View style={[styles.row,styles.rowHeight]}>
            {this._getCustomer(rowData)}
          </View>
        </TouchFeedback>
      </View>

    );
  }
}

CustomerRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:55,
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'white',
    paddingHorizontal:16,
  },
  rowLeft:{
    flexDirection:'column',
    flex:1,
    paddingVertical:16,
  },
  rowRight:{
    justifyContent:'center',
    // flex:1,
    paddingVertical:5,

  },
  titleText:{
    fontSize:17,
    color:'#333'//BLACK
  },
  subTitleText:{
    fontSize:12,
    color:GRAY,
    marginTop:8,
  }
});
