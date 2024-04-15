import React,{Component} from "react";
import { ScrollView } from "react-native";
import {GREEN} from '../../styles/color';
import {
	VictoryAxis,
	LineSegment,
	VictoryLabel,
	VictoryChart,
	VictoryScatter,VictoryGroup,
	VictoryCursorContainer, VictoryBar,VictoryTooltip
} from "victory-native";
const warnRed = '#ff4d4d'
let data=[];
const LINE_HISTORY = "#464949";
const xLables=['',['A相电流','最大需量'],['B相电流','最大需量'],['C相电流','最大需量']];

export default class AxisView extends Component{

	constructor(props) {
		super(props);
		// this.state={};
    this.updateData(props);
	}

	updateData(props,type) {
    data=[];
    data.push({x:0,y:0})
    data.push({x:1,y:props.data[1]})
    data.push({x:2,y:props.data[2]})
    data.push({x:3,y:props.data[3]})
    data.push({x:4,y:0})
    //计算图片显示最大值最小值区域
    let indicator = this.props.data[0];
    let max = this.props.max;
    let min = this.props.min;
    if (max === 0 && min === 0) {
      this.state={max:10,min:-2};
      return;
    }
    if(!type){
      this.state={max: max+(max)/5,min: -(max)/5}
    } else {
      this.setState({max: max+(max)/5,min: -(max)/5})
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
    if(nextProps.data !== this.props.data){
      this.updateData(nextProps,1);
    }
  }

  render() {
		return (
			<ScrollView>
				<VictoryChart padding={{left:76,right:40}} maxDomain={{y:this.state.max}} minDomain={{y:this.state.min}}>
					<VictoryBar
						data={data}
            barRatio={0.8}
						style={{
							data: {
								fill: (datum) => {
								  //这里应该根据参考值判断，比参考值小的一个颜色，大的另外一个颜色
                  return data[datum.index].y >= this.props.data[0] ? warnRed : GREEN;
								}
							},
              labels: {
							  fill: ({datum}) => '#888888'
              }
						}}
            labels={({datum})=>  datum.x <1 || datum.x >3 ? '' : datum.y > 0 ? `${datum.y}A` : '0A'}
					/>
					<VictoryAxis
						tickValues={[1,2,3]}
            style={{
              axis:{stroke:'#88888888',strokeWidth:1},
              ticks: {stroke: "#88888888", size: 5},
              tickLabels: {fontSize: 12, fill: '#888888'}
            }}
            // standalone={true}
						tickFormat={(t) => {
						  if (t > 0) {
						    return `${xLables[t][0]}\n${xLables[t][1]}`
              }
						  return ''
						}}
					/>
					<VictoryAxis
						style={{
							axis:{stroke:'#00000000',strokeWidth:0.5},
							grid:{stroke:LINE_HISTORY,strokeWidth:0.5,strokeDasharray:"3,5"},
							tickLabels:{fontSize:14,fill:warnRed,fontFamily:''},
						}}
						tickFormat={(t) => {
						  //实际的参考值
							return `Ir=${this.props.data[0]}A`;
						}}
						tickValues={[this.props.data[0]]}
						dependentAxis
						crossAxis={true}
						standalone={true}
					/>
				</VictoryChart>
			</ScrollView>
		);
	}
}

