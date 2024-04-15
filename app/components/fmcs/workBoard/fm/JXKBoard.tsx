
import React from "react";
import {FlatList, RefreshControl, StyleSheet, Text, View} from "react-native";
import {isIndustryPad, screenHeight, screenWidth} from "../../../../utils/const/Consts";
import {FMChartLineType} from "../../../../containers/fmcs/workBoard/factoryBoard/FactoryBoardHelper";
import {LinearGradientHeader} from "../LinearGradientHeader";
import EmptyView from "../../../../utils/refreshList/EmptyView";
import InstrumentBoard from "../instrument";
import {BarItem} from "../charts/Bar";
import Colors from "../../../../utils/const/Colors";

export interface JXKBoardProps {
  data?: {
    title?: string,
    unit?: string,
    chartType?: FMChartLineType,
    data?: {
      name?: string,
      value?: number,
      colors?: string[],
      values?: number[],
      color?: string,
    }[],
  }[]

  onRefresh?: Function,
}

export function JXKBoard(props: JXKBoardProps) {
  const renderItem = (item: any) => {
    if (item.chartType == FMChartLineType.instrument) {
      return <LinearGradientHeader title={item.title}
                                   content={
                                     renderSkContent(item.data)
                                   }/>
    }else if(item.chartType == FMChartLineType.bar){
      return <BarItem title={item.title}
                      subTitle={item.unit}
                      data={item.data}
                      multi={false}
                      barWidth={30}
                      height={325}/>
    }
    return <></>
  }

  const renderSkContent = (data: any[])=>{
    if (data && data.length > 0){
      let width = (screenWidth() - 20 - 40) * 0.5 * 0.5;
      return (
        <View style={{flex: 1, flexDirection:'row', flexWrap:'wrap', backgroundColor: 'white' , justifyContent:'space-around'}}>
          {
            data.map((datum, index)=>{
              return (
                <View key={datum.name+index}
                      style={{alignItems: 'center'}}>
                  {renderProgressItem(datum.value!, width, datum.colors!, datum.values!, datum.color)}
                  <Text style={{
                    fontSize: 20,
                    color: Colors.text.primary,
                    position: 'absolute',
                    bottom: 15,
                    left: 0,
                    right: 0,
                    textAlign:'center',
                  }}>{datum.name}<Text style={{fontSize: 12, color: Colors.text.light}}>  {datum.unit}</Text></Text>
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

  function renderProgressItem(percentage: number, radius: number,  contentStrokeColors: string[], contentPercentValues: number[], color: string) {
    let degreeTextRadius = radius - 20;///刻度值的半径
    let strokeWidth = radius / 6.5;///进度条的宽度
    let needleRadius = degreeTextRadius - strokeWidth * 2;///指针半径
    return (
      <InstrumentBoard
        percentage={percentage}
        radius={radius}
        degreeTexts={['0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100']}
        degreeTextStartOffset={['4%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '0%', '-4%']}
        contentTextColor={color}
        degreeTextRadius={degreeTextRadius}
        needleRadius={needleRadius}
        animated={true}
        strokeWidth={strokeWidth}
        showSectionProgress={true}
        contentStrokeColors={contentStrokeColors}
        contentPercentValues={contentPercentValues}
      />
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
  container:{
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    width: screenWidth()
  }
})
