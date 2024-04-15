import React from "react";
import {FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View} from "react-native";
import {screenWidth} from "../../../../utils/const/Consts";
import Colors from "../../../../utils/const/Colors";
import {Progress} from "@ant-design/react-native";
import LinearGradient from "react-native-linear-gradient";

export interface TQBoardProps {
  monthIndex?: number,  ///当前所在月份  上月/本月
  title?: string,///标题
  data?: {
    data?: TaskItem[],
  }[],
  onRefresh?: Function,
  onChange?: Function, ///segment 索引变化回调
}

export interface TaskItem {
  title?: string,
  totalCount?: number,
  finishedCount?: number,
  iconName?: any,
  colors: string[],
}

export function TaskBoard(props: TQBoardProps) {
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
          <Text style={{fontSize: 14, color: Colors.text.primary, fontWeight: 'bold'}}>{props.title + '(个)'}</Text>
          {SegmentControl(props.monthIndex!, (index: number) => {
            props.onChange && props.onChange(index);
          })}
        </LinearGradient>
        <View style={{paddingLeft: 20, paddingRight: 20, paddingBottom: 20}}>
          {
            item.data?.map((datum: TaskItem, index: number) => {
              let percentage = 0;
              if (datum.finishedCount != undefined && datum.totalCount && datum.totalCount > 0) {
                let temp = ((datum.finishedCount / datum.totalCount) * 100).toFixed(1);
                percentage = Number(temp);
              }
              return (
                <LinearGradient key={index}
                                style={{
                                  marginTop: 12,
                                  borderRadius: 5,
                                  height: 120,
                                  paddingLeft: 30,
                                  paddingRight: 30,
                                  paddingTop: 12,
                                  paddingBottom: 12
                                }}
                                start={{x: 0, y: 0}}
                                end={{x: 0, y: 1}}
                                colors={datum.colors}>
                  <Image source={require('../../../../images/aaxiot/board/cw_bj.png')} style={{position:'absolute', top: 0, left: 0, width: 112, height: 52}}/>
                  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 4}}>
                      <Text style={{fontSize: 18, color: Colors.white}}>{datum.title + '  (个)'}</Text>
                      <Text style={{fontSize: 24, color: Colors.white, fontWeight: 'bold', marginBottom: 15}}>{datum.totalCount??'-'}</Text>
                      <View style={{height: 12}}>
                        <Progress position={'normal'}
                                  percent={percentage}
                                  style={{backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 6, height: 12, overflow:'hidden'}}
                                  barStyle={{
                                    // height: 12,
                                    flex: 1,
                                    backgroundColor: '#fff',
                                    // borderRadius: 6,
                                    borderColor: '#fff',
                                  }}/>
                      </View>


                    </View>
                    <View style={{
                      flex: 1,
                      alignItems: 'flex-end',
                      marginTop: 8
                    }}>
                      <Image source={datum.iconName} style={{width: 45, height: 45}}/>
                      <Text style={{fontSize: 18, color: Colors.white, marginTop:10}}>{percentage + '%'}</Text>

                    </View>
                  </View>
                </LinearGradient>
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

export function SegmentControl(selectIndex: number, onIndexChange: Function) {
  return (
    <View style={{flexDirection: 'row'}}>
      <Pressable onPress={() => {
        onIndexChange(0);
      }}
                 style={[styles.segmentContent,
                   {
                     borderWidth: 1,
                     borderRightWidth: selectIndex == 0 ? 1 : 0,
                     borderColor: selectIndex == 0 ? Colors.theme : '#d9d9d9',
                     borderTopLeftRadius: 6,
                     borderBottomLeftRadius: 6,
                   }]}>
        <Text style={{color: selectIndex == 0 ? Colors.theme : Colors.text.primary, fontSize: 14}}>上月</Text>
      </Pressable>
      <Pressable onPress={() => {
        onIndexChange(1);
      }}
                 style={[styles.segmentContent, {
                   borderWidth: 1,
                   borderLeftWidth: selectIndex == 1 ? 1 : 0,
                   borderColor: selectIndex == 1 ? Colors.theme : '#d9d9d9',
                   borderTopRightRadius: 6,
                   borderBottomRightRadius: 6,
                 }]}>
        <Text style={{color: selectIndex == 1 ? Colors.theme : Colors.text.primary, fontSize: 14}}>本月</Text>
      </Pressable>
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

  segmentContent: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center'
  }
})
