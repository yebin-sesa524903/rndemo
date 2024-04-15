import React, {Component} from "react";
import {Dimensions, PanResponder, Platform, ScrollView, Text, View} from "react-native";
import moment from 'moment';
import {
  VictoryChart,
  VictoryCursorContainer,
  VictoryVoronoiContainer,
  VictoryLine,
  VictoryScatter,
  VictoryLabel,
  VictoryAxis
} from "victory-native";
import Loading from '../Loading';
import {isPhoneX} from "../../utils";

const LINE_HISTORY = "#464949";
const grayColor = '#88888888'
let data = []
const curveColors = [
  '#4ECC74',
  '#3BA1FF',
  '#37CCCC',
  '#FBD438',
  '#F3647C',
  '#6DC8EC',
  '#9270CA',
  '#FF9D4D',
  '#269A99',
  '#FF99C3']//['#4ecc74','#3ba1ff','#37cccc','#fbd438'];
const FULL_HOUR_FORMAT = 'YYYY年MM月DD日 HH:mm:ss';
const LONG_HOUR_FORMAT = 'MM月DD日HH点';
const SHORT_HOUR_FORMAT = 'DD日HH点';
const TIME_SHORT_FORMAT = 'HH:mm';
const TIME_LONG_FORMAT = 'DD日HH点';
export default class ChartBusHistoryCurve extends Component {

  constructor(props) {
    super(props);
    this.state={index:-1}
    this.updateData(this.props);
  }

  updateData(props,type) {
    //最大温度值
    if(props.isFetching || !props.data || props.data.size ===0) {
      return;
    }
    let maxTp = 0;
    this._maxTps=[];
    data = props.data.map((d,curveIndex) => {
      let tmp = {
        x:-1,y:0
      };
      return d.map((item,index) => {
        if (item.get('Value') > maxTp) maxTp = item.get('Value');
        if (item.get('Value') > tmp.y) {
          tmp.y = item.get('Value');
          tmp.x=index
        }
        this._maxTps[curveIndex] = tmp;
        return {
          x:index,
          y:item.get('Value'),
          time:item.get('Time')
        }
      });
    }).toJS();
    maxTp = Number(maxTp);
    let tpIndexs = [];
    if (maxTp === 0) {
      tpIndexs = [0,10];
    } else {
      let mod = maxTp % 5 ;
      let div = maxTp / 5;
      let divCount = 0;
      if(mod>0) {
        divCount = (Math.floor(div) + 1)
      } else {
        divCount = Math.floor(div);
      }
      if (divCount <= 4) {
        maxTp = divCount * 5;
        for(let i = 0; i <= divCount; i++) {
          tpIndexs.push(i*5);
        }
      } else {
        while((divCount * 5) % 3 !== 0 && (divCount * 5) % 4 !== 0) {
          divCount ++;
        }
        maxTp = divCount * 5;
        let zone = 0;
        if (maxTp % 3 === 0) {
          zone = maxTp / 3;
        } else {
          zone = maxTp / 4;
        }
        for (let i=0; i* zone <= maxTp; i++) {
          tpIndexs.push(i*zone);
        }
      }
    }

    let arr = [];
    let steps = 12;
    if(props.step ===0) {
      steps = 1;
    }
    for(let i=0;i<data[0].length;i=(i + steps)) {
      arr.push(i);
    }
    if(maxTp === 0) maxTp = 10;
    if(!type) {
      this.state = {
        index: -1,
        arr,maxTp,tpIndexs
      }
    } else {
      this.setState({
        index: -1,
        arr,maxTp,tpIndexs
      })
    }

  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.data !== this.props.data) {
  //     this.updateData(1);
  //   }
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data && nextProps.data) {
      this.updateData(nextProps,1)
      // this.setState({arr:[],index: -1},()=>{
      //   this.updateData(1);
      // })

    }
  }

  renderTp() {
    let tp = [];
    // let timeView = null;
    data.forEach((c,i) => {
      let unit = this.props.busTemp[i].unit || '';
      let value = this.state.index < 0 ? '' : c[this.state.index].y===null?'':c[this.state.index].y;
      let fvalue = value === '' ? '' : `:${value}${unit}`
      tp[i] = `${this.props.busTemp[i].deviceName}${fvalue}`
    });
    // timeView = (
    //   <Text style={{fontSize:12, color:'#888',marginBottom: 10}}>{`${moment(data[0][this.state.index].time*1000).format(FULL_HOUR_FORMAT)}`}</Text>
    // )
    let length = data.length / 2 + data.length % 2;
    length = Number.parseInt(length);
    let rows = [];
    let singleItem = (text,color) => (
      <View Key={text} style={{flexDirection: 'row', alignItems: 'center',marginRight:16,marginVertical:5}}>
        <View style={{height: 6, width: 6, borderRadius: 3, backgroundColor: color, marginRight: 4}}/>
        <Text style={{fontSize: 12, color: '#888'}}>{text}</Text>
      </View>
    );
    for(let i = 0; i < tp.length; i++) {
      // rows.push(
      //   <View key={i} style={{flexDirection: 'row', marginBottom: 8}}>
      //     {singleItem(tp[i*2], curveColors[i*2])}
      //     {(i*2+1 >= data.length) ? null : singleItem(tp[i*2+1], curveColors[i*2+1])}
      //   </View>
      // )
      rows.push(singleItem(tp[i], curveColors[i]))
    }
    return (
      <View style={{padding: 16, backgroundColor:'#fff',flexDirection:'row',flexWrap:'wrap'}}>
        {/*{timeView}*/}
        {rows}
      </View>
    )
  }

  render() {
    if(this.props.isFetching) return <Loading/>
    if(!this.props.data || this.props.data.size === 0 || data.length ===0) {
      return (
        <View style={{justifyContent:'center',alignItems:'center'}}>
          <Text style={{fontSize:14, color:'#333'}}>暂无数据</Text>
        </View>
      )
    }
    return (
      <ScrollView showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}
                  style={{flex:1,paddingBottom: isPhoneX()? 34: 0}}>
        <View>
          {this.renderTp()}
          <View>
          {this._renderChart2()}
          </View>
        </View>
      </ScrollView>
    )
  }

  renderCurveDot() {
    let curves = data.map((c, index) => {
      return this.state.index >= 0 ?
        <VictoryScatter key={index} size={4}
          style={{data: {fill: curveColors[index]}, labels: {fill: curveColors[index]}}}
          data={[].concat(data[index][this.state.index])}
        />
        : null
    });
    return curves;
  }

  renderCurve() {
    let curves = data.map((c, index) => {
      return (
        [
          <VictoryLine key={'line:'+index}
                       style={{data: {stroke: curveColors[index]},}}
                       interpolation={'natural'} data={data[index]}/>,
          <VictoryScatter key={'scatter:'+index} size={2}
                          style={{data: {fill: curveColors[index]}, labels:{fill:curveColors[index]}}}
                          data={data[index]}
          />
        ]
      )
    })
    return curves;
  }

  _renderMaxDot() {
    let arr = this._maxTps.map((dot,index) => {
      if(dot.x < 0) return null;
      return (
        <VictoryScatter key={'maxDot:'+index} size={2}
                        style={{data: {fill: curveColors[index]}, labels:{fill:curveColors[index]}}}
          labels={data=>{
            return `${dot.y}`;
          }}
          labelComponent={<VictoryLabel dy={0}/>}
          data={[dot]}
        />
      );
    });

    return arr;
  }

  _renderChart2() {
    let {width,height} = Dimensions.get('window');
    let bottom=40;
    return (
      <VictoryChart domain={{y: [0, this.state.maxTp+20]}}
        width={width>height?width:height}
        height={200}
        padding={{left:50,right:50,top:10,bottom:bottom}}
        containerComponent={
          <VictoryCursorContainer
            cursorDimension="x"
            cursorComponent={<VictoryLabel/>}
            onCursorChange={(value, props) => {
              if (value === null) {
                this.setState({
                  index: -1
                })
                return
              }
              let index = Math.round(value);
              if (this.state.index !== index) {
                this.setState({
                  index
                })
              }
            }}
          />
        }
      >
        {this.renderCurveDot()}
        {this.renderCurve()}
        {this.renderCustomerXAxis()}
        {this.renderCrossAxis()}
        {this.renderMainAxis()}
        {this._renderMaxDot()}
      </VictoryChart>
    )
  }

  renderCrossAxis(){
    return <VictoryAxis
      tickCount={4}
      style={{
        axis:{stroke:'#00000000',strokeWidth:0.5},
        grid:{stroke:grayColor,strokeWidth:0.5,strokeDasharray:"3,3"},
        tickLabels: {fontSize: 12, fill: grayColor}
      }}
      tickFormat={(t) => {
        return `${t}℃`;
      }}
      tickValues={this.state.tpIndexs}
      standalone={true}
      dependentAxis
      crossAxis={true}
    />
  }

  renderMainAxis(){
    return <VictoryAxis
      style={{
        axis:{stroke:grayColor,strokeWidth:1},
        ticks: {stroke: grayColor, size: 5},
        tickLabels: {fontSize: 11, fill: grayColor}
      }}
      tickFormat={(t) => {
        if(t >= data[0].length) return '';
        let time = data[0][t].time * 1000;
        time = time + new Date().getTimezoneOffset() * 60000;
        let hour = new Date(time).getHours();
        let show = hour % 6 === 0;
        if(this.props.isTime) show = true;
        if (!show) return '';
        if(t === 0 || t === data[0].length -1) {
          return `${moment(time).format(this.props.isTime?TIME_LONG_FORMAT:LONG_HOUR_FORMAT)}`
        }
        return `${moment(time).format(this.props.isTime?TIME_SHORT_FORMAT:SHORT_HOUR_FORMAT)}`
      }}
      tickValues={this.state.arr}

      standalone={false}
    />
  }

  renderCustomerXAxis(){
    if(this.state.index>=0){
      return <VictoryAxis
        tickCount={1}
        style={{
          axis:{stroke:'#00000000',strokeWidth:0.5},
          grid:{stroke:'#333333ff',strokeWidth:1},
        }}
        tickFormat={(t) => ''}
        tickValues={[this.state.index]}
        standalone={true}
      />
    }
    return null;
  }

}
