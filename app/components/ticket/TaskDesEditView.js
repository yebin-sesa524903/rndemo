
'use strict';
import React,{Component} from 'react';

import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  Text,
  ScrollView

} from 'react-native';
import PropTypes from 'prop-types';
import Toolbar from '../Toolbar';
import KeyboardSpacer from '../KeyboardSpacer.js';

import {GRAY,BLACK} from '../../styles/color.js';
export default class TaskDesEditView extends Component{
  constructor(props){
    super(props);
    var text = this.props.content;
    this.state = {text};
  }
  _logChanged(text){
    this.setState({text});
    this.props.dataChanged(text);
  }
  render() {
    var lines = 0;
    var content = this.state.text;
    if (!!content) {
      content.split('\n').forEach((item)=>{
        lines++;
      });
    }
    var disable = !this.state.text || this.state.text.length === 0;
    console.warn('state.text',disable,this.state.text);
    var actions = [{title:'完成',show:'always',disable:disable}];
    if(Platform.OS === 'android'){
      actions = [{title:'完成',show:'always'}];
    }
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <Toolbar
          title={this.props.title}
          navIcon="back"
          actions={actions}
          onIconClicked={this.props.onBack}
          onActionSelected={[()=>{
            this.props.onSave(this.state.text);
          }]}
          />

        <View style={{flex:1}}>
          <TextInput
            ref={(input)=>this._input=input}
            style={styles.input}
            autoFocus={this.props.content ? false : true}
            underlineColorAndroid={'transparent'}
            textAlign={'left'}
            multiline={true}
            numberOfLines={lines}
            placeholderTextColor={GRAY}
            textAlignVertical={'top'}
            placeholder={"输入创建工单任务描述"}
            onChangeText={(text)=>this._logChanged(text)}
            value={this.state.text} />
        </View>
        <KeyboardSpacer />
      </View>
    );
  }
}

TaskDesEditView.propTypes = {
  navigator:PropTypes.object,
  title:PropTypes.string,
  content:PropTypes.string,
  user:PropTypes.object,
  onBack:PropTypes.func.isRequired,
  onSave:PropTypes.func.isRequired,
  isSameUser:PropTypes.bool,
  dataChanged:PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  input:{
    flex:1,
    justifyContent:'flex-start',
    alignItems:'flex-start',
    textAlignVertical:'top',
    fontSize:14,
    color:BLACK,
    padding:0,
    margin:16,
    // height:48,
  },
  button:{
    // marginTop:20,
    height:48,
    flex:1,
    marginHorizontal:16,
    borderRadius:6,

  },
});
