import React, { Component } from "react";
import { PanResponder, Text, View } from "react-native";
import moment from 'moment';
import { VictoryChart, VictoryCursorContainer, VictoryVoronoiContainer, VictoryLine, VictoryScatter, VictoryLabel, VictoryAxis } from "victory-native";
import Svg, { Rect, Circle, Defs, LinearGradient, Stop, Pattern, Image } from "react-native-svg";
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
const SHORT_HOUR_FORMAT = 'HH点';
export default class ChartTpCurve extends Component {

  constructor(props) {
    super(props);
    this.updateData();
  }

  updateData(type) {
    if (!this.props.data) {
      return;
    }
    data = [[], [], [], []]
    //最大温度值
    let maxTp = 0;
    data = this.props.data.map(d => {
      return d.ParameterData.map((item, index) => {
        if (item.Value > maxTp) maxTp = item.Value;
        return {
          x: index,
          y: item.Value,
          time: item.Time
        }
      });
    })
    maxTp = Number(maxTp);
    let tpIndexs = [];
    if (maxTp === 0) {
      tpIndexs = [0, 10];
    } else {
      let mod = maxTp % 5;
      let div = maxTp / 5;
      let divCount = 0;
      if (mod > 0) {
        divCount = (Math.floor(div) + 1)
      } else {
        divCount = Math.floor(div);
      }
      if (divCount <= 4) {
        maxTp = divCount * 5;
        for (let i = 0; i <= divCount; i++) {
          tpIndexs.push(i * 5);
        }
      } else {
        while ((divCount * 5) % 3 !== 0 && (divCount * 5) % 4 !== 0) {
          divCount++;
        }
        maxTp = divCount * 5;
        let zone = 0;
        if (maxTp % 3 === 0) {
          zone = maxTp / 3;
        } else {
          zone = maxTp / 4;
        }
        for (let i = 0; i * zone <= maxTp; i++) {
          tpIndexs.push(i * zone);
        }
      }
    }

    //处理时间显示
    let now = Date.now();
    let curHour = new Date().getHours();
    let hourTime = now - now % 3600000;
    hourTime = hourTime / 1000;
    //显示的小时 2，6，10，14，18，22
    let filterHours = [2, 6, 10, 14, 18, 22];
    let indexs = {};
    let arr = [];
    for (let i = 0; i < 24; i++) {
      let tempHour = curHour - i;
      if (tempHour < 0) tempHour = 24 + tempHour;
      if (filterHours.includes(tempHour)) {
        let key = hourTime - i * 3600;
        indexs[key] = key;
      }
    }
    data[0].forEach((d, index) => {
      if (indexs[d.time]) {
        arr.push(index)
      }
    });
    if (maxTp === 0) maxTp = 10;
    if (!type) {
      this.state = {
        index: -1,
        arr, maxTp, tpIndexs
      }
    } else {
      this.setState({
        index: -1,
        arr, maxTp, tpIndexs
      })
    }

  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.data !== this.props.data) {
  //     this.updateData(1);
  //   }
  // }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({}, () => {
        this.updateData(1);
      })

    }
  }

  renderTp() {
    let tp = [...this.props.monitorNames];
    let timeView = null;
    if (this.state.index >= 0) {
      data.forEach((c, i) => {
        let unit = this.props.units[i] || '';
        let value = c[this.state.index].y === null ? '' : c[this.state.index].y;
        let fvalue = value === '' ? '' : `:${value}${unit}`
        tp[i] = `${tp[i]}${fvalue}`
      });
      timeView = (
        <Text style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{`${moment(data[0][this.state.index].time * 1000).format(FULL_HOUR_FORMAT)}`}</Text>
      )
    }
    let length = data.length / 2 + data.length % 2;
    length = Number.parseInt(length);
    let rows = [];
    let singleItem = (text, color) => (
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: color, marginRight: 4 }} />
        <Text style={{ fontSize: 12, color: '#888' }}>{text}</Text>
      </View>
    );
    for (let i = 0; i < length; i++) {
      rows.push(
        <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
          {singleItem(tp[i * 2], curveColors[i * 2])}
          {(i * 2 + 1 >= data.length) ? null : singleItem(tp[i * 2 + 1], curveColors[i * 2 + 1])}
        </View>
      )
    }
    return (
      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        {/*{timeView}*/}
        {rows}
      </View>
    )
  }

  render() {
    // let top =0// this.state.index >= 0 ? -64 : -44;
    if (!this.props.data || !this.props.monitorNames) {
      return;
    }
    return (
      <View>
        {this.renderTp()}
        <View style={{ marginTop: 0, }}
          onMoveShouldSetResponder={() => {
            this.props.onMove();
            return false;
          }}>
          {this._renderChart2()}
        </View>

      </View>
    )
  }

  renderCurveDot() {
    let curves = data.map((c, index) => {
      return this.state.index >= 0 ?
        <VictoryScatter key={index} size={4}
          style={{ data: { fill: curveColors[index] }, labels: { fill: curveColors[index] } }}
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
          <VictoryLine key={'line:' + index}
            style={{ data: { stroke: curveColors[index] }, }}
            interpolation={'natural'} data={data[index]} />,
          <VictoryScatter key={'scatter:' + index} size={2}
            style={{ data: { fill: curveColors[index] } }}
            data={data[index]}
          />
        ]
      )
    })
    return curves;
  }

  _renderChart2() {
    return (
      <VictoryChart domain={{ y: [0, this.state.maxTp] }} padding={{ top: 4, bottom: 44, left: 58, right: 20 }}
        containerComponent={
          <VictoryCursorContainer
            cursorDimension="x"
            cursorComponent={<VictoryLabel />}
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
      </VictoryChart>
    )
  }

  renderCrossAxis() {
    return <VictoryAxis
      tickCount={4}
      style={{
        axis: { stroke: '#00000000', strokeWidth: 0.5 },
        grid: { stroke: grayColor, strokeWidth: 0.5, strokeDasharray: "3,3" },
        tickLabels: { fontSize: 12, fill: grayColor }
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

  renderMainAxis() {
    // let mydata = [0,4,7,9];
    return <VictoryAxis
      style={{
        axis: { stroke: grayColor, strokeWidth: 1 },
        ticks: { stroke: grayColor, size: 5 },
        tickLabels: { fontSize: 11, fill: grayColor }
      }}
      tickFormat={(t) => {
        let time = data[0][t].time * 1000;
        if (this.state.arr.indexOf(t) === 0) {
          return `${moment(time).format(LONG_HOUR_FORMAT)}`
        }
        return `${moment(time).format(SHORT_HOUR_FORMAT)}`
      }}
      tickValues={this.state.arr}

      standalone={false}
    />
  }

  renderCustomerXAxis() {
    if (this.state.index >= 0) {
      return <VictoryAxis
        tickCount={1}
        style={{
          axis: { stroke: '#00000000', strokeWidth: 0.5 },
          grid: { stroke: '#333333ff', strokeWidth: 1 },
        }}
        tickFormat={(t) => ''}
        tickValues={[this.state.index]}
        standalone={true}
      />
    }
    return null;
  }

}



