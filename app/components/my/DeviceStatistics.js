
'use strict';
import React,{Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  // PixelRatio,
} from 'react-native';
import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';
import Text from '../Text';
import {GRAY,BLACK,LIST_BG,GREEN} from '../../styles/color';
import moment from 'moment';
import ListSeperator from '../ListSeperator';
import Bottom from '../Bottom'
import Loading from '../Loading';
import Button from '../Button.js';
import privilegeHelper from '../../utils/privilegeHelper.js';
import Icon from '../Icon.js';
import TouchFeedback from '../TouchFeedback';
import unit from '../../utils/unit.js';
// import num
moment.locale('zh-cn');
import Svg,{Line,} from 'react-native-svg';

export default class DeviceStatistics extends Component{
  constructor(props){
    super(props);
  }
  _renderCell(title,value){
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <View style={{}}>
          <Text style={{fontSize:17,color:'#333',lineHeight:25}}>
            {title}
          </Text>
        </View>
        <View style={{marginTop:6,}}>
          <Text style={{fontSize:22,color:'#333',lineHeight:30,fontWeight:'500',}}>
            {value}
          </Text>
        </View>
      </View>
    )
  }
  _renderRows(){
    var arrTodayDatas=this.props.rowData.get('Today');
    if (!arrTodayDatas) {
      arrTodayDatas=[];
    }
    var arrTotalDatas=this.props.rowData.get('History');
    if (!arrTotalDatas) {
      arrTotalDatas=[];
    }
    var viewRows=arrTotalDatas.map((item,index)=>{
      // var itemTotal=arrTotalDatas.get(index);
      var indexT = arrTodayDatas.findIndex((itemToday)=> itemToday.get('SumClass') === item.get('SumClass'));
      var numToday=0;
      if (indexT!==-1) {
        let dataToday=arrTodayDatas.get(indexT);
        numToday=dataToday.get('Count');
      }

      return (
        <View style={{}}>
          {this._getSection()}
          <View style={{backgroundColor:'white',borderRadius:4,}}>
            <View style={styles.rowStyle}>
              <View style={{flexDirection:'row',alignItems:'center'}}>
                <View style={{width:3,height:18,backgroundColor:'#284e98'}}>
                </View>
                <Text style={{fontSize:17,color:'#888',marginLeft:6,}}>
                  {item.get('SumClass')}
                </Text>
              </View>
            </View>
            <View style={{flexDirection:'row',paddingVertical:20,}}>
              {this._renderCell('今日新增',numToday)}
              <Svg style={{width:1,}}
                >
                <Line
                  x1={1}
                  y1={0}
                  x2={1}
                  y2={300}
                  stroke="#d9d9d9"
                  strokeWidth="2"
                  strokeDasharray={[2,2,]}
                  strokeDashoffset={5}
                />
              </Svg>
              {this._renderCell('总数',item.get('Count'))}
            </View>
          </View>
        </View>
      )
    })
    return viewRows;
  }
  _getSection()
  {
    return (<View style={{
        borderColor:LIST_BG,
        borderBottomWidth:10,
        }}>
      {}
    </View>);
  }
  _getContent(){
    if(!this.props.rowData){
      var loading = null;
      if(this.props.isFetching){
        loading = (
          <Loading />
        );
      }
      return  (
        <View style={{flex:1,backgroundColor:'white'}}>
          {
            loading
          }
        </View>
      )
    }else {
      var arrTotalDatas=this.props.rowData.get('History');
      if (!arrTotalDatas||arrTotalDatas.size===0) {
        return (
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={{fontSize:15,color:'#888'}}>
              {'您尚未添加任何Logbook设备'}
            </Text>
          </View>
        )
      }
      return(
        <View style={{flex:1}}>
          <ScrollView style={[styles.wrapper,]}>
            <View style={styles.container}>
              {this._renderRows()}
            </View>
          </ScrollView>
        </View>
      );
    }
  }
  render() {
    var actions=[{title:'去兑换',show:'always'}];
    var arrTotalDatas=this.props.rowData&&this.props.rowData.get('History');
    if (!arrTotalDatas||arrTotalDatas.size===0) {
      actions=null;
    }
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}}>
        <Toolbar
          title='Logbook设备统计'
          navIcon="back"
          onIconClicked={()=>this.props.onBack()}
          actions={actions}
          onActionSelected={[()=>{
            this.props.gotoExchange();
          }]}
        />
        {this._getContent()}
      </View>
    );
  }
}

DeviceStatistics.propTypes = {
  onBack:PropTypes.func,
  gotoExchange:PropTypes.func,
  isFetching:PropTypes.bool,
  rowData:PropTypes.object,//immutable
}

var styles = StyleSheet.create({
  container:{
    flex:1,
    paddingHorizontal:16,
  },
  rowStyle:{
    flex:1,height:36,flexDirection:'row',alignItems:'flex-end',
  },
  title:{
    fontSize:17,
    color:'white'
  },
  headerLeft:{
    flex:1,
    justifyContent:'flex-end',
    paddingBottom:25,
    // backgroundColor:'black'//test
  },
  headerRight:{
    width:80,
    paddingBottom:25,
    alignItems:'flex-end',
    justifyContent:'flex-end',
    // backgroundColor:'#00ff00'//test
  },
  datetime:{
    fontSize: 14,
    marginBottom:18,
    color:'white',
  },
  codeText:{
    fontSize: 32,
    color:'white',
    // backgroundColor:'red',//test
  },
  level:{
    borderColor:'white',
    borderWidth:1,
    borderRadius:35,
    width:70,
    height:70,
    justifyContent:'center',
    alignItems:'center'
  },
  levelText:{
    fontSize: 20,
    color:'white'
  },
  detailRow:{
    flexDirection:'row',
    alignItems:'flex-start',
    justifyContent:'space-between',
  },
  detailTitleText:{
    color:GRAY,
    fontSize:14,
    // height:17,
  },
  detailText:{
    color:BLACK,
    fontSize:14,
    marginLeft:10,
    // height:17,
    // lineHeight:25,
    // backgroundColor:'red',
  },
  statusRowContainer:{
    flex:1,
  },
  statusRow:{
    flexDirection:'row',
    marginBottom:11
  },
  statusTimeText:{
    color:GRAY,
    fontSize:12,
  },
  statusText:{
    color:GRAY,
    fontSize:12,
    marginLeft:21
  },
  viewTicket:{
    color:GREEN,
    fontSize:12,
  },
  wrapper:{
    // paddingBottom: 48,
    flex:1,
    backgroundColor:LIST_BG,
  },
  button:{
    height:48,
    flex:1,
    marginHorizontal:16,
    borderRadius:6,

  }
});
