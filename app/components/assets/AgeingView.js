'use strict'
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Circle from './Circle';
import Text from '../Text';
import {BLACK,GRAY,LINE_HISTORY,CHART_RED,CHART_NGRAY,CHART_OFFSET_COLOR,CHART_GREEN} from '../../styles/color';

export default class AgeingView extends Component{
  constructor(props){
    super(props);
  }
  _getErrView(errStr)
  {
    if (!errStr) {
      return null;
    }
    return (
      <Text numberOfLines={1} style={styles.valueText}>
        {errStr}
      </Text>
    );
  }
  render(){
    var showValueText=true;
    var ageValue=this.props.ageValue;
    // ageValue=0.0;
    if (this.props.errStr || ageValue === null) {
      showValueText=false;
    }
    var color=CHART_OFFSET_COLOR;
    var offsetColor=CHART_NGRAY;
    var textColor=LINE_HISTORY;
    if (ageValue===null) {
      color=CHART_OFFSET_COLOR;
      offsetColor=CHART_OFFSET_COLOR;
    }else {
      textColor=(ageValue&&ageValue>=0.9)?CHART_RED:LINE_HISTORY;
    }
    return (
      <View style={styles.circleContainer}>
        <Circle
          style={styles.progress}
          size={100}
          thickness={11}
          showsText={true}
          animated={false}
          borderWidth={0}
          borderColor={'#f00'}
          unfilledColor={this.props.unfilledColor ||CHART_GREEN}
          offsetColor={this.props.offsetColor ||offsetColor}
          color={this.props.color ||color}
          textStyle={{color:textColor,fontSize:showValueText?26:16}}
          textIconStyle={{color:showValueText?textColor:'transparent',fontSize:14}}
          formatText={(progress)=>{
            return showValueText?`${Math.round(progress * 100)}`:`无效值`;
          }}
          formatIconText={(progress)=>{
            return showValueText?`%`:'';
          }}
          progress={ageValue}
          indeterminate={false}
        />
        {this._getErrView(this.props.errStr)}
      </View>
    );
  }
}


AgeingView.propTypes = {
  ageValue:PropTypes.number,
  errStr:PropTypes.string,
}

var styles = StyleSheet.create({
  circleContainer: {
    flex:1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // height:120,
    // marginVertical:20,
    // backgroundColor:'gray'
  },
  progress: {
    marginTop:20,
    marginBottom:20,
    // backgroundColor:'gray'
  },
  valueText:{
    marginBottom:20,
    fontSize:11,
    color:CHART_RED
  }
});
