import React from "react";
import {FlatList, RefreshControl, StyleSheet, Text, View} from "react-native";
import {isEmptyString, screenHeight, screenWidth} from "../../../../utils/const/Consts";
import EmptyView from "../../../../utils/refreshList/EmptyView";
import {FMChartLineType} from "../../../../containers/fmcs/workBoard/factoryBoard/FactoryBoardHelper";
import {LinearGradientHeader} from "../LinearGradientHeader";
import {DoubleLineChart} from "../charts/DoubleLineChart";
import Colors from "../../../../utils/const/Colors";

export interface QHKBoardProps {
  data?: {
    title?: string,
    unit?: string,
    chartType?: FMChartLineType,
    data?: {
      x: string,
      y: number,
      name: string,
      fill: string,
    }[],
  }[]

  onRefresh?: Function,
}

export function QHKBoard(props: QHKBoardProps) {

  const renderItem = (item: any) => {
    if (item.chartType == FMChartLineType.doubleChartLine) {
      let subTitle = (isEmptyString(item.unit) ? ' ' : (`(供应量  单位:${item.unit})`));
      return <LinearGradientHeader title={item.title}
                                   subTitle={subTitle}
                                   content={
                                     renderGasContent(item.data)
                                   }/>
    } else if (item.chartType == FMChartLineType.GMS) {
      return <LinearGradientHeader title={item.title}
                                   content={
                                     renderGMSContent(item.data)
                                   }/>
    }
    return <></>
  }

  const renderGasContent = (data: any)=>{
    if (data && data.length > 0){
      return (<DoubleLineChart data={data}/>)
    }else {
      return (
        <View style={{height: 200, alignItems:'center', justifyContent:'center'}}>
          <EmptyView/>
        </View>
      )
    }
  }

  const renderGMSContent = (data: {name:string, value: string, color: string}[])=>{
    return (
      <View style={{flexDirection:'row', backgroundColor:'white', paddingBottom: 20, paddingTop:  20}}>
        {
          data.map((value, index, array)=>{
            return (
              <View key={index}
                    style={{alignItems:'center', justifyContent:'center', flex: 1}}>
                <Text style={{fontSize: 24, color: value.color}}>{value.value}</Text>
                <Text style={{fontSize: 16, color: Colors.text.primary, marginTop: 8}}>{value.name}</Text>
              </View>
            )
          })
        }
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList data={props.data}
                contentContainerStyle={{paddingBottom: 25}}
                keyExtractor={(item, index) => ((item.title ?? '') + index)}
                refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
                  props.onRefresh && props.onRefresh();
                }}/>}
                ListEmptyComponent={
                  <View style={{
                    height: screenHeight() - 64 - 40 - 44 - 20,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EmptyView/>
                  </View>
                }
                renderItem={(item) => renderItem(item.item)}/>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor:Colors.background.primary,
    width: screenWidth(),
    flex: 1,
  },
})

