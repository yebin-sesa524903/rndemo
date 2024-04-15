import React from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {screenHeight, screenWidth} from "../../../../utils/const/Consts";
import { ElectricBoardChartType } from "../../../../containers/fmcs/workBoard/electricityBoard/ElectBoardHelper";
import EmptyView from "../../../../utils/refreshList/EmptyView";
import {ZJZTProgressItem} from "../electricity/ZJZTProgressItem";

export interface DKBoardBoardProps {
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
  onRefresh?: Function,
}

export function DKBoard(props: DKBoardBoardProps) {

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
                refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
                  props.onRefresh && props.onRefresh();
                }}/>}
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
