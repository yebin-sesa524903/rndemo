import React from "react";
import {FlatList, StyleSheet, View, Text, RefreshControl,} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import {WaterBoardChartType} from "../../../../containers/fmcs/workBoard/waterBoard/WaterBoardHelper";
import ChartBar from "../charts/ChartBar";
import {LineCharts} from "../charts/LineCharts";
import {LinearGradientHeader} from "../LinearGradientHeader";
import MultiChartBar from "../charts/MultiChartBar";
import {Bar} from "../charts/Bar";


export interface WaterBoardProps {
  data?: WaterBoardData[],
  onRefresh?: Function,
}

export interface WaterBoardData {
  title?: string,///标题
  chartType?: WaterBoardChartType,///图表类型
  unit?: string,  ///单位
  data?: { x?: number, y?: number }[] | { name: string, value: number }[] | { itemName: string, datas: { name: string, value: number }[] }[],///曲线数据源 /柱状图数据源
  rightRange?: { max: number, min: number },  ///曲线图正常范围(内控要求)
}

export default function WaterBoardComponent(props: WaterBoardProps) {
  const renderItem = (item: any) => {
    return (
      <LinearGradientHeader title={item.title}
                            subTitle={item.unit}
                            content={
                              renderSingleItem(item)
                            }/>
    )
  }

  const renderSingleItem = (item: any) => {
    if (item.chartType == WaterBoardChartType.chartLine) {
      if (!item.data || item.data.length === 0) {
        return (
          <View
            style={{flex: 1, height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7'}}>
            <Text style={{fontSize: 14, color: '#000000a6'}}>暂无数据</Text>
          </View>
        )
      }
      return (
        <LineCharts data={item.data}
                    onTouch={() => {
                    }}
                    title={item.title}
                    unit={item.unit}
                    range={item.rightRange}/>
      )
    } else if (item.chartType == WaterBoardChartType.multiBar) {
      return <Bar multi={true} multiData={item.data}/>
    } else if (item.chartType == WaterBoardChartType.singleBar) {
      return <Bar multi={false} data={item.data}/>
    }
    return <></>
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
                refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
                  props.onRefresh && props.onRefresh();
                }}/>}
                keyExtractor={(item, index) => ((item.title ?? '') + index)}
                renderItem={(item) => renderItem(item.item)}/>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    width: screenWidth(),
    flex: 1,
  },
})
