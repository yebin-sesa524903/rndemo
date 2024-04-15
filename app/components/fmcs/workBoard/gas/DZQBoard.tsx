import React from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import {BarData, BarItem} from "../charts/Bar";
import {GasBoardChartType} from "../../../../containers/fmcs/workBoard/gasBoard/GasBoardHelper";
import {GasTableItem, GasTableProps} from "../charts/GasTable";

export interface DZQBoardProps {
  data?: {
    title?: string,
    chartType?: GasBoardChartType,
    subTitle?: string,
    data?: BarData[],
    headers?: string[],
    rows?: string[][],
  }[],
  onRefresh?: Function,
}

export function DZQBoard(props: DZQBoardProps) {
  const renderItem = (item: any) => {
    if (item.chartType == GasBoardChartType.bar) {
      return (
        <BarItem title={item.title}
                 subTitle={item.subTitle}
                 data={item.data}
                 multi={false}
                 barWidth={30}
                 height={325}
        />
      )
    } else if (item.chartType == GasBoardChartType.table) {
      return (
        <GasTableItem title={item.title}
                      headers={item.headers}
                      rows={item.rows}/>
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
