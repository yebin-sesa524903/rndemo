import React from "react";
import {Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";
import LinearGradient from "react-native-linear-gradient";
import {Progress} from "@ant-design/react-native";
import {LinearGradientHeader} from "../LinearGradientHeader";

export interface ProgressProps {
  title?: string,
  data?: ProgressInterface[],
}

export interface ProgressInterface {
  title?: string, ///标题
  percentage?: number,///占比
  date?: string,///日期
}

export function ProgressItem(props: ProgressProps) {
  return (
    <LinearGradientHeader title={props.title}
                          content={
                            <View style={{marginBottom: 10}}>
                              {
                                props.data?.map((datum) => {
                                  return ProgressView(datum)
                                })
                              }
                            </View>
                          }/>
  )
}

function ProgressView(data: ProgressInterface) {
  return (
    <View
      style={{flexDirection: 'row', paddingLeft: 20, paddingRight: 20, flex: 1, alignItems: 'center', marginTop: 15}}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-end', width: '20%', marginRight: 12}}>
        <Text style={{fontSize: 10, color: Colors.text.sub}} numberOfLines={1}>{data.title}</Text>
      </View>
      <Progress position={'normal'}
                percent={data.percentage}
                unfilled={false}
                style={{backgroundColor: '#EEEEEE', borderRadius: 4, height: 8}}
                barStyle={{height: 8, backgroundColor: '#2E75F4', borderRadius: 4, borderColor: '#2E75F4'}}/>
      <View style={{
        flexDirection: 'row',
        width: '15%',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 12
      }}>
        <Text style={{fontSize: 10, color: Colors.text.sub}}>{(data.percentage ?? 0) + '%'}</Text>
        <Text style={{fontSize: 10, color: Colors.text.sub}}>{data.date}</Text>
      </View>
    </View>
  )
}
