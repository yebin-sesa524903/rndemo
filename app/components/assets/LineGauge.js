import React,{Component} from 'react';
import {
  StyleSheet,
  ScrollView,
  Dimensions,
  Text,
  View,
} from 'react-native';
import PropTypes from 'prop-types';

import ReactNative from 'react-native'
import times from 'lodash/times';
import Icon from '../Icon.js';
import {BLACK,GRAY,CHART_RED,CHART_GRAY} from '../../styles/color';

const MARGINBORDER=15
const GAUGE_WIDTH = Math.floor(Dimensions.get('window').width-30)
const INTERVAL_WIDTH = GAUGE_WIDTH*1.0/50.5

export default class LineGauge extends Component {
  constructor(props) {
    super(props)
    // console.warn('GAUGE_WIDTH,INTERVAL_WIDTH',GAUGE_WIDTH,INTERVAL_WIDTH);
  }

  _getIntervalSize(val) {
    let { largeInterval} = this.props

    if (val % largeInterval == 0) return 'large'
    return 'small'
  }

  _renderIntervals() {
    let { min, max } = this.props
    let range = (max - min + 1);

    let values = times(range, (i) => i + min);

    var viewIntervals=values.map((val, i) => {
      let intervalSize = this._getIntervalSize(val)
      var color='white'
      // var color=`#f7${i*i%10}`
      // if (i>=0 || i < 5) {
      //   color=`#444${i%10}`
      //   // color='#4443';
      // }

      if (i%2===0) {
        return (
          <View key={`val-${i}`} style={[styles.intervalContainer,{backgroundColor:color}]}>
            <View style={[styles.intervalItem, styles[intervalSize]]}/>
          </View>
        )
      }
    });
    let viewIntervalTexts=values.map((val, i) => {
      let intervalSize = this._getIntervalSize(val)
      var color='white'
      if (i%2===0) {
        return (
          <View key={i} style={[styles.intervalContainer]}>
            {intervalSize === 'large'&&(<Text style={styles.intervalText}>{i}</Text>)}
          </View>
        );
      }
    });
    return (
      <View style={{}}>
        <View style={{flexDirection:'row'}}>
          {viewIntervals}
        </View>
        <View style={{flexDirection:'row'}}>
          {viewIntervalTexts}
        </View>
      </View>
    )
  }
  _isValidScrollValue()
  {
    return this.props.value!==null;
  }
  _isMiddleValue()
  {
    return this.props.value>30&&this.props.value<80;
  }
  _getScrollValueView()
  {
    if (!this._isValidScrollValue()) {
      return null;
    }
    return(
      <View style={[styles.centerline,{left:(this.props.value+0.4)*INTERVAL_WIDTH/2.0}]}>
        <Text style={{color:(this._isMiddleValue()?GRAY:CHART_RED),fontSize:10}}>
          {this.props.value+'%'}
        </Text>
        <Icon type='icon_arrow_unfold' size={12} color={GRAY} />
      </View>
    );
  }
  _getErrStringView()
  {
    if (!this.props.errStr) {
      return null;
    }
    return (
      <Text numberOfLines={1} style={styles.valueText}>
        {this.props.errStr}
      </Text>
    );
  }
  render() {
    return (
      <View style={[styles.container,{marginTop:this._isValidScrollValue()?10:25}]}>
        {this._getScrollValueView()}
        <View style={{flexDirection:'row',height:13,borderWidth:1,borderColor:CHART_GRAY}}>
          <View style={{flex:0.3,backgroundColor:CHART_RED}}/>
          <View style={{flex:0.5,backgroundColor:'#ccc'}}/>
          <View style={{flex:0.2,backgroundColor:CHART_RED}}/>
        </View>

        <View style={styles.intervalsSty}>
          {this._renderIntervals()}
        </View>
        {this._getErrStringView()}
      </View>
    )
  }
}

LineGauge.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  largeInterval: PropTypes.number,
  value: PropTypes.number,
  errStr: PropTypes.string
}

LineGauge.defaultProps = {
  min: 1,
  max: 100,
  largeInterval: 5,
}

var styles = StyleSheet.create({
  container: {
    justifyContent:'flex-end',
    paddingHorizontal:MARGINBORDER,
    // width: GAUGE_WIDTH,
    borderWidth:1,
    borderColor:'#DDD0',
  },
  intervalsSty: {
    flexDirection: 'row',
    marginBottom:15,
  },
  intervalContainer: {
    width: INTERVAL_WIDTH,
    alignItems: 'flex-start',
  },
  intervalItem: {
    width: 1,
    alignItems:'flex-end',
    backgroundColor: CHART_GRAY,
  },
  intervalText: {
    fontSize: 9,
    marginBottom: 3,
    marginLeft:-20,
    width:40,
    textAlign:'center',
    color:CHART_GRAY,
  },
  small: {
    height: 1,
  },
  large: {
    height: 3,
  },
  centerline: {
    flex:1,
    marginLeft:-21,
    width: 40,
    justifyContent:'flex-end',
    marginBottom:1,
    alignItems:'center',
    zIndex: 1
  },
  valueText:{
    marginBottom:15,
    fontSize:11,
    color:CHART_RED,
    textAlign:'center'
  }
})
