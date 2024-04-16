
'use strict';
import React,{Component} from 'react';

import {
  View,
  Animated,
  Easing,
  StyleSheet,
  ViewPropTypes,
  Dimensions,
  ScrollView,
  BackHandler,
  Platform,
} from 'react-native';

import Text from '../Text';
import Icon from '../Icon.js';
import {BLACK,GRAY,LINE_HISTORY,CHART_RED,CHART_NGRAY,CHART_OFFSET_COLOR,CHART_GREEN} from '../../styles/color';
import Loading from '../Loading';
import LineGradient from 'react-native-linear-gradient';
import ListSeperator from '../ListSeperator';
import TouchFeedback from '../TouchFeedback';
import WaveAnimatCircleView from './WaveAnimatCircle.js';

// const {Surface, Group, Shape,LinearGradient,Defs,Stop,Path,ClippingRectangle} = ART;

import Svg,{
    Circle,
    Ellipse,
    G,
    // LinearGradient,
    RadialGradient,
    Line,
    // Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Use,
    // Defs,
    // Stop
} from 'react-native-svg';

import PropTypes from 'prop-types';

import Toolbar from '../Toolbar';

import List from '../List.js';
import TendingRow from './TendingRow.js';

function getLinearColor(color1,t,color2){
  return color1+t*(color2-color1)
}

const POINT_0=[75,227,141],
    POINT_40=[187,221,45],
    POINT_80=[255,128,52],
    POINT_100=[248,39,9];

export default class BuildingHealthyView extends Component{
  constructor(props){
    super(props);
    this.state = {
        rotationAnim: new Animated.Value(0),
        startAnim:false,
        contentHeight:0,
        chatWidth:0,
        chatHeight:0,
        rectWidth:0,rectHeight:0,
        arrLinePoints:[],
        paddTopForGrid:0,
        arrRoundStartPoints:[],
        roundRectWidth:0,
        enableArrowScroll:true,
    };
  }
  componentDidMount() {
    // this.setState({startAnim:true},()=>{
    //   this._initializeRotationAnimation();
    // });
    var {width,height} = Dimensions.get('window');
    var calHeight=width>height?height:width;
    calHeight=calHeight-(Platform.OS==='ios'?64:80);
    // console.warn('222222',calHeight);
    this.setState({contentHeight:calHeight});
    this._back=BackHandler.addEventListener('hardwareBackPress', () => {
      this.setState({startAnim:false},()=>{
        this.props.onBack();
      });
      return true;
    });
  }

  componentWillUnmount(){
    this._back.remove();
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.isFetching && !nextProps.isFetching && !nextProps.stopAnimat){
      // this._initializeRotationAnimation();
      // console.warn('show anima');
      var status=nextProps.healthyDatas?nextProps.healthyDatas.get('Status'):null;
      this.setState({startAnim:status===1},()=>{
        this._initializeRotationAnimation();
      });
    }
  }
  willExitView(cb)
  {
    // console.warn('111');
    if (this._rotateAnimation) {
      // console.warn('aaaaa');
      this._rotateAnimation.stopAnimation();
    }
    this.setState({startAnim:false},()=>{
      cb();
    });
  }
  _getToolbar(){
    return (
      <Toolbar
        title={this.props.title}
        navIcon="back"
        isLandscape={true}
        onIconClicked={()=>{
          this.setState({startAnim:false},()=>{
            this.props.onBack();
          });
        }}
        onActionSelected={[this.props.createLog]} />
    );
  }
  _initializeRotationAnimation() {
    if (!this.state.startAnim) {
      return;
    }
    this.state.rotationAnim.setValue(0);
    this._rotateAnimation=Animated.timing(this.state.rotationAnim, {
           toValue: 1,
           duration: 1000*60,
           easing: Easing.linear,
       });
    this._rotateAnimation.start(() => {
         this._initializeRotationAnimation()
       });
  }
  _getInterpolatedRotateAnimation() {
    return this.state.rotationAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
          });
  }
  _getIconWrapperStyles() {
    var styles = {transform: [{rotate: this._getInterpolatedRotateAnimation()}]};
    // styles={};
    return styles;
  }
  _checkHeight(e){
    const {x, y, width, height} = e.nativeEvent.layout;
    // console.warn('11111111',height);//311 in scroll,
    // this.setState({contentHeight:height});
  }
  _onScroll(e){
    const {x, y} = e.nativeEvent.contentOffset;
    this.setState({enableArrowScroll:y<=1});
  }
  _checkChatHeight(e,h){
    var {nativeEvent:{layout:{width,height}}} = e;
    // console.warn('2222222',width,height);

    var rectWidth=parseInt(width*2/7.0);
    var rectHeight=parseInt((height)*2/7.0);
    var paddTop=parseInt(rectHeight/2.0);
    var arrLinePoints=[
      {point0:{x:0,y:paddTop},              point1:{x:width,y:paddTop}},
      {point0:{x:0,y:paddTop+rectHeight},   point1:{x:width,y:paddTop+rectHeight}},
      {point0:{x:0,y:paddTop+rectHeight*2}, point1:{x:width,y:paddTop+rectHeight*2}},
      {point0:{x:rectWidth,y:paddTop},      point1:{x:rectWidth,y:height}},
      {point0:{x:rectWidth*2,y:paddTop},    point1:{x:rectWidth*2,y:height}},
      {point0:{x:rectWidth*3,y:paddTop},    point1:{x:rectWidth*3,y:height}},
    ];

    var rectGridWidth=rectWidth>rectHeight?rectHeight:rectWidth;
    var paddLeft=(rectWidth-rectGridWidth/2.0);
    var arrRoundStartPoints=[
      {x:paddLeft,y:0},
      {x:paddLeft+rectWidth,y:0},
      {x:paddLeft+rectWidth*2,y:0},

      {x:paddLeft,y:rectGridWidth},
      {x:paddLeft+rectWidth,y:rectGridWidth},
      {x:paddLeft+rectWidth*2,y:rectGridWidth},

      {x:paddLeft,y:rectGridWidth*2},
      {x:paddLeft+rectWidth,y:rectGridWidth*2},
      {x:paddLeft+rectWidth*2,y:rectGridWidth*2},
    ];
    this.setState({chatWidth:width,chatHeight:height-h,arrLinePoints:arrLinePoints,
      paddTopForGrid:paddTop,arrRoundStartPoints:arrRoundStartPoints,
      roundRectWidth:rectGridWidth,rectWidth,rectHeight,
    });
  }

  // <Animated.View style={[this._getIconWrapperStyles(),{width:160,height:160,}]}>
  //   <Surface
  //     style={{ backgroundColor:'gray',
  //       marginLeft:0,
  //       alignItems:'center',
  //       justifyContent:'center',}}
  //     width={160}
  //     height={160}
  //     >
  //     <Group
  //       scale={0.95}>
  //         <Shape
  //           fill={new LinearGradient({'0': '#6ed87bff', '0.85': '#6ed87b00'},"0","0","0","158")}
  //           d={`
  //             M79,163 C35.3695048,163 0,127.630495 0,84 C0,40.3695048 35.3695048,5 79,5 L79,7 C36.4740743,7 2,41.4740743 2,84 C2,126.525926 36.4740743,161 79,161 L79,163 Z
  //             `}
  //         />
  //         <Shape
  //           fill={'#6ed87b'}
  //           d={`
  //             M79,163 L79,161 C121.525926,161 156,126.525926 156,84 C156,41.4740743 121.525926,7 79,7 L79,5 C122.630495,5 158,40.3695048 158,84 C158,127.630495 122.630495,163 79,163 Z
  //             `}
  //         />
  //       <Shape d={path} stroke="#6ed87b" strokeWidth={2}/>
  //     </Group>
  //   </Surface>
  // </Animated.View>

  _getPointerColor(index){
    var r,g,b,
        r1,g1,b1,
        r2,g2,b2,
        t;

    if(index<=40){
            r1=POINT_0[0];
            r2=POINT_40[0];
            g1=POINT_0[1];
            g2=POINT_40[1];
            b1=POINT_0[2];
            b2=POINT_40[2];
            t=index/40
    }else{
            if(index<=80){
               r1=POINT_40[0];
               r2=POINT_80[0];
               g1=POINT_40[1];
               g2=POINT_80[1];
               b1=POINT_40[2];
               b2=POINT_80[2];
               t=(index-40)/40
            }else{
                    r1=POINT_80[0];
                    r2=POINT_100[0];
                    g1=POINT_80[1];
                    g2=POINT_100[1];
                    b1=POINT_80[2];
                    b2=POINT_100[2];
                    t=(index-80)/20
            }
    }

    r=parseInt(r1+t*(r2-r1));
    g=parseInt(g1+t*(g2-g1));
    b=parseInt(b1+t*(b2-b1));

    return `rgb(${r},${g},${b})`
  }
  _getTickHorizontalText()
  {
    return (
      <View style={{
          // flex:1,
          marginBottom:0,
          borderTopWidth:1,
          height:20,
          borderColor:'#ccc',
          // backgroundColor:'#1111',
          alignItems:'center',flexDirection:'row'}}>
          <View style={{flex:1,alignItems:'center'}}>
            <Text style={{fontSize:12,color:'#666'}}>
              {''}
            </Text>
          </View>
          <View style={{flex:2,alignItems:'center',
            // backgroundColor:'red'
            }}>
            <Text style={{fontSize:12,color:'#666'}}>
              {'低'}
            </Text>
          </View>
          <View style={{flex:2,alignItems:'center'}}>
            <Text style={{fontSize:12,color:'#666'}}>
              {'中等'}
            </Text>
          </View>
          <View style={{flex:2,alignItems:'center',
            // backgroundColor:'red'
            }}>
            <Text style={{fontSize:12,color:'#666'}}>
              {'紧急'}
            </Text>
          </View>
      </View>
    )
  }
  _getTickVerticalText()
  {
    var arrTextView=['危险','预警','健康'].map((item,index)=>{
      return (
        <View style={{flex:2,alignItems:'flex-start',
          paddingTop:6,
          }}>
          <Text style={{fontSize:12,color:'#666'}}>
            {item}
          </Text>
        </View>
      )
    })
    return (
      <View style={{position:'absolute',
        // backgroundColor:'#2222',
        width:this.state.chatWidth*2/7.0,height:this.state.paddTopForGrid*6,left:35,
        top:this.state.paddTopForGrid,}}>
        {arrTextView}
      </View>
    )
  }
  _getHorizonTitle()
  {
    return(
      <View style={{
      }}>
        <View style={{flex:1,}}>
        </View>
        <View style={{
            height:20,
            // backgroundColor:'red',
            marginBottom:10,
            justifyContent:'flex-end'}}>
            <View style={{height:20,justifyContent:'center'}}>
              <Text style={{fontSize:12,color:'#666',}}>
                {'紧急程度'}
              </Text>
            </View>
        </View>
      </View>
    );
  }
  _getVertialTitle()
  {
    return (
      <View style={{position:'absolute',top:11,left:17,alignItems:'center',}}>
        <Text style={{fontSize:12,color:'#666'}}>
          {'健康状况'}
        </Text>
      </View>
    )
  }
  _getFormatValue(value,unit,name)
  {
    var status=this.props.healthyDatas.get('Status');
    var isOfflineOrPause=status===2||status===3;
    if (isOfflineOrPause) {
      if (name==='LoadRateName'||name==='THDuName'||name==='PFName') {
        value=null;
      }
    }
    if (!value&&value!==0) {
      value='-';
      return value;
    }
    return value+unit;
  }
  _getItemsView(objTransfrom)
  {
    var arrTitles=[['电流','ElectricityName','ElectricityValue','ElectricityAlarmLevel','A','ElectricityId'],
                    ['负载率','LoadRateName','LoadRateValue','LoadRateAlarmLevel','%','LoadRateId'],
                    ['系统电压','VoltageName','VoltageValue','VoltageAlarmLevel','V','VoltageId'],
                    ['THDu','THDuName','THDuValue','THDuAlarmLevel','%','THDuId'],
                    ['功率因素','PFName','PFValue','PFAlarmLevel','','PFId'],
                    ['最高设备温度','TemperatureDeviceName','TemperatureValue','TemperatureAlarmLevel','℃','TemperatureIds'],
                  ];
    var {width} = Dimensions.get('window');
    var widthCard=(width-32)/6.0;
    var arrItemsView=arrTitles.map((item,index)=>{
      var iconColor='transparent';
      var textColor='#666666';
      var alarm=objTransfrom.get(item[3]);
      if (alarm===1) {
        iconColor='#68d3f1';
        textColor=iconColor;
      }else if (alarm===2) {
        iconColor='#fe9666';
        textColor=iconColor;
      }else if (alarm===3) {
        iconColor='#ff4d4d';
        textColor=iconColor;
      }
      if (!objTransfrom.get(item[5])||objTransfrom.get(item[5]).size===0) {
        return;
      }
      return (
        <View style={{width:widthCard,}}>
          <View style={{flexDirection:'row',flex:1,alignItems:'flex-start',paddingTop:16,
            // backgroundColor:'gray'
          }}>
            <View style={{justifyContent:'flex-end',paddingTop:1}}>
              <Text style={{fontSize:14,color:'#8e8e9c'}}>
                {item[0]}
              </Text>
            </View>

            <View style={{marginLeft:4,}}>
              <Icon type={'icon_over_due'} size={15} color={iconColor} />
            </View>
          </View>
          <View style={{flex:1,justifyContent:'flex-end',paddingBottom:16,
            paddingRight:3,
            // backgroundColor:'gray'
          }}>
            <Text style={{fontSize:18,color:textColor}} numberOfLines={1}>
              {this._getFormatValue(objTransfrom.get(item[2]),item[4],item[1])}
            </Text>
          </View>
        </View>
      )
    });
    return arrItemsView;
  }
  _getTransformerView()
  {
    var transData=this.props.dataTransformer;
    if (!transData) {
      return;
    }

    var arrViews=transData.map((item,index)=>{
      var lastSepe=(<ListSeperator marginWithLeft={16}/>);
      if (index!==transData.size-1) {
        lastSepe=null;
      }
      return (
        <View style={{}}>
          <ListSeperator marginWithLeft={16}/>
          <View style={{padding:16,paddingBottom:0,height:115}}>
              <View style={{flexDirection:'row',alignItems:'center'}}>
                <View style={{width:2,height:14,backgroundColor:'#03b679'}}>
                </View>
                <View style={{marginLeft:6,flex:1,}}>
                  <Text style={{fontSize:16,color:'black'}} numberOfLines={1}>{item.get('Name')}</Text>
                </View>
              </View>
              <View style={{flex:1,flexDirection:'row',}}>
                {this._getItemsView(item)}
              </View>
          </View>
          {lastSepe}
        </View>
      )
    })
    return (
      <View style={{flex:1,}}>
        {arrViews}
      </View>
    )
  }
  _getGradientView()
  {
    var valRisk=this.props.healthyDatas.get('RiskFactor');
    if (valRisk===0) {
      valRisk=0.01;
    }
    var strValue='0%';
    if (valRisk!==null) {
      strValue=`${100-valRisk-2.5}%`;
    }
    var status=this.props.healthyDatas.get('Status');
    var isOfflineOrPause=status===2||status===3;
    var colorArrow='#666';
    if (isOfflineOrPause) {
      colorArrow='transparent';
    }
    return (
      <View style={{
          paddingTop:0,paddingBottom:20,
          // backgroundColor:'#2222',
        height:this.state.contentHeight-30,
        flexDirection:'row'}}>
        <View style={{width:26,marginTop:this.state.paddTopForGrid,alignItems:'flex-end'}}>
          <View style={{width:8,flex:1,
            }}>
            <LineGradient colors={['#f82709','#ff8034','#bbdd2d','#4be38d',]}
              locations={[0,0.2,0.6,1.0]}
              style={styles.styLinearGradient}>
            </LineGradient>
          </View>
          <View style={{position:'absolute',top:strValue,
              // backgroundColor:'red'
          }}>
            <Icon type={'icon_healthy_indica'} size={18} color={colorArrow} />
          </View>
        </View>
      </View>
    )
  }
  _getRoundCheckView()
  {
    var valRisk=this.props.healthyDatas.get('RiskFactor');
    var color='red';
    var strRisk='';
    if (valRisk!==null) {
      if (valRisk<=40) {
        strRisk='系统整体健康';
      }else if (valRisk>40&&valRisk<81) {
        strRisk='系统发现潜在隐患';
      }else if (valRisk>=81) {
        strRisk='系统处于高风险';
      }
      color=this._getPointerColor(valRisk);
    }
    var status=this.props.healthyDatas.get('Status');
    var isOfflineOrPause=status===2||status===3;
    var viewRoundContent=(
      <View style={{
          width:158,height:158,
          zIndex:1,overflow:'hidden',
          // borderRadius:79,borderWidth:3,borderColor:'#6ed87b',
          marginTop:0,backgroundColor:'transparent'}}>
        <Text style={{fontSize:12,color:'#333',textAlign:'center',marginTop:37}}>
          {'系统风险指数'}
        </Text>
        <Text style={{fontSize:30,color:color,textAlign:'center',marginTop:7}}>
          {valRisk}
        </Text>
        <Text style={{fontSize:14,color:color,textAlign:'center',marginTop:7}}>
          {strRisk}
        </Text>
      </View>
    )
    if (isOfflineOrPause) {
      color='#c0c0c0';
      viewRoundContent=(
        <View style={{
            width:158,height:158,
            zIndex:1,overflow:'hidden',
            justifyContent:'center',alignItems:'center',
            flexDirection:'row',
            // borderRadius:79,borderWidth:3,borderColor:'#6ed87b',
            marginTop:0,backgroundColor:'transparent'}}>
          <Icon type={'icon_info'} size={14} color={'#c0c0c0'}/>
          <Text style={{marginLeft:4,fontSize:14,color:'#666',textAlign:'center',}}>
            {status===2?'诊断已全部暂停':'网关已全部离线'}
          </Text>
        </View>
      )
    }
    return (
      <View style={{
          width:158+18+18,height:158+18+18,
          justifyContent:'center',alignItems:'center'}}>
        <Animated.View style={[{
            // backgroundColor:'#1111',
            position:'absolute',
            width:158,height:158,
            alignItems:'center',justifyContent:'center',
            paddingTop:0,
            paddingBottom:Platform.OS==='ios'?0:5,
          },this._getIconWrapperStyles()]}>
          <View style={{marginTop:Platform.OS==='ios'?-10:0}}>
            <Icon type={'icon_round'} size={158} color={color}/>
          </View>
        </Animated.View>
        {viewRoundContent}
      </View>
    )
  }
  _getDevicesFromDatas(paramIndex,arrDatas)
  {
    var obje=null;
    var param=arrDatas[paramIndex];
    if(this.props.healthyDatas.get('Items')) {
      this.props.healthyDatas.get('Items').forEach((item, index) => {
        if (item.get('HealthLevel') === param.healthyLevel && item.get('EmergencyLevel') === param.emergenLevel) {
          obje = item;
          return false;
        }
      });
    }
    return obje;
  }
  _getCurrentMaxAndMinValuesFromDatas()
  {
    var maxValue=0;
    var minValue=0;
    if(this.props.healthyDatas.get('Items')) {
      this.props.healthyDatas.get('Items').forEach((item, index) => {
        var val = item.get('Count');
        if (val) {
          maxValue = maxValue > val ? maxValue : val;
          minValue = minValue < val ? minValue : val;
        }
      });
    }
    return {maxValue,minValue};
  }
  _getRaidusView(currRadius,roundMinRadius,roundMaxRadius,showCount,objDevices,color,showAnimation)
  {
    if (!objDevices) {
      return(
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <View style={{width:9,height:9,borderRadius:4.5,backgroundColor:'#e6e6e6'}}>
          </View>
        </View>
      )
    }
    var child=(
      <Text style={{fontSize:15,color:'white'}}>
        {showCount}
      </Text>
    );
    if (showAnimation) {
      return (
        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <WaveAnimatCircleView minRadius={currRadius} maxRadius={currRadius+10} child={child}/>
        </View>
      )
    }
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <View style={{width:currRadius*2,height:currRadius*2,backgroundColor:color,
          borderRadius:currRadius,justifyContent:'center',alignItems:'center'}}>
          {child}
        </View>
      </View>
    )
  }
  _getGridRectRoundView()
  {
    if (!this.state.arrRoundStartPoints) {
      return;
    }
    var arrDatas=[{emergenLevel:0,healthyLevel:2,color:'#fdb54c'},{emergenLevel:1,healthyLevel:2,color:'#fa664d',showAnimation:true},{emergenLevel:2,healthyLevel:2,color:'#fa664d',showAnimation:true},
                  {emergenLevel:0,healthyLevel:1,color:'#72e36e'},{emergenLevel:1,healthyLevel:1,color:'#fdb54c'},{emergenLevel:2,healthyLevel:1,color:'#fdb54c'},
                {emergenLevel:0,healthyLevel:0,color:'#72e36e'},{emergenLevel:1,healthyLevel:0,color:'#72e36e'},{emergenLevel:2,healthyLevel:0,color:'#72e36e'},];

    var status=this.props.healthyDatas.get('Status');
    var isOfflineOrPause=status===2||status===3;
    // console.warn('aaa',this.props.healthyDatas);
    var rects=this.state.arrRoundStartPoints.map((item,index)=>{
      // console.warn('3333',item,this.state.roundRectWidth,);
      var objDevices=this._getDevicesFromDatas(index,arrDatas);
      if (isOfflineOrPause) {
        objDevices=null;
      }
      var {maxValue,minValue}=this._getCurrentMaxAndMinValuesFromDatas();
      var color='transparent';
      // index+=1;
      color=`#11${index}${index}`;
      color=arrDatas[index].color;
      var showAnimation=arrDatas[index].showAnimation;
      var widthRound=this.state.roundRectWidth;
      var roundMaxRadius=widthRound/2.0-6;//3
      var roundMinRadius=12;
      var count=objDevices?objDevices.get('Count'):0;
      var showCount=count;
      if (count>999) {
        count=999;
        showCount='999+';
      }else if (count<99) {
        // count=99;
      }
      var currRadius=roundMinRadius+(roundMaxRadius-roundMinRadius)*count/((maxValue-minValue)*1.0);
      return (
        <View
          key={index}
          style={{
            position:'absolute',left:item.x,top:item.y,
            width:widthRound,height:widthRound,
            }}>
            <TouchFeedback enabled={!!objDevices} style={[{flex:1,}]} onPress={()=>{
                this.props.onRowClick(objDevices);
            }}>
              {this._getRaidusView(currRadius,roundMinRadius,roundMaxRadius,showCount,objDevices,color,showAnimation)}
            </TouchFeedback>
        </View>
      )
    })
    return (
      <View style={{
          // backgroundColor:'red',
        flexDirection:'row',flexWrap:'wrap',
        // zIndex:2,overflow:'hidden',
        // left:0,top:0,
        position:'absolute'
        }}
      >
        {rects}
      </View>
    )
  }
  _getNoDatasText()
  {
    var status=this.props.healthyDatas.get('Status');
    var isOfflineOrPause=status===2||status===3;
    if (!isOfflineOrPause) {
      return;
    }
    return (
      <View style={{
        position:'absolute',
        left:this.state.rectWidth,
        top:this.state.rectHeight*3/2.0,
        width:this.state.rectWidth*2,height:this.state.rectHeight,
        justifyContent:'center',alignItems:'center'
      }}>
        <View style={{
          flexDirection:'row',
          backgroundColor:'white',
          width:this.state.rectWidth*2,height:40,justifyContent:'center',alignItems:'center'
          }}>
          <Icon type={'icon_info'} size={14} color={'#c0c0c0'}/>
          <Text style={{marginLeft:4,fontSize:14,color:'#666',textAlign:'center'}}>
            {'设备健康状态暂停统计'}
          </Text>
        </View>
      </View>
    )
  }
  _getGridLines()
  {
    if (!this.state.arrLinePoints) {
      return;
    }
    var lines=this.state.arrLinePoints.map((item,index)=>{
      var p0=item.point0;
      var p1=item.point1;
      return (
        <Line
            x1={p0.x}
            y1={p0.y}
            x2={p1.x}
            y2={p1.y}
            stroke="#e6e6e6"
            strokeWidth="0.5"
            strokeDasharray={[4,2,]}
            strokeDashoffset={5}
        />
      )
    })
    return (
      <View style={{
          zIndex:0,overflow:'hidden'
        }}>
        <Svg
            height={`${this.state.chatHeight}`}
            width={`${this.state.chatWidth}`}
        >
          {lines}
        </Svg>
      </View>
    )
  }
  _getContentsView()
  {
    if (!this.props.healthyDatas||this.props.isFetching||this.props.stopAnimat) {
      return (
        <Loading />
      )
    }
    // console.warn('33333',LineGradient);
    // const path = new Path()
    //             .moveTo(76,158)
    //             .arc(0,8,4)
    //             .arc(0,-8,4)
    //             .close();
    var {width,height} = Dimensions.get('window');
    var arrowColor=this.state.enableArrowScroll?'#999':'transparent';
    // console.warn('3333',this.state.enableArrowScroll,arrowColor);
    return (
      <ScrollView style={{flex:1,}} onLayout={(e)=>{this._checkHeight(e)}}
        ref={(scroll)=>{
          this._scroll=scroll;
        }}
        onScroll={(e)=>this._onScroll(e)}
        >
        <View style={{}}>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',
            width:width,height:this.state.contentHeight-27}}
            >
            {this._getRoundCheckView()}

            <View style={{
                flex:1,
              marginLeft:0,marginRight:10,
              marginTop:10,marginBottom:0,
              flexDirection:'row',
              // backgroundColor:'#2222'
            }}>
              {this._getVertialTitle()}
              {this._getGradientView()}
              {this._getTickVerticalText()}
              <View style={{flex:1,
                  marginRight:8,
                  marginTop:0,
                }}>
                <View style={{
                    flex:1,
                    // backgroundColor:'#f001',
                    overflow:'hidden',
                  }} onLayout={(e)=>{
                    this._checkChatHeight(e,0)}
                }>
                  {
                    this._getGridLines()
                  }
                  {this._getGridRectRoundView()}
                </View>
                {this._getTickHorizontalText()}
                {this._getNoDatasText()}
              </View>
              {this._getHorizonTitle()}
            </View>
          </View>
          <TouchFeedback style={[{}]} onPress={()=>{
            if (this._scroll) {
              this._scroll.scrollTo({x:0,y:160,animated:true});
            }
          }}
          enabled={this.state.enableArrowScroll}>
            <View style={{height:27,alignItems:'center',justifyContent:'center',paddingTop:3,}}>
              <Icon type={'icon_arrow_down'} size={17} color={arrowColor} />
            </View>
          </TouchFeedback>
        </View>
        <View style={{flexDirection:'row',justifyContent:'center',
          width:width,
          // backgroundColor:'#2222'
        }}
          >
          {this._getTransformerView()}
        </View>
      </ScrollView>
    )
  }
  render() {
    // var {width,height} = Dimensions.get('window');
    // var height=
    return (
      <View style={{flex:1,backgroundColor:'white'}}>
        {this._getToolbar()}
        {this._getContentsView()}
      </View>
    );
  }
}

BuildingHealthyView.propTypes = {
  user:PropTypes.object,
  isFetching:PropTypes.bool,
  stopAnimat:PropTypes.bool,
  onRowClick:PropTypes.func.isRequired,
  onRefresh:PropTypes.func.isRequired,
  healthyDatas:PropTypes.object,
  onBack:PropTypes.func.isRequired,
  title:PropTypes.string.isRequired,
  startAnim:PropTypes.bool,
  dataTransformer:PropTypes.object,
}

var styles = StyleSheet.create({

    styLinearGradient: {
      flex: 1,
      borderRadius: 4,
      // backgroundColor:'red'
    },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    color: '#ffffff',
    backgroundColor: 'transparent',
  },
});
