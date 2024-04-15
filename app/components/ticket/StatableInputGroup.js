'use strict'

import React,{Component} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import PropTypes from 'prop-types';
import Text from '../Text';
import Icon from '../Icon.js';

import TitleComponent from '../alarm/TitleComponent.js';
import {GRAY,BLACK,ALARM_FILTER_BUTTON_BORDER} from '../../styles/color.js';
// import KeyboardSpacer from '../KeyboardSpacer.js';

export default class StatableInputGroup extends Component{
  constructor(props){
    super(props);
  }
  _getContent(){
    return(
      <View style={{flex:1,borderWidth:1,borderColor:ALARM_FILTER_BUTTON_BORDER}}>
        <TextInput
          ref={(input)=>this._input=input}
          style={styles.inputStyle}
          autoFocus={false}
          underlineColorAndroid={'transparent'}
          textAlign={'left'}
          multiline={false}
          numberOfLines={1}
          placeholderTextColor={GRAY}
          placeholder={'请输入'}
          onChangeText={(text)=>this.props.onChanged(text)}
          value={this.props.text}
          />
      </View>
  );
    // <KeyboardSpacer />
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.warn('nextProps',nextProps.selectedIndexes);
    if(nextProps.text === this.props.text){
      return false;
    }
    return true;
  }

  render() {
    return (
      <TitleComponent title={this.props.title}>
        {this._getContent()}
      </TitleComponent>

    );
  }
}

StatableInputGroup.propTypes = {
  title:PropTypes.string,
  text:PropTypes.string,
  onChanged:PropTypes.func,
}


var styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:'column'
  },
  inputStyle:{
    flex:1,
    justifyContent:'flex-start',
    alignItems:'flex-start',
    textAlignVertical:'center',
    fontSize:14,
    color:BLACK,
    padding:0,
    marginLeft:12,
    // backgroundColor:'red',
    height:45,
  },
  titleText:{
    fontSize:12,
    color:GRAY
  },
  inputWrapper:{
    borderColor:'gray',
    borderWidth:1,
  },
  itemContainer:{


  },

});
