import React from "react";
import {FlatList, RefreshControl, StyleSheet, View} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import {FJWDItem, FJWDBoardData} from "./FJWDItem";
import {MachineBoardChartType} from "../../../../containers/fmcs/workBoard/mechanicalBoard/MachineBoardHelper";

export interface FJWDBoardProps {
  data?: FJWDBoardData[],
  onRefresh?: Function,
}

export function FJWDBoard(props: FJWDBoardProps) {

  const renderItem = (item: any) => {
    if (item.chartType == MachineBoardChartType.tempCard) {
      return (
        <FJWDItem
          title={item.title}
          subTitle={item.subTitle}
          height={429}
          {...item}
        />
      )
    }
    return <></>
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
                keyExtractor={(item, index) => ((item.title ?? '') + index)}
                refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
                  props.onRefresh && props.onRefresh();
                }}/>}
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
