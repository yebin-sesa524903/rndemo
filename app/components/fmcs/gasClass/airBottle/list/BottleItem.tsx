import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../../../../../utils/const/Colors";
import { isEmptyString, TimeFormatYMDHM } from "../../../../../utils/const/Consts";
import moment from "moment";

export function BottleItem(item: any, onPressItem?: Function) {
  const {
    deviceName,
    positionName,
    systemName,
    statusDesc,
    planChangeTime,
    capacityStatus,
    currentCapacity,
    referenceCountCode,
    totalCapacity
  } = item.item;
  let complete = '';
  if (totalCapacity == null || totalCapacity == 0 || currentCapacity == null) {
    complete = '未知';
  } else if (currentCapacity >= totalCapacity) {
    complete = '100%';
  } else if (currentCapacity < 0) {
    complete = '0%';
  }
  else {
    complete = Math.floor(100 * currentCapacity / totalCapacity) + '%';
  }

  let bottleYL = (currentCapacity == null ? '-' : currentCapacity) + `(${referenceCountCode ?? '-'})`;
  if (currentCapacity < 0) {
    bottleYL = '0';
  }
  let timeString = moment(planChangeTime).format(TimeFormatYMDHM);

  return (
    <Pressable onPress={() => {
      onPressItem && onPressItem(item.item);
    }}
      style={{
        backgroundColor: 'white',
        borderRadius: 5,
        margin: 12,
        marginBottom: 0,
        paddingLeft: 15,
        paddingRight: 15,
      }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text numberOfLines={0}
            style={{
              fontSize: 14,
              color: Colors.text.primary
            }}>{isEmptyString(deviceName) ? '-' : deviceName}</Text>
          <Text style={{ fontSize: 13, color: Colors.text.light, marginLeft: 8 }}
            numberOfLines={0}>({positionName})</Text>
        </View>
        <View style={{ flex: 0.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: 'rgba(34, 84, 183, 0.06)',
            borderRadius: 3,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 3,
            paddingBottom: 3,
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: Colors.theme }}>{statusDesc}</Text>
          </View>
        </View>

      </View>
      <View style={{ backgroundColor: Colors.border, height: 0.5, }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 74 }}>
        <View style={styles.subContent}>
          <Text style={{ fontSize: 13, color: Colors.text.primary }}>{bottleYL}
            <Text style={{ fontSize: 15, color: 'orange' }}> {complete}</Text>
          </Text>
          <Text style={styles.subTitleText}>气瓶余量</Text>
        </View>
        <View style={styles.subContent}>
          <Text style={{ fontSize: 13, color: 'green', fontWeight: 'bold' }}>{capacityStatus}</Text>
          <Text style={styles.subTitleText}>气瓶状态</Text>
        </View>
        <View style={styles.subContent}>
          <Text style={{ fontSize: 13, color: Colors.text.primary, fontWeight: 'bold' }}>{timeString}</Text>
          <Text style={styles.subTitleText}>计划更换</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  subContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitleText: {
    fontSize: 14,
    color: Colors.text.sub,
    marginTop: 10
  }
})
