import React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";


export interface MaintainOutboundOrderItemProps {
    id?: number,///出库id
    isSelected?: boolean,///是否选中
    number?: string, ///出库单号
    userName?: string,///出库人
    dateString?: string, ///日期
}

/**
 * 关联备件出库单 item
 * @param itemObj
 * @param onSelected
 * @constructor
 */
export function MaintainOutboundOrderItem(itemObj: MaintainOutboundOrderItemProps, onSelected?: Function,) {
    const {isSelected, number, userName, dateString} = itemObj;
    return (
        <Pressable style={styles.container}
                   onPress={() => {
                       onSelected && onSelected(itemObj);
                   }}>
            <View style={styles.pressContainer}>
                <Image
                    source={isSelected ? require('../../../../../images/aaxiot/checkbox/check_box_selected.png') : require('../../../../../images/aaxiot/checkbox/check_box_normal.png')}/>
            </View>
            <View style={{flex: 1}}>
                <View style={styles.numberContainer}>
                    <Text style={[styles.mainText, {width: 100}]}>出库单号</Text>
                    <Text style={styles.lightText}>{number}</Text>
                </View>
                <View style={styles.userContainer}>
                    <View style={styles.userLeftContainer}>
                        <Text style={[styles.lightText, {width: 100}]}>出库人</Text>
                        <Text style={styles.mainText}>{userName}</Text>
                    </View>

                    <View style={styles.dateContainer}>
                        <Text style={styles.lightText}>日期</Text>
                        <Text style={[styles.mainText, {marginLeft: 15}]}>{dateString}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 15,
        marginLeft: 12,
        marginRight: 12,
        flexDirection: 'row',
    },
    pressContainer: {
        marginTop: 5,
        paddingLeft: 15,
        paddingRight: 15
    },
    numberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userContainer: {
        flex: 1,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainText: {
        fontSize: 13,
        color: Colors.text.primary,
    },
    lightText: {
        fontSize: 13,
        color: Colors.text.light
    },
    userLeftContainer: {
        flexDirection: 'row',
    },
    dateContainer: {
        flexDirection: 'row',
    },
})
