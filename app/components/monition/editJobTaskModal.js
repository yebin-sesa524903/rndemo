import React,{Component} from "react";
import CommonActionSheet from '../actionsheet/CommonActionSheet';
import {View, Text, ScrollView, FlatList, TextInput} from 'react-native';
import s from "../../styles/commonStyle";
import {Table} from "../Table";
import TouchFeedback from "../TouchFeedback";
import {testAsset as Assets} from './billTaskTpl'
import {GREEN} from "../../styles/color";
import Icon from "../Icon";
const TS = {...s.f14,color:'#333'}
export default class EditJobTaskModal extends Component{
  constructor(props) {
    super(props)
    this._init();
  }
  _init() {
    this.state = {...this.props.step}
  }

  _renderTitle() {
    return (
      <View style={[s.center, s.p16]}>
        <Text style={[s.f18]}>{this.props.title || '编辑安全措施'}</Text>
      </View>
    )
  }

  _renderVLine() {
    return (
      <View style={{width:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _renderHLine() {
    return (
      <View style={{height:1,backgroundColor:'#e6e6e6'}}/>
    )
  }

  _renderButton(label,click,isFill=false,enable=true) {
    let color= '#fff';
    let backgroundColor = '#fff';
    let border = {};
    if(enable && !isFill) {
      color = GREEN;
    }
    if(!enable) backgroundColor = '#284e9866';
    else {
      if(isFill) {
        backgroundColor=GREEN;
      }else {
        border = {
          borderWidth:1,
          borderColor:GREEN
        }
      }
    }
    return (
      <TouchFeedback style={[s.f]} key={label} enabled={enable} onPress={()=>click()}>
        <View style={[s.center,border,{flex:1,borderRadius:2,height:46,backgroundColor,paddingVertical:8}]}>
          <Text style={[{fontSize:16,color}]}>{label}</Text>
        </View>
      </TouchFeedback>
    )
  }

  _onSave =()=>{
    let action = this.state.action || '';
    action = action.trim();
    let content = this.state.content || '';
    content = content.trim();
    let select = this.state.select;
    this.props.onSave(action,content,select)
  }

  _renderButtons() {
    let enable = (this.state.action && this.state.action.trim().length>0) ||
      (this.state.content && this.state.content.trim().length>0);
    return (
      <View style={[{justifyContent:'flex-end',marginHorizontal:0,marginBottom:0}]}>
        <View style={[s.p16,s.r,{borderTopWidth:1,borderTopColor:'#d9d9d9'}]}>
          {this._renderButton("取消",this.props.onCancel,true,true)}
          <View style={{width:16}}/>
          {this._renderButton("完成",this._onSave,true,enable)}
        </View>
      </View>
    )
  }

  _editTextChange(key,txt) {
    let obj = {};
    obj[key] = txt;
    this.setState(obj)
  }

  _edit(key,data={}) {
    let editData = this.state || {}
    return (
      <View style={[s.jc,{paddingHorizontal:10, backgroundColor: 'white',minHeight:32,
        borderRadius:1.6, borderWidth: 1, borderColor: '#999',
        ...data.style
      }]}>
        <TextInput
          style={[TS,{padding:0,margin:0}]}
          autoFocus={false}
          autoCapitalize={'none'}
          underlineColorAndroid={'transparent'}
          textAlign={'left'}
          multiline={data.multiline}
          placeholderTextColor={'#b2b2b2'}
          textAlignVertical={'center'}
          placeholder={data.label||'请输入'}
          onChangeText={(val) => this._editTextChange(key, val)}
          value={editData[key]}
        />
      </View>
    )
  }

  _renderLabel(label,style={}) {
    return (
      <Text style={[TS,{color:'#999'},style]}>{label}</Text>
    )
  }

  _renderAssets() {
    let select = this.state.select;
    let arr = this.props.assets.map((item,index) => {
      console.log('asset map',item)
      let sel = select.find(asset => asset.id === item.id);
      let borderColor = '#d9d9d9'
      let style = {color:'#999'};
      if(sel) {
        style={
          color:GREEN,
          marginRight:8
        }
        borderColor = GREEN
      }
      return (
        <TouchFeedback onPress={()=>{
          if(sel) {
            select.splice(select.findIndex(asset => asset.id === item.id),1);
          }else {
            select.push(item);
          }
          this.setState({select})
        }}>
          <View style={[s.r,s.ac,{borderColor,borderWidth:1,borderRadius:1.6,
            paddingHorizontal:8,paddingVertical:4,marginRight:8,marginTop:8}]}>
            {this._renderLabel(`${item.name}(${item.serialNumber})`,style)}
            {
              !sel ? null :
                <Icon type={'icon_check'} color={GREEN} size={14}/>
            }
          </View>
        </TouchFeedback>
      )
    })
    return (
      <View style={[s.r,{flexWrap:'wrap'}]}>
        {arr}
      </View>
    )
  }

  render() {
    if(this.props.show) {
      return (
        <CommonActionSheet modalVisible={this.props.show} onCancel={this.props.onCancel}>
          <View style={[{backgroundColor:'#fff',maxHeight:600}]}>
            {this._renderTitle()}
            {this._renderHLine()}
            <ScrollView style={{padding:16}} showsVerticalScrollIndicator={false}>
              <View>
                {this._renderLabel('动作',{marginBottom:8})}
                {this._edit('action')}
                {this._renderLabel('回路',{marginTop:16})}
                {this._renderAssets()}
                {this._renderLabel('操作或检查内容',{marginTop:16,marginBottom:8})}
                {this._edit('content')}
              </View>

            </ScrollView>
            {this._renderButtons()}
          </View>

        </CommonActionSheet>
      )
    }
    return null;
  }
}
