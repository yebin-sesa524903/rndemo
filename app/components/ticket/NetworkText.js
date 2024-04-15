'use strict'
import React,{Component} from 'react';

import {
  View,
  Platform,
  ViewPropTypes
  // Linking
} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text.js';
// import {GRAY,BLACK,GREEN} from '../../styles/color.js';
import Toast from 'react-native-root-toast';
import {openFile} from '../../utils/openFile';
import storage from '../../utils/storage.js';
import {getBaseUri,TOKENHEADER,JWTTOKENHEADER,HEADERDEVICEID} from '../../middleware/api.js';

const RNFS = require('react-native-fs');
import { DocumentDirectoryPath } from 'react-native-fs';

const saveDocumentPath = Platform.OS === 'ios' ? DocumentDirectoryPath : RNFS.ExternalDirectoryPath;

var jobId = -1;

export default class NetworkText extends Component {
  constructor(props){
    super(props);
    this.state={id:null,loaded:false,progress:''};
    // this.stopDownloadTest=this.stopDownloadTest.bind(this);
  }

  async downloadFile(name,id,ossKey) {
    if (jobId !== -1) {
      return;
    }

    var progress = data => {
      var percentage = ((100 * data.bytesWritten) / data.contentLength) | 0;
      this.setState({
          id,
          loaded:false,
          progress:`${percentage}%`,
      });
    };

    var begin = res => {
      this.setState({
          id,
          loaded:false,
          progress:`1%`,
      });
    };

    var progressDivider = 10;

    var index = name.lastIndexOf('.');
    var type = name.substring(index+1);
    // var ossBucket = appInfo.get().ossBucket;
    // index = ossBucket.indexOf('.');
    // ossBucket = ossBucket.substring(0,index);
    // var url = `http://${ossBucket}.oss-cn-hangzhou.aliyuncs.com/rem-file-${id}.${type}`;
    //api/tickets/docs/{fileId}.{ext}
    var baseUri = getBaseUri();
    // var url = 'http://www.pdf995.com/samples/pdf.pdf';
    let url=null;
    if(ossKey){
      url=`${baseUri}/popapi/api/common/file/download/${ossKey}`;
    }
    else {
      url = `${baseUri}/popapi/api/tickets/docs/${id}.${type}`;
    }
    var downFilePath=`${saveDocumentPath}/${id}.${type}`;
    var token = await storage.getToken();
    var jwtToken = await storage.getJwtToken();
    var deviceid=await storage.getDeviceId();
    var headers={};
    headers[TOKENHEADER]=token;
    headers[HEADERDEVICEID]=deviceid;
    headers[JWTTOKENHEADER]=jwtToken;

    RNFS.exists(downFilePath).then((result) => {
      if (result) {
        console.warn('will open file...');
        this.fileOpen(downFilePath,type);
      }else {
        const ret = RNFS.downloadFile({ fromUrl: url, toFile: downFilePath, begin, progress, background:false, progressDivider ,headers});
        console.warn('start down load file with id:',ret.jobId);
        jobId = ret.jobId;

        ret.promise.then(res => {
          this.setState({
              id,
              loaded:true,
              progress:'',
          });
          console.warn('end down load file with forceStoped:',this.props.forceStoped);
          if (!this.props.forceStoped) {
            this.fileOpen(downFilePath,type);
          }else {
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

  fileOpen(downFilePath,type)
  {
    openFile(downFilePath,type,()=>{
      Toast.show('无法打开此文件', {
        duration: 5000,
        position: -80,
      });
    });
  }

  stopDownloadTest() {
    console.warn('stopDownloadTest...jobId:',jobId);
    if (jobId !== -1) {
      console.warn('stopDownloadTest 2...');
      RNFS.stopDownload(jobId);
    } else {
      console.warn('There is no download to stop');
    }
  }
  showError(err){
    this.setState({ output: `ERROR: Code: ${err.code} Message: ${err.message}` });
  }
  componentWillReceiveProps(nextProps)
  {
    if (!this.props.forceStoped&&nextProps.forceStoped) {
      // this.stopDownloadTest();
    }
  }
  // componentWillUnmount(){
  //   // this.stopDownloadTest();
  //   console.warn('componentWillUnmount...');
  // }
  render () {
    var {item,textStyle}=this.props;
    var bytes=item.size;
    var unit='bytes';
    if (bytes>1024) {
      bytes=bytes/1024;
      unit='KB';
    }
    if (bytes>1024) {
      bytes=bytes/1024;
      unit='MB';
    }
    if (bytes>1024) {
      bytes=bytes/1024;
      unit='GB';
    }
    var nameAndSize=`${item.name} (${bytes.toFixed(0)}${unit})`;
    var textContent=`${nameAndSize} ${this.state.progress}`;
    return (
      <Text
        onPress={this.downloadFile.bind(this,item.name,item.id,item.ossKey)}
        style={textStyle}>{this.props.title||textContent}</Text>
    );
  }
}

NetworkText.propTypes = {
  item:PropTypes.any.isRequired,
  style:ViewPropTypes.style,
  forceStoped:PropTypes.bool,
}
