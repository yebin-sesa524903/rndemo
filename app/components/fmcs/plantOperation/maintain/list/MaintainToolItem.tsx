import React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";


export interface MaintainToolItemProps {
    id?: number,///出库id
    isSelected?: boolean,///是否选中
    toolNumber?: string,
    toolName?:string,
    userName?:string,
    dateString?: string, ///日期
}

/**
 * 关联工具领用 item
 * @param itemObj
 * @param onSelected
 * @constructor
 */
export function MaintainToolItem(itemObj: MaintainToolItemProps, onSelected?: Function,) {
    const {isSelected, toolNumber, toolName, userName, dateString} = itemObj;
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
                    <Text style={[styles.mainText, {width: 100}]}>工具领用单号</Text>
                    <Text style={styles.lightText}>{toolNumber}</Text>
                </View>
                <View style={styles.toolNameContainer}>
                    <View style={[styles.userLeftContainer, {flex: 1}]}>
                        <Text style={[styles.lightText, {width: 100}]}>工具名称</Text>
                        <Text style={[styles.mainText, {flex: 1}]}>{toolName}</Text>
                    </View>

                    <View style={[styles.dateContainer]}>
                        <Text style={styles.lightText}>日期</Text>
                        <Text style={[styles.mainText, {marginLeft: 15}]}>{dateString}</Text>
                    </View>
                </View>
                <View style={styles.userContainer}>
                    <Text style={[styles.lightText, {width: 100}]}>领用人</Text>
                    <Text style={[styles.mainText, {flex: 1}]}>{userName}</Text>
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
    toolNameContainer:{
        flex: 1,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    userContainer: {
        flex: 1,
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
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
        flex: 0.5,
        justifyContent:'flex-end',
    },
})
