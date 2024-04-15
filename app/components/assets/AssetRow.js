'use strict'
import React,{Component,PureComponent} from 'react';
import {
  View,
  StyleSheet,
  // Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';

import Text from '../Text';
import ClickableRow from '../ClickableRow';

import {BLACK,GRAY} from '../../styles/color';
import NetworkImage from '../NetworkImage';
import TouchFeedback from '../TouchFeedback.js';
import Icon from '../Icon';
import privilegeHelper from '../../utils/privilegeHelper.js';

export default class AssetRow extends Component{
  constructor(props){
    super(props);
  }
  _getRightImage(data){
    let hasRiskAuth=privilegeHelper.hasAuth('ViewRiskFactor')||privilegeHelper.hasAuth('FullRiskFactor');
    if(!hasRiskAuth||data.RiskFactor===null){
      return;
    }
    var valRisk=data.RiskFactor;
    var color='red';
    var strRisk='';
    if (valRisk<=40) {
      color='#284e98';
      strRisk='健康';
    }else if (valRisk>40&&valRisk<81) {
      color='#fdb54c';
      strRisk='预警';
    }else if (valRisk>=81) {
      color='#f7270a';
      strRisk='危险';
    }
    let viewContent=(
      <View style={{flex:1,alignItems:'center',flexDirection:'row',}}>
        <View style={{flex:1,alignItems:'flex-end',paddingRight:10,}}>
          <Text style={{fontSize:18,color:color}}>
            {valRisk}
          </Text>
        </View>
        <View style={{flex:1,alignItems:'center',justifyContent:'center',
          backgroundColor:color,height:24,borderRadius:2,}}>
          <Text style={{fontSize:13,color:'white'}}>
            {strRisk}
          </Text>
        </View>
      </View>
    );
    viewContent=(
      <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',marginTop:4}}>
        <Text style={{fontSize:18,color:color}}>
          {valRisk}
        </Text>
        <View style={{alignItems:'center',justifyContent:'center',paddingHorizontal:10,marginLeft:8,
          backgroundColor:color,height:21,borderRadius:2,}}>
          <Text style={{fontSize:12,color:'white'}}>
            {strRisk}
          </Text>
        </View>
      </View>
    );
    let status=data.Status;
    let isOfflineOrPause=status===2||status===3;
    if (isOfflineOrPause) {
      viewContent=(
        <View style={{alignItems:'center',flexDirection:'row',marginTop:4}}>
          <View style={{alignItems:'center',backgroundColor:'#d0d0d0',paddingHorizontal:4,
            height:21,borderRadius:2,justifyContent:'center'}}>
            <Text style={{fontSize:11,color:'white'}}>
              {status===2?'诊断已全部暂停':'网关已全部离线'}
            </Text>
          </View>
        </View>
      )
    }
    return (
      <TouchFeedback onPress={()=>this.props.onRowClick(data,'hearthy')}>
        <View style={{marginRight:16,alignItems:'flex-end'}}>
          <Text style={{fontSize:12,color:'#888'}}>
            {'系统风险指数'}
          </Text>
          {/**
          <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',marginTop:4}}>
            <Text style={{fontSize:18,color:color}}>
              {valRisk}
            </Text>
          </View>
          **/}
          {viewContent}
        </View>
      </TouchFeedback>
    )
    // return (
    //   <NetworkImage
    //     width={85}
    //     height={59}
    //     defaultSource = {require('../../images/building_default/building.png')}
    //     name={data.get('LogoKey')}>
    //   </NetworkImage>
    // );

  }
  _getBuildingName(data){
    return (
      <View style={{marginRight:16,flex:1}}>
        <Text numberOfLines={1} style={styles.titleText}>{data.Name}</Text>
      </View>
    )
  }
  _getCustomer(data){
    return (
      // <View style={[styles.content]}>
        <Text numberOfLines={2} style={styles.subTitleText}>{data.get('CustomerName')}</Text>
      // </View>
    )
  }
  render(){
    var {rowData} = this.props;
    if((!rowData)||(rowData&&rowData.isFolder)) return null;
    return (
      <ClickableRow onRowClick={()=>this.props.onRowClick(rowData,'row')}
        onLongClick={()=>this.props.onLongClick(rowData,this.props.rowId)}>
        <View style={[styles.row,styles.rowHeight]}>
          <Icon type={'icon_building'} style={{marginRight:4}} color={'#888'} size={18}/>
          {this._getBuildingName(rowData)}
          {this._getRightImage(rowData)}
        </View>
      </ClickableRow>
    );
  }
}

AssetRow.propTypes = {
  user:PropTypes.object,
  onRowClick:PropTypes.func.isRequired,
  // rowData:PropTypes.object.isRequired,
}

var styles = StyleSheet.create({
  rowHeight:{
    height:56,
  },
  row:{
    flexDirection:'row',
    marginLeft:56,
    alignItems:'center',
    backgroundColor:'transparent',
    borderColor:'#e6e6e6',
    borderBottomWidth:1,
  },
  rowLeft:{
    flexDirection:'row',
    flex:1,
    // paddingVertical:16,
    // backgroundColor:'gray',
  },
  rowRight:{
    justifyContent:'center',

  },
  titleText:{
    fontSize:17,
    color:'#888'
  },
  subTitleText:{
    fontSize:12,
    color:GRAY,
    marginTop:8,
  }
});
