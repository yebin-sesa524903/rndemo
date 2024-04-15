import React from "react";
import {FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import {screenWidth} from "../../../../utils/const/Consts";

export interface OverviewProps {
  data: {
    title: string,///标题
    showViewDetails?: boolean
    itemInfo: {
      value: number, ///数量
      title: string, ///数量对应的标题
      valueColor: any,///数量文字颜色
    }[]
  }[],
  onPressViewDetail?:Function,///查看明细点击
  onRefresh?: Function,
}

export function Overview(props: OverviewProps) {
  const renderItem = (item: any, index: number) => {
    return (
      <View style={styles.itemContainer}>
        <LinearGradient start={{x: 0, y: 0}}
                        end={{x: 0, y: 1}}
                        style={{flexDirection: 'row', alignItems: 'center', height: 40, justifyContent:'space-between'}}
                        colors={['rgba(228, 235, 252, 0.89)', 'rgba(247, 251, 255, 0.74)']}>
          <Text style={{
            fontSize: 15,
            color: Colors.text.primary,
            fontWeight: 'bold',
            marginLeft: 15,
            marginTop: 6,
            marginBottom: 6,
          }}>{item.title}</Text>
          {
            item.showViewDetails &&
            <Pressable style={{flexDirection:'row', paddingLeft: 10, paddingRight: 15, alignItems:'center'}} onPress={()=>{
              props.onPressViewDetail && props.onPressViewDetail(index);
            }
            }>
              <Text style={{fontSize: 13, color: Colors.text.sub, marginRight: 5}}>查看明细</Text>
              <Image source={require('../../../../images/aaxiot/airBottle/arrow_right.png')}/>
            </Pressable>
          }
        </LinearGradient>
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 18}}>
          {
            item.itemInfo.map((obj: any, index: number) => {
              return (
                <View key={index}
                      style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                  <Text style={{
                    color: obj.valueColor || Colors.text.primary,
                    fontSize: 16,
                    fontWeight: 'bold'
                  }}>{obj.value}</Text>
                  <Text style={{color: Colors.text.sub, fontSize: 13, marginTop: 10}}>{obj.title}</Text>
                  <View style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: index == 0 ? 0 : 1,
                    backgroundColor: Colors.border
                  }}/>
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
                refreshControl={<RefreshControl refreshing={false} onRefresh={() => {
                  props.onRefresh && props.onRefresh();
                }}/>}
                keyExtractor={(item, index) => item.title}
                renderItem={(item) => renderItem(item.item, item.index)}/>
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
  itemContainer: {
    backgroundColor: Colors.white,
    borderRadius: 5,
    marginTop: 10,
  }
})
