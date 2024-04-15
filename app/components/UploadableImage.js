'use strict';

import React,{Component} from 'react';

import {
  View,
  ImageBackground,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from './Text.js';
import {getBaseUri} from '../middleware/api.js';
import {TOKENHEADER,JWTTOKENHEADER,HEADERDEVICEID} from '../middleware/api.js';
import storage from '../utils/storage.js';

// const uploadImageUrl = 'http://39.98.50.32:31888'

class UploadableImage extends Component {
  constructor(props){
    super(props);
    this.state = {percent:0,loaded:false};
    if(props.loaded){
      this.state.loaded = true;
    }
  }

  async _uploadImage() {
    var xhr = new XMLHttpRequest();
    var postUri = `${getBaseUri()}/lego-bff/bff/fmcs/rest/commonUploadFile`;
    // var postUri = `${getBaseUri()}/lego-bff/bff/ledger/rest/fileUpload`;
    // var postUri = `${getBaseUri()}/hdcore/simple/se-ecox-static/${this.props.name}`;
    if(this.props.postUri){
      postUri = `${getBaseUri()}/lego-bff/bff/${this.props.postUri}`;
    }
    xhr.open('POST', postUri);

    xhr.setRequestHeader(TOKENHEADER,await storage.getToken());
    xhr.setRequestHeader(JWTTOKENHEADER,await storage.getJwtToken());
    xhr.setRequestHeader(HEADERDEVICEID,await storage.getDeviceId());
    // xhr.setRequestHeader(TOKENHEADER,'dssession=23f58c59d372adef91252056b8b47f3e3811e872795571ef9a6a2512903dbea5ba32891f5a3f57d3788cf2ad84d50c718b6aa4163ee98833cdcc09b80a155b252d0b59f1367c023b133469460f649d52191da0c96d0b89e867579b9c59f669e6218297469d3085f64d16746d90e1be4438ceaae595326cbbb4ad65d34bf70c7f13b264f11ef9a4e2762b298d7f8ca1f02ce2c7d4caf27dd59a7bef81895e6f444819e84d11e5ffb5368c1d3ee05a4904b8b62ba679b0d0d29fb0e73eec903b0f76e28baf156c1814eec074f01124475150b24c05c03ae55a012ef75d8d8f5f08dd66e08cbf9a965c9b0764b38b0b9e9d333e4df62511fbeafd71337c031b204b66aa5673e28c54ae8e799da1d232b5c7025731e6ba051f3cbd609405fd8c261e4cf6caa54fedfdc5c7eca558f1be164a3440968333fd6f79cb78be692264ad64a502b215e68a38c31e59057bc9c4deda36fe86689148b0f8f06c420c405171e8725aedd3c81f8f5cff20a32135cd59c13469fb049da6d96db56e2642518387ba5d1e452ebe634138dec51a3a314b0dc4cb608159a600f1a4c91c904f0812c1acc4e31af87475d7eb76f22586b95aa512e213897380fb2dbaa9c2462fae2328b20f74bfaaf0de7055ba6d56abbca3be13e6e8ac8053cef9569a90fac86546ac193d766566140513b552cbb61b1a1fd065bff77fd75cd88ba67a830e4d183900a1ddbf6582560789293c2be2b2ee43b9fed981ce17c14442c4b1296052cb94885b3967175d020fa7cf2ccedfd5374db726a07ee81b43588ae409316db9ac4f25d00f2bf970a43473568ff51c75abb5b3f0d327586cb68c46db7b19d73f5c82cb46f28c6d79c57638e7085c92594b55e70bc1942f9c14ffa287b8a6481be06a665da21bbd51e7e57d26a04d35a8c0f62bcf64a33eaa24083e5702890f4f2f7c3cfec924e55ae0c9dabf8eca37326e05016196f5e0e99b4cd9a61e729c5a9db8d30278b98c2cc171889b70e7367d88cc42a2d293129a26f29ffc45a83902662159682b5524bfcd55e42e70958f7511754dcbd633583d0836c0fc408ffb833f09f583b35767acbe61dd00f121472fd777102b137091c604504daa5f0f006bfacab659e4852cf5f0d55ee15dc652a0ada185fd47c42cd6c324a3ab84b139470b8cdd7df7c8dd7dd548fb23f7629dc8bb16a8affb5b610b3d9c80a65ee0ac7bf1b0e47503299dfd501fae4ea92b7ca94505079807ad7be55b2d797e646cd40492376a9920aa6837c8831363d0a771b1ccd3b9c49cc70309bcbd1b0a204d3beec6222a9eae7ab6bf823d880d59725e4177e7964064f2eb6e80d71256fffc8ac7e29e91c34fd8015c858b979d2f36a83ec0e77c8ece577d12eb99474a55c8c4f5335f40dc99ed665ef1f9931f7820124101724e7314f20a314cf074d151c4fb51589e3c1585e6f1d2cd0d28cf8f1d3992fded9c0ab3407978826b30fc61c1eb29c7a1da1f2e6eae091e53663f90ee754a99a28902a905773fd39706fd4570ed56bd5c47bb78fa5f0268abaa4fe0c5d5d08dac562fdb283c7c030fe04a1eaeaaaa2110b07a6270ce8390921de851a52b0f624615c4d555bc327fc3f0b11c80ceb131d7c6c1bf3e9bf1b407f7ced26a4ee88f8a8b20833f71beb46c626203ae989a13e9b2dc32cb73e1636ba276313ee467a42229d50feebc74f2f395e699b48a09293cfb7ab560fd35844589d09b930b727e437ec14ce11209f6975800926f56e6d9a5dd43d8532920f30e43b6ee5f58639eae89e2b42959ef3f8141bcb62a4aaba0c21539');

    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.warn(
          'Upload failed',
          'Expected HTTP 200 OK response, got ' + xhr.status,
          this.props.name,
          this.props.uri
        );
        return;
      }
      if (!xhr.responseText) {
        console.warn(
          'Upload failed',
          'No response payload.'
        );
        return;
      }
      console.warn('xhr.responseText',xhr.responseText);
      this.setState({loaded:true});
      this.props.loadComplete(xhr.responseText);
    };
    var formdata = new FormData();
    console.warn('uri',this.props.uri);
    console.warn('name',this.props.name);
    formdata.append("deviceId",this.props.deviceId);
    formdata.append("fileType",0);
    formdata.append('file',{uri:this.props.uri,name:this.props.name,key:this.props.name,type:'image/jpg',});

    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        // console.warn('upload onprogress', event);
        if (event.lengthComputable) {
          // console.warn('uploadProgress',{uploadProgress: event.loaded / event.total});
          this._uploadProgress({currentSize:event.loaded,totalSize:event.total})
        }
      };
    }
    xhr.send(formdata);


    return;

	}
  _uploadProgress(obj){
    var {currentSize,totalSize} = obj;
    // console.warn('uri',this.props.uri);
    this.setState({percent:currentSize/totalSize});
  }
  componentDidMount() {
    this._uploadImage();
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.uri !== this.props.uri && !nextProps.loaded){
      this.setState({percent:0,loaded:false});
      this._uploadImage();
    }
  }
  render () {
    var {resizeMode} = this.props;


    var progress = parseInt(this.state.percent*100);
    var text = null;
    if(progress !== 100){
      text = (
        <Text style={{
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'transparent'
          }}>{progress+'%'}</Text>
      )
    }

    var overlay = (
      <View style={
        {
          height: this.props.height*(1-this.state.percent),
          width: this.props.width,
          position:'absolute',
          left:0,
          bottom:0,
          right:0,
          backgroundColor:'black',
          opacity:0.4
        }
      }>

    </View>);
    var children = null;
    var imageStyle = {
      height: this.props.height,
      width: this.props.width,
      margin: 0,
      padding: 0,
      justifyContent:'center',
      alignItems:'center',
    };
    if(this.state.loaded){

      // return (
      //   <Image
      //     source={{uri:this.props.uri}}
      //     resizeMode={resizeMode} style={{width:this.props.width,height:this.props.height}}>
      //     {this.props.children}
      //   </Image>
      // );
      text = null;
      overlay = null;
      children = this.props.children;
      imageStyle = {
        height: this.props.height,
        width: this.props.width,
        margin: 0,
        padding: 0,
      };
    }

    return (
      <View style={[{
        overflow: 'hidden',
        height: this.props.height,
        width: this.props.width,
        padding: 0,
      },this.props.style]}>
        <ImageBackground
          source={{uri:this.props.uri}}
          resizeMode={resizeMode}
          style={imageStyle} >
          {overlay}
          {text}
          {children}
        </ImageBackground>
      </View>
    );

  }
}

UploadableImage.propTypes = {
  uri:PropTypes.string,
  children:PropTypes.object,
  name:PropTypes.string,
  resizeMode:PropTypes.string,
  loaded:PropTypes.bool,
  style:PropTypes.object,
  height:PropTypes.number,
  width:PropTypes.number,
  postUri:PropTypes.string,
  loadComplete:PropTypes.func,
  onLongPress:PropTypes.func,
  deviceId: PropTypes.number,
};

UploadableImage.defaultProps = {
  resizeMode:'cover',
  postUri:''
}


export default UploadableImage;
