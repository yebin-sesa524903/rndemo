import React,{Component} from 'react';
import {View, Text, Image, ScrollView, Platform} from 'react-native';
import NetworkImage from "../../NetworkImage";
import {GREEN} from "../../../styles/color";
import TouchFeedback from "../../TouchFeedback";

export class Urgency extends Component {

  render() {
    if(!this.props.isUrgency) return null;
    let offsetY = this.props.offsetY || 0;
    return (
      <View style={{transform: [{translateY: offsetY}]}}>
        <View style={{backgroundColor:'#fff1f0',width:22,height:20,borderRadius:2,alignItems:'center',
          justifyContent:'center',borderColor:'#ffa39e',borderWidth:1}}>
          <Text style={{fontSize:12,color:'#ff4d4d'}}>急</Text>
        </View>
      </View>
    )
  }
}

export class Level extends Component {

  render() {
    if(!this.props.level) return null;
    const ALARM_HIGH = '#ff4d3d';
    const ALARM_HIGH_BG = '#ff4d3d11';
    const ALARM_MIDDLE = '#fbb325';
    const ALARM_MIDDLE_BG = '#fbb32511';
    const ALARM_LOW = '#219bfd';
    const ALARM_LOW_BG = '#219bfd11';
    let borderColors = [ALARM_HIGH,ALARM_MIDDLE,ALARM_LOW];
    let bgColors = [ALARM_HIGH_BG,ALARM_MIDDLE_BG,ALARM_LOW_BG];

    let texts = ['高','中','低'];
    let PRIORITY_VALUE = [3,2,1];
    let index = PRIORITY_VALUE.indexOf(this.props.level);
    if(index < 0) return null;
    let title = texts[index];
    let offsetY = 1;
    if(Platform.OS === 'android') offsetY = 4;
    return (
      <View style={{backgroundColor:bgColors[index],borderColor:borderColors[index],borderRadius:2,
        borderWidth:1,height:20,width:24,alignItems:'center',justifyContent:'center',transform: [{translateY: offsetY}]}}>
        <Text style={{fontSize:12,color:borderColors[index]}}>{title}</Text>
      </View>
    );
  }
}

export class CheckDot extends Component {

  render() {
    let size = this.props.size || 14;
    let innerSize = size / 2;
    let sel = this.props.selected || false;
    let color = this.props.color || '#888'
    return (
      <View style={{
        width: size, height: size, borderRadius: size / 2, borderColor: sel ? GREEN : color, borderWidth: 1,
        alignItems: 'center', justifyContent: 'center'
      }}>
        <View style={{
          width: innerSize, height: innerSize, borderRadius: innerSize / 2,
          backgroundColor: sel ? GREEN : '#00000000'
        }}/>
      </View>
    );
  }
}

export class Avatar extends Component {

  _renderImage(radius) {
    return (
      <View style={{borderWidth:1,borderColor:'#e6e6e6',borderRadius:radius+1}}>
        <NetworkImage
          style={{borderRadius:radius,...this.props.style}}
          resizeMode="cover"
          imgType='jpg'
          defaultSource = {require('../../../images/building_default/building.png')}
          width={radius*2-1} height={radius*2-1}
          name={this.props.imgKey} />
      </View>

    );
  }

  render() {
    let radius = this.props.radius || 15;
    if(this.props.imgKey) return this._renderImage(radius);
    let letter = this.props.name || '';
    if(letter.length>0) letter=letter[0];
    return (
      <View style={{width:radius*2,height:radius*2,borderRadius:radius,backgroundColor:'#f2f2f2',
        alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#e6e6e6',
        ...this.props.style}}>
        <Text style={{fontSize:radius,color:'#888'}}>{letter}</Text>
      </View>
    )
  }
}

export class GreenLabel extends Component {

  render() {
    return (
      <View style={{marginBottom:10,flexDirection:'row',alignItems:'center',...this.props.style}}>
        <View style={{width:3,height:18,backgroundColor:GREEN,borderRadius:1.5,marginRight:8}}/>
        <Text style={{fontSize:15,color:'#333'}}>{this.props.title}</Text>
      </View>
    )
  }
}

export class Remark extends Component {

  render() {
    let offsetY = 1;
    if(Platform.OS === 'android'){
      offsetY = 4;
    }
    if(this.props.noOffset) offsetY = 0;
    return (
      <TouchFeedback enabled={this.props.disable ? false: true} onPress={this.props.click}>
        <View style={{backgroundColor:'#ff4d4d',height:20,justifyContent:'center',alignItems:'center',transform: [{translateY: offsetY}],
          paddingHorizontal:2,borderRadius:2}}>
          <Text style={{fontSize:12,color:'#fff'}}>批注</Text>
        </View>
      </TouchFeedback>
    )
  }
}

