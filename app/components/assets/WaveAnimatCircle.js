'use strict'
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import PropTypes from 'prop-types';

import Circle from './Circle';
import Text from '../Text';
import {BLACK,GRAY,LINE_HISTORY,CHART_RED,CHART_NGRAY,CHART_OFFSET_COLOR,CHART_GREEN} from '../../styles/color';

export default class WaveAnimatCircleView extends Component{
  constructor(props){
    super(props);
    var scale=props.minRadius/props.maxRadius;
    this.state={fadeAnimat0:new Animated.Value(1),scaleAnimat0:new Animated.Value(scale),
      fadeAnimat1:new Animated.Value(1),scaleAnimat1:new Animated.Value(scale),
    }
  }
  componentDidMount()
  {
    const {fadeAnimat0,scaleAnimat0,fadeAnimat1,scaleAnimat1}=this.state;
    Animated.stagger(1000,[
      Animated.loop(
        Animated.parallel(
          [
            Animated.timing(scaleAnimat0,{
                toValue:1.0,
                duration:2000,
              }
            ),
            Animated.timing(fadeAnimat0,{
                toValue:0.1,
                duration:2000,
              }
            ),
          ]
        )
      ),

      Animated.loop(
        Animated.parallel(
          [
            Animated.delay(200),
            Animated.timing(scaleAnimat1,{
                toValue:1.0,
                duration:1800,
              }
            ),
            Animated.timing(fadeAnimat1,{
                toValue:0.1,
                duration:1800,
              }
            ),
          ]
        )
      )
    ]).start(()=>{
      // this.state.fadeAnimat0.setValue(1);
      // this.state.scaleAnimat0.setValue(0.7);
      // this.state.fadeAnimat1.setValue(1);
      // this.state.scaleAnimat1.setValue(0.7);
    });
  }

  render(){
    var width=this.props.maxRadius*2;
    var top=this.props.maxRadius-this.props.minRadius;
    return (
      <View style={[styles.container,{width:width,height:width}]}>
        <Animated.View style={{
          zIndex:1,overflow:'hidden',
          width:width,height:width,
          borderRadius:width/2.0,opacity:this.state.fadeAnimat0,
          borderWidth:1,borderColor:'#f44026',
          backgroundColor: this.state.fadeAnimat0.interpolate({
                        inputRange: [0,1],
                        outputRange: ['#f4402600', '#f44026ff']
                    }),
          transform:[
            {
              scale:this.state.scaleAnimat0,
            }
          ]
        }}>
          <Animated.View style={{width:width,height:width,backgroundColor:'transparent',
            borderRadius:width/2.0,opacity:this.state.fadeAnimat1,
            borderWidth:1,borderColor:'#f44026',
            transform:[
              {
                scale:this.state.scaleAnimat1,
              }
            ]
          }}>

          </Animated.View>
        </Animated.View>

        <View style={{
            position:'absolute',left:top,top:top,
            width:this.props.minRadius*2,height:this.props.minRadius*2,backgroundColor:'#f7270a',
            borderRadius:this.props.minRadius,justifyContent:'center',alignItems:'center',
            zIndex:2,overflow:'hidden',}}>
          {this.props.child}
        </View>

      </View>
    );
  }
}

WaveAnimatCircleView.defaultProps = {
  minRadius:28,
  maxRadius:40,
  child:null,
}

WaveAnimatCircleView.propTypes = {
  minRadius:PropTypes.number,
  maxRadius:PropTypes.number,
  child:PropTypes.any,
}

var styles = StyleSheet.create({
  container: {
    // flex:1,
    // flexDirection: 'column',
    // alignItems: 'center',
    // justifyContent: 'center',
    // height:120,
    // marginVertical:20,
    // backgroundColor:'#1111'
  },
});
