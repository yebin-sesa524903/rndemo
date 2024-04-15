import React,{Component} from 'react';

import {View,Image,Text} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import Toolbar from '../Toolbar';
import {isPhoneX} from '../../utils'
import TouchFeedback from '../TouchFeedback';
import Icon from '../Icon';
import backHelper from '../../utils/backHelper'

export default class SignView extends Component {

  constructor(){
    super();
    this.state={
      signature:null,
      showTip:true,
      delayLoad:false
    };
  }

  _getToolbar(){
    if(this.props.isModal) return null;
    return (
      <Toolbar
      title='客户签名'
      navIcon="back"
      isLandscape={true}
      onIconClicked={this.props.onBack} />
    )
  }

  componentDidMount(){
    setTimeout(()=>{
      this.setState({delayLoad: true})
    },200);
  }

  onLayout(e) {
    let {width, height} = e.nativeEvent.layout;
    console.log('width',width,'height',height);
    if (this.state.width !== width || this.state.height !== height) {
      let signWidth = width*0.7;
      let signHeight = signWidth / 3
      console.log(signWidth,signHeight)
      this.setState({
        width: width,
        height: height,
        signSize:{width:signWidth,height:signHeight,borderWidth:2,borderColor:'#888'}
      });
    }
  }

  render(){
    return (
      <View style={{flex:1,backgroundColor:'#fff'}}>
        {this._getToolbar()}
        <View style={[{flex:1}]}>
          {this.state.delayLoad?
            <SignatureCapture
              style={[{flex:1}]}
              ref="sign"
              square={true}
              showBorder={false}
              minStrokeWidth={30}
              onSaveEvent={this._onSaveEvent.bind(this)}
              onDragEvent={this._onDragEvent.bind(this)}
              saveImageFileInExtStorage={false}
              showNativeButtons={false}
              showTitleLabel={false}
              viewMode={this.props.isModal?'':"landscape"}/>
            :null
          }

          <View pointerEvents="box-none"
                style={{position:'absolute',left:0,bottom:0,right:0,top:0,backgroundColor:'#d9d9d966'}}
            onStartShouldSetResponder={(e)=>true}>
            { this.props.sanpiao ? null :
              <View style={{margin:12,flexDirection:'row'}}>
                <Icon type="icon_info" color="#fbb325" size={16}/>
                <Text style={{fontSize:16,color:'#888',marginLeft:8}}>今日巡检任务已经完成，请签名验收:</Text>
              </View>
            }
            <View pointerEvents="none" style={{flex:1,justifyContent:'center',alignItems:'center'}}>
              <Text style={{fontSize:25,color:'#b2b2b2'}}>{this.state.showTip?'正楷手写横向签名':''}</Text>
            </View>

            <View style={{flexDirection:'row',margin:24,marginBottom:24+isPhoneX()?34:0,
              justifyContent:'space-between'}}>
              {this._getButton('重写',()=>this.resetSign())}
              {this._getButton('确认',()=>this.saveSign())}
            </View>
          </View>
        </View>
      </View>
    )
  }

  _getButton(title,click){
    return (
      <TouchFeedback onPress={()=>click()}>
        <View style={{width:80,height:32,borderColor:'#284e98',borderWidth:1,borderRadius:2,
          justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:16,color:'#284e98',}}>{title}</Text>
        </View>
      </TouchFeedback>
    )
  }

  saveSign() {
    if(this.state.showTip){
      this.props.saveSign(null);
      return;
    }
    this.refs["sign"].saveImage();
  }

  resetSign() {
    this.refs["sign"].resetImage();
    this.setState({showTip:true})
  }

  _onSaveEvent(result) {
    if(this.props.saveSign){
      // this.props.saveSign('data:image/jpeg;base64,'+result.encoded);
      this.props.saveSign(result.encoded);
    }
  }
  _onDragEvent() {
    this.setState({showTip:false})
  }
}
