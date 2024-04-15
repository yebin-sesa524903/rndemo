import React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";


export interface RepairSelectItemProps {
    id?: number,///出库id
    isSelected?: boolean,///是否选中
    title1?: string,
    value1?: string,
    title2?: string,
    value2?: string,
    title3?: string,
    value3?: string,
}

/**
 * 关联工具领用 item
 * @param props
 * @param onSelected
 * @constructor
 */
export function RepairSelectItem(props: RepairSelectItemProps, onSelected?: Function,) {
    return (
        <Pressable style={styles.container}
                   onPress={() => {
                       onSelected && onSelected(props);
                   }}>
            <View style={styles.pressContainer}>
                <Image
                    source={props.isSelected ? require('../../../../../images/aaxiot/checkbox/check_box_selected.png') : require('../../../../../images/aaxiot/checkbox/check_box_normal.png')}/>
            </View>
            <View style={{flex: 1}}>
                <View style={styles.itemContainer}>
                    <Text style={[styles.mainText, {width: 100}]}>{props.title1}</Text>
                    <Text style={styles.mainText}>{props.value1}</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Text style={[styles.lightText, {width: 100}]}>{props.title2}</Text>
                    <Text style={styles.mainText}>{props.value2}</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Text style={[styles.lightText, {width: 100}]}>{props.title3}</Text>
                    <Text style={styles.mainText}>{props.value3}</Text>
                </View>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        paddingTop: 10,
        paddingBottom: 10,
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
    itemContainer: {
        flexDirection: 'row',
        paddingTop: 5,
        paddingBottom: 5
    },

    mainText: {
        fontSize: 13,
        color: Colors.text.primary,
    },
    lightText: {
        fontSize: 13,
        color: Colors.text.light
    },
})
