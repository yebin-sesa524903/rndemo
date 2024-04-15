'use strict';
import React,{Component} from 'react';

import {
  View,
  Platform,
  ScrollView,
  TextInput,
  Text,
  Keyboard,
  UIManager,
  Dimensions,
  Image,
  Alert,InteractionManager
} from 'react-native';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';
import Toast from 'react-native-root-toast';

import TextInput2 from '../CustomerTextInput';

import Toolbar from '../Toolbar';
// import Loading from '../Loading';
import PagerBar from '../PagerBar.js';
import {GREEN,TAB_BORDER,LIST_BG} from '../../styles/color.js';
import {LINE} from "../../styles/color";
import TouchFeedback from "../TouchFeedback";
import backHelper from '../../utils/backHelper';
// import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {listenToKeyboardEvents } from 'react-native-keyboard-aware-scroll-view'
const KeyboardAwareScrollView = listenToKeyboardEvents((props) => <ScrollView {...props} />);
import {submitPatrolTicketItems,loadCacheTicketById} from '../../actions/ticketAction';

import {cacheTicketModify,getTicketFromCache,isTicketInCache} from '../../utils/sqliteHelper';
import Icon from "../Icon";
import NetworkImage from "../NetworkImage";

const SH=Dimensions.get('window').height;
const IS_IOS = Platform.OS === 'ios';

const CHECKEDVIEW=(
  <View style={{width:22,height:22,justifyContent:'center',alignItems:'center',
    borderRadius:11,borderColor:GREEN,borderWidth:1}}>
    <View style={{width:11,height:11,borderRadius:5.5,backgroundColor:GREEN}}/>
  </View>
);

const UNCHECKVIEW=(
  <View style={{width:22,height:22,borderColor:"#d9d9d9",borderWidth:1,borderRadius:11}}/>
)

export default class TicketCheckView extends Component{

  constructor(props){
    super(props);
    this._isDestory=false;
    this.state={
      data:this.props.data,
      enable:true
    };
  }

  componentWillReceiveProps(nextProps){
    // this.state={
    //   data:nextProps.data,
    // };
    if(this.state.data !== nextProps.data) {
      this.setState({data:nextProps.data})
    }
  }

  //抄表类别
  _renderReadingMeterRow(row,index){
    let invalidView=null;

    let value=row.get('Result');
    let maxValue=row.get('MaxValue');
    let minValue=row.get('MinValue');
    let result=value;
    if(result===null||maxValue===null||minValue===null){
      invalidView=false;
    }else{
      result=Number(result);minValue=Number(minValue);maxValue=Number(maxValue);
      if(result>maxValue || result< minValue) {
        invalidView=true;
      }
    }
    if(invalidView){
      invalidView=(
        <View style={{width:52,height:22,backgroundColor:'#fff1f0',
          borderRadius:2,borderWidth:1,borderColor:'#ffa39e',marginLeft:16,
          alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:12,color:'#ff4d4d'}}>异常</Text>
        </View>
      );
    }

    let strValue=String(value).trim();
    let isNumber=true;
    if(strValue.length>1){
      if(strValue[0]==='.'||strValue[strValue.length-1]==='.') isNumber=false;
    }

    // if(value && String(value).trim()!==''&&row.get('Name')!==this.state.focusTitle){
    //   if(!isNaN(value)){
    //     let num=Number.parseFloat(value);
    //     if(isNumber&&
    //       ((row.get('MaxValue')&&num>row.get('MaxValue'))||
    //         (row.get('MinValue')&&num<row.get('MinValue')))){
    //       invalidView=(
    //         <View style={{width:52,height:22,backgroundColor:'#fff1f0',
    //           borderRadius:2,borderWidth:1,borderColor:'#ffa39e',marginLeft:8,
    //           alignItems:'center',justifyContent:'center'}}>
    //           <Text style={{fontSize:12,color:'#ff4d4d'}}>异常</Text>
    //         </View>
    //       );
    //     }
    //   }
    // }

    let msgView=this.props.isOffline?null:(
      <TouchFeedback style={{}} onPress={()=>this.props.editRemark(this.props.index,index)}>
        <View style={{marginRight:-16,paddingRight:16,
          marginLeft:12,paddingLeft:12,borderLeftWidth:1,borderLeftColor:'#e6e6e6'}}>
          <Icon type={'icon_ticket_msg'} style={{}} color={GREEN} size={17}/>
        </View>
      </TouchFeedback>
    );

    let textColor='#888';
    if(!this.props.canEdit){
      if(value===null){
        value='未检';
        textColor='#ff4d4d';
      }
      msgView=null;
    }

    if((this.props.canEdit&&isNaN(value)&&row.get('Name')!==this.state.focusTitle) || !isNumber){
      textColor='#ff4d4d';
    }
    let remarkView=this._renderRemark(row);
    if(remarkView){
      remarkView=(
        <View style={{marginBottom:12}}>
          {remarkView}
        </View>
      )
    }
    return (
      <View key={index} style={{marginLeft:16,flex:1,justifyContent:'center',
        borderBottomColor:'#f2f2f2',borderBottomWidth:1,paddingLeft:30}}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1,marginRight:10}}>
            <Text numberOfLines={1} style={{fontSize:17,color:'#333'}}>{`${row.get('Name')}（${row.get('Unit')}）`}</Text>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',marginRight:16}}>
            <TextInput numberOfLines={1} style={{paddingRight:0,fontSize:17,textAlign:'right',minWidth:70,maxWidth:120,paddingVertical:12,color:textColor}}
               value={String(value||'')} placeholder={'请输入'} onFocus={e=>{
                 // this._onFocus(e);
                 this.setState({focusTitle:row.get('Name')})
               }}
               keyboardType={Platform.OS==='ios'?'numbers-and-punctuation':"numeric"}
               placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent" onBlur={()=>this._onBlur(value)}
               returnKeyType={'done'} returnKeyLabel={'完成'} editable={this.props.canEdit}
               onChangeText={text=>this._onRowChanged(index,'Result',text)}
               enablesReturnKeyAutomatically={true}/>
            {invalidView}
            {msgView}
          </View>
        </View>
        {remarkView}
      </View>
    )
  }

  _onBlur(value){
    this.setState({focusTitle:null});
    let strValue=String(value).trim();
    let isNumber=true;
    if(strValue.length>1){
      if(strValue[0]==='.'||strValue[strValue.length-1]==='.') isNumber=false;
    }
    //如果非数字，则提示仅支持数字
    if(!isNumber||isNaN(value)){
      if(this._toast) Toast.hide(this._toast);
      this._toast=Toast.show('仅支持数字',{
        duration: Toast.durations.LONG,
        position: Toast.positions.CENTER,
      });
    }
  }

  _renderCheckItem(lable,checked,clickValue,row,index){
    return (
      <TouchFeedback onPress={()=>{
        this._onRowChanged(index,'Result',clickValue);
      }}>
        <View style={{flexDirection:'row',alignItems:'center',paddingVertical:10,
          paddingHorizontal:16,marginLeft:-16,marginTop:-5,marginBottom:-5}}>
          {checked?CHECKEDVIEW:UNCHECKVIEW}
          <Text style={{fontSize:17,color:'#888',marginLeft:12}}>{lable}</Text>
        </View>
      </TouchFeedback>
    )
  }

  //判断类别
  _renderJudgeRow(row,index){
    let value=row.get('Result');
    if(!this.props.canEdit){
      let txtColor='#888';
      let invalidView=null;
      if(value===null||value===undefined) {
        value='未检';
        txtColor='#ff4d4d';
      }else if(!value || value==='false'){
        value='异常';
        // txtColor='#ff4d4d';
        invalidView=(
          <View style={{width:52,height:22,backgroundColor:'#fff1f0',
            borderRadius:2,borderWidth:1,borderColor:'#ffa39e',marginLeft:8,
            alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:12,color:'#ff4d4d'}}>异常</Text>
          </View>
        );

      }else{
        value='正常';
      }
      return (

        <View key={index} style={{marginLeft:16,paddingVertical:16,
          paddingRight:16, borderBottomColor:'#f2f2f2',borderBottomWidth:1,paddingLeft:30}}>
          <View style={{flexDirection:'row',alignItems:'center',}}>
            <View style={{flex:1,marginRight:32}}>
              <Text style={{fontSize:17,color:'#333',lineHeight:25}}>{`${row.get('Name')}：${row.get('Content')}`}</Text>
            </View>
            <Text numberOfLines={1} style={{fontSize:17,color:txtColor}}>
              {value}
            </Text>
            {invalidView}
          </View>
          {this._renderRemark(row)}
        </View>
      )
    }
    let msgView=this.props.isOffline?null:(
      <TouchFeedback onPress={()=>this.props.editRemark(this.props.index,index)}>
        <View style={{marginRight:-16,paddingRight:16,marginTop:-5,paddingTop:5,
          marginLeft:24,paddingLeft:24}}>
          <Icon type={'icon_ticket_msg'} style={{marginTop:5}} color={GREEN} size={17}/>
        </View>
      </TouchFeedback>
    );

    let result=row.get('Result');
    return (
      <View key={index} style={{marginLeft:16,paddingTop:16,paddingBottom:16,
        borderBottomColor:'#f2f2f2',borderBottomWidth:1,paddingLeft:30}}>
        <View style={{flex:1,paddingRight:16,flexDirection:'row',alignItems:'flex-start'}}>
          <Text style={{fontSize:17,color:'#333',lineHeight:25,flex:1}}>{`${row.get('Name')}：${row.get('Content')}`}</Text>
          {msgView}
        </View>
        <View style={{flexDirection:'row',marginTop:10}}>
          {this._renderCheckItem('正常',(result==='true'||result===true),true,row,index)}
          <View style={{width:60}}/>
          {this._renderCheckItem('异常',(result==='false'||result===false),false,row,index)}
        </View>
        {this._renderRemark(row)}
      </View>
    )
  }

  //输入类别
  _renderInputRow(row,index){
    // let canEdit=(this.props.status===3||this.props.status===2)&&this.props.roleType!==1;
    let value=row.get('Result');
    if(!this.props.canEdit){
      let txtColor='#888';
      let invalidView=null;
      if(value===undefined||value===null) {
        value='未检';
        txtColor='#ff4d4d';
      }else if(!value || value==='false'){
        value='无';
        // txtColor='#ff4d4d';
      }else{
        value='有';
        invalidView=(
          <View style={{width:52,height:22,backgroundColor:'#fff1f0',
            borderRadius:2,borderWidth:1,borderColor:'#ffa39e',marginLeft:8,
            alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:12,color:'#ff4d4d'}}>异常</Text>
          </View>
        );
      }
      return (
        <View key={index} style={{marginLeft:16,paddingRight:16,paddingVertical:16,
          borderBottomColor:'#f2f2f2',borderBottomWidth:1,paddingLeft:30}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            <View style={{flex:1,marginRight:32}}>
              <Text style={{fontSize:17,color:'#333',lineHeight:25}}>{row.get('Name')}</Text>
            </View>
            <Text numberOfLines={1} style={{fontSize:17,color:txtColor}}>
              {value}
            </Text>
            {invalidView}
          </View>
          {this._renderRemark(row)}
          {/*{row.get('Comment') &&*/}
          {/*  <View style={{marginTop:16,paddingTop:Platform.OS==='ios'?4:8,paddingBottom:8,paddingHorizontal:12,*/}
          {/*    backgroundColor:'#f5f5f5',marginBottom:8}}>*/}
          {/*    <Text style={{fontSize:15,lineHeight:23,color:'#888'}}>*/}
          {/*      {row.get('Comment')}*/}
          {/*    </Text>*/}
          {/*  </View>*/}
          {/*}*/}
        </View>
      )
    }

    let msgView=this.props.isOffline?null:(
      <TouchFeedback onPress={()=>this.props.editRemark(this.props.index,index)}>
        <View style={{marginRight:-16,paddingRight:16,marginTop:-5,paddingTop:5,
          marginLeft:24,paddingLeft:24}}>
          <Icon type={'icon_ticket_msg'} style={{marginTop:5}} color={GREEN} size={17}/>
        </View>
      </TouchFeedback>
    );

    let result=row.get('Result');
    return (
      <View key={index} style={{marginLeft:16,paddingTop:16,paddingBottom:16,paddingRight:16,flex:1,
        borderBottomColor:'#f2f2f2',borderBottomWidth:1,paddingLeft:30}}>
        <View style={{flex:1,flexDirection:'row',alignItems:'flex-start'}}>
          <Text style={{fontSize:17,color:'#333',lineHeight:25,flex:1,marginRight:24}}>{row.get('Name')}</Text>
          {msgView}
        </View>
        <View style={{flexDirection:'row',marginTop:16}}>
          {this._renderCheckItem('有',(result===true||result==='true'),true,row,index)}
          <View style={{width:60}}/>
          {this._renderCheckItem('无',(result===false||result==='false'),false,row,index)}
        </View>
        {/*{row.get('Result') && this._getTextInput(row,index)}*/}
        {this._renderRemark(row)}
      </View>
    )
  }

  _getTextInput(row,index){
    if(Platform.OS==='ios'){
      return (
        <View style={{borderColor:"#e6e6e6",borderRadius:2,flex:1,
          borderWidth:1,marginTop:20,paddingTop:4,paddingBottom:8,paddingHorizontal:12}}>
          <TextInput2 style={{fontSize:15,height:69,color:'#888',lineHeight:23,padding:0,marginTop:-4}}
             textAlign={'left'}
             autoFocus={false}
             maxLength={1000}  multiline={true}
             placeholderStyle={{fontSize:15,marginTop:4,top:0,lineHeight:23}}
             placeholderTextColor={'#d0d0d0'}
             underlineColorAndroid={'transparent'}
             textAlignVertical={'top'}
              onChangeText={text=>this._onRowChanged(index,'Comment',text)}
              value={row.get('Comment')} placeholder={'请输入详细说明'}
          />
        </View>
      )
    }else{
      return (
        <View style={{borderColor:"#e6e6e6",borderRadius:2,height:90,flex:1,
          borderWidth:1,marginTop:20,paddingTop:8,paddingBottom:8,paddingHorizontal:12}}>
          <TextInput style={{fontSize:15,height:69,flex:1,lineHeight:23,paddingVertical:0,color:'#888'}}
             value={String(row.get('Comment')||'')} placeholder={'请输入详细说明'}
             textAlignVertical={'top'} textAlign={'left'} multiline={true}
             placeholderTextColor={'#d0d0d0'} underlineColorAndroid="transparent"
             returnKeyLabel={'完成'} editable={this.props.canEdit}
             maxLength={1000}
             onChangeText={text=>this._onRowChanged(index,'Comment',text)}
          />
        </View>
      );
    }
  }

  _renderRemark(remark){
    const size=78;
    if(!remark || this.props.isOffline) return;
    let pics=remark.get('Pictures');
    let content=remark.get('Comment');
    let arr=[];
    if(content && content.trim&&content.trim().length>0){
      arr.push(
        <Text key={0} style={{fontSize:15,lineHeight:23,color:'#888',marginTop:10}}>{content}</Text>
      )
    }

    if(pics&&pics.size>0){
      let imgViews=pics.map((item,index)=>{
        let data={
          index,items:pics,thumbImageInfo:{width:size-2,height:size-2}
        }
        let dataSource=require('../../images/building_default/building.png');
        if(item.get('uri')){
          dataSource={uri:item.get('uri')}
        }

        return (
          <TouchFeedback key={index} onPress={()=>this.props.imageClick(data)}>
            <View style={{marginTop:10,marginRight:10,width:size,height:size,
              borderWidth:1.0,borderColor:LINE,borderRadius:2}}>
              <NetworkImage
                style={{}}
                resizeMode="cover"
                imgType='jpg'
                // key={item.get('PictureId')}
                defaultSource = {dataSource}
                width={size-2} height={size-2}
                name={item.get('PictureId')} />
            </View>
          </TouchFeedback>
        )
      });
      imgViews=(
        <View key={1} style={{flexDirection:'row',flexWrap:'wrap'}}>
          {imgViews}
        </View>
      )
      arr.push (imgViews)
    }
    if(arr.length>0) return (
      <View style={{}}>
        {arr}
      </View>
    )
    return null;
  }

  _showItems(row,index){
    let type=this.state.data.get('ValueType');//0:查表类；1：判断类；2：输入类
    if(type===2) return this._renderReadingMeterRow(row,index);
    if(type===1) return this._renderJudgeRow(row,index);
    if(type===3) return this._renderInputRow(row,index);
  }

  _onRowChanged(index,type,value){
    let newData=this.state.data;
    newData=newData.setIn(['SubItems',index,type],value);
    this.props.valueChanged(newData);
    // this.setState({data:newData})
  }

  render() {
    let rows=this.state.data.get('SubItems').map((item,index)=>this._showItems(item,index));
    return (
      <View style={{flex:1,backgroundColor:'#fafafa'}}>
        {rows}
      </View>
    );
  }
}
