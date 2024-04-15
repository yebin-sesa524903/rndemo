import React,{Component} from "react";
import { ScrollView } from "react-native";
import {
	VictoryAxis,
	LineSegment,
	VictoryLabel,
	VictoryChart,
	VictoryScatter,VictoryGroup,VictoryLine,
	VictoryCursorContainer, VictoryBar,VictoryTooltip
} from "victory-native";

import Svg,{Text,Rect,Circle,Defs,LinearGradient,Stop,Pattern,Image} from "react-native-svg";
import moment from "moment";
const FULL_HOUR_FORMAT = 'YYYY年MM月DD日 HH:mm:ss';
const LONG_HOUR_FORMAT = 'MM月DD日 HH点mm分';
const SHORT_HOUR_FORMAT = 'HH点';
let data=[];
const LINE_HISTORY = "#464949";

class CustomerLabel extends React.Component {
	render() {
		const {x, y, datum} = this.props;
		const cat = moment(data[datum].time*1000).format(LONG_HOUR_FORMAT)//`2020-08-13 16:${this.props.onValue()}:45`;
		let chartWidth=this.props.onWidth()-90||0;
		let rectOffset=x-60;
		if(rectOffset<60-25) rectOffset=60-25;
		if(rectOffset>chartWidth-60) rectOffset=chartWidth-60;
		let offsetx=x-70;
		let achor='start';
		return ([
			<Rect key={'bg'} x={rectOffset} y={y+10-14} width="120" height="20" opacity={0.8} fill="black"/>,
			<Text key={'text'}
				fill="white"
				fontSize="12"
				x={rectOffset+5}
				y={y+10}
				textAnchor={achor}
			>{cat}</Text>
		]);
	}
}

class YLabel extends React.Component {
  render() {
    const {x, y, datum} = this.props;
    let cat = `${datum}`;
    let len = cat.length;
    let width = len * 8+3;
    if(width<12) width = 12;
    let achor='start';
    return ([
      <Rect key={'bg'} x={x-20} y={y-20/2} width={width} height="20" opacity={0.8} fill="black"/>,
      <Text key={'text'}
        fill="#fff"
        fontSize="12"
        x={x-16}
        y={y+4}
        textAnchor={achor}
      >{cat}</Text>
    ]);
  }
}

export default class AxisView extends Component{

	constructor(props) {
		super(props);
    data=[];
    this.props.data.forEach((d,index) => {
      data.push({
         x:index,
        y:d.Value,
        time:d.Time
      })
    });

    let filterHours = [2,8,14,20];
    let arr = filterHours.map(t => t * 4);
    this.state={
      xIndex:-1,
      arr
    };
	}

  renderCustomerYAxis(){
		if(this.state.xIndex>=0){
			let y=data[this.state.xIndex].y;
			if (y === null) return;
			return <VictoryAxis
				style={{
					axis:{stroke:'#00000000',strokeWidth:0.5},
					grid:{stroke:'#000',strokeWidth:1},
				}}
        tickLabelComponent={<YLabel/>}
				tickValues={[y]}
				dependentAxis
				crossAxis={true}
				standalone={true}
			/>
		}
		return null;
	}

	renderCustomerXAxis(){
		if(this.state.xIndex>=0){
			return <VictoryAxis
				tickCount={1}
				style={{
					axis:{stroke:'#00000000',strokeWidth:0.5},
          grid:{stroke:'#000',strokeWidth:1},
        }}
				tickLabelComponent={<CustomerLabel onWidth={()=>this._chartWidth} onValue={()=>this.state.xIndex}/>}
				tickValues={[this.state.xIndex]}
				standalone={true}
			/>
		}
		return null;
	}

  renderCrossAxis(){
    return <VictoryAxis
      tickCount={4}
      style={{
        axis:{stroke:'#00000000',strokeWidth:0.5},
        grid:{stroke:'#888888', strokeWidth:0.5,strokeDasharray:"3,3"},
        tickLabels: {fill: '#888888', fontSize: 12}
      }}
      tickFormat={(t) => {
        if(t<1) t=0;
        return `${t}`;
      }}
      tickValues={[20,40,60,80,100]}
      standalone={true}
      dependentAxis
      crossAxis={true}
    />
  }

  renderMainAxis(){
    return <VictoryAxis
      style={{
        axis:{stroke:'#888888',strokeWidth:1},
        ticks: {stroke: "#888", size: 5},
        tickLabels: {fontSize: 12, fill: '#888'}
      }}
      tickFormat={(t) => {
        let time = data[t].time * 1000;
        if(this.state.arr.indexOf(t) === 0) {
          return `${moment(time).format(LONG_HOUR_FORMAT)}`
        }
        return `${moment(time).format(SHORT_HOUR_FORMAT)}`
      }}
      tickValues={this.state.arr}
      standalone={true}
    />
  }

	render() {
		return (
				<VictoryChart domain={{y: [-4, 104]}} padding={{top: 4, bottom: 24, left: 28, right: 38}}
					containerComponent={
						<VictoryCursorContainer
							cursorDimension="x"
							cursorComponent={<VictoryLabel/>}
							onCursorChange={(value, props) => {
								if(value === null){
									this.setState({
										xIndex:-1
									})
									return
								}
								this._chartWidth=props.width;
								let index=Math.round(value);
								if(this.state.xIndex!==index){
									this.setState({
										xIndex:index
									})
								}
							}}
						/>
					}
				>

					<Defs>
						<LinearGradient id="Gradient1" x1="0%" x2="0%" y1="0%" y2="100%">
							<Stop offset="100%" stopColor="#4be38d"/>
							<Stop offset="66%" stopColor="#bbdd2d"/>
							<Stop offset="33%" stopColor="#ff8034"/>
              <Stop offset="0%" stopColor="#f82709"/>
						</LinearGradient>
					</Defs>
					<VictoryBar
						data={[{x:0,y:101}]}
            cornerRadius={3}
						style={{
							data:{
								fill:"url(#Gradient1)",
                width: 6
							}
						}}
					/>
					{/*<VictoryLine*/}
          {/*  style={{ data: { stroke: "#1890ff", strokeWidth: 2, strokeLinecap: "round" } }}*/}
					{/*	data={data}/>*/}
          <VictoryScatter data={data} size={2}
                          style={{ data: { fill: "#1890ff", strokeWidth: 2 } }}
          />
          {this.renderCrossAxis()}
          {this.renderMainAxis()}
          {this.renderCustomerXAxis()}
          {this.renderCustomerYAxis()}
          {this.state.xIndex >= 0 ?
            <VictoryScatter size={4}
              style={{data: {fill: "#3ba1ff"}, labels: {fill: "#3ba1ff"}}}
              data={[].concat(data[this.state.xIndex])}
            />
            : null
          }
				</VictoryChart>
		);
	}
}
