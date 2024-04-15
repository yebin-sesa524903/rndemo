import React from "react";
import {FlatList, Image, RefreshControl, StyleSheet, Text, View} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import {SegmentControl} from "./TaskBoard";

export interface EnergyBoardProps {
  monthIndex?: number,  ///当前所在月份  上月/本月
  title?: string,///标题
  data?: {
    data?: EnergyItem[],
  }[],
  onRefresh?: Function,
  onChange?: Function, ///segment 索引变化回调
}

export interface EnergyItem {
  icon?: any,
  value?: string | number,
  unit?: string,
}


export function EnergyBoard(props: EnergyBoardProps) {

  const renderItem = (item: any) => {
    return (
      <View style={{
        backgroundColor: Colors.white,
        borderRadius: 6,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        overflow: 'hidden'
      }}>
        <LinearGradient start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          height: 40,
                          paddingLeft: 20,
                          paddingRight: 20,
                          justifyContent: 'space-between'
                        }}
                        colors={['rgba(228, 235, 252, 0.89)', 'rgba(247, 251, 255, 0.74)']}>
          <Text style={{fontSize: 14, color: Colors.text.primary, fontWeight: 'bold'}}>{props.title}</Text>
          {SegmentControl(props.monthIndex!, (index: number) => {
            props.onChange && props.onChange(index);
          })}
        </LinearGradient>
        <View style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          paddingLeft: 25,
          paddingRight: 25,
          paddingBottom: 25
        }}>
          {
            item.data?.map((datum: EnergyItem) => {
              return (
                <View key={datum.icon} style={{flexDirection: 'row', width: '50%', marginTop: 25}}>
                  <Image source={datum.icon} style={{width: 45, height: 45}}/>
                  <View style={{marginLeft: 12}}>
                    <Text style={{fontSize: 20, color: Colors.text.primary}}>{datum.value}</Text>
                    <Text style={{fontSize: 14, color: Colors.text.light}}>{datum.unit}</Text>
                  </View>
                </View>
              )
            })
          }
        </View>
      </View>
    )
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
        // @ts-ignore
                keyExtractor={(item, index) => (item.data?.length ?? 0) + index}
                renderItem={(item) => renderItem(item.item)}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    width: screenWidth(),
    backgroundColor: Colors.background.primary,
    flex: 1,
  },

});
