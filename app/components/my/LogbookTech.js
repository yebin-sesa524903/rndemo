
'use strict';
import React,{Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ImageBackground,
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import {BLACK} from '../../styles/color';
import Video from 'react-native-video-controls';
import NetworkImage from '../NetworkImage';
import TouchFeedback from '../TouchFeedback';

let url='https://media.w3.org/2010/05/sintel/trailer.mp4';
var {width,height} = Dimensions.get('window');

export default class LogbookTech extends Component{
  constructor(props){
    super(props);
  }
  _getDesTextView(item){
    var strText=item.get('Detail');
    if (!strText) {
      return;
    }
    // var strText='1.进入建筑页面，点击“新建配电室”按钮进入新建配电室页面\n2.输入配电室名称完成新建\n3.进入配电室页面，点击右上角“•••”，进行编辑、删除配电室';
    strText=strText.replace('&#8226;&#8226;&#8226;','•••')
    var textViews=strText.split('<br/>').map((item,index)=>{
      return (
        <View style={{marginTop:9,}} key={`des${index}`}>
          <Text style={{color:'#888',fontSize:15,lineHeight:20,}}>
            {item}
          </Text>
        </View>
      )
    });
    return (
      <View style={{}}>
        {textViews}
      </View>
    )
  }
  _getContentView(){
    var viewContent=this.props.guideInfos.map((item,index)=>{
      return this._getItemRow(item,index);
    })
    return viewContent;
  }
  _getItemRow(item,index){
    var imageKey=item.get('ThumOssKey');//'image-feedback-log-0-312038-1556259940336-0'
    var strSize=item.get('Size');
    var strVideo=item.get('VideoOssKey');
    return (
      <View style={{}} key={`tech${index}`}>
        <NetworkImage
          width={width}
          height={width*690.0/1125.0}
          defaultSource = {require('../../images/building_default/building.png')}
          name={imageKey}>
          <View style={{
              // backgroundColor:'#f002',
            // width:64,height:64,
            flex:1,
            alignItems:'center'
          }}>
          <TouchFeedback style={{}} onPress={()=>this.props.onPlay(strVideo)}>
            <View style={{marginTop:94,width:64,height:64,}}>
              <ImageBackground
                source={require('../../images/player/btnPlayer.png')}
                resizeMode="cover"
                style={[{flex:1,},]}>
              </ImageBackground>
            </View>
          </TouchFeedback>
          <View style={{borderColor:'#70e07c',borderWidth:1,paddingHorizontal:8,height:26,
            justifyContent:'center',backgroundColor:'#f5fff7',borderRadius:2,
            marginTop:12,}}>
            <Text style={{color:'#284e98',fontSize:13}}>
              {strSize}
            </Text>
          </View>
          </View>
        </NetworkImage>
        <View style={{paddingHorizontal:16,paddingVertical:12}}>
          <View style={{}}>
            <Text style={{color:'black',fontSize:17,fontWeight:'500',}}>
              {item.get('Title')}
            </Text>
          </View>
          {this._getDesTextView(item)}
        </View>
        <View style={{height:20,backgroundColor:'#F2F2F2'}}>
        </View>
      </View>
    )
  }
  render() {
    // let url=this.props.guideInfos;
    // console.warn('ddd',this.props.guideInfos);
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar
          title={'Logbook使用教程'}
          navIcon="back"
          onIconClicked={()=>this.props.onBack()} />
        <ScrollView>
          {this._getContentView()}
        </ScrollView>
      </View>
    );
  }
}

LogbookTech.propTypes = {
  onBack:PropTypes.func,
  onPlay:PropTypes.func,
  guideInfos:PropTypes.object,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
});
