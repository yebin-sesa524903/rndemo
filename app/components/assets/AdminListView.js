'use strict'
import React,{Component} from 'react';
import {
  View,
  Linking,
  StyleSheet,

} from 'react-native';
import PropTypes from 'prop-types';
// import Icon from '../Icon.js';
import Text from '../Text';
import TouchFeedback from '../TouchFeedback.js';
import {BLACK,GRAY,LIST_BG} from '../../styles/color';
import Toolbar from '../Toolbar';
import ListSeperator from '../ListSeperator.js';

export default class AdminListView extends Component{
  constructor(props){
    super(props);
  }
  _openMobile(){
    Linking.
      openURL(`tel:${this.props.admin.get('Telephone')}`).
      catch((err) => console.warn('An error occurred', err));
  }
  render(){
    return (
      <View style={styles.container}>
        <Toolbar
          title={this.props.admin.get('Name')}
          navIcon="back"
          onIconClicked={this.props.onBack} />
        <View style={{flex:1,}}>
          <View style={styles.connectionRow}>
            <Text style={styles.titleText}>{this.props.admin.get('Title')}
            </Text>
          </View>
          <View style={styles.connection}>
            <Text style={styles.sectionTitle}>联系他/她</Text>
            <View style={styles.connectionContainer}>
              <TouchFeedback onPress={()=>this._openMobile()}>
                <View style={styles.connectionRow}>
                  <Text style={styles.titleText}>{this.props.admin.get('Telephone')}
                  </Text>
                </View>
              </TouchFeedback>
              <ListSeperator />
              <View style={styles.connectionRow}>
                <Text style={styles.titleText} numberOfLines={1}>
                  {this.props.admin.get('Email')}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

AdminListView.propTypes = {
  onBack:PropTypes.func.isRequired,
  admin:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  container:{
    backgroundColor:LIST_BG,
    flex:1,
  },
  sectionTitle:{
    marginTop:19,
    marginBottom:10,
    marginLeft:16,
    fontSize:14,
    color:GRAY
  },
  connection:{
    marginTop:10,
  },
  connectionContainer:{
  },
  connectionRow:{
    flexDirection:'row',
    height:49,
    paddingHorizontal:16,
    alignItems:'center',
    backgroundColor:'white',
    // flex:1,
  },
  titleText:{
    fontSize:17,
    color:BLACK
  }

});
