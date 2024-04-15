import React, { Component } from "react";
import { ScrollView, View } from "react-native";
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
let arrChatDatas = [];
const LINE_HISTORY = "#464949";

class YLabel extends React.Component {
  render() {
    let { x, y, datum } = this.props;
    if (isNaN(datum)) {
      datum = '1';
    }
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

export default class MultiChartBar extends Component {

  constructor(props) {
    super(props);
    this.updateData(props);
  }

  updateData(props, type) {
    arrChatDatas = [];
    props.chatData.forEach((item, index) => {
      let subDatas = [];
      subDatas.push({ x: 0, y: 0 })
      item.datas.forEach((item2, index2) => {
        subDatas.push({ x: index2 + 1, y: item2.value })
      })
      subDatas.push({ x: item.datas.length + 1, y: 0 })
      arrChatDatas.push({ key: item.itemName, subDatas: subDatas });
    })

    const yAxisCount = 6;
    let tempData = [];
    for (let datum of props.chatData) {
      for (let item of datum.datas) {
        tempData.push(item.value);
      }
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
  //   if(preProps.arrChatDatas !== this.props.arrChatDatas){
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
    let N = 0;
    if (arrDatas) {
      N = arrDatas.length;
    }
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
          <VictoryGroup
            offset={8}
          >
            {
              arrChatDatas.map((item, index) => {
                return (
                  <VictoryBar
                    key={index}
                    data={item.subDatas}
                    barRatio={0.8}
                    style={{
                      data: {
                        fill: (datum) => {
                          return ['#fea45b', '#45a0ff', '#1cc26a', '#826CE6'][index];
                        }
                      },
                    }}
                  />
                )
              })
            }
          </VictoryGroup>
          <VictoryAxis
            tickValues={this.renderXAxisTickets(this.props.chatData[0].datas)}//{[1, 2, 3, 4, 5, 6, 7]}
            style={{
              axis: { stroke: '#818fa0', strokeWidth: 0.5 },
              ticks: { stroke: "#666", size: 5 },
              tickLabels: { fontSize: 12, fill: '#666', fontFamily: '' },
            }}
            standalone={true}
            tickFormat={(t) => {
              if (t > 0) {
                let item = this.props.chatData[0].datas[t - 1];
                if (item) {
                  return `${item.name}`;
                } else {
                  return 'aaa';
                }

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
{/* <MultiChartBar chatData={
  [
    {
      itemName: 'HCL', datas: [
        { name: '1月', value: 47 },
        { name: '2月', value: 2 },
        { name: '3月', value: 33 },
        { name: '4月', value: 47 },
        { name: '5月', value: 2 },
        { name: '6月', value: 33 },
      ]
    },
    {
      itemName: 'NaOH', datas: [
        { name: '1月', value: 47 },
        { name: '2月', value: 2 },
        { name: '3月', value: 33 },
        { name: '4月', value: 47 },
        { name: '5月', value: 2 },
        { name: '6月', value: 33 },
      ]
    },
    {
      itemName: 'NaDH', datas: [
        { name: '1月', value: 47 },
        { name: '2月', value: 2 },
        { name: '3月', value: 33 },
        { name: '4月', value: 47 },
        { name: '5月', value: 2 },
        { name: '6月', value: 33 },
      ]
    }
  ]
} /> */}
