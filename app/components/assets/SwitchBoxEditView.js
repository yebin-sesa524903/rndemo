import React,{Component} from 'react';
import {View,Text,TextInput,ScrollView,StyleSheet,InteractionManager,Dimensions,
  Platform,TouchableWithoutFeedback,Alert,Image,Keyboard} from 'react-native';
import {LIST_BG, LINE, GREEN, GRAY, ADDICONCOLOR, DOCBKGCOLOR} from '../../styles/color';
import Icon from '../Icon';
import Toolbar from '../Toolbar';
import TouchFeedback from '../TouchFeedback';
import Picker from 'react-native-picker'
import SchActionSheet from "../actionsheet/SchActionSheet";
import {checkFileNameIsImage} from "../../utils/fileHelper";
import UploadableImage from "../UploadableImage";
import NetworkImage from "../NetworkImage";
const WIDTH=Dimensions.get('window').width;
const picWidth=(WIDTH-32-20*2)/3;
export default class SwitchBoxEditView extends Component{

  constructor(props){
    super(props);
    this.state={
    };
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.name!==this.props.name){
      this.setState({
        inputText:nextProps.name
      })
    }
  }

  _onChangeText(type,text){
    this.props.changeInput(type,text);
  }

  _enableSubmit() {
    let empty=item=>!item || item.trim().length===0;
    if(!empty(this.props.name) && !empty(this.props.location)
      && !empty(this.props.number)) {
      return true;
    }
    return false;
  }

  componentWillUnmount(){
    Keyboard.dismiss();
  }

  _doSubmit(){
    Keyboard.dismiss();
    this.props.submit();
  }

  _ocrRow(title,type,value){
    return (
      <View style={{flexDirection:'row',paddingHorizontal:16,paddingVertical:8,backgroundColor:'white',alignItems:'center',borderColor:LINE,
      borderBottomWidth:1}}>
      <Text style={{fontSize:17,color:'#000'}}>{title}</Text>
      <View style={{flex:1,}}>
        <TextInput numberOfLines={1} style={{fontSize:17,paddingVertical:0,textAlign:'right',color:'#888',marginLeft:20,marginRight:12}}
           value={value} placeholder={'请输入'} onFocus={this._onFocus}
           placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent" returnKeyType={'done'} returnKeyLabel={'完成'}
           onChangeText={text=>this._onChangeText(type,text)} enablesReturnKeyAutomatically={true} autoFocus={true}/>
      </View>
      
    </View>
    );
  }

  _logoRow(){
    //判断有没有添加过，没有显示默认占位符
    let logoView=null;
    if(!this.props.logo.get('PictureId')){
      logoView=(
        <Image style={{width:67,height:67}} source={require('../../images/building_default/building.png')}/>
      )
    }else{
      if(this.props.logo.get('uri') && !this.props.logo.get('loaded')){
        logoView=this._uploadImageView(0,this.props.logo,67,'logo');
      }else{
        logoView=this._cacheImageView(0,this.props.logo,67,'logo');
      }
    }
    return (
      <View style={{flexDirection:'row',paddingHorizontal:16,paddingVertical:16,backgroundColor:'white',alignItems:'center',borderColor:LINE,
        borderBottomWidth:1}}>
        <Text style={{fontSize:17,color:'#000',flex:1}}>{'照片'}</Text>
        <TouchFeedback onPress={()=>this._showMenu('logo')}>
          <View style={{width:67,height:67,borderRadius:5,marginRight:16}}>
            {logoView}
          </View>
        </TouchFeedback>
        <Icon type="arrow_right" color={'#b2b2b2'} size={18} />
      </View>
    );
  }

  _showAuth(){
    return true;
  }

  _deleteImage(item,type){
    if(type!=='image') return;
    if(!this._showAuth()){
      return;
    }
    Alert.alert('',
      checkFileNameIsImage(item.get('FileName'))?'删除这张图片吗？':'删除这个文件吗？',
      [
        {text: '取消', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: '删除', onPress: () => {
            this.props.dataChanged(type,'delete',item);
          }}
      ]
    )
  }
  _imageLoadComplete(item,type){
    this.props.dataChanged(type,'uploaded',item);
  }
  _getAddButton(index) {
    return (
      <View key={index}>
        <View style={{borderWidth:1,borderColor:'#d9d9d9',backgroundColor:'#fafafa',marginTop:10,}}
              width={picWidth}
              height={picWidth}>
          <TouchFeedback
            style={{flex:1,backgroundColor:'transparent'}}
            key={index}
            onPress={()=>this._showMenu('image')}>
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
              <Icon type='icon_add' size={16} color={'#000'} />
            </View>
          </TouchFeedback>
        </View>
      </View>
    );
  }

  _uploadImageView(index,item,picSize=picWidth,type='image'){
    return (
      <View key={index} style={{marginRight:10, borderWidth:1,marginTop:type==='image'?10:0,
        borderColor:ADDICONCOLOR, alignItems:'center', justifyContent:'center',
        width:picSize, height:picSize}}>
        <UploadableImage
          name={item.get('PictureId')}
          uri={item.get('uri')}
          loaded={item.get('loaded')}
          resizeMode="cover"
          height={picSize-2} width={picSize-2}
          loadComplete = {()=>this._imageLoadComplete(item,type)}>
          <TouchFeedback
            style={{flex:1,backgroundColor:'transparent'}}
            key={index}
            onPress={()=>{
              if(type==='logo'){
                this._showMenu('logo');
              }
            }}
            onLongPress={()=>this._deleteImage(item,type)}>
            <View style={{flex:1}}></View>
          </TouchFeedback>
        </UploadableImage>
      </View>
    )
  }

  _cacheImageView(index,item,picSize=picWidth,type='image'){
    return (
      <View style={{marginRight:10, borderWidth:1, borderColor:ADDICONCOLOR,
        alignItems:'center', justifyContent:'center', backgroundColor:'gray',
        width:picSize, height:picSize,marginTop:type==='image'?10:0,
      }}>
        <NetworkImage
          name={item.get('uri')||item.get('PictureId')}
          resizeMode="cover" imgType='jpg' width={picSize-2}
          height={picSize-2}>
          <TouchFeedback
            style={{flex:1,backgroundColor:'transparent'}}
            key={String(index)}
            onPress={()=>{
              if(type==='logo'){
                this._showMenu('logo');
              }
            }}
            onLongPress={()=>this._deleteImage(item,type)}>
            <View style={{flex:1}}></View>
          </TouchFeedback>
        </NetworkImage>
      </View>
    );
  }

  _getImageView(){
    let images = this.props.images.map((item,index)=>{
      if(item.get('uri')){
        return this._uploadImageView(index,item);
      }
      else {
        return this._cacheImageView(index,item);
      }
    });
    if (this.props.canEdit) {
      if(images.size<5)
        images = images.push(this._getAddButton(images.size));
    }
    if(images && images.size >0){
      return (
        <View style={{flexDirection:'row',flexWrap:'wrap',marginTop:16}}>
          {images}
        </View>
      );
    }
    return null;
  }

  _showMenu(type){
    if(this._clicking) return;
    this._clicking=true;
    let arr=['拍照','相册选择'].map((item,index)=>{
      return {title:item,select:true,index,type}
    });
    this.setState({'modalVisible':true,arrActions:arr});
  }

  _menuClick(item){
    this.setState({modalVisible:false},()=>{
      if(item.index===0){
        InteractionManager.runAfterInteractions(()=>{
          setTimeout(()=>{
            this.props.takePhoto(item.type);
            this._clicking=false;
          },200)
        });
      }else{
        //相册选择
        this.props.pickImage(item.type);
        this._clicking=false;
      }
    });

  }

  _getActionSheet() {
    var arrActions=this.state.arrActions;
    if (!arrActions) {
      return;
    }
    if (this.state.modalVisible) {
      return(
        <SchActionSheet title={''} arrActions={arrActions} modalVisible={this.state.modalVisible}
          onCancel={()=>{
            this._clicking=false;
            this.setState({'modalVisible':false});
          }}
          onSelect={item=>this._menuClick(item)}
        />
      )
    }
  }

  render(){
    return(
        <View style={{flex:1,backgroundColor:LIST_BG}} >
          <Toolbar
            title={this.props.title}
            navIcon="back"
            noShadow={true}
            onIconClicked={()=>this.props.onBack()}
            actions={[{title:'完成',show:'always',disable:!this._enableSubmit()}]}
            onActionSelected={[()=>this._doSubmit()]}
          />
          <ScrollView>
            {this._logoRow()}
            {this._ocrRow('名称','name',this.props.name)}
            {this._ocrRow('编号','number',this.props.number)}

            <View style={{paddingHorizontal:16,paddingBottom:24,paddingTop:16,backgroundColor:'white',borderColor:LINE,
              borderBottomWidth:1}}>
              <Text style={{fontSize:17,color:'#000'}}>位置</Text>
              <TextInput multiline={true}  style={{fontSize:15,paddingVertical:0,color:'#888',marginTop:10,maxHeight:80}}
                 value={this.props.location} placeholder={'请输入位置描述'} onFocus={this._onFocus} maxLength={200}
                 placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent" returnKeyType={'done'} returnKeyLabel={'完成'}
                 onChangeText={text=>this._onChangeText('location',text)} enablesReturnKeyAutomatically={true} autoFocus={true}/>
              {this._getImageView()}
            </View>
          </ScrollView>
          {this._getActionSheet()}
        </View>
    )
  }

}
