
'use strict';
import React,{Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import {BLACK} from '../../styles/color';
import Video from 'react-native-video-controls';

let url='https://media.w3.org/2010/05/sintel/trailer.mp4';

export default class VideoPlayer extends Component{
  constructor(props){
    super(props);
  }

  render() {
    let url=this.props.urlVideo;
    if (!url) {
      return;
    }
    // console.warn('ddd',this.props.urlVideo);
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Video source={{uri:url}}
           ref={(ref) => {
             this.player = ref
           }}
           onBack={()=>{
             this.props.onBack();
           }}
           resizeMode={'contain'}
           disableFullscreen={true}
           disableVolume={true}
           style={{
             flex:1,
             backgroundColor:'#000',
           }}
        >
        </Video>
      </View>
    );
  }
}

VideoPlayer.propTypes = {
  onBack:PropTypes.func,
  urlVideo:PropTypes.string,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
});
