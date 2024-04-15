'use strict'

import React, {Component} from 'react';

import {Text,View,ScrollView, Platform} from 'react-native';
import PropTypes from 'prop-types';
import Icon from './Icon';
import Toolbar from './Toolbar';
import {isPhoneX} from '../utils';
import {LIST_BG} from '../styles/color';
import TouchFeedback from './TouchFeedback';
import Colors from "../utils/const/Colors";

export default class AssetsText extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let arr=Object.entries(this.props.data).map((item,index)=>{
      return (
        <TouchFeedback key={index} onPress={()=>{
          this.props.onBack();
          this.props.onItemClick(item[0],item[1]);}}>
          <View style={{height:56,borderBottomWidth:1,borderBottomColor:Colors.seBorderSplit,
            padding:16,justifyContent:'center'}}>
            <Text numberOfLines={1} style={{fontSize:17,color:Colors.seTextPrimary}}>{item[1]}</Text>
          </View>
        </TouchFeedback>
      );
    });

    return (
      <View style={{flex: 1, backgroundColor: Colors.seBgContainer}}>
        <Toolbar title={this.props.title}
                 color={Colors.seBrandNomarl}
                 borderColor={Colors.seBrandNomarl}
                 navIcon="back"
                 onIconClicked={() => this.props.onBack()}
        />
        <ScrollView
          style={[{}, {backgroundColor:Colors.seBgContainer,
            marginBottom: isPhoneX() ? 34 : 0,
            showsVerticalScrollIndicator: false
          }]}>
          {arr}
        </ScrollView>
      </View>
    );
  }
}

AssetsText.propTypes = {
  title:PropTypes.string,
  onBack:PropTypes.func,
  onItemClick:PropTypes.func,
  data:PropTypes.array,
};

AssetsText.defaultProps = {
  title:'',
  onBack:()=>{},
  onItemClick:()=>{},
  data:[]
};
