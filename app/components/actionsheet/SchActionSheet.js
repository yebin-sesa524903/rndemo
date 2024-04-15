'use strict';
import React,{Component} from 'react';

import {
    Modal, ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import Button from './Button';
import FadeInView from './FadeInView';
import TouchFeedback from '../TouchFeedback';
import Text from '../Text';
import PropTypes from 'prop-types';

import {isPhoneX} from '../../utils';
let toBottom=0;
if(isPhoneX()) toBottom=34;

export default class SchActionSheet extends Component {
  constructor(props){
    super(props);
  }

  _getTitleView()
  {
    if (!this.props.title) {
      return;
    }
    return (
      <View style={{
          height:49,backgroundColor:'transparent',
          justifyContent:'center',alignItems:'center',
        }}>
        <Text style={{fontSize:14,color:'#333', fontWeight: 'bold'}}>
          {this.props.title}
        </Text>
        <View style={{position:'absolute', backgroundColor: '#E4EAF3', height: 1, left: 15, right: 15, bottom: 0}}/>
      </View>
    )
  }
  render() {
    var {arrActions}=this.props;
    var itemsView=arrActions.map((item,index)=>{
      return (
        <View key={index} style={{}}>
          <TouchFeedback onPress={()=>this.props.onSelect(item)}>
            <View style={{
                height:49,backgroundColor:'transparent',justifyContent:'center',alignItems:'center',
              }}>
              <Text style={{fontSize:14,color:item.select?'#333':'#999', fontWeight: item.select?'bold':'normal'}}>
                {item.title}
              </Text>
              {index !==0 && <View style={{position:'absolute', backgroundColor: '#E4EAF3', height: 1, left: 15, right: 15, top: 0}}/>}
            </View>
          </TouchFeedback>
        </View>
      )
    })
    return (
      <FadeInView visible={this.props.modalVisible}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.props.modalVisible}
          onRequestClose={this.props.onCancel}>
          <View style={styles.modalContainer}>

            <TouchableOpacity style={styles.container} onPress={this.props.onCancel}></TouchableOpacity>
              <View style={{backgroundColor:'white',marginBottom:8,
              borderRadius:2,marginHorizontal:10}}>
                {this._getTitleView()}
                  <ScrollView style={{maxHeight: 49 * 5}}>
                      {itemsView}
                  </ScrollView>
              </View>
            <Button onPress={this.props.onCancel} text={this.props.buttonText || "取消"} />
          </View>
        </Modal>
      </FadeInView>
    );
  }
}

SchActionSheet.propTypes = {
  arrActions:PropTypes.array,
  onSelect:PropTypes.func,
  title:PropTypes.string,
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingBottom: toBottom,
    justifyContent: "flex-end",
  }
});
