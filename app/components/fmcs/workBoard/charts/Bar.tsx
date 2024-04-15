import React from "react";
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryLegend,
  VictoryVoronoiContainer,
} from "victory-native";
import {screenWidth} from "../../../../utils/const/Consts";
import {LinearGradientHeader} from "../LinearGradientHeader";
import {FlatList, Pressable, Text, View} from "react-native";
import EmptyView from "../../../../utils/refreshList/EmptyView";

///柱状图
export interface BarItemProps extends BarProps {
  title?: string, ///标题
  subTitle?: string,
}

export interface BarProps {
  data?: BarData[], ///单个柱状图数据源
  multiData?: { itemName?: string, datas?: BarData[] }[],///多个柱状图数据源
  multi?: boolean,  ///是否为多个柱状图
  height?: number,
  barWidth?: number,  ///柱子宽度
}


export interface BarData {
  name?: string,
  value?: number,
  color?: string,
}

export function BarItem(props: BarItemProps) {
  return (
    <LinearGradientHeader title={props.title}
                          subTitle={props.subTitle}
                          content={
                            Bar({...props})
                          }/>
  )
}


export function Bar(props: BarProps) {
  /**
   * 单个柱状图 数据集合
   */
  const chartSingleData = React.useMemo(() => {
    let chartInfo = []
    if (props.data) {
      for (let datum of props.data) {
        chartInfo.push({
          x: datum.name,
          y: datum.value,
          color: datum.color || '#45A0FF'
        })
      }
    }
    return chartInfo;
  }, [props.data])

  /**
   * 多个柱子数据整合
   */
  const chartMultiData = React.useMemo(() => {
    let chartInfo = []
    if (props.multi) {
      if (props.multiData) {
        for (let datum of props.multiData) {
          let array1 = [];
          for (let barDatum of datum.datas!) {
            array1.push({
              x: barDatum.name,
              y: barDatum.value,
              color: barDatum.color
            })
          }
          chartInfo.push(array1);
        }
      }
    }
    return chartInfo;
  }, [props.multiData]);

  const configLegendData = React.useMemo(() => {
    let data = [];
    if (props.multiData) {
      for (const argument of props.multiData) {
        let color = '#ddd';
        if (argument.datas && argument.datas.length > 0) {
          color = argument.datas[0].color!;
        }
        data.push({
          name: argument.itemName,
          fill: color,
        })
      }
    }
    return data;
  }, [props.multiData])

  /**
   * 手动计算y轴等分坐标
   */
  const yAxisTicketsValue = React.useMemo(() => {
    const yAxisCount = 6;
    let yValues = [];
    if (props.multi) {
      for (let datum of chartMultiData) {
        for (let datumElement of datum) {
          yValues.push(datumElement.y!);
        }
      }
    } else {
      for (let datum of chartSingleData) {
        yValues.push(datum.y!);
      }
    }
    let maxValue = Math.max(...yValues);
    let minValue = Math.min(...yValues);

    let maxX = 0;
    let minX = 0;
    if (maxValue <= 1 && minValue >= 0) {
      maxX = 1;
      minX = 0;
    } else if (maxValue <= 0 && minValue >= -1) {
      maxX = 0;
      minX = -1;
    } else if (maxValue <= 1 && minValue >= -1) {
      maxX = 1;
      minX = -1;
    } else {
      if (maxValue > 0) {
        if (maxValue < 1000){
          maxX = (10 - maxValue % 10) + maxValue;
        }else {
          maxX = (1000 - maxValue % 1000) + maxValue;
        }
      } else {
        maxX = (maxValue - maxValue % 10);
      }
      if (minValue < 10 && minValue > 0) {
        minX = 0;
      } else {
        if (minValue < 1000){
          minX = (-10 - minValue % 10) + minValue;
        }else {
          minX = (-1000 - minValue % 1000) + minValue;
        }
      }
    }
    let space = (maxX - minX) / (yAxisCount - 1);

    let ticketValues = []
    for (let i = 0; i < yAxisCount; i++) {
      let dateStamp = Number((maxX - space * i).toFixed(1));
      ticketValues.push(dateStamp);
    }
    return ticketValues.reverse();
  }, [props.data]);

  /**
   * 纵轴
   */
  function renderCrossAxis() {
    return (
      <VictoryAxis
        key={Math.ceil(Math.random() * 10000)}
        style={{
          axis: {stroke: 'transparent', strokeWidth: 0.5},
          grid: {stroke: '#E8EAEE', strokeWidth: 0.5, strokeDasharray: "3,3"},
          ticks: {stroke: 'transparent', size: 5},
          tickLabels: {fill: '#666', fontSize: 12}
        }}
        tickCount={5}
        minDomain={yAxisTicketsValue[0]}
        tickValues={yAxisTicketsValue}
        standalone={true}
        dependentAxis={true}
        crossAxis={true}/>
    )
  }

  /**
   * 横轴
   */
  function renderMainAxis() {
    let ticketCount = props.multi ? chartMultiData.length : chartSingleData.length;
    if (ticketCount == 0) {
      ticketCount = 1;
    }
    return (
      <VictoryAxis
        style={{
          axis: {stroke: '#818FA0', opacity: 0.1, strokeWidth: 1},///控制主轴线宽度/颜色
          ticks: {stroke: '#D9D9D9', size: 4},///控制刻度长度/颜色
          grid: {stroke: 'transparent'},///相交轴 每条线 颜色/虚/实
          tickLabels: {fontSize: 10, fill: '#666'}///控制刻度字体大小/颜色
        }}
        tickCount={ticketCount}
        dependentAxis={false}
        standalone={true}
      />
    )
  }

  /**
   * 单个柱
   * @param data
   */
  function renderSingleBar(data: any, index?: number) {
    return (
      <VictoryBar
        key={index}

        barWidth={props.multi ? 6 : (props.barWidth || 16)}
        alignment={'middle'}
        style={{
          data: {
            fill: ({datum, index}) => {
              return datum.color;
            }
          }
        }}
        data={data}
      />
    )
  }

  /**
   * 多个柱
   */
  function renderMultiBar(multi: any) {
    let offset = 8;
    return (
      <VictoryGroup offset={offset}>
        {
          multi.map((datum: any, index: number) => {
            return (
              renderSingleBar(datum, index)
            )
          })
        }
      </VictoryGroup>
    )
  }

  function renderBarLegend() {
   return  (
      <View style={{paddingLeft: 25, paddingRight: 25}}>
        <FlatList data={configLegendData}
                  horizontal={false}
                  scrollEnabled={false}
                  numColumns={4}
                  keyExtractor={(item, index) => {
                    return item.name! + index;
                  }}
                  renderItem={(item) => {
                    let itemObj = item.item;
                    return (
                      <View style={{ flexDirection: "row", width: (screenWidth() - 20 - 25 * 2) * 0.25, marginBottom: 10, marginTop: 10, alignItems: 'center'}}>
                        <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: itemObj.fill }} />
                        <Text style={{
                          fontSize: 11,
                          color: '#333',
                          marginLeft: 5
                        }}>{itemObj.name}</Text>
                      </View>
                    )
                  }} />
      </View>
    )
  }

  if (props.data && props.data.length == 0){
    return (
      <View style={{height: 325}}>
        <EmptyView/>
      </View>
    )
  }
  return (
    <View style={{ backgroundColor: 'white' }}>
      {props.multi && renderBarLegend()}
      <VictoryChart padding={{left: 70, top: 30, right: 20, bottom: 40}}
                    maxDomain={{y: yAxisTicketsValue[yAxisTicketsValue.length - 1]}}
                    minDomain={{y: yAxisTicketsValue[0]}}
                    singleQuadrantDomainPadding={{x: false}}
                    domainPadding={props.multi ? 20 : 60}
                    width={screenWidth() - 30}
                    height={props.height || 259}>
        {renderCrossAxis()}
        {props.multi ? renderMultiBar(chartMultiData) : renderSingleBar(chartSingleData)}
        {renderMainAxis()}
      </VictoryChart>
    </View>

  )
}


