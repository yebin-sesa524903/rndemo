import React, { Component } from "react";
import { ScrollView, View, } from "react-native";
import RNText from "../../../Text";
import { GREEN } from "../../../../styles/color";
import {
  VictoryAxis,
  LineSegment,
  VictoryLabel,
  VictoryChart,
  VictoryScatter, VictoryGroup,
  VictoryCursorContainer, VictoryBar, VictoryTooltip
} from "victory-native";
import Svg, { Text, Rect, Circle, Defs, LinearGradient, Stop, Pattern, Image } from "react-native-svg";

const warnRed = '#45a0ff'
let data = [];
const LINE_HISTORY = "#464949";

class YLabel extends React.Component {
  render() {
    const { x, y, datum } = this.props;
    let cat = `${datum}`;
    let len = cat.length;
    let width = len * 8 + 3;
    if (width < 12) width = 12;
    let achor = 'end';
    return ([
      <Text key={'text'}
        fill="#666"
        fontSize="12"
        x={x}
        y={y + 4}
        textAnchor={achor}
      >{cat}</Text>
    ]);
  }
}

export default class ChartBar extends Component {

  constructor(props) {
    super(props);
    this.updateData(props);
  }

  updateData(props, type) {
    data = [];
    data.push({ x: 0, y: 0 })
    this.props.chatData.forEach((item, index) => {
      data.push({ x: index + 1, y: item.value })
    })
    data.push({ x: this.props.chatData.length + 1, y: 0 })

    const yAxisCount = 6;
    let tempData = [];
    for (let datum of props.chatData) {
      tempData.push(datum.value);
    }
    let tempMaxX = Math.max(...tempData);
    let tempMinX = Math.min(...tempData);

    let maxX = (10 - tempMaxX % 10) + tempMaxX;
    let minX = tempMinX < 10 ? 0 : (tempMinX - tempMinX % 10);
    let space = (maxX - minX) / (yAxisCount - 1);
    let ticketValues = []
    for (let i = 0; i < yAxisCount; i++) {
      let dateStamp = (maxX - space * i);
      ticketValues.push(Math.floor(dateStamp));
    }
    ticketValues = ticketValues.reverse();

    // console.warn('-----------', ticketValues, yAxisCount);
    if (!type) {
      this.state = { yValues: ticketValues, max: tempMaxX + (tempMaxX) / 5, min: -(tempMaxX) / 5 };
    } else {
      this.setState({ yValues: ticketValues, max: tempMaxX + (tempMaxX) / 5, min: -(tempMaxX) / 5 });
    }
  }

  // componentDidUpdate(preProps) {
  //   if(preProps.data !== this.props.data){
  //     this.updateData(this.props,1);
  //     // setTimeout(()=>{
  //     //   this.updateData(this.props,1);
  //     // },10);
  //
  //   }
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chatData !== this.props.chatData) {
      this.updateData(nextProps, 1);
    }
  }

  renderCustomerYAxis() {
    return
  }
  renderXAxisTickets(arrDatas) {
    const N = arrDatas.length;
    return Array.from({ length: N }, (_, index) => index + 1);
  }
  render() {
    if (!this.props.chatData || this.props.chatData.length === 0) {
      return (
        <View style={{ flex: 1, height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' }}>
          <RNText style={{ fontSize: 14, color: '#000000a6' }}>暂无数据</RNText>
        </View>
      )
    }
    return (
      <ScrollView>
        <VictoryChart padding={{ left: 70, right: 40 }} maxDomain={{ y: this.state.max }} minDomain={{ y: this.state.min }}>
          <VictoryBar
            data={data}
            barRatio={0.8}
            style={{
              data: {
                fill: (datum) => {
                  return '#45a0ff';
                }
              },
              labels: {
                fill: ({ datum }) => '#666',
                fontFamily: '',
                fontSize: 12,
              }
            }}
          // labels={({ datum }) => datum.x < 1 || datum.x > this.props.chatData.length ? '' : datum.y > 0 ? `${datum.y}` : '0'}
          />
          <VictoryAxis
            tickValues={this.renderXAxisTickets(this.props.chatData)}//{[1, 2, 3, 4, 5, 6, 7]}
            style={{
              axis: { stroke: '#818fa0', strokeWidth: 0.5 },
              ticks: { stroke: "#666", size: 5 },
              tickLabels: { fontSize: 12, fill: '#666', fontFamily: '' },
            }}
            standalone={true}
            tickFormat={(t) => {
              if (t > 0) {
                return `${this.props.chatData[t - 1].name}`
              }
            }}
          />
          <VictoryAxis
            style={{
              axis: { stroke: '#0000', strokeWidth: 0.5, },
              grid: { stroke: '#3333', strokeWidth: 0.5, strokeDasharray: "3,5" },
            }}
            tickLabelComponent={<YLabel />}
            dependentAxis
            crossAxis={false}
          />
        </VictoryChart>
      </ScrollView>
    );
  }
}

//使用示例：
{/* <ChartBar chatData={
  [
    { name: 'OOS', value: 50 },
    { name: 'OOW', value: 92 },
    { name: 'OOC', value: 80 },
  ]
} /> */}

{/* <ChartBar chatData={
  [
    { name: '2.1', value: 50 },
    { name: '2.2', value: 92 },
    { name: '2.3', value: 80 },
    { name: '2.4', value: 2 },
    { name: '2.5', value: 80 },
    { name: '2.6', value: 33 },
    { name: '2.7', value: 80 },
  ]
} /> */}
