import React from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import {PieItem, PieLineObj} from "../charts/Pie";
import {ProgressInterface, ProgressItem} from "../charts/Progress";
import {GasBoardChartType} from "../../../../containers/fmcs/workBoard/gasBoard/GasBoardHelper";

export interface TQBoardProps {
  data?: {
    title?: string,
    chartType?: GasBoardChartType,
    data?: PieLineObj[] | ProgressInterface[],
    legendData?: {name: string, color: string}[],
    colorScale?: string[],
  }[],
  onRefresh?: Function,
}

export function TQBoard(props: TQBoardProps) {

  const renderItem = (item: any) => {
    if (item.chartType == GasBoardChartType.pie){
      return (
        <PieItem title={item.title}
                 subTitle={item.subTitle}
                 height={325}
                 data={item.data}
                 legendData={item.legendData}
                 colorScale={item.colorScale}
        />
      )
    }else if(item.chartType == GasBoardChartType.progress){
      return (
        <ProgressItem title={item.title} data={item.data}/>
      )
    }
    return <></>
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
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
