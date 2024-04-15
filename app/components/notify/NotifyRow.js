'use strict'

import React,{Component} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
// import TouchFeedback from '../TouchFeedback';
import ClickableRow from '../ClickableRow.js';
import {GRAY,BLACK,ALARM_HIGH,ALARM_MIDDLE,ALARM_LOW, LINE} from '../../styles/color';
import moment from 'moment';
import Icon from '../Icon.js';
import TouchFeedback from '../TouchFeedback';

export default class NotifyRow extends Component{
  constructor(props){
    super(props);
  }
  _getLevelText(data){
    var level = data.get('Level'),secureTime = data.get('SecureTime');
    var ret = {text:level,style:null};
    if(level === 3){
      ret.text = '高';
      ret.style={backgroundColor:ALARM_HIGH};
    }
    else if (level === 2) {
      ret.text = '中';
      ret.style={backgroundColor:ALARM_MIDDLE};
    }
    else {
      ret.text = '低';
      ret.style={backgroundColor:ALARM_LOW};
    }

    if(secureTime){
      ret.style=styles.securedAlarm;
    }
    return ret;
  }
  _getLevelView(data){
    var level = this._getLevelText(data);
    return (
      <View style={[styles.level,level.style]}>
        <Text style={styles.levelText}>{level.text}</Text>
      </View>
    )
  }
  _getBuildingText(data){
    var path = data.get('Paths').toArray();
    return (path&&path.length>0)?path[0]:'';
  }
  _getPrimaryContent(data){
    return (
      <View style={styles.content}>
        <Text numberOfLines={1} style={styles.alarmText}>{data.get('DeviceName')}</Text>
        <Text numberOfLines={1} style={[styles.locationText]}>{this._getBuildingText(data)}</Text>
      </View>
    )
  }
  _getTime(data){
    var time = moment(data.get('createdTime'));
    return time.format('MM月DD日 HH:mm');
    // if(time.isSame(moment(),'day')){
    //   return time.format('HH:mm:ss');
    // }
    // else {
    //   return time.format('MM-DD');
    // }
  }
  _getRedView(rowData){
    var iconTicket = null;
    if (rowData.get('unread')) {
      iconTicket=(
        <View style={{width:8,height:8,backgroundColor:'#ff4d4d',borderRadius:4,marginRight:8}}>
        </View>
      );
    }
    return iconTicket;
  }
  render(){
    var {rowData} = this.props;
    return (
      <TouchFeedback style={{backgroundColor:'#fff'}} onPress={()=>this.props.onRowClick(rowData)}>
        <View style={{}}>
          <View style={{flex:1,height:10,backgroundColor:'#f2f2f2'}}>
          </View>
          <View style={styles.container}>
            <View style={[styles.row,styles.rowHeight,{alignItems:'flex-start'}]}>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  {this._getRedView(rowData)}
                  <View style={{flexDirection:'row',flex:1,alignItems:'center'}}>
                    <Text numberOfLines={1} style={styles.alarmText}>{rowData.get('header')}</Text>
                  </View>
                  <Text style={styles.timeText}>{this._getTime(rowData)}</Text>
                </View>
                <View style={{paddingVertical:16}}>
                  <View style={{flex:1,height:1,backgroundColor:'#e6e6e6'}}>
                  </View>
                </View>
                <Text style={{fontSize:17,color:'#333'}}>{rowData.get('title')}</Text>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  <View style={{flexDirection:'row',flex:1,alignItems:'center',marginTop:12,marginBottom:8,}}>
                    <Text numberOfLines={1} style={{fontSize:15,color:'#b2b2b2'}}>{(rowData.get('messageType')===20?'地点:':'单位:')+rowData.get('subTitle')}</Text>
                  </View>
                  <Text style={styles.seeText}>{'查看 >'}</Text>
                </View>

              </View>
            </View>
          </View>
        </View>
      </TouchFeedback>
    );
  }
}

NotifyRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  container:{
    paddingHorizontal:16,
    paddingBottom:16,
    paddingTop:12,
    backgroundColor:'#fff',
    flex:1
  },
  rowHeight:{
    // height:74
  },
  row:{
    flexDirection:'row',
    alignItems:'center',
    // padding:16,
    overflow:'hidden',
    flex:1
  },
  rowLeft:{
    flexDirection:'row',
    flex:1,
  },
  content:{
    flex:1,
    // backgroundColor:'red'
  },
  level:{
    width:40,
    height:40,
    borderRadius:20,
    marginRight:16,
    justifyContent:'center',
    alignItems:'center'
  },
  levelText:{
    fontSize:17,
    color:'white'
  },
  unSecuredAlarm:{
    backgroundColor:ALARM_HIGH
  },
  securedAlarm:{
    backgroundColor:'#c0c0c0',//GRAY
  },
  alarmText:{
    fontSize:17,
    color:'#888',//BLACK
  },
  locationText:{
    fontSize:12,
    color:GRAY,
    marginTop:8,
  },
  timeText:{
    fontSize:15,
    color:'#888',//GRAY,
  },
  seeText:{
    fontSize:15,
    color:'#3dcd58',//GRAY,
  },
});
