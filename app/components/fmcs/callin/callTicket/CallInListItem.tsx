import React from "react";
import {StyleSheet, View, Text, Pressable} from "react-native";
import Colors from "../../../../utils/const/Colors";


export interface CallInListItemProps {
  orderId: number,///工单id
  subOrderId: number,
  businessType: string, ///业务类型
  ticketStatus: string, ///工单类型
  actionTitle: string,  ///工单点击名称
  userName: string,   ///报修人
  department: string, ///课室
  repairTime: string, ///报修时间
  telephone: string,///电话
  acceptActionCallBack?: Function,    ///接单/编辑/查看点击
  itemOnPressCallBack?: Function,
}

export function CallInListItem(props: CallInListItemProps) {
  return (
    <Pressable style={styles.container}
               onPress={() => {
                 props.itemOnPressCallBack && props.itemOnPressCallBack(props);
               }}>
      <View style={styles.typeContent}>
        <Text style={styles.typeText}>{'业务类型: ' + props.businessType}</Text>
        <Pressable style={styles.actionContent}
                   onPress={() => {
                     if (props.ticketStatus == 'pending') {
                       props.acceptActionCallBack && props.acceptActionCallBack(props);
                     } else {
                       props.itemOnPressCallBack && props.itemOnPressCallBack(props);
                     }
                   }}>
          <Text style={styles.actionText}>{props.actionTitle}</Text>
        </Pressable>
        <View style={styles.lineSeparator}/>
      </View>
      <View style={styles.titleContent}>
        <View style={[styles.itemContent, {alignItems: 'flex-start'}]}>
          <Text style={styles.userName}>{props.userName}<Text
            style={styles.department}>{`(${props.department})`}</Text></Text>
          <Text style={styles.titleText}>{`${props.businessType}人`}</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.userName}>{props.repairTime}</Text>
          <Text style={styles.titleText}>{`${props.businessType}时间`}</Text>
        </View>
        <View style={[styles.itemContent, {alignItems: 'flex-end'}]}>
          <View style={{justifyContent:'center', alignItems:'center'}}>
            <Text style={styles.telephone}>{props.telephone}</Text>
            <Text style={styles.titleText}>电话</Text>
          </View>
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
  typeContent: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeText: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },
  actionContent: {
    backgroundColor: Colors.theme,
    borderRadius: 2,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  actionText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: 'bold'
  },

  telephone: {
    fontSize: 13,
    color: Colors.theme,
    textDecorationLine: 'underline',
    fontWeight: 'bold'
  },
  department: {
    fontSize: 13,
    color: Colors.text.sub,
    fontWeight: 'normal',
  },

  titleText: {
    fontSize: 13,
    color: Colors.text.sub,
    marginTop: 12,
  },
  titleContent: {
    flexDirection: 'row',
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
