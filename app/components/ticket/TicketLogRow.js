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
import {BLACK, ASSET_IMG_BORDER, ADDICONCOLOR, LINE} from '../../styles/color';
import moment from 'moment';
import Icon from "../Icon";

export default class LogRow extends Component{
  constructor(props){
    super(props);
  }
  _getContentImageView(){
    var {rowData} = this.props;
    var time = moment(rowData.get('UpdateTime')).format("YYYY-MM-DD HH:mm");
    var content = rowData.get('Content') || '无附加文本';
    if (content) {
      content = content.replace(/(^\s*)|(\s*$)/g, "");
    }
    var {width} = Dimensions.get('window');
    width = parseInt((width-16*2-10*3)/4.0);
    var arrImgsView=null;
    if (rowData.get('Pictures')&&rowData.get('Pictures').size!==0) {
      arrImgsView=rowData.get('Pictures').map((item,index)=>{
        if (index>=4&&!this.props.showAllImages) {
          return null;
        }
        let defaultUri=null;
        if(item.get('uri')){
          defaultUri={uri:item.get('uri')};
        }else{
          defaultUri=require('../../images/building_default/building.png');
        }
        return (
          <TouchFeedback key={item.get('PictureId')} onPress={()=>this.props.imageClick(item)}>
          <View style={{marginTop:this.props.showAllImages?10:0,width:width,height:width,
            marginLeft:index%4===0?0:10,borderWidth:1.0,borderColor:LINE}}>
            <NetworkImage
              style={{}}
              imgType='jpg'
              defaultSource = {defaultUri}
              width={width-2} height={width-2}
              name={item.get('PictureId')} />
          </View>
          </TouchFeedback>
        )
      });
      arrImgsView=(
        <View style={{marginTop:this.props.showAllImages?0:10,flexDirection:'row',flexWrap:'wrap'}}>
          {arrImgsView}
        </View>
      )
    }
    if (content){
      content = content.replace(/(^\s*)|(\s*$)/g, "");
    }

    let locationInfo=this.renderLocationInfo();

    return (
      <View style={[styles.row,styles.rowHeight,{justifyContent:'space-between'}]}>
        <View style={{marginTop:10,}}>
          <Text style={{fontSize:17,lineHeight:24,color:'#333'}} lineBreakModel='charWrapping'>{`${content}`}
          </Text>
        </View>
        {arrImgsView}
        <View style={{
            flex:1,
            marginTop:10,flexDirection:'row',
          // justifyContent:'flex-start',
        // backgroundColor:'gray'
          }}>
          <Text style={{fontSize:13,color:'#b2b2b2'}} numberOfLines={1} lineBreakModel='charWrapping'>
            {rowData.get('CreateUserName')}
          </Text>
          <View style={{flexDirection:'row',flex:1}}>
            <Text style={{fontSize:12,color:'#b2b2b2',marginLeft:8,}} numberOfLines={1} lineBreakModel='charWrapping'>{`${time}`}
            </Text>
          </View>
        </View>
        <View style={{marginBottom:16,marginTop: locationInfo?8:0}}>
          {locationInfo}
        </View>


      </View>
    )
  }

  //显示定位信息
  renderLocationInfo(){
    let {rowData} = this.props;
    //如果有定位信息，则显示定位信息
    // console.warn(rowData);
    if(rowData.get('Location')){
      return (
        <Text>
          <Icon style={{marginTop:2,marginRight:4}} type={'arrow_location'} size={11} color={'#999'} />
          <Text style={{fontSize:12,color:'#b2b2b2',flex:1}}
                numberOfLines={2} lineBreakModel='charWrapping' ellipsizeMode="tail">
            {' '+`${rowData.get('Location')}`}
          </Text>
        </Text>
      )
    }
    return null;
  }

  _getContentView(){
    var {rowData} = this.props;
    var time = moment(rowData.get('UpdateTime')).format("YYYY-MM-DD HH:mm");
    var content = rowData.get('Content') || '无附加文本';
    // console.warn('contentview',time,content);
    var conText = time.toString() + ' ' + content.toString();
    return (
      <View style={[styles.row,styles.rowHeight,{paddingTop:16}]}>
        <Text style={styles.nameText} numberOfLines={1} lineBreakModel='charWrapping'>
          {rowData.get('CreateUserName')}
        </Text>
        <View style={{flex:1,flexDirection:'row'}}>
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

LogRow.propTypes = {
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
