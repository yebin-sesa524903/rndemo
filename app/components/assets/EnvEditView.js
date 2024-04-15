'use strict'
import React,{Component} from 'react';
import {
  View,
  TextInput,
  StyleSheet,

} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';

import {BLACK,GRAY,ENV_EDIT_LINE} from '../../styles/color';
import Toolbar from '../Toolbar';

export default class EnvEditView extends Component{
  constructor(props){
    super(props);
    this.state = {text:props.data.getIn(['rvalue',0])};
  }
  _textChanged(text){
    this.setState({text});
  }
  render(){
    return (
      <View style={styles.container}>
        <Toolbar
          title={this.props.data.get('title')}
          navIcon="back"
          actions={[{title:'完成',show:'always'}]}
          onIconClicked={this.props.onBack}
          onActionSelected={[()=>{
            this.props.save(this.state.text)
          }]} />
        <View style={styles.inputContainer}>
          <TextInput
              style={styles.input}
              autoFocus={true}
              underlineColorAndroid={'transparent'}
              textAlign={'left'}
              keyboardType={"numbers-and-punctuation"}
              multiline={false}
              placeholderTextColor={GRAY}
              textAlignVertical={'bottom'}
              placeholder={""}
              onChangeText={(text)=>this._textChanged(text)}
              value={this.state.text} />
            <Text style={{fontSize:17,color:GRAY}}>{this.props.data.getIn(['rvalue',1])}</Text>
        </View>

      </View>
    );
  }
}

EnvEditView.propTypes = {
  data:PropTypes.object.isRequired,
  onBack:PropTypes.func.isRequired,
  save:PropTypes.func.isRequired,
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'white',
  },
  inputContainer:{
    // flex:1,
    marginTop:16,
    paddingHorizontal:15,
    flexDirection:'row',
    alignItems:'center',
    // justifyContent:'center',
    // paddingBottom:7,
    height:48,
    borderBottomWidth:1,
    backgroundColor:'white',
    borderColor:ENV_EDIT_LINE
  },
  input:{
    fontSize:17,
    color:BLACK,
    // backgroundColor:'white',
    flex:1,
    // padding:0,
    height:48,
    marginTop:0,marginBottom:0,
  }
});
