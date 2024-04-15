import React from "react";
import {FlatList, StyleSheet, View, Text, RefreshControl,} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import {LineCharts} from "../charts/LineCharts";
import {LinearGradientHeader} from "../LinearGradientHeader";
import {MachineBoardChartType} from "../../../../containers/fmcs/workBoard/mechanicalBoard/MachineBoardHelper";
import {CircleRoundProgress} from "../charts/CircleRoundProgress";
import {WaterBoardChartType} from "../../../../containers/fmcs/workBoard/waterBoard/WaterBoardHelper";


export interface PCWSystemProps {
  data?: PCWSystemData[],
  onRefresh?: Function,
}

export interface PCWSystemData {
  title?: string,///标题
  chartType?: MachineBoardChartType,///图表类型
  unit?: string,  ///单位
  value?: number, ///progress当前指示值
  data?: { x?: number, y?: number }[] ,///曲线数据源 /柱状图数据源
  rightRange?: { max: number, min: number },  ///曲线图正常范围(内控要求)

}

export default function PCWSystem(props: PCWSystemProps) {
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
    } else if (item.chartType == MachineBoardChartType.CircleRound) {
      return <CircleRoundProgress value={item.value} unit={item.unit}/>
    }
    return <></>
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
                contentContainerStyle={{paddingBottom: 20}}
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
