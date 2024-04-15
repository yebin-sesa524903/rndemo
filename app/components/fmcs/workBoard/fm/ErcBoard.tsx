import React from "react";
import {FMChartLineType} from "../../../../containers/fmcs/workBoard/factoryBoard/FactoryBoardHelper";
import {isEmptyString, screenHeight, screenWidth} from "../../../../utils/const/Consts";
import {LinearGradientHeader} from "../LinearGradientHeader";
import {DoubleLineChart} from "../charts/DoubleLineChart";
import {FlatList, RefreshControl, StyleSheet, Text, View} from "react-native";
import EmptyView from "../../../../utils/refreshList/EmptyView";
import Colors from "../../../../utils/const/Colors";
import {renderSvgRound} from "../charts/CircleRoundProgress";

export interface ErcBoardProps {
  data?: {
    title?: string,
    chartType?: FMChartLineType,
    data?: {
      value?: number,
      title?: string,
    }[],
    alarmCount?: string,///报警数
    isolationCount?: string,///侦测器数
    breakdownCount?: string,  ///故障数
  }[]

  onRefresh?: Function,
}

export function ErcBoard(props: ErcBoardProps) {
  const renderItem = (item: any) => {
    if (item.chartType == FMChartLineType.progress) {
      return <LinearGradientHeader title={item.title}
                                   content={
                                     <View style={{paddingBottom: 15}}>
                                       {renderErcContent(item.data)}
                                       {renderContent([
                                         {
                                           name: '报警数',
                                           value: item.alarmCount,
                                           color: '#ff0000',
                                         },
                                         {
                                           name: '故障数',
                                           value: item.breakdownCount,
                                           color: '#ffa510',
                                         },
                                         {
                                           name: '侦测器隔离数',
                                           value: item.isolationCount??'-',
                                           color: '#52b3ff',
                                         }
                                       ])}
                                     </View>
                                   }/>
    }
    return <></>
  }

  const renderErcContent = (data: {value?: number, title?: string}[])=>{
    if (data && data.length > 0){
      let width = (screenWidth() - 20 - 10) * 0.5;
      return (
        <View style={{flexDirection:'row', flexWrap:'wrap', backgroundColor: 'white' , justifyContent:'space-between'}}>
          {
            data.map((datum, index)=>{
              return (
                <View style={{paddingBottom: 10}}>
                  <View style={{}}>
                    {renderSvgRound(width, 200, datum.value! * 100, '#ffa363')}
                    <View style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      right: 0,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Text style={{fontSize: 20, color:Colors.text.primary}}>{(datum.value??0) * 100 + '%'}</Text>
                    </View>
                  </View>
                  <Text style={{fontSize: 16, color: Colors.text.primary, textAlign:'center', marginTop: -10}}>{datum.title}</Text>
                </View>
              )
            })
          }
        </View>
      )
    }else {
      return (
        <View style={{height: 200, alignItems:'center', justifyContent:'center'}}>
          <EmptyView/>
        </View>
      )
    }
  }

  const renderContent = (data: {name:string, value: string, color: string}[])=>{
    return (
      <View style={{flexDirection:'row', backgroundColor:'white', paddingBottom: 20, paddingTop:  40}}>
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
