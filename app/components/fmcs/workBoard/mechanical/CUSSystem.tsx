import React from "react";
import {FlatList, Pressable, RefreshControl, StyleSheet, Text, View} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import {MultilineCharts} from "../charts/MultiLine";
import {MachineBoardChartType} from "../../../../containers/fmcs/workBoard/mechanicalBoard/MachineBoardHelper";

export interface CUSSystemProps {
  data?: CUSSystemData[],
  onRefresh?: Function,
}

export interface CUSSystemData {
  title?: string,///标题
  rightTitle?: string, ///右侧标题
  chartType: MachineBoardChartType,///标记图标类型
  legendData?: { title: string, value: string, valueColor: string }[],///头部标记位展示数据源
  data?: { x: number, y: number, fill: string, name: string, fillMark: string, }[][],
}

export function CUSSystem(props: CUSSystemProps) {
  const renderItem = (item: any) => {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: 4,
        overflow:'hidden',
        marginTop: 10,
      }}>
        <LinearGradient start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          height: 40,
                        }}
                        colors={['rgba(228, 235, 252, 0.89)', 'rgba(247, 251, 255, 0.74)']}>
          <Text style={{
            fontSize: 15,
            color: Colors.text.primary,
            fontWeight: 'bold',
            marginLeft: 15,
            marginTop: 6,
            marginBottom: 6,
          }} numberOfLines={1} lineBreakMode={"tail"}>{item.title}</Text>
          <Text style={{
            fontSize: 15,
            color: Colors.text.primary,
            marginRight: 15,
            fontWeight: 'bold',
          }}>{'供水温度: '}
            <Text style={{
              fontSize: 15,
              color: Colors.yellow.primary,
              fontWeight: 'bold',
            }}>{item.rightTitle}</Text>
          </Text>
        </LinearGradient>
        {item.chartType == MachineBoardChartType.multiLine && renderLegendContent(item.legendData)}
        <MultilineCharts data={item.data}/>
      </View>
    )
  }

  const renderLegendContent = (data: { title: string, value: string, valueColor: string }[]) => {
    let numColumns = 3;
    return (
      <View style={{
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 10,
        paddingTop: 10,
        flexWrap: 'wrap',
        flexDirection: 'row'
      }}>
        {
          data.map((datum, index) => {
            let itemObj = datum;
            let justifyContent: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly" | undefined;
            let width = (screenWidth() - 10 * 2 - 20 * 2) / numColumns;
            if (index == 0 || index % numColumns == 0) {
              justifyContent = 'flex-start';
            } else if (index == numColumns - 1 || index == numColumns * 2 - 1) {
              justifyContent = 'flex-end';
            } else {
              justifyContent = 'center';
            }

            return (
              <View key={index}
                    style={{
                      flexDirection: "row",
                      marginTop: 10,
                      alignItems: 'center',
                      width: width,
                      justifyContent: justifyContent
                    }}>
                <Text style={{fontSize: 12, color: Colors.text.primary}}>{itemObj.title}</Text>
                <Text style={{
                  fontSize: 12,
                  color: itemObj.valueColor,
                  marginLeft: 5
                }}>{itemObj.value}</Text>
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
