'use strict'

import React,{Component} from 'react';

import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import TouchFeedback from '../TouchFeedback';
import NetworkImage from '../NetworkImage';
import {BLACK,ASSET_IMG_BORDER} from '../../styles/color';
import moment from 'moment';

export default class TicketMsgRow extends Component{
  constructor(props){
    super(props);
  }
  _getContentImageView(){
    var {rowData} = this.props;
    var time = moment(rowData.get('CreateTime')).format("YYYY-MM-DD HH:mm");
    var content = rowData.get('Content') || '无附加文本';
    if (content) {
      content = content.replace(/(^\s*)|(\s*$)/g, "");
    }
    var {width} = Dimensions.get('window');
    width = parseInt((width-16*2-10*3)/4.0);
    var arrImgsView=null;
    if (rowData.get('Pictures')&&rowData.get('Pictures').size!==0) {
      arrImgsView=rowData.get('Pictures').map((item,index)=>{
        if (index>=4) {
          return null;
        }
        return (
          <View style={{marginLeft:index===0?0:10,}}>
            <NetworkImage
              style={{borderWidth:0.5,borderColor:ASSET_IMG_BORDER}}
              key={rowData.getIn(['Pictures',0,'PictureId'])}
              defaultSource = {require('../../images/building_default/building.png')}
              width={width} height={width}
              name={item.get('PictureId')} />
          </View>
        )
      });
      arrImgsView=(
        <View style={{marginTop:10,flexDirection:'row'}}>
          {arrImgsView}
        </View>
      )
    }
    if (content){
      content = content.replace(/(^\s*)|(\s*$)/g, "");
    }
    return (
      <View style={[styles.row,styles.rowHeight,{justifyContent:'space-between'}]}>
        <View style={{marginTop:15,}}>
          <Text style={{fontSize:17,lineHeight:24,color:'#333'}} lineBreakModel='charWrapping'>{`${content}`}
          </Text>
        </View>
        {arrImgsView}
        <View style={{
            flex:1,
            marginTop:8,flexDirection:'row',
            marginBottom:15,
            // backgroundColor:'gray',
            // alignItems:'flex-end',
        // backgroundColor:'gray'
      }}>
          <Text style={{fontSize:13,color:'#b2b2b2'}} numberOfLines={1} lineBreakModel='charWrapping'>
            {rowData.get('UserName')}
          </Text>
          <View style={{maxWidth:150,justifyContent:'flex-end'}}>
            <Text style={{fontSize:12,color:'#b2b2b2',marginLeft:8,}} numberOfLines={1} lineBreakModel='charWrapping'>
              {`${time}`}
            </Text>
          </View>
        </View>
      </View>
    )
  }
  _getContentView(){
    var {rowData} = this.props;
    var time = moment(rowData.get('CreateTime')).format("YYYY-MM-DD HH:mm");
    var content = rowData.get('Content') || '无附加文本';
    // console.warn('contentview',time,content);
    var conText = time.toString() + ' ' + content.toString();
    return (
      <View style={[styles.row,styles.rowHeight,{paddingTop:16}]}>
        <Text style={styles.nameText} numberOfLines={1} lineBreakModel='charWrapping'>
          {rowData.get('UserName')}
        </Text>
        <View style={{flex:1}}>
          <Text  style={styles.contentText} numberOfLines={1} lineBreakModel='charWrapping'>{conText}
          </Text>
        </View>
      </View>
    )
  }

  render(){
    var {rowData} = this.props;
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        <TouchFeedback onLongPress={()=>this.props.onRowLongPress(rowData)} onPress={()=>this.props.onRowClick(rowData)}>
            {
              this._getContentImageView()
              //rowData.get('Pictures').size > 0 ?
              //this._getContentImageView() : this._getContentView()
            }
        </TouchFeedback>
      </View>

    );
  }
}

TicketMsgRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  onRowLongPress:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  rowHeight:{
    // height:74
  },
  row:{
    backgroundColor:'white',
    paddingHorizontal:16,
  },
  titleRow:{
    flexDirection:'row',
    // backgroundColor:'red',
    alignItems:'flex-start',
    justifyContent:'space-between',
  },
  nameText:{
    color:BLACK,
    fontSize:17
  },
  contentText:{
    color:BLACK,
    fontSize:12,
    marginTop:13
  },



});
