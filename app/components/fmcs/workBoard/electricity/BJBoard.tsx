import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { screenWidth } from "../../../../utils/const/Consts";
import { BarData, BarItem } from "../charts/Bar";
import { ElectricBoardChartType } from "../../../../containers/fmcs/workBoard/electricityBoard/ElectBoardHelper";
import { GasTableItem, GasTableProps } from "../charts/GasTable";

export interface BJBoardProps {
  data?: {
    title?: string,
    chartType?: ElectricBoardChartType,
    subTitle?: string,
    data?: BarData[],
    headers?: string[],
    rows?: string[][],
    leftRow?: { title: string, count: number }[],
    rightRow?: string[][],
  }[],
}

export function BJBoard(props: BJBoardProps) {
  const renderItem=(item: any) => {
    if (item.chartType==ElectricBoardChartType.table) {
      return (
        <GasTableItem title={item.title}
          headers={item.headers}
          leftRow={item.leftRow}
          rightRow={item.rightRow}
          rows={item.rows} />
      )
    }
    return <></>
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data} keyExtractor={(item, index) => ((item.title??'')+index)}
        renderItem={(item) => renderItem(item.item)} />
    </View>
  )
}


const styles=StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    width: screenWidth(),
    flex: 1,
  },
})
