import React from "react";
import {FlatList, Text, View} from "react-native";
import {VictoryPie, VictoryTooltip} from "victory-native";
import Colors from "../../../../utils/const/Colors";
import {screenWidth} from "../../../../utils/const/Consts";
import {LinearGradientHeader} from "../LinearGradientHeader";


const headerTitleHeight = 40;
const bottomLegendHeight = 60;

///饼图
export interface PieItemProps {
  title?: string, ///标题
  subTitle?: string,  ///副标题
  height?: number, ///高
  data?: PieLineObj[],///饼图的数据
  legendData?: { name: string, color: string }[],///底部标注的数据集合
  colorScale?: string[],///饼图颜色集合
}

export interface PieLineObj {
  y?: number,
  label?: string, ///标题
}

export function PieItem(props: PieItemProps) {
  return (
    <LinearGradientHeader title={props.title}
                          subTitle={props.subTitle}
                          content={
                            Pie((props.height ?? 500) - headerTitleHeight, props.data, props.colorScale, props.legendData)
                          }/>
  )
}

function Pie(height: number, data?: PieLineObj[], colorScale?: string[], legendInfo?: { name: string, color: string }[]) {
  const renderLegend = () => {
    return (
      <FlatList data={legendInfo}
                numColumns={4}
                renderItem={(item) => {
                  let itemObj = item.item;
                  return (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 88,
                      marginTop: 12
                    }}>
                      <View
                        style={{width: 8, height: 8, borderRadius: 4, backgroundColor: itemObj.color, marginRight: 8}}/>
                      <Text style={{fontSize: 13, color: Colors.text.primary}}>{itemObj.name}</Text>
                    </View>
                  )
                }}/>
    )
  }


  return (
    <View style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 20}}>
      <VictoryPie
        style={{
          parent: {backgroundColor: 'white'},
          labels: {fontSize: 12, fontWeight: 'normal', fill: Colors.text.primary},
        }}
        data={data}
        innerRadius={height * 0.2}
        width={screenWidth() - 20}
        height={height - bottomLegendHeight}
        radius={(height - bottomLegendHeight) * 0.33}
        labelPosition="centroid"
        labelPlacement="vertical"
        animate={{duration: 200}}
        labelComponent={
          <VictoryTooltip
            active={true}
            constrainToVisibleArea
            flyoutStyle={{stroke: "gray", strokeWidth: 0.5, fill: "white",}}
            pointerWidth={0.1}
            pointerLength={10}
            // renderInPortal={false}
            flyoutPadding={{top: 5, bottom: 5, left: 20, right: 20}}
            cornerRadius={10}
          />
        }
        colorScale={colorScale}

      />
      {renderLegend()}
    </View>

  )
}


