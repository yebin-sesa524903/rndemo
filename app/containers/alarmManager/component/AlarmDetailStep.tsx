import React from "react";
import {
  StyleSheet, Text,
  View

} from "react-native";
import Colors from "../../../utils/const/Colors";

export interface AlarmDetailStepProps {
  title?: string,
  time?: string,
  index?: number,
  isLast?: boolean,
}
export default function AlarmDetailStep(props: AlarmDetailStepProps) {

  return (
    <View key={props.index}
      style={styles.container}>
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <View style={{
          backgroundColor: (props.index&&props.index>0)? Colors.seBorderSplit:Colors.seBgContainer,
          width: 2,
          flex: 0.05
        }} />
        <View
          style={{ backgroundColor: Colors.seBrandNomarl, width: 15, height: 15, borderRadius: 7.5, alignItems: "center", justifyContent: 'center' }}>
          <View style={{ backgroundColor: Colors.seBgContainer, height: 8, width: 8, borderRadius: 4 }} />
        </View>
        <View style={{
          backgroundColor: (props.isLast)? Colors.seBgContainer:Colors.seBorderSplit,
          width: 2,
          flex: 1
        }} />
      </View>
      <View style={{ marginLeft: 20 }}>
        <Text style={styles.alarmText}>{props.title}</Text>
        <Text style={[styles.alarmText, { marginTop: 5 }]}>{props.time}</Text>
      </View>
    </View>
  )
}


// @ts-ignore
const styles=global.amStyleProxy(() => StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: Colors.seBgContainer,
    flexDirection: 'row',
    height: 66
  },

  alarmText: {
    fontSize: 14,
    color: Colors.seTextTitle
  }
}))
