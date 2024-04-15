import React from "react";
import {Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../utils/const/Colors";
import {isEmptyString} from "../../../../utils/const/Consts";

export interface WarningListItemProps {
  ticketStatus: string,
  status: string, ///工单类型 待执行/执行中/已完成
  level: string,///报警级别
  time: string,   ///报警时间
  name: string,   ///报警名称
  category: string,
  threshold: string,
  value: string,
  acceptActionCallBack?: Function,
  itemOnPressCallBack?: Function,
}

export function AlarmListItem(props: WarningListItemProps) {

  const getNameCategory = ()=>{
    let unit = '';
    if (!isEmptyString(props.name)){
      let categories = props.name.split(' ');
      for (let category of categories) {
        if (category.indexOf(props.category) != -1 || category.indexOf(props.value) != -1 || category.indexOf(props.threshold) != -1){
          continue;
        }
        unit = category;
      }
    }
    return unit;
  }

  return (
    <Pressable style={styles.container}
               onPress={() => {
                 props.itemOnPressCallBack && props.itemOnPressCallBack(props);
               }}>
      <View style={styles.levelContent}>
        <Text style={styles.levelText}>{'报警级别: ' + props.level}</Text>
        <Pressable style={styles.actionContent}
                   onPress={() => {
                     if (props.ticketStatus == 'pending') {
                       props.acceptActionCallBack && props.acceptActionCallBack(props);
                     } else {
                       props.itemOnPressCallBack && props.itemOnPressCallBack(props);
                     }
                   }}>
          <Text style={styles.actionText}>{props.status}</Text>
        </Pressable>
        <View style={styles.lineSeparator}/>
      </View>
      <View style={styles.warningContent}>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.warningTextTitle}>
            报警时间
          </Text>
          <Text style={styles.warningTime}>{props.time}</Text>
        </View>
        <View style={{flexDirection: 'row', marginTop: 12, alignItems: 'center'}}>
          <Text style={styles.warningTextTitle}>报警名称</Text>
          <Text style={styles.warningTime}>
            {props.category}
            <Text style={styles.greenText}> {getNameCategory()}</Text>
          </Text>
          <Text style={styles.warningTime}>
            当前值
            <Text style={styles.yellowText}> {props.value}</Text>
          </Text>
          <Text style={styles.warningTime}>
            设定值
            <Text style={styles.greenText}> {props.threshold}</Text>
          </Text>
        </View>
      </View>
    </Pressable>
  )

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    borderRadius: 3,
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  levelContent: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  actionContent: {
    backgroundColor: Colors.theme,
    borderRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: 'bold'
  },
  warningContent: {
    paddingTop: 12,
  },
  warningTextTitle: {
    fontSize: 13,
    color: Colors.text.sub,
    width: 70,
  },

  warningTime: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginRight: 12,
  },
  greenText: {
    fontSize: 15,
    color: Colors.green.sub,
    paddingLeft: 3,
  },
  yellowText: {
    fontSize: 15,
    color: Colors.yellow.sub,
    paddingLeft: 3,
  },

  lineSeparator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 0.5,
    backgroundColor: Colors.border
  }
})
