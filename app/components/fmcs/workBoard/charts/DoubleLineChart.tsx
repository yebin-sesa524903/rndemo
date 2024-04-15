import React from "react";
import {Dimensions, Text, View} from "react-native";
import {VictoryAxis, VictoryChart, VictoryLine, VictoryTheme} from "victory-native";
import moment from "moment/moment";
import Colors from "../../../../utils/const/Colors";

export interface DoubleLineChartProps{
  data: { x: number, y: number, fill: string, name: string}[][];
}

export function DoubleLineChart(props: DoubleLineChartProps) {

  const renderVictoryLegend = ()=>{
    return (
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center', }}>
        {
          props.data.map((datum, index)=>{
            if (datum && datum.length > 0){
              return (
                <View key={index}
                      style={{flexDirection:'row', alignItems:'center', marginLeft: index > 0 ? 25 : 0}}>
                  <View style={{width: 12, height: 4, backgroundColor: datum[0].fill}}/>
                  <Text style={{fontSize: 12, color: Colors.text.primary, marginLeft: 12}}>{datum[0].name}</Text>
                </View>
              )
            }
          })
        }
      </View>
    )
  }



  /**
   * x轴
   */
  function renderXAxis() {
    return (
      <VictoryAxis
        style={{
          axis: { stroke: 'gray', strokeWidth: 1 },///控制主轴线宽度/颜色
          ticks: { stroke: 'gray', size: 3 },///控制刻度长度/颜色
          grid: { stroke: 'transparent' },///相交轴 每条线 颜色/虚/实
          tickLabels: { fontSize: 12, fill: 'gray' }///控制刻度字体大小/颜色
        }}
        tickFormat={(t, index) => {
          return moment(t).format('MM.DD');
        }}
        // tickValues={xAxisTicketValues}
        dependentAxis={false}
        standalone={false}
      />
    )
  }


  /**
   * y坐标 刻度集合
   */
  const yAxisTicketValues = React.useMemo(() => {
    const yAxisCount = 3;
    let tempData = [];
    for (let datum of props.data) {
      for (let cureData of datum) {
        tempData.push(cureData.y);
      }
    }
    let tempMaxX = Math.max(...tempData);
    let tempMinX = Math.min(...tempData);

    let maxX = (10 - tempMaxX % 10) + tempMaxX;
    let minX = 0;
    if (tempMinX < 10 && tempMinX > 0){
      minX = 0;
    }else if (tempMinX < 0){
      minX = tempMinX;
    }else {
      minX = tempMinX - tempMinX % 10;
    }
    let space = (maxX - minX) / (yAxisCount - 1);
    let ticketValues = []
    for (let i = 0; i < yAxisCount; i++) {
      let dateStamp = (maxX - space * i);
      ticketValues.push(Math.floor(dateStamp));
    }
    return ticketValues.reverse();
  }, [props.data]);

  /**
   * y轴
   */
  function renderYAxis() {
    return (
      <VictoryAxis tickCount={4}
                   style={{
                     axis: { stroke: 'transparent', strokeWidth: 0.5 },
                     grid: { stroke: 'gray', strokeWidth: 0.5, strokeDasharray: "3,3" },
                     ticks: { stroke: 'transparent', size: 0 },
                     tickLabels: { fill: 'gray', fontSize: 12 }
                   }}
                   tickValues={yAxisTicketValues}
                   standalone={false}
                   dependentAxis={true}
                   crossAxis={false} />
    )
  }


  /**
   * 曲线
   */
  function renderChartLines() {
    return props.data.map((source, index) => {
      return <VictoryLine key={index + ((source && source.length > 0) ? source[0].name : '')}
                          style={{ data: { stroke: (source && source.length > 0) ? source[0].fill : 'white', }, }}
                          interpolation="monotoneX"
                          standalone={false}
                          data={source} />
    })
  }


  return (
    <View style={{ backgroundColor: 'white' }}>
      {renderVictoryLegend()}
      <VictoryChart padding={{ left: 52, right: 50, top: 16, bottom: 40 }}
                    height={200}
                    width={Dimensions.get('window').width}
                    theme={VictoryTheme.material}>
        {renderXAxis()}
        {renderYAxis()}
        {renderChartLines()}
      </VictoryChart>
    </View>

  )

}
