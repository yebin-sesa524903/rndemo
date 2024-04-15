import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {screenHeight, screenWidth} from "../../../../utils/const/Consts";
import { ZJZTProgressItem, } from "./ZJZTProgressItem";
import { ProgressInterface, ProgressItem } from "../charts/Progress";
import { ElectricBoardChartType } from "../../../../containers/fmcs/workBoard/electricityBoard/ElectBoardHelper";
import EmptyView from "../../../../utils/refreshList/EmptyView";

export interface ZJZTBoardProps {
  data?: {
    title?: string,
    chartType?: string,
    totalPower?: string,
    status?: string,
    temp?: string,
    frequency?: string,
    electricity?: string,
    voltage?: string,
    voltageMin?: string,
    voltageMax?: string,
  }[],
}

export function ZJZTBoard(props: ZJZTBoardProps) {

  const renderItem=(item: any) => {
    if (item.chartType==ElectricBoardChartType.semiCircleProgress) {
      return (
        <ZJZTProgressItem
          title={item.title}
          subTitle={item.subTitle}
          height={325}
          {...item}
        />
      )
    }
    return <></>
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
                keyExtractor={(item, index) => ((item.title??'')+index)}
                ListEmptyComponent={
                  <View style={{height: screenHeight() - 64 - 40 - 44 - 20, alignItems:'center', justifyContent:'center'}}>
                    <EmptyView/>
                  </View>
                }
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
