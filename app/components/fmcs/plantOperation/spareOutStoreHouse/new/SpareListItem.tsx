import React from "react";
import {Image, Pressable, StyleSheet, Text, View} from "react-native";
import Colors from "../../../../../utils/const/Colors";


export interface SpareListItemProps {
    id?: number,///出库id
    isSelected?: boolean,///是否选中
    editable?: boolean, ///是否可编辑
    code?: string,  ///备件编号
    name?: string,  ///备件名称
    brand?: string, ///品牌
    type?: string,  ///型号
    inventory?: number,///当前库存
}

/**
 * 关联工具领用 item
 * @param props
 * @param onSelected
 * @constructor
 */
export function SpareListItem(props: SpareListItemProps, onSelected?: Function) {
    let canSelected = props.editable && (props.inventory! > 0)
    return (
        <Pressable
            style={[styles.container, {backgroundColor: canSelected ? Colors.white : Colors.background.light}]}
            disabled={!canSelected}
            onPress={() => {
                onSelected && onSelected(props);
            }}>
            <View style={styles.pressContainer}>
                <Image
                    source={props.isSelected ? require('../../../../../images/aaxiot/checkbox/check_box_selected.png') : require('../../../../../images/aaxiot/checkbox/check_box_normal.png')}/>
            </View>
            <View style={{flex: 1}}>
                <View style={styles.itemContainer}>
                    <Text style={[styles.mainText, {width: 100}]}>备件编号</Text>
                    <Text style={styles.mainText}>{props.code}</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.itemContainer}>
                        <Text style={[styles.lightText, {width: 100}]}>备件名称</Text>
                        <Text style={[styles.mainText,{flex: 1}]}>{props.name}</Text>
                    </View>
                    <View style={[styles.itemContainer, {justifyContent: 'flex-end', flex: 0.6}]}>
                        <Text style={[styles.lightText, {width: 80}]}>型号</Text>
                        <Text style={[styles.mainText,{flex: 1}]}>{props.type}</Text>
                    </View>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.itemContainer}>
                        <Text style={[styles.lightText, {width: 100}]}>品牌</Text>
                        <Text style={styles.mainText}>{props.brand}</Text>
                    </View>
                    <View style={[styles.itemContainer, {justifyContent: 'flex-end', flex: 0.6}]}>
                        <Text style={[styles.lightText, {width: 80}]}>当前库存</Text>
                        <Text style={[styles.mainText,{flex: 1}]}>{props.inventory}</Text>
                    </View>
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
        flex: 1,
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

    contentContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "space-between"
    }
})
