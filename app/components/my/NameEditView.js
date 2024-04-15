'use strict'
import React,{Component} from 'react';
import {
  View,
  TextInput,
  StyleSheet,

} from 'react-native';
import PropTypes from 'prop-types';

import {BLACK,GRAY,ENV_EDIT_LINE,LIST_BG} from '../../styles/color';
import Toolbar from '../Toolbar';
import Loading from '../Loading';
import backHelper from "../../utils/backHelper";
import trackApi from "../../utils/trackApi";
import TouchFeedback from "../TouchFeedback";
import Icon from "../Icon";
import {Keyboard} from 'react-native';
export default class NameEditView extends Component{
  constructor(props){
    super(props);
    this.state={
      value:''
    }
  }

  _clear(type){
    Keyboard.dismiss();
    let data={};
    data[type]='';
    this.setState({...data})
  }

  onChangeText(type,text){
    let data={};
    data[type]=text;
    this.setState(data)
  }

  _renderInput(label,type){
    let clearIcon=null;
    let value=this.state[type];
    if(value&&value.length>0){
      clearIcon=(
        <TouchFeedback onPress={()=>this._clear(type)}>
          <View>
            <Icon type="icon_unselect" color={'#ccc'} size={15}/>
          </View>
        </TouchFeedback>
      );
    }
    return (
      <View style={{flexDirection:'row',height:56,alignItems:'center',
        backgroundColor:'#fff',paddingHorizontal:16}}>
        <TextInput style={[{fontSize:17,color:'#333',flex:1,marginHorizontal:6,padding:0}]}
           numberOfLines={1} value={value} placeholder={'请填写显示名称'}
           placeholderTextColor={'#d0d0d0'} onChangeText={(text)=>this.onChangeText(type,text)}
        />
        {clearIcon}
      </View>
    )
  }


  isEmpty(str){
    if(str&&str.length>0) return false;
    return true;
  }

  enableNext(){
    if(this.isEmpty(this.state.phone)) return false;
    if(this.isEmpty(this.state.phone.trim())) return false;
    return true;
  }

  doNext(){
    this.props.save(this.state.realName||'')
  }

  render() {
    let actions=[{title:'完成'}];
    return (
      <View style={{flex:1,backgroundColor:'#f2f2f2'}}>
        <Toolbar
          title={'显示名称'}
          navIcon="back"
          actions={actions}
          onActionSelected={[this.doNext.bind(this,false)]}
          onIconClicked={()=>this.props.onBack()} />
        <View style={{backgroundColor:'#fff',marginTop:10,height:55,justifyContent:'center'}}>
          {this._renderInput('名称','realName')}
        </View>
      </View>
    );
  }
}

NameEditView.propTypes = {
  user:PropTypes.object.isRequired,
  onBack:PropTypes.func.isRequired,
  save:PropTypes.func.isRequired,
  isFetching:PropTypes.bool,
}
