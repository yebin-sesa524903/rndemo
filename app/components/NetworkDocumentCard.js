'use strict'
import React, { Component } from 'react';

import {
  View,
  Platform,
  StyleSheet, Pressable, Image
  // Linking
} from 'react-native';
import PropTypes from 'prop-types';
import Text from './Text.js';
import { getBaseUri, TOKENHEADER, JWTTOKENHEADER, HEADERDEVICEID } from '../middleware/api.js';
import Toast from 'react-native-root-toast';
import { openFile } from '../utils/openFile';
import TouchFeedback from './TouchFeedback.js';
import { BLACK, GRAY } from './../styles/color.js';
import Icon from './Icon.js';
import storage from '../utils/storage.js';

const RNFS = require('react-native-fs');

const saveDocumentPath = Platform.OS === 'ios' ? RNFS.CachesDirectoryPath : RNFS.ExternalDirectoryPath;

var jobId = -1;

export default class NetworkDocumentCard extends Component {
  constructor(props) {
    super(props);
    this.state = { id: null, loaded: false, progress: '' };
    // this.stopDownloadTest=this.stopDownloadTest.bind(this);
  }

  async downloadNetFile(name, id) {
    if (jobId !== -1) {
      return;
    }

    var progress = data => {
      console.warn('data', data);
      var percentage;
      if (data.contentLength > 0) {
        percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
        percentage = `${percentage}%`;
      } else {
        let mb = 1024 * 1024;
        percentage = `${(data.bytesWritten / mb).toFixed(2)}Mb`;
      }

      this.setState({
        id,
        loaded: false,
        progress: percentage,
      });
    };

    var begin = res => {
      this.setState({
        id,
        loaded: false,
        progress: `1%`,
      });
    };

    var progressDivider = 10;
    var index = name.lastIndexOf('.');
    var type = name.substring(index + 1);
    // var ossBucket = appInfo.get().ossBucket;
    // index = ossBucket.indexOf('.');
    // ossBucket = ossBucket.substring(0,index);
    // var url = `http://${ossBucket}.oss-cn-hangzhou.aliyuncs.com/rem-file-${id}.${type}`;
    //api/tickets/docs/{fileId}.{ext}
    var baseUri = getBaseUri();
    // var url = 'http://www.pdf995.com/samples/pdf.pdf';
    var url = id;//`${baseUri}/popapi/api/common/file/download/${id}`;
    var downFilePath = `${saveDocumentPath}/${name}`;
    var token = await storage.getToken();
    var jwtToken = await storage.getJwtToken();
    var deviceid = await storage.getDeviceId();
    var headers = {};
    headers[TOKENHEADER] = token;
    headers[HEADERDEVICEID] = deviceid;
    headers[JWTTOKENHEADER] = jwtToken;
    RNFS.exists(downFilePath).then((result) => {
      if (result) {
        console.warn('will open file...');
        this.fileOpen(downFilePath, type);
      } else {
        const ret = RNFS.downloadFile({
          fromUrl: url,
          toFile: downFilePath,
          headers,
          background: false,
          progressDivider,
          begin,
          progress
        });
        console.warn('start down load file with id:', ret.jobId);
        jobId = ret.jobId;

        ret.promise.then(res => {
          this.setState({
            id,
            loaded: true,
            progress: '',
          });
          console.warn('end down load file with forceStoped:', this.props.forceStoped);
          if (!this.props.forceStoped) {
            this.fileOpen(downFilePath, type);
          } else {
            console.warn('stoped is false...');
          }
          //'image/jpeg','application/msword',image/png,	application/x-png,application/octet-stream
          jobId = -1;
        }).catch(err => {
          this.showError(err)
          jobId = -1;
        });
      }
    });
  }

  fileOpen(downFilePath, type) {
    openFile(downFilePath, type, () => {
      Toast.show('无法打开此文件', {
        duration: 5000,
        position: -80,
      });
    });
  }

  stopDownloadTest() {
    console.warn('stopDownloadTest...jobId:', jobId);
    if (jobId !== -1) {
      console.warn('stopDownloadTest 2...');
      RNFS.stopDownload(jobId);
    } else {
      console.warn('There is no download to stop');
    }
  }
  showError(err) {
    this.setState({ output: `ERROR: Code: ${err.code} Message: ${err.message}` });
  }
  componentWillReceiveProps(nextProps) {
    if (!this.props.forceStoped && nextProps.forceStoped) {
      // this.stopDownloadTest();
    }
  }
  // componentWillUnmount(){
  //   // this.stopDownloadTest();
  //   console.warn('componentWillUnmount...');
  // }

  configFileImage(name){
    let imageSource = require('../images/aaxiot/callin/image.png');
    let index = name.lastIndexOf('.');
    let type = name.substring(index + 1);
    if (type==='jpg'||type==='png'||type==='gif') {
      imageSource = require('../images/aaxiot/callin/image.png');
    }else if (type==='pdf') {
      imageSource = require('../images/aaxiot/callin/pdf.png');
    }else if (type==='doc') {
      imageSource = require('../images/aaxiot/callin/word.png');
    }else if (type==='xls') {
      imageSource = require('../images/aaxiot/callin/excel.png');
    }else if (type==='ppt') {
      imageSource = require('../images/aaxiot/callin/ppt.png');
    }
    return imageSource;
  }

  render() {
    var { item } = this.props;
    var textContent = `${item.get('FileName')} ${this.state.progress}`;
    console.warn(this.props.index, textContent);
    return (
      <Pressable key={String(this.props.index)}
                 style={{
                   marginLeft: 15,
                   marginRight: 15,
                   marginBottom: 15,
                   borderRadius: 5,
                   backgroundColor: '#f7f7f7',
                   flexDirection:'row',
                   padding: 10,
                   flex: 1,
                   alignItems:'center',
                  }}
                 onPress={()=>{
                   this.downloadNetFile(item.get('FileName'), item.get('PictureId'));
                 }}
      >
        <Image source={this.configFileImage(item.get('FileName'))} style={{width: 25, height: 25, marginRight: 6}}/>
        <Text numberOfLines={0} style={{ color: '#333333', fontSize: 13 , flex: 1}}>{textContent}</Text>
      </Pressable>
      // <TouchFeedback
      //   style={{
      //     width: this.props.imageWidth,
      //     height: this.props.imageHeight,
      //     backgroundColor: 'transparent',
      //   }}
      //   key={String(this.props.index)}
      //   onLongPress={this.props.onLongPress}
      //   onPress={() => {
      //     this.downloadNetFile(item.get('FileName'), item.get('PictureId'));
      //   }}>
      //   <View style={{
      //     flex: 1, width: this.props.imageWidth,
      //     height: this.props.imageHeight, padding: 5, backgroundColor: 'transparent',
      //   }}>
      //     <Text numberOfLines={3} style={{ color: '#ffffffab', fontSize: 9 }}>{textContent}</Text>
      //     <View style={styles.iconTicket}>
      //       <Icon type='icon_alarm_ticket' size={17} color={'#413d54'} />
      //     </View>
      //   </View>
      // </TouchFeedback>
    );
  }
}

var styles = StyleSheet.create({
  iconTicket: {
    position: 'absolute',
    right: 3,
    bottom: 5,
    flex: 1,
    // paddingRight:10,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
});

NetworkDocumentCard.propTypes = {
  index: PropTypes.any,
  imageWidth: PropTypes.number.isRequired,
  imageHeight: PropTypes.number.isRequired,
  item: PropTypes.any.isRequired,
  onLongPress: PropTypes.func,
  forceStoped: PropTypes.bool,
}
