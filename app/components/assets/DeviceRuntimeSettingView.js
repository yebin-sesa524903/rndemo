'use strict'
import React,{Component} from 'react';
import {
  View,Text,ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

import List from '../List.js';
import SimpleRow from './SimpleRow.js';
import Section from '../Section.js';
import NetworkImage from '../NetworkImage.js';
import SectionParamTouch from './SectionParamTouch.js';
import AgeingView from './AgeingView.js';
import LineGauge from './LineGauge';
import Circle from './Circle';
import {GRAY,GREEN,LIST_BG,LINE} from '../../styles/color'

import {VictoryChart,VictoryLine,VictoryAxis,VictoryScatter,LineSegment,VictoryLabel} from 'victory-native'
import Icon from "../Icon";
import {SegmentedControl} from '@ant-design/react-native';
import unit from '../../utils/unit';

const STATUS_VIEWS=[
  (
    <View style={{flexDirection:'row',alignItems:'center'}}>
      <Icon type="icon_runtime_status_ok" color={GREEN} size={17}/>
      <Text style={{fontSize:17,marginLeft:8,color:GREEN}}>正常</Text>
    </View>
  ),
  (
    <View style={{flexDirection:'row',alignItems:'center'}}>
      <Icon type="icon_runtime_status_fail" color={'#fbb325'} size={17}/>
      <Text style={{fontSize:17,marginLeft:8,color:'#fbb325'}}>预警</Text>
    </View>
  ),
  (
    <View style={{flexDirection:'row',alignItems:'center'}}>
      <Icon type="icon_runtime_status_fail" color={'#ff4d4d'} size={17}/>
      <Text style={{fontSize:17,marginLeft:8,color:'#ff4d4d'}}>报警</Text>
    </View>
  )
];

//推荐值
const RECOMMENDEDVALUE=[
  {
    type:['KYN中压柜'],
    values:[
      [{lable:'0.3A-1A',min:0.3,max:1},{lable:'40ms-70ms',min:40,max:70}],
      [{lable:'0.3A-1A',min:0.3,max:1},{lable:'30ms-60ms',min:30,max:60}],
      [{lable:'0.2A-0.5A',min:0.2,max:0.5},{lable:'0s-10s',min:0,max:10}]
    ]
  },
  {
    type:['PIX','MVnex中压柜'],
    values:[
      [{lable:'0.3A-1A',min:0.3,max:1},{lable:'35ms-70ms',min:35,max:70},'35-70ms'],
      [{lable:'0.3A-1A',min:0.3,max:1},{lable:'25ms-40ms',min:25,max:40},'25-40ms'],
      [{lable:'0.2A-0.5A',min:0.2,max:0.5},{lable:'4s-12s',min:4,max:12},'4-12s']
    ]
  }
]

export default class DeviceRuntimeSettingView extends Component{
  constructor(props){
    super(props);
    this.state={selectedIndex:0};
  }
  _renderSection(sectionData,sectionId,sectionIndex){
    if(!this.props.sectionData || !this.props.sectionData.get(sectionId)){
      return null
    }
    var secData=this.props.sectionData.get(sectionId);
    if (secData&&secData.get('isExpanded')===null) {
      return (
        <Section text={secData.get('title')} />
      );
    }
    return (
      <SectionParamTouch rowData={secData} onSectionClick={this.props.onSectionClick}/>
    );
  }
  _renderRow(rowData,sectionId,rowId){
    if (rowData.get('title')==='image') {
      return this._renderImage();
    }else if (rowData.get('title')==='AgingData') {
      return this._renderAgingData(rowData);
    }else if (rowData.get('title')==='DemandRequestRatio') {
      return this._renderDemandRatio(rowData);
    }
    var secData=this.props.sectionData.get(sectionId);
    var style={};
    // if (secData&&secData.get('isExpanded')!==null) {
    //   style={marginLeft:34};
    // }
    return (
      <SimpleRow textStyle={style} rowData={rowData} onRowClick={()=>{}} />
    )
  }
  _renderAgingData(rowData)
  {
    return (
      <View style={{alignItems:'center',justifyContent:'center',backgroundColor:'white'}}>
        <AgeingView ageValue={rowData.get('value')} errStr={rowData.get('errStr')}/>
      </View>
    );
  }
  _renderDemandRatio(rowData)
  {
    // console.warn(rowData);
    return (
      <View style={{backgroundColor:'white'}}>
        <LineGauge min={0} max={100} value={rowData.get('value')} errStr={rowData.get('errStr')}/>
      </View>
    )
  }
  _renderImage(){
    // console.warn('footer',this.props.imageId);
    if(this.props.imageId){
      var {width} = Dimensions.get('window');
      width -= 20;
      var height = parseInt(width*2/3);
      return (
        <View style={{padding:10,backgroundColor:'white'}}>
          <NetworkImage resizeMode="contain" name={this.props.imageId} width={width} height={height} />
        </View>

      );
    }
    return null;
  }

  _renderSimpleRow(title,value){
    return (
      <View key={`${title}-${value}`} style={{marginVertical:8,backgroundColor:'#ccc',padding:8,flexDirection:'row',justifyContent:'space-around'}}>
        <Text style={{color:"#666"}}>{title}</Text>
        <Text style={{color:"#f00"}}>{value}</Text>
      </View>
    )
  }

  _renderLines(data){
    let data2=[];
    data.forEach((item,index)=>{
      data2.push(Number.parseFloat(item));
    });
    data=data2;
    let yTick=[0,20,40,60,80,100];
    let xTick=[0];
    for(let i=0;i<=10;i++){
      xTick[i+1]=i+1;
    }
    let axisData=data.map((value,index)=>{
      return {
        x:index+1,
        y:(value>100?150:value)
      }
    });
    return (
      <View style={{marginRight:16}}>
        <Text style={{color:'#b2b2b2',fontSize:12}}>健康指数</Text>
        <VictoryChart height={120} width={Dimensions.get('window').width-140-16} style={{}}
            maxDomain={{y:110}}
            padding={{bottom:20,top:8,left:-10,right:-10}}>
          <VictoryAxis
            domain={[0,yTick.length]}
            tickValues={yTick}
            labels={(item) => item}
            tickFormat={x=>x}
            dependentAxis
            style={{
              axis:{stroke:'#00000000',strokeWidth:2},
              grid:{stroke:'#888888',strokeWidth:0.5,strokeDasharray:"3,4"},
              tickLabels:{fontSize:12,fill:GREEN,fontFamily:''},
            }}
          />
          <VictoryAxis
            tickValues={xTick}
            tickFormat={(y) =>{
              return `${y}`;
            }}
            style={{
              axis: {stroke: "#00000000"},
              ticks: {stroke: "#f00", size: 0,strokeWidth:0.5},
              tickLabels: {fontSize: 12, padding: 4,fill: "#b2b2b2",fontFamily:'',fontWeight:'normal'}
            }}
          />
          <VictoryScatter
            style={{ data: { fill: '#3fa1ff' } }}
            size={3}
            data={axisData}
          />
        <VictoryLine
          style={{
            data: {
              stroke:'#3fa1ff',
              strokeWidth:2,
            },
            labels: {fontSize:12,fill:'#3fa1ff',fontFamily:'',fontWeight:'normal'}
          }}
          labelComponent={<VictoryLabel renderInPortal dx={0} dy={5}/>}
           labels={(item) => unit.fillZeroAfterPointWithRound(item.y,0)}
           interpolation="natural"
           data={axisData}
        />
        </VictoryChart>
        <Text style={{color:'#b2b2b2',fontSize:12,alignSelf:'center'}}>最近记录次数(次)</Text>
      </View>
    );
  }

  _renderHealthIndex(title,data){
    data=data||0;
    if(data>100) data=100;
    let displayText='';
    if(Number.isNaN(Number.parseFloat(data))){
      displayText=data;
    }else{
      displayText=unit.fillZeroAfterPointWithRound(data,0);
    }
    let useColor=GREEN;
    if(data<60){
      useColor='#ff4d4d';
    }
    let fontName='Arial Rounded MT Pro';
    if(Platform.OS==='ios'){
      fontName='ArialRoundedMTBold';
    }
    return (
      <View style={{alignItems:'center',width:140}}>
        <View>
        <Circle
          noSpace={true}
          size={90}
          thickness={10}
          showsText={true}
          animated={false}
          borderWidth={0}
          borderColor={'#f00'}
          color={useColor}
          unfilledColor={'#eee'}
          //textStyle={{color:useColor,fontSize:20,padding:0,fontFamily:'ArialRoundedMTBold'}}
          //textIconStyle={{color:'#00f',fontSize:17}}
          formatText={(progress)=>{
            return null;
          }}
          formatIconText={(progress)=>{
            return null;
          }}
          progress={data/100}
          direction='counter-clockwise'
          indeterminate={false}
        />
          <View style={{
            position: 'absolute',left:0,right:0,top:0,bottom:0,
            justifyContent:'center',alignItems:'center'
          }}>
            <Text style={{color:useColor,fontSize:30,padding:0,fontFamily:fontName}}>{displayText}</Text>
          </View>
        </View>
        <Text style={{color:'#333',fontSize:15,marginTop:10}}>{title}</Text>
      </View>
    )
  }

  //总览tab
  _renderTab1(){
    let statusLables=['合闸线圈状态','分闸线圈状态','储能电机状态'];
    let status=this.props.smartData.get('status').map((item,index)=>{
      return (
        <View key={index} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:index===1?16:0}}>
          <Text style={{color:'#333',fontSize:17}}>{statusLables[index]}</Text>
          {STATUS_VIEWS[Number.parseInt(item)]}
        </View>
      )
    });

    let opts=this.props.smartData.get('opts1').map((item,index)=>{
      return (
        <View key={index} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:index===1?16:0}}>
          <Text style={{color:'#333',fontSize:17}}>{`第${item.get('index')}次操作`}</Text>
          {STATUS_VIEWS[item.get('value')]}
        </View>
      )
    });

    return (
      <View>
        <View style={{}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            {this._renderHealthIndex('总体健康指数',this.props.smartData.getIn(['healthIndex',0]))}
            <View style={{flex:1}}>
              {this._renderLines(this.props.smartData.get('lines1'))}
            </View>
          </View>

          <View style={{margin:16,padding:16,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>
            {status}
          </View>
          <View style={{margin:16,marginVertical:-6,padding:16,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',}}>
              <Text style={{color:'#333',fontSize:17}}>手车状态</Text>
              <View style={{flexDirection:'row',alignItems:'center'}}>
                <Icon type={this.props.smartData.get('breakerStatus')==='1'?"icon_runtime_disconn":"icon_runtime_conn"} color="#333" size={20}/>
                <Text style={{color:'#333',fontSize:15,marginLeft:4}}>
                  {this._formatValue(this.props.smartData.getIn(['handcart','distance']))}{this.props.smartData.getIn(['handcart','unit'])}
                  </Text>
              </View>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:-11}}>
              <Text style={{color:'#333',fontSize:17}}>断路器状态</Text>
              <Icon type={this.props.smartData.get('breakerStatus')==='1'?"icon_runtime_open":"icon_runtime_closed"} color="#333" size={40}/>
            </View>
          </View>
          <View style={{margin:16,padding:16,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>
            {opts}
          </View>
        </View>
      </View>
    )
  }

  _formatValue(value){
    let tmp=value;
    if(Number.isNaN(Number.parseFloat(value))){
      //tmp=Number.parseFloat(value);
      return tmp;
    }
    tmp=Number.parseFloat(value);
    if(tmp<10){
      return unit.fillZeroAfterPointWithRound(value,2);
    }else{
      return unit.fillZeroAfterPointWithRound(value,1);
    }
  }

  //判断某个值是否在区间里面（如果值是非数字，判断为不在区间里面)
  _valueInRange(value,min,max){
    // console.warn(`value=${value} min=${min} max=${max}`);
    let tmp=Number.parseFloat(value);
    if(Number.isNaN(tmp)) return false;
    if(tmp<min || tmp>max) return false;
    return true;
  }

  //其他tab：
  //tabIndex 1:合闸线圈；2：分闸线圈；3：储能电机
  _renderTab2(tabIndex){
    //取推荐值
    let recommandedvalue=null;
    if(this.props.panelData){
      let panelType=this.props.panelData.get('panelType');
      if(panelType){
        RECOMMENDEDVALUE.find(item=>{
          if(item.type.indexOf(panelType)>=0){
            recommandedvalue=item.values;
            return true;
          }
        });
      }
    }
    let opts=this.props.smartData.get('opts'+(tabIndex+1)).map((item,index)=>{
      return (
        <View key={index} style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginVertical:index===1?16:0}}>
          <Text style={{color:'#333',fontSize:17}}>{`第${item.get('index')}次操作`}</Text>
          {STATUS_VIEWS[item.get('value')]}
        </View>
      )
    });

    let electricity=this.props.smartData.getIn(['electricityTime',tabIndex-1,0]);
    let time=this.props.smartData.getIn(['electricityTime',tabIndex-1,1]);
    let electricityLabels=['脱扣峰值电流','脱扣峰值电流','储能工作电流'];
    let electricityRecommandedView=null;
    let electricityColor={};
    let timeLabels=['合闸时间','分闸时间','储能时间'];
    let timeRecommandedView=null;
    let timeColor={};
    let tabLabels=['合闸线圈','分闸线圈','储能电机'];
    let strValue='';
    let strUnit='';
    if (time) {
      strValue=time.get('value');
      strUnit=time.get('unit');
    }
    if(recommandedvalue){
      electricityRecommandedView=(
        <Text style={{color:'#888',fontSize:14,marginTop:4}}>
          {`(推荐值：${recommandedvalue[tabIndex-1][0].lable})`}
          </Text>
      );

      if(electricity&&!this._valueInRange(electricity.get('value'),recommandedvalue[tabIndex-1][0].min,
          recommandedvalue[tabIndex-1][0].max)){
        electricityColor={color:'#ff4d4d'}
      }
      timeRecommandedView=(
        <Text style={{color:'#888',fontSize:14,marginTop:4}}>
          {`(推荐值：${recommandedvalue[tabIndex-1][1].lable})`}
        </Text>
      );
      if(!this._valueInRange(strValue,recommandedvalue[tabIndex-1][1].min,
          recommandedvalue[tabIndex-1][1].max)){
        timeColor={color:'#ff4d4d'}
      }
    }
    let strText='';
    if (electricity) {
      strText=`${this._formatValue(electricity.get('value'))}${electricity.get('unit')}`;
    }
    return (
      <View>
        <View style={{}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
            {this._renderHealthIndex(tabLabels[tabIndex-1]+'健康指数',this.props.smartData.getIn(['healthIndex',tabIndex]))}
            <View style={{flex:1}}>
              {this._renderLines(this.props.smartData.get('lines'+(tabIndex+1)))}
            </View>
          </View>

          <View style={{margin:16,padding:16,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:'#333',fontSize:17}}>{electricityLabels[tabIndex-1]}</Text>
              <View style={{alignItems:'flex-end'}}>
                <Text style={[{color:'#333',fontSize:17},electricityColor]}>
                  {strText}
                </Text>
                {electricityRecommandedView}
              </View>
            </View>
          </View>

          <View style={{margin:16,padding:16,marginVertical:-6,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>
            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
              <Text style={{color:'#333',fontSize:17}}>{timeLabels[tabIndex-1]}</Text>
              <View style={{alignItems:'flex-end'}}>
                <Text style={[{color:'#333',fontSize:17},timeColor]}>
                  {`${this._formatValue(strValue)}${strUnit}`}
                </Text>
                {timeRecommandedView}
              </View>
            </View>
          </View>

          <View style={{margin:16,padding:16,borderRadius:2,borderColor:'#e6e6e6',borderWidth:1}}>
            {opts}
          </View>
        </View>
      </View>
    )
  }

  _renderSmartView(){
    if(!(this.props.isSmartHVX&&this.props.smartData)){
      return null;
    }

    let tab=this.state.selectedIndex>0
      ? this._renderTab2(this.state.selectedIndex)
      : this._renderTab1();

    return (
      <View style={{backgroundColor:'#fff'}}>
        <View style={{marginVertical:16,marginHorizontal:24}}>
        <SegmentedControl
          values={['健康总览', '合闸线圈', '分闸线圈','储能电机']}
          tintColor={GREEN}
          selectedIndex={this.state.selectedIndex}
          onChange={e=>{
            this.setState({selectedIndex:e.nativeEvent.selectedSegmentIndex})
          }}
          style={{ height: 28}}
        />
        </View>
        {tab}
      </View>
    )
  }

  render(){
    return (
      <View style={{flex:1,backgroundColor:LIST_BG}}>
        {/*{this._renderSmartView()}*/}
        <List
          renderHeader={()=>this._renderSmartView()}
          isFetching={this.props.isFetching}
          listData={this.props.data}
          hasFilter={false}
          currentPage={1}
          totalPage={1}
          emptyText={this.props.emptyText}
          onRefresh={this.props.onRefresh}
          renderRow={(rowData,sectionId,rowId)=>this._renderRow(rowData,sectionId,rowId)}
          renderSectionHeader={(sectionData,sectionId)=>this._renderSection(sectionData,sectionId)}
        />
      </View>
    );
  }
}

DeviceRuntimeSettingView.propTypes = {
  isFetching:PropTypes.bool.isRequired,
  imageId:PropTypes.string,
  sectionData:PropTypes.object.isRequired,
  onRefresh:PropTypes.func.isRequired,
  data:PropTypes.object,
  onSectionClick:PropTypes.func,
  emptyText:PropTypes.string,
}
