import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Colors from "../../../utils/const/Colors";
import { configLevel, formatAlarmTime } from "../utils";
import moment from "moment";
import { Icon } from "@ant-design/react-native";
import { localStr } from "../../../utils/Localizations/localization";

export default function AlarmDetailTXHeader(props: any) {
  let duration: any='-';
  if (props.businessStatus===2&&props.resetTime) {
    ///已解除
    duration=formatAlarmTime(props.alarmTime, props.resetTime);
  } else if (props.businessStatus===1) {
    duration=formatAlarmTime(props.alarmTime);
  }
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={[styles.levelContainer, { backgroundColor: configLevel(props.level, props.businessStatus).color }]}>
          <Text
            style={{ fontSize: 16, fontWeight: 'bold', color: Colors.seTextInverse }}>{configLevel(props.level, props.businessStatus).levelText}</Text>
        </View>
        <Text style={{ fontSize: 16, color: Colors.seTextTitle, marginLeft: 16, fontWeight: 'bold' }}>{props.typeName}</Text>
      </View>
      <View style={styles.bottomViewContainer}>
        <View style={styles.rowView}>
          <Text style={styles.titleText}>{localStr('lang_alarm_info_device')}</Text>
          <View style={{ flex: 1, marginLeft: 12, flexDirection: 'row', justifyContent: 'flex-end' }}>
            <Pressable onPress={
              () => {
                if (props.hierarchyId&&props.type=='501') {
                  props.devicePress&&props.devicePress({ id: props.hierarchyId, name: props.hierarchyName })
                }
              }}
              style={{
                backgroundColor: Colors.seFill3,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 4,
                paddingBottom: 4,
                borderRadius: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{ fontSize: 14, color: Colors.seTextSecondary, marginRight: 6 }}>{(props.type=='501'? props.deviceName:props.gatewayName)||"-"}</Text>
              {props.deviceName&&<Icon name={'right-square'} size={14} color={Colors.seTextSecondary} />}
            </Pressable>
          </View>
        </View>
        <View style={styles.dividerLine} />

        <View style={styles.rowView}>
          <Text style={styles.titleText}>{localStr('lang_alarm_info_duration')}</Text>
          <Text style={styles.valueText}>{duration}</Text>
        </View>
        {props.type=='501'&&<View style={styles.dividerLine} />}
        {
          props.type=='501'&&<View style={styles.rowView}>
            <Text style={styles.titleText}>{localStr('lang_alarm_info_gateway')}</Text>
            <Text style={styles.valueText}>{props.gatewayName}</Text>
          </View>
        }
      </View>
    </View>
  )
}


// @ts-ignore
const styles=global.amStyleProxy(() => StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.seBgLayout
  },
  levelContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomViewContainer: {
    backgroundColor: Colors.seBgContainer,
    borderRadius: 4,
    paddingLeft: 16,
    paddingRight: 12,
    marginTop: 20
  },
  titleText: {
    fontSize: 14,
    color: Colors.seTextTitle,
  },
  valueText: {
    fontSize: 14,
    color: Colors.seTextPrimary,
    flex: 1,
    marginLeft: 16,
    textAlign: 'right'
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 12,
  },
  dividerLine: {
    height: 1,
    backgroundColor: Colors.seBorderSplit,
  }
}))
