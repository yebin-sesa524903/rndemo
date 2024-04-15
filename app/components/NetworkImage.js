'use strict';

import React,{Component} from 'react';

import {ImageBackground,View,PixelRatio,Image} from 'react-native';
import PropTypes from 'prop-types';
// import CryptoJS from "crypto-js";
import appInfo from '../utils/appInfo.js';
import TransformableImage from './ImageComponent/TransformableImage.js';
import CacheableImage from './ImageComponent/CacheableImage.js';
import {isLocalFile} from "../utils/fileHelper";
import storage from '../utils/storage.js';
import {getBaseUri} from "../middleware/api";

class NetworkImage extends Component {
  static async getUri(name,width,height){
    if(isLocalFile(name)) return name;
    var pWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    var pHeight = PixelRatio.getPixelSizeForLayoutSize(height);

    // var bucketName = appInfo.get().ossBucket;
    var bucketName = await storage.getOssBucket()+'/popapi/api/common/getobject';

    var uri = `${bucketName}/${name}@${pWidth}w_${pHeight}h.png`;
    if(!appInfo.get().prod){
      uri = `${bucketName}/${name}?x-oss-process=image/resize,w_${pWidth},h_${pHeight}/format,png`;
    }

    // if(this.props.useOrigin){
    //   uri = `http://${bucketName}/${name}@.jpg`
    // }

    return uri;
  }
  constructor(props){
    super(props);
    this.state = {
      loaded:false,
      defaultSourcePath:null,
    };
  }
  _onLoaded(){
    if(this._unmount) return;
    this.setState({loaded:true});
  }

  static buildUrl(name,width,height,imgType,useOrigin,isEncrypt){
    if(isLocalFile(name)) return name;
    var pWidth = PixelRatio.getPixelSizeForLayoutSize(width);
    var pHeight = PixelRatio.getPixelSizeForLayoutSize(height);

    // var bucketName = appInfo.get().ossBucket;
    var bucketName = null;//await storage.getOssBucket();//+'api/common/getobject';
    bucketName = getBaseUri();//fillPostFix(bucketName);
    bucketName += '/popapi/api/common/getobject';

    var uri = '';//`http://${bucketName}/${name}@${pWidth}w_${pHeight}h.${imgType==='jpg'?'jpg':'png'}`;
    // if(!appInfo.get().prod){
      uri = `${bucketName}/${name}?x-oss-process=image/resize,w_${pWidth},h_${pHeight}/format,${imgType==='jpg'?'jpg':'png'}`;
    // }
    if(useOrigin){
      // uri = `http://${bucketName}/${name}@.${imgType==='png'?'png':'jpg'}`
      // if(!appInfo.get().prod){
        uri = `${bucketName}/${name}?x-oss-process=image/format,${imgType==='png'?'png':'jpg'}`;
      // }
    }

    // let _BASEURL = "http://pop-core-mobilehost-k3s.energymost.com/api/";
    if (isEncrypt) {
    //   if(appInfo.get().prod){
    //     _BASEURL = appInfo.get().prod;
    //   }
      uri = `${getBaseUri()}/popapi/api/images/download/${name}?x-oss-process=image/resize,w_${pWidth},h_${pHeight}/format,${imgType==='jpg'?'jpg':'png'}`;
    //   // uri = images/view/2arEGxEWGwPKK9qZKX7WXx4lKfG0EzVa?x-oss-process=image/resize,w_750,h_500/format,png
    }

    // console.warn('----------1111',uri);
    return uri;
  }

  _assemlbeUri(name,width,height,imgType,useOrigin,isEncrypt){
    return  NetworkImage.buildUrl(name,width,height,imgType,useOrigin,isEncrypt);
  }
  componentWillUnmount() {
    this._unmount = true;
    this.setState = () => {};
  }

  componentWillMount() {
    if(this.props.render === false && this.props.name){
      // Image.prefetch(this._assemlbeUri());
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    if(nextProps.name === this.props.name
      && this.state.loaded === nextState.loaded
      && nextProps.render === this.props.render
      && this.state.defaultSourcePath === nextState.defaultSourcePath){
      return false;
    }
    return true;
  }
  // async getPhotoPath(thumbUri)
  // {
  //   var res =await CacheableImage.getFilepathFromSource({uri:thumbUri});
  //   // console.warn('res...',res);
  //   return res;
  // }
  render () {
    var {name,style,width,height,imgType,useOrigin,isEncrypt} = this.props;
    var styles = [];
    if(style && Array.isArray(style)){
      styles = styles.concat(style);
    }
    else if(typeof style === 'object' || typeof style === 'number'){

      styles.push(style);
    }
    styles.push({width,height});

//defaultSource={{uri: 'file://'+'./Users/SamuelMac/Library/Developer/CoreSimulator/Devices/D67EC84C-BCF6-4CBA-9882-102559D453AE/data/Containers/Data/Application/61445FB6-B500-4921-9A6E-763FA23DCCAF/Documents/se-t-data.energymost.com/ec45897176d73aba7be11f1810904c85361696c6.png'}}
    var defaultImage = null;
    if(this.props.defaultSource && !this.state.loaded && !this.props.zoomAble){
      defaultImage = (
        <ImageBackground key={this.props.defaultSource} style={[styles,{zIndex:1}]} resizeMode={this.props.resizeMode} source={this.props.defaultSource}>
          {this.props.children}
        </ImageBackground>
      )
    }
    var realImage = null;
    if(name){
      var uri = this._assemlbeUri(name,width,height,imgType,useOrigin,isEncrypt);
      var thuWidth=null;
      var thuHeight=null;
      var thumbUri=null;
      if (this.props.thumbImageInfo) {
        thuWidth=this.props.thumbImageInfo.width;
        thuHeight=this.props.thumbImageInfo.height;
        thumbUri=this._assemlbeUri(name,thuWidth,thuHeight,'jpg',false);
        CacheableImage.getFilepathFromSource({uri:thumbUri}).then((res)=>{
          this.setState({defaultSourcePath:res})
        });
      }


      //console.warn('----------222',uri);

      if (this.props.zoomAble) {
        var obj={
          pixels:{width:this.props.width*2,height:this.props.height*2},
          ref:this.props.cusRef,
          key:{uri},
          resizeMode:this.props.resizeMode,
          source:{uri},
          thumbImageUri:{uri:thumbUri},
          onLoad:()=>this._onLoaded(),
        };
        // console.warn('localFilePath...',this.state.defaultSourcePath);
        var objDefaultSource=null;
        if (this.state.defaultSourcePath) {
          objDefaultSource={
            defaultSource:{
              uri: this.state.defaultSourcePath
              // uri: 'file://'+this.state.defaultSourcePath
            },
          };
        }
        var objParam={...this.props.other,...obj,...objDefaultSource};
        // console.warn('objParam',objParam);
        realImage = (
          <TransformableImage
            {...objParam}>
            {this.props.children}
          </TransformableImage>
        )
      }else {
        realImage = (
          <CacheableImage key={uri} style={[styles,{zIndex:2}]}
            source={{uri}}
            resizeMode={this.props.resizeMode}
            onLoad={()=>this._onLoaded()}
            capInsets={{left: 0.1, top: 0.1, right: 0.1, bottom: 0.1}}>
            {this.props.children}
          </CacheableImage>
        )
      }

    }
    if(!this.props.render){
      return (
        <View style={[styles,{overflow:'hidden',zIndex:1}]}>
        </View>
      )
    }
    if(this.props.zoomAble){
      return (
        realImage
      );
    }
    return (
      <View style={[styles,{overflow:'hidden',zIndex:1}]}>
        <View style={{position:'absolute',left:0,right:0,top:0,bottom:0}}>
          {realImage}
        </View>

        {defaultImage}
      </View>

    );

  }
}

NetworkImage.propTypes = {
  children:PropTypes.any,
  uri:PropTypes.string,
  onLoaded:PropTypes.func,
  render:PropTypes.bool,
  name:PropTypes.string,
  resizeMode:PropTypes.string,
  imgType:PropTypes.string,
  useOrigin:PropTypes.bool,
  defaultSource:PropTypes.any,
  style:PropTypes.any,
  width:PropTypes.number,
  height:PropTypes.number,
  zoomAble:PropTypes.bool,
  isEncrypt:PropTypes.bool,
  cusRef:PropTypes.any,
  other:PropTypes.any,
  thumbImageInfo:PropTypes.object,
};

NetworkImage.defaultProps = {
  resizeMode:'cover',
  render:true,
  imgType:'png',
  useOrigin:false,
  isEncrypt:false,
}


module.exports = NetworkImage
