import React from "react";
import {FlatList, RefreshControl, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";
import {screenWidth, TimeFormatYMDHMS} from "../../../../../utils/const/Consts";
import {RefreshList} from "../../../../../utils/refreshList/RefreshList";
import moment from "moment";

export interface DeviceAlarmMsgProps {
    data: AlarmMessageProps[],
    pullToRefresh: Function,
    pullLoadMore: Function,
}

export interface AlarmMessageProps {
    level: string,
    levelDesc: string,
    alarmDesc: string,
    dataTime: string,
    alarmType: string,
    threshold: string,
    statusType: string,
}

export function DeviceAlarmMsg(props: DeviceAlarmMsgProps) {

    const configAlarmContentColor = (level: string, statusType: string) => {
        let color = Colors.text.light;
        if (statusType == '1'){
            switch (level) {
                case '1':
                    color = Colors.device_status_3_text_color;
                    break;
                case '2':
                    color = Colors.device_status_2_text_color;
                    break;
                case '3':
                    color = Colors.device_status_4_text_color;
                    break;
            }
        }else if (statusType == '0'){
            color = Colors.text.light;
        }

        return color
    }


    const renderItem = (alarm: AlarmMessageProps) => {

         const alarmTime = moment(alarm.dataTime).format(TimeFormatYMDHMS);

        return (
            <View style={styles.itemContainer}>
                <View style={{
                    backgroundColor: configAlarmContentColor(alarm.level, alarm.statusType),
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    marginRight: 12,
                }}>
                    <Text style={styles.levelText}>{alarm.levelDesc}</Text>
                </View>
                <View style={{}}>
                    <Text style={styles.alarmText}>{alarm.alarmDesc}</Text>
                    <Text style={styles.alarmContentText}>{`时间: ${alarmTime}`}</Text>
                    <Text style={styles.alarmContentText}>{`报警类别: ${alarm.alarmType}`}</Text>
                    <Text style={styles.alarmContentText}>{`设定值: ${alarm.threshold}`}</Text>
                </View>


            </View>
        )
    }

    return (
        <View style={styles.container}>
            <RefreshList contentContainerStyle={{
                paddingBottom: 20,
            }}
                         refreshing={false}
                         pullToRefresh={props.pullToRefresh}
                         pullLoadMore={props.pullLoadMore}
                         keyExtractor={(item, index) => ((item.alarmTitle ?? '') + index)}
                         renderItem={(item) => renderItem(item.item)}
                         sections={(props.data && props.data.length > 0) ? [{data: props.data}] : []}/>
        </View>
    )
}

// @ts-ignore
const styles = global.amStyleProxy(() => StyleSheet.create({
    container: {
        paddingLeft: 10,
        paddingRight: 10,
        width: screenWidth(),
        flex: 1,
        backgroundColor: Colors.background.primary,
    },
    itemContainer: {
        flexDirection: 'row',
        marginTop: 12,
        borderRadius: 8,
        backgroundColor: Colors.white,
        padding: 10,
    },
    levelText: {
        fontSize: 16,
        color: Colors.white,
    },
    alarmText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text.primary,
    },
    alarmContentText: {
        fontSize: 14,
        color: Colors.text.light,
        marginTop: 10
    }
}));
