
'use strict';
import React,{Component} from 'react';

import {
  View,

  Animated,
  Easing,
  StyleSheet,
  ViewPropTypes,
  Dimensions,
  ScrollView,
} from 'react-native';

import Text from '../Text';
import Icon from '../Icon.js';
import {BLACK,GRAY,LINE_HISTORY,CHART_RED,CHART_NGRAY,CHART_OFFSET_COLOR,CHART_GREEN} from '../../styles/color';
import Loading from '../Loading';
import ListSeperator from '../ListSeperator';
import TouchFeedback from '../TouchFeedback';
import PropTypes from 'prop-types';
import Toolbar from '../Toolbar';

export default class BuildingHealthyView extends Component{
  constructor(props){
    super(props);
    this.state = {
        rotationAnim: new Animated.Value(0),
        startAnim:false,
        contentHeight:0,
        chatWidth:0,
        chatHeight:0,
        arrLinePoints:[],
        paddTopForGrid:0,
        arrRoundStartPoints:[],
        roundRectWidth:0,
        enableArrowScroll:true,
    };
  }
  componentDidMount() {
    // this.setState({startAnim:true},()=>{
    //   this._initializeRotationAnimation();
    // });
  }
  componentWillReceiveProps(nextProps) {

  }
  _getToolbar(){
    return (
      <Toolbar
        title={this.props.title}
        navIcon="close"
        onIconClicked={()=>{
          this.props.onBack();
        }}/>
    );
  }
  _getAlarmInfos(arrAlarmInfos)
  {
    if (!arrAlarmInfos||arrAlarmInfos.size===0) {
      return (
        <View style={{flexDirection:'row',}}>
          <View style={{width:180,paddingRight:40,height:35,justifyContent:'center'}}>
            <Text style={{fontSize:15,color:'#666'}} numberOfLines={1}>
              {'无'}
            </Text>
          </View>
          <View style={{width:110,height:35,justifyContent:'center'}}>
            <Text style={{fontSize:15,color:'#666'}}>
              {''}
            </Text>
          </View>
        </View>
      );
    }
    return arrAlarmInfos.map((item,index)=>{
      var name=item.get('Name');
      return (
        <View style={{flexDirection:'row',}}>
          <View style={{width:180,paddingRight:40,height:35,justifyContent:'center'}}>
            <Text style={{fontSize:15,color:'#666'}} numberOfLines={1}>
              {name}
            </Text>
          </View>
          <View style={{width:110,height:35,justifyContent:'center'}}>
            <Text style={{fontSize:15,color:'#666'}}>
              {item.get('Value')+item.get('UomName')}
            </Text>
          </View>
        </View>
      );
    })
  }
  _getDeviceRows()
  {
    if (!this.props.devicesDatas) {
      return;
    }
    var arrDevices=this.props.devicesDatas.get('DeviceHealthInfo');
    return arrDevices.map((item,index)=>{
      if (index>=10) {
        return null;
      }
      var arrAlarmInfos=item.get('AlarmInfos');
      return (
        <View style={{}}>
          <View style={{flexDirection:'row',}}>
            <View style={{flex:1,paddingLeft:16,}}>
              <View style={{height:35,justifyContent:'center',paddingRight:40,}}>
                <Text style={{fontSize:15,color:'#666',}} numberOfLines={1}>
                  {item.get('DeviceName')}
                </Text>
              </View>
            </View>

            <View style={{}}>
              {this._getAlarmInfos(arrAlarmInfos)}
            </View>
          </View>
          <ListSeperator/>
        </View>
      )
    })
  }
  _getContentsView()
  {
    // if (!this.props.devicesDatas||this.props.isFetching) {
    //   return (
    //     <Loading />
    //   )
    // }
    var {width,height} = Dimensions.get('window');
    var arrowColor=this.state.enableArrowScroll?'#999':'transparent';
    // console.warn('3333',this.props.devicesDatas);
    return (
      <ScrollView style={{flex:1,}}
        ref={(scroll)=>{}}
        >
        <View style={{flex:1,padding:16,}}>
          <View style={{flexDirection:'row',height:35,backgroundColor:'#f2f2f2',
          alignItems:'center'}}>
            <View style={{flex:1,paddingLeft:16,}}>
              <Text style={{fontSize:15,color:'#8e8e9c'}}>
                {'设备名称'}
              </Text>
            </View>
            <View style={{width:180,paddingRight:40}}>
              <Text style={{fontSize:15,color:'#8e8e9c'}}>
                {'问题名称'}
              </Text>
            </View>
            <View style={{width:110}}>
              <Text style={{fontSize:15,color:'#8e8e9c'}}>
                {'报警值'}
              </Text>
            </View>
          </View>

          <View style={{}}>
            {this._getDeviceRows()}
          </View>

        </View>

        <View style={{flex:1,justifyContent:'center',alignItems:'center',paddingBottom:11,}}>
          <Text style={{fontSize:12,color:'#8e8e9c'}}>
            {'更多设备问题请到电脑端查看~'}
          </Text>
        </View>
      </ScrollView>
    )
  }
  render() {
    // var {width,height} = Dimensions.get('window');
    // var height=
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        {this._getToolbar()}
        {this._getContentsView()}
      </View>
    );
  }
}

BuildingHealthyView.propTypes = {
  user:PropTypes.object,
  isFetching:PropTypes.bool,
  onRowClick:PropTypes.func.isRequired,
  onRefresh:PropTypes.func.isRequired,
  devicesDatas:PropTypes.object,
  onBack:PropTypes.func.isRequired,
  title:PropTypes.string.isRequired,
}

var styles = StyleSheet.create({

    styLinearGradient: {
      flex: 1,
      borderRadius: 4,
      backgroundColor:'red'
    },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
