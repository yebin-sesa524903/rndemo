'use strict'

import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import PropTypes from 'prop-types';
// import Icon from '../Icon.js';
import {LINE_HISTORY,GREEN} from '../../styles/color';
import List from '../List.js';
import SimpleRow from './SimpleRow.js';
import Section from '../Section.js';
import Button from '../Button';
import Text from '../Text';
import Loading from '../Loading';

export default class DashCardView extends Component{
  constructor(props){
    super(props);
  }
  _getValueView()
  {
    var contentView=null;
    if(this.props.isFetching){
      contentView=(
        <View style={{flexDirection:'row',marginTop:10,height:30}}>
          <Loading />
        </View>
      );
    }else {
      if (this.props.value==='--') {
        contentView=(
          <View style={{flexDirection:'row',marginTop:10,height:30}}>
            <Text style={styles.invalidText}>
              {'无效值'}
            </Text>
          </View>
        );
      }else {
        contentView=(
          <View style={{flexDirection:'row',marginTop:10,height:30}}>
            <Text style={styles.valueStyle}>
              {this.props.value}
            </Text>
            <Text style={styles.unitStyle}>
              {this.props.unit}
            </Text>
          </View>
        );
      }
    }
    return (
      contentView
    );
  }
  render(){
    return (
      <View style={[this.props.style,{justifyContent:'center',alignItems:'center'}]}>
        <Text style={styles.titleStyle}>
          {this.props.title}
        </Text>
        {this._getValueView()}
      </View>
    )
  }
}

DashCardView.propTypes = {
  title:PropTypes.string,
  value:PropTypes.string,
  unit:PropTypes.string,
  isFetching:PropTypes.bool,
  style:PropTypes.any,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
  },
  titleStyle:{
    fontSize: 12,
    color:LINE_HISTORY,
  },
  valueStyle:{
    fontSize: 26,
    color:GREEN,
    // lineHeight:40,
    // textAlignVertical:'bottom'
  },
  invalidText:{
    fontSize: 20,
    color:'#abafae',
  },
  unitStyle:{
    fontSize: 12,
    color:GREEN,
    marginLeft:3,
    marginTop:12,
    // lineHeight:40,
    // textAlignVertical:'bottom'
  },
});
